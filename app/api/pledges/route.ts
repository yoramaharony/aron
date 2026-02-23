import { NextResponse } from 'next/server';
import { db } from '@/db';
import {
  donorOpportunityState,
  donorOpportunityEvents,
  leverageOffers,
  opportunities,
} from '@/db/schema';
import { getSession } from '@/lib/auth';
import { and, desc, eq } from 'drizzle-orm';
import { toIsoTime } from '@/lib/time';

function generateGrantId(key: string, fundedDate: Date | null): string {
  const year = fundedDate ? fundedDate.getFullYear() : new Date().getFullYear();
  const hash = key
    .split('')
    .reduce((acc, ch) => ((acc << 5) - acc + ch.charCodeAt(0)) | 0, 0);
  const short = Math.abs(hash).toString(36).slice(0, 4).toUpperCase().padStart(4, '0');
  return `GR-${year}-${short}`;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const donorId = session.userId;

  // 1. All funded state rows
  const fundedStates = await db
    .select()
    .from(donorOpportunityState)
    .where(
      and(
        eq(donorOpportunityState.donorId, donorId),
        eq(donorOpportunityState.state, 'funded'),
      ),
    );

  if (fundedStates.length === 0) {
    return NextResponse.json({ pledges: [] });
  }

  const fundedKeys = fundedStates.map((s) => String(s.opportunityKey));

  // 2. Funded events (for commitment date)
  const fundedEvents = await db
    .select()
    .from(donorOpportunityEvents)
    .where(
      and(
        eq(donorOpportunityEvents.donorId, donorId),
        eq(donorOpportunityEvents.type, 'funded'),
      ),
    )
    .orderBy(desc(donorOpportunityEvents.createdAt));

  const fundedDateByKey = new Map<string, string | null>();
  for (const e of fundedEvents) {
    const k = String(e.opportunityKey);
    if (!fundedDateByKey.has(k)) {
      fundedDateByKey.set(k, toIsoTime(e.createdAt));
    }
  }

  // 3. Leverage offers
  const allOffers = await db
    .select()
    .from(leverageOffers)
    .where(eq(leverageOffers.donorId, donorId))
    .orderBy(desc(leverageOffers.createdAt));

  const offersByKey = new Map<string, (typeof allOffers)[number][]>();
  for (const o of allOffers) {
    const k = String(o.opportunityKey);
    if (!offersByKey.has(k)) offersByKey.set(k, []);
    offersByKey.get(k)!.push(o);
  }

  // 4. Resolve each funded opportunity from the unified table
  const pledges = [];
  for (const key of fundedKeys) {
    const row = await db.select().from(opportunities).where(eq(opportunities.id, key)).get();

    const title = row?.title ?? 'Unknown';
    const orgName = row?.orgName || row?.orgEmail || 'Unknown';
    const category = row?.category ?? null;
    const location = row?.location ?? null;
    const summary = row?.summary ?? '';
    const amount = row?.targetAmount
      ? Number(row.targetAmount) - Number(row.currentAmount ?? 0)
      : null;
    const source = row?.source ?? 'unknown';

    const commitmentDateRaw = fundedDateByKey.get(key) ?? null;
    const commitmentDate = commitmentDateRaw ? new Date(commitmentDateRaw) : null;

    const keyOffers = (offersByKey.get(key) || []).map((o) => ({
      id: o.id,
      anchorAmount: o.anchorAmount,
      challengeGoal: o.challengeGoal,
      matchMode: o.matchMode,
      topUpCap: o.topUpCap,
      deadline: o.deadline,
      status: o.status,
      createdAt: toIsoTime(o.createdAt),
    }));

    pledges.push({
      opportunityKey: key,
      source,
      title,
      orgName,
      category,
      location,
      summary,
      totalPledge: amount ?? 0,
      paidToDate: 0,
      status: 'New Commitment',
      grantId: generateGrantId(key, commitmentDate),
      commitmentDate: commitmentDateRaw,
      leverageOffers: keyOffers,
    });
  }

  // Newest first
  pledges.sort((a, b) => (b.commitmentDate || '').localeCompare(a.commitmentDate || ''));

  return NextResponse.json({ pledges });
}
