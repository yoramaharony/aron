import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { donorOpportunityEvents, donorOpportunityState, leverageOffers, requests, submissionEntries } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { toIsoTime } from '@/lib/time';
import { CHARIDY_CURATED } from '@/lib/charidy-curated';

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

  let opportunity: any = null;
  let source: 'request' | 'submission' | 'charidy' = 'request';

  const curated = CHARIDY_CURATED.find((c) => c.key === safeKey);
  if (curated) {
    source = 'charidy';
    opportunity = {
      key: safeKey,
      source,
      title: curated.title,
      orgName: curated.orgName,
      summary: curated.summary,
      category: curated.category,
      location: curated.location,
      fundingGap: curated.fundingGap,
      outcomes: curated.outcomes,
      whyNow: curated.whyNow,
      createdAt: null,
    };
  } else
  if (safeKey.startsWith('sub_')) {
    source = 'submission';
    const id = safeKey.slice('sub_'.length);
    const row = await db.select().from(submissionEntries).where(eq(submissionEntries.id, id)).get();
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (String(row.donorId) !== String(session.userId)) return forbidden();
    opportunity = {
      key: safeKey,
      source,
      title: row.title || 'Submission',
      orgName: row.orgName || row.orgEmail || 'Unknown',
      orgEmail: row.orgEmail ?? null,
      summary: row.summary,
      amountRequested: row.amountRequested ?? null,
      videoUrl: row.videoUrl ?? null,
      contactName: row.contactName ?? null,
      contactEmail: row.contactEmail ?? null,
      extracted: row.extractedJson ? JSON.parse(row.extractedJson) : null,
      extractedCause: row.extractedCause ?? null,
      extractedGeo: row.extractedGeo ?? null,
      extractedUrgency: row.extractedUrgency ?? null,
      extractedAmount: row.extractedAmount ?? null,
      moreInfoRequestedAt: row.moreInfoRequestedAt ?? null,
      moreInfoSubmittedAt: row.moreInfoSubmittedAt ?? null,
      details: row.detailsJson ? JSON.parse(row.detailsJson) : null,
      createdAt: toIsoTime(row.createdAt),
    };
  } else {
    const row = await db.select().from(requests).where(eq(requests.id, safeKey)).get();
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    opportunity = {
      key: safeKey,
      source,
      title: row.title,
      orgName: 'Curated',
      summary: row.summary,
      category: row.category,
      location: row.location,
      targetAmount: row.targetAmount,
      currentAmount: row.currentAmount,
      createdAt: toIsoTime(row.createdAt),
    };
  }

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

