import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { donorOpportunityEvents, donorOpportunityState, leverageOffers, opportunities } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { toIsoTime } from '@/lib/time';

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function GET(_request: NextRequest, context: { params: Promise<{ key: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return forbidden();

  const { key } = await context.params;
  const safeKey = String(key || '');
  if (!safeKey) return NextResponse.json({ error: 'Missing key' }, { status: 400 });

  const row = await db.select().from(opportunities).where(eq(opportunities.id, safeKey)).get();
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // For submissions, verify the donor owns it
  if (row.originDonorId && String(row.originDonorId) !== String(session.userId)) {
    return forbidden();
  }

  const opportunity: any = {
    key: safeKey,
    source: row.source,
    title: row.title,
    orgName: row.orgName || row.orgEmail || 'Unknown',
    orgEmail: row.orgEmail ?? null,
    summary: row.summary,
    category: row.category,
    location: row.location,
    targetAmount: row.targetAmount,
    currentAmount: row.currentAmount,
    videoUrl: row.videoUrl ?? null,
    contactName: row.contactName ?? null,
    contactEmail: row.contactEmail ?? null,
    extracted: row.extractedJson ? JSON.parse(row.extractedJson) : null,
    moreInfoRequestedAt: row.moreInfoRequestedAt ?? null,
    moreInfoSubmittedAt: row.moreInfoSubmittedAt ?? null,
    details: row.detailsJson ? JSON.parse(row.detailsJson) : null,
    coverUrl: row.coverUrl ?? null,
    createdAt: toIsoTime(row.createdAt),
  };

  const stateRow = await db
    .select()
    .from(donorOpportunityState)
    .where(eq(donorOpportunityState.donorId, session.userId))
    .limit(500);
  const matchedStateRow = stateRow.find((s) => String(s.opportunityKey) === safeKey);
  const state = matchedStateRow?.state ?? 'new';
  const notes = matchedStateRow?.notes ?? null;

  const events = await db
    .select()
    .from(donorOpportunityEvents)
    .where(eq(donorOpportunityEvents.donorId, session.userId))
    .orderBy(desc(donorOpportunityEvents.createdAt))
    .limit(50);
  const eventsForKey = events
    .filter((e) => String(e.opportunityKey) === safeKey)
    .map((e) => ({
      id: e.id,
      type: e.type,
      meta: e.metaJson ? JSON.parse(e.metaJson) : null,
      createdAt: toIsoTime(e.createdAt),
    }));

  const offers = await db
    .select()
    .from(leverageOffers)
    .where(eq(leverageOffers.donorId, session.userId))
    .orderBy(desc(leverageOffers.createdAt))
    .limit(50);
  const offersForKey = offers
    .filter((o) => String(o.opportunityKey) === safeKey)
    .map((o) => ({
      id: o.id,
      anchorAmount: o.anchorAmount,
      challengeGoal: o.challengeGoal,
      matchMode: o.matchMode,
      topUpCap: o.topUpCap,
      deadline: o.deadline,
      status: o.status,
      createdAt: toIsoTime(o.createdAt),
    }));

  return NextResponse.json({ opportunity, state, notes, events: eventsForKey, leverageOffers: offersForKey });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ key: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return forbidden();

  const { key } = await context.params;
  const safeKey = String(key || '');
  if (!safeKey) return NextResponse.json({ error: 'Missing key' }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const notesValue = typeof body?.notes === 'string' ? body.notes : null;

  const donorId = session.userId;
  const existing = await db
    .select()
    .from(donorOpportunityState)
    .where(eq(donorOpportunityState.donorId, donorId))
    .limit(500);
  const row = existing.find((r) => String(r.opportunityKey) === safeKey);

  if (row) {
    await db
      .update(donorOpportunityState)
      .set({ notes: notesValue, updatedAt: new Date() })
      .where(eq(donorOpportunityState.id, row.id));
  } else {
    await db.insert(donorOpportunityState).values({
      id: uuidv4(),
      donorId,
      opportunityKey: safeKey,
      state: 'new',
      notes: notesValue,
      updatedAt: new Date(),
    });
  }

  return NextResponse.json({ success: true, notes: notesValue });
}
