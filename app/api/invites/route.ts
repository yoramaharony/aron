import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inviteCodes, users } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { generateInviteCode, normalizeInviteCode } from '@/lib/invites';
import { renderEmailFromTemplate } from '@/lib/email-templates';
import { sendMailgunEmail } from '@/lib/mailgun';
import { desc, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const rows = await db
      .select()
      .from(inviteCodes)
      .where(eq(inviteCodes.createdBy, session.userId))
      .orderBy(desc(inviteCodes.createdAt))
      .limit(25);

    // Don't leak internal ids by default (keep it simple for MVP)
    return NextResponse.json({
      invites: rows.map((r) => ({
        code: r.code,
        intendedRole: r.intendedRole,
        uses: r.uses,
        maxUses: r.maxUses,
        createdAt: r.createdAt,
        expiresAt: r.expiresAt,
        usedAt: r.usedAt,
        revokedAt: r.revokedAt,
        note: r.note,
        recipientEmail: r.recipientEmail,
      })),
    });
  } catch (e: any) {
    const msg = String(e?.message || e);
    const isSchema =
      msg.toLowerCase().includes('no such column') || msg.toLowerCase().includes('no such table');
    return NextResponse.json(
      {
        error: isSchema
          ? 'DB schema is out of date (or you are pointing at the wrong DB). Run `npm run db:ensure` from yesod-platform/, then restart `npm run dev`.'
          : 'Internal Error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const intendedRole = body?.intendedRole ?? 'requestor';
  const note = typeof body?.note === 'string' ? body.note : null;
  const recipientEmail = typeof body?.recipientEmail === 'string' ? body.recipientEmail.trim() : '';
  const expiresInDays = typeof body?.expiresInDays === 'number' ? body.expiresInDays : 14;
  const maxUses = typeof body?.maxUses === 'number' ? body.maxUses : 1;

  // Product rule (updated): donors can invite both donors and nonprofits (requestors).
  // We store inviter->invitee via invite_codes.created_by + invite_codes.used_by for later analysis.
  if (intendedRole !== 'requestor' && intendedRole !== 'donor') {
    return badRequest('Invalid intendedRole');
  }
  if (!Number.isFinite(expiresInDays) || expiresInDays < 0 || expiresInDays > 3650) {
    return badRequest('Invalid expiresInDays');
  }
  if (!Number.isFinite(maxUses) || maxUses < 1 || maxUses > 1000) {
    return badRequest('Invalid maxUses');
  }

  const expiresAt =
    expiresInDays && Number.isFinite(expiresInDays)
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

  // Retry a few times to avoid rare unique collisions
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = normalizeInviteCode(generateInviteCode());
    try {
      await db.insert(inviteCodes).values({
        id: uuidv4(),
        code,
        intendedRole,
        createdBy: session.userId,
        note,
        recipientEmail: recipientEmail || null,
        expiresAt,
        maxUses,
        uses: 0,
      });

      // Optional: send email invite via Mailgun
      let email: any = null;
      if (recipientEmail) {
        const origin = new URL(request.url).origin;
        const inviteUrl = `${origin}/auth/signup?invite=${encodeURIComponent(code)}&role=${encodeURIComponent(intendedRole)}`;
        const inviterRow = await db
          .select()
          .from(users)
          .where(eq(users.id, session.userId))
          .get()
          .catch(() => null as any);
        const inviterName = inviterRow?.name || inviterRow?.email || 'A donor';
        const tplKey = intendedRole === 'donor' ? 'invite_donor' : 'invite_requestor';
        try {
          const rendered = await renderEmailFromTemplate({
            key: tplKey,
            vars: {
              inviter_name: inviterName,
              invite_url: inviteUrl,
              invite_code: code,
              note: note ?? '',
            },
          });
          await sendMailgunEmail({
            to: recipientEmail,
            subject: rendered.subject,
            text: rendered.text,
            html: rendered.html,
            from: rendered.from,
          });
          email = { sent: true, to: recipientEmail };
        } catch (e: any) {
          email = { sent: false, to: recipientEmail, error: String(e?.message || e) };
        }
      }

      return NextResponse.json({
        code,
        intendedRole,
        expiresAt,
        maxUses,
        email,
      });
    } catch (e: any) {
      // Unique constraint collision; retry.
      if (String(e?.message ?? '').toLowerCase().includes('unique')) continue;
      const msg = String(e?.message || e);
      const isSchema =
        msg.toLowerCase().includes('no such column') || msg.toLowerCase().includes('no such table');
      return NextResponse.json(
        {
          error: isSchema
            ? 'DB schema is out of date (or you are pointing at the wrong DB). Run `npm run db:ensure` from yesod-platform/, then restart `npm run dev`.'
            : 'Internal Error',
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'Failed to generate unique code' }, { status: 500 });
}

