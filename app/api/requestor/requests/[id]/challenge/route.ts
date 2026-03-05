import { NextResponse } from 'next/server';
import { db } from '@/db';
import { donorOpportunityEvents, leverageOffers, opportunities } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { and, desc, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'requestor') return forbidden();

  const { id } = await params;
  const safeId = String(id || '').trim();
  if (!safeId) return NextResponse.json({ error: 'Missing request id' }, { status: 400 });

  const requestRow = await db
    .select()
    .from(opportunities)
    .where(and(eq(opportunities.id, safeId), eq(opportunities.createdBy, session.userId)))
    .get();
  if (!requestRow) return forbidden();

  const latestOffer = await db
    .select()
    .from(leverageOffers)
    .where(eq(leverageOffers.opportunityKey, safeId))
    .orderBy(desc(leverageOffers.createdAt))
    .limit(1)
    .then((rows) => rows[0] ?? null);
  if (!latestOffer) return NextResponse.json({ error: 'No challenge offer found for this request' }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const action = typeof body?.action === 'string' ? body.action : '';

  let nextStatus = latestOffer.status;
  let eventType = '';
  let note = '';

  if (action === 'accept') {
    nextStatus = 'accepted';
    eventType = 'leverage_accepted';
    note = 'Organization accepted the challenge offer.';
  } else if (action === 'decline') {
    nextStatus = 'canceled';
    eventType = 'leverage_declined';
    note = 'Organization declined the challenge offer.';
  } else if (action === 'launch_campaign') {
    nextStatus = 'in_campaign';
    eventType = 'leverage_campaign_started';
    note = 'Challenge campaign launched on Charity platform (demo sync).';
  } else if (action === 'mark_goal_reached') {
    nextStatus = 'goal_reached';
    eventType = 'leverage_goal_reached';
    note = 'Charity campaign reached target (demo sync). Donor can proceed to fund.';
  } else if (action === 'release_funds') {
    nextStatus = 'released';
    eventType = 'leverage_released';
    note = 'Challenge released and marked complete.';
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const now = new Date();
  await db
    .update(leverageOffers)
    .set({ status: nextStatus, updatedAt: now })
    .where(eq(leverageOffers.id, latestOffer.id));

  await db.insert(donorOpportunityEvents).values({
    id: uuidv4(),
    donorId: latestOffer.donorId,
    opportunityKey: safeId,
    type: eventType,
    metaJson: JSON.stringify({
      source: 'org_challenge_flow',
      leverageOfferId: latestOffer.id,
      status: nextStatus,
      note,
    }),
    createdAt: now,
  });

  return NextResponse.json({
    success: true,
    leverageOfferId: latestOffer.id,
    status: nextStatus,
    action,
  });
}

