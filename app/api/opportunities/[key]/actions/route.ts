import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { donorOpportunityEvents, donorOpportunityState, opportunities, users } from '@/db/schema';
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
    request_info: 'shortlisted',
    scheduled: 'scheduled',
    meeting_completed: 'scheduled',
    info_received: 'shortlisted',
    diligence_completed: 'shortlisted',
    funded: 'funded',
  };

  if (!action || !actionToState[action]) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const donorId = session.userId;
  const state = actionToState[action];
  let moreInfoUrl: string | null = null;

  // Sync opportunities.status for terminal donor actions
  if (action === 'pass') {
    await db.update(opportunities).set({ status: 'passed' }).where(eq(opportunities.id, safeKey));
  } else if (action === 'funded') {
    await db.update(opportunities).set({ status: 'funded' }).where(eq(opportunities.id, safeKey));
  }
  let emailSent: { to: string; id?: string } | null = null;

  // Upsert state row
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

  // Progressive disclosure: on request_info, mint token + link on the opportunity
  if (action === 'request_info') {
    const opp = await db.select().from(opportunities).where(eq(opportunities.id, safeKey)).get();
    if (opp) {
      const token = opp.moreInfoToken || uuidv4();
      if (!opp.moreInfoToken) {
        await db
          .update(opportunities)
          .set({ moreInfoToken: token, moreInfoRequestedAt: new Date(), status: 'more_info_requested' })
          .where(eq(opportunities.id, safeKey));
      }
      const origin = new URL(request.url).origin;
      moreInfoUrl = `${origin}/more-info/${token}`;

      const meta = body?.meta && typeof body.meta === 'object' ? body.meta : null;
      const sendEmail = Boolean((meta as any)?.sendEmail);
      const note = typeof (meta as any)?.note === 'string' ? String((meta as any).note).trim() : '';

      if (sendEmail) {
        const to = (opp.orgEmail || opp.contactEmail || '').trim();
        if (!to) {
          return NextResponse.json(
            { error: 'No organization email on file for this opportunity (orgEmail/contactEmail is missing).' },
            { status: 400 }
          );
        }

        const donor = await db.select().from(users).where(eq(users.id, donorId)).get();
        const inviterName = donor?.name || 'A donor';

        const rendered = await renderEmailFromTemplate({
          key: 'request_more_info',
          vars: {
            inviter_name: inviterName,
            opportunity_title: opp.title || 'Opportunity',
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

  // When info_received comes with details, persist them on the opportunity record
  if (action === 'info_received') {
    const meta = body?.meta && typeof body.meta === 'object' ? body.meta : null;
    const details = (meta as any)?.details;
    if (details && typeof details === 'object') {
      await db
        .update(opportunities)
        .set({
          detailsJson: JSON.stringify(details),
          moreInfoSubmittedAt: new Date(),
          status: 'more_info_submitted',
        })
        .where(eq(opportunities.id, safeKey));
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
