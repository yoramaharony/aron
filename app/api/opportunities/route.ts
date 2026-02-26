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
  progressBadge?: 'info_requested' | 'meeting_scheduled' | 'info_received' | 'meeting_completed' | 'in_review' | 'daf_in_progress' | 'daf_submitted' | 'funded' | null;
  lowAmount?: boolean;
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
  const eventTypesByKey = new Map<string, Set<string>>();
  for (const evt of events) {
    const key = String(evt.opportunityKey);
    const current = eventTypesByKey.get(key) ?? new Set<string>();
    current.add(String(evt.type || ''));
    eventTypesByKey.set(key, current);

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
    const state = stateByKey.get(key) ?? 'new';
    const types = eventTypesByKey.get(key) ?? new Set<string>();

    let progressBadge: OpportunityRow['progressBadge'] = null;
    if (state === 'funded') progressBadge = 'funded';
    else if (types.has('diligence_completed')) progressBadge = 'in_review';
    else if (types.has('daf_submitted')) progressBadge = 'daf_submitted';
    else if (types.has('daf_packet_generated')) progressBadge = 'daf_in_progress';
    else if (types.has('meeting_completed')) progressBadge = 'meeting_completed';
    else if (types.has('scheduled')) progressBadge = 'meeting_scheduled';
    else if (types.has('info_received')) progressBadge = 'info_received';
    else if (types.has('request_info')) progressBadge = 'info_requested';

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
      state,
      conciergeAction: (cc?.action as OpportunityRow['conciergeAction']) ?? null,
      conciergeReason: cc?.reason ?? null,
      progressBadge,
      lowAmount: opp.targetAmount != null ? Number(opp.targetAmount) < 25000 : false,
    });
  }

  // Sort newest first
  rows.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  return NextResponse.json({ opportunities: rows, hasVision, visionStage });
}
