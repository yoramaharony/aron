import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inviteCodes } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { generateInviteCode, normalizeInviteCode } from '@/lib/invites';
import { desc, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

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
    })),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const intendedRole = body?.intendedRole ?? 'requestor';
  const note = typeof body?.note === 'string' ? body.note : null;
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
        expiresAt,
        maxUses,
        uses: 0,
      });

      return NextResponse.json({
        code,
        intendedRole,
        expiresAt,
        maxUses,
      });
    } catch (e: any) {
      // Unique constraint collision; retry.
      if (String(e?.message ?? '').toLowerCase().includes('unique')) continue;
      return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Failed to generate unique code' }, { status: 500 });
}

