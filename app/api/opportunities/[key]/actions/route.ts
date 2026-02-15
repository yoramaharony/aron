import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { donorOpportunityEvents, donorOpportunityState, submissionEntries, users } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { renderEmailFromTemplate } from '@/lib/email-templates';
import { sendMailgunEmail } from '@/lib/mailgun';

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(request: NextRequest, context: { params: Promise<{ key: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return forbidden();

  const { key } = await context.params;
  const safeKey = String(key || '');
  if (!safeKey) return NextResponse.json({ error: 'Missing key' }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const action = typeof body?.action === 'string' ? body.action : '';

  const actionToState: Record<string, string> = {
    save: 'shortlisted',
    shortlist: 'shortlisted',
    pass: 'passed',
    reset: 'new',
    // Requesting info also implies donor intent, so keep it in shortlist.
    request_info: 'shortlisted',
    scheduled: 'scheduled',
    funded: 'funded',
  };

  if (!action || !actionToState[action]) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const donorId = session.userId;
  const state = actionToState[action];
  let moreInfoUrl: string | null = null;
  let emailSent: { to: string; id?: string } | null = null;

  // Upsert state row (via unique index donor+key)
  const existing = await db
    .select()
    .from(donorOpportunityState)
    .where(eq(donorOpportunityState.donorId, donorId))
    .limit(500);
  const row = existing.find((r) => String(r.opportunityKey) === safeKey);

  const now = new Date();
  if (!row) {
    await db.insert(donorOpportunityState).values({
      id: uuidv4(),
      donorId,
      opportunityKey: safeKey,
      state,
      updatedAt: now,
    });
  } else {
    await db
      .update(donorOpportunityState)
      .set({ state, updatedAt: now })
      .where(eq(donorOpportunityState.id, row.id));
  }

  // Progressive disclosure: on request_info for submissions, mint token + link
  if (action === 'request_info' && safeKey.startsWith('sub_')) {
    const submissionId = safeKey.slice('sub_'.length);
    const sub = await db.select().from(submissionEntries).where(eq(submissionEntries.id, submissionId)).get();
    if (sub && String(sub.donorId) === String(donorId)) {
      const token = sub.moreInfoToken || uuidv4();
      if (!sub.moreInfoToken) {
        await db
          .update(submissionEntries)
          .set({ moreInfoToken: token, moreInfoRequestedAt: new Date(), status: 'more_info_requested' })
          .where(eq(submissionEntries.id, submissionId));
      }
      const origin = new URL(request.url).origin;
      moreInfoUrl = `${origin}/more-info/${token}`;

      const meta = body?.meta && typeof body.meta === 'object' ? body.meta : null;
      const sendEmail = Boolean((meta as any)?.sendEmail);
      const note = typeof (meta as any)?.note === 'string' ? String((meta as any).note).trim() : '';

      if (sendEmail) {
        const to = (sub.orgEmail || sub.contactEmail || '').trim();
        if (!to) {
          return NextResponse.json(
            { error: 'No organization email on file for this submission (orgEmail/contactEmail is missing).' },
            { status: 400 }
          );
        }

        const donor = await db.select().from(users).where(eq(users.id, donorId)).get();
        const inviterName = donor?.name || 'A donor';

        const rendered = await renderEmailFromTemplate({
          key: 'request_more_info',
          vars: {
            inviter_name: inviterName,
            opportunity_title: sub.title || 'Submission',
            more_info_url: moreInfoUrl,
            note,
          },
        });

        const sent = await sendMailgunEmail({
          to,
          subject: rendered.subject,
          text: rendered.text,
          html: rendered.html,
          from: rendered.from,
        });

        emailSent = { to, id: sent?.id };
      }
    }
  }

  const metaObj = {
    ...(body?.meta && typeof body.meta === 'object' ? body.meta : {}),
    ...(moreInfoUrl ? { moreInfoUrl } : {}),
    ...(emailSent ? { emailSentTo: emailSent.to, mailgunId: emailSent.id || null } : {}),
  };

  await db.insert(donorOpportunityEvents).values({
    id: uuidv4(),
    donorId,
    opportunityKey: safeKey,
    type: action,
    metaJson: Object.keys(metaObj).length ? JSON.stringify(metaObj) : null,
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true, state, moreInfoUrl, emailSent });
}

