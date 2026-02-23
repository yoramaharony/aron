import { NextResponse } from 'next/server';
import { db } from '@/db';
import { donorOpportunityEvents, donorOpportunityState, donorProfiles, opportunities } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { desc, eq, or, isNull } from 'drizzle-orm';
import { toIsoTime } from '@/lib/time';

type OpportunityRow = {
  key: string;
  source: string;
  title: string;
  orgName: string;
  location?: string;
  category?: string;
  summary: string;
  amount?: number | null;
  createdAt?: string | null;
  state: string;
  conciergeAction?: 'pass' | 'request_info' | 'keep' | null;
  conciergeReason?: string | null;
};

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Single query: donor sees their submissions + all portal/curated opportunities
  const allOpps = await db
    .select()
    .from(opportunities)
    .where(
      or(
        eq(opportunities.originDonorId, session.userId),
        isNull(opportunities.originDonorId),
      ),
    )
    .orderBy(desc(opportunities.createdAt))
    .limit(500);

  // Load donor state rows
  const states = await db
    .select()
    .from(donorOpportunityState)
    .where(eq(donorOpportunityState.donorId, session.userId))
    .limit(500);

  const stateByKey = new Map<string, string>();
  for (const s of states) {
    stateByKey.set(String(s.opportunityKey), String(s.state || 'new'));
  }

  // Load concierge events for annotation
  const events = await db
    .select()
    .from(donorOpportunityEvents)
    .where(eq(donorOpportunityEvents.donorId, session.userId))
    .limit(2000);

  const conciergeByKey = new Map<string, { action: string; reason: string }>();
  for (const evt of events) {
    if (!evt.metaJson) continue;
    try {
      const meta = JSON.parse(evt.metaJson);
      if (meta?.source !== 'concierge') continue;
      const action =
        evt.type === 'pass' ? 'pass'
          : evt.type === 'request_info' ? 'request_info'
            : 'keep';
      conciergeByKey.set(String(evt.opportunityKey), { action, reason: meta.reason || '' });
    } catch { /* ignore bad JSON */ }
  }

  // Load donor vision status
  const profile = await db.select().from(donorProfiles).where(eq(donorProfiles.donorId, session.userId)).get();
  const vision = profile?.visionJson ? JSON.parse(profile.visionJson) : null;
  const hasVision = Boolean(profile && profile.visionJson);
  const visionStage: string | null = vision?.stage ?? null;

  const rows: OpportunityRow[] = [];

  for (const opp of allOpps) {
    const key = opp.id;
    const cc = conciergeByKey.get(key);
    rows.push({
      key,
      source: opp.source,
      title: opp.title,
      orgName: opp.orgName || opp.orgEmail || 'Unknown',
      location: opp.location,
      category: opp.category,
      summary: opp.summary,
      amount: opp.targetAmount ? Number(opp.targetAmount) - Number(opp.currentAmount ?? 0) : null,
      createdAt: toIsoTime(opp.createdAt),
      state: stateByKey.get(key) ?? 'new',
      conciergeAction: (cc?.action as OpportunityRow['conciergeAction']) ?? null,
      conciergeReason: cc?.reason ?? null,
    });
  }

  // Sort newest first
  rows.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  return NextResponse.json({ opportunities: rows, hasVision, visionStage });
}
