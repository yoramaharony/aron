import { NextResponse } from 'next/server';
import { db } from '@/db';
import { donorOpportunityEvents, donorOpportunityState, donorProfiles, requests, submissionEntries } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';
import { toIsoTime } from '@/lib/time';
import { CHARIDY_CURATED } from '@/lib/charidy-curated';

type OpportunityRow = {
  key: string;
  source: 'request' | 'submission' | 'charidy';
  title: string;
  orgName: string;
  location?: string;
  category?: string;
  summary: string;
  amount?: number | null;
  createdAt?: string | null;
  state: string; // new/shortlisted/passed/...
  conciergeAction?: 'pass' | 'request_info' | 'keep' | null;
  conciergeReason?: string | null;
};

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Submissions: donor-specific
  const subs = await db
    .select()
    .from(submissionEntries)
    .where(eq(submissionEntries.donorId, session.userId))
    .orderBy(desc(submissionEntries.createdAt))
    .limit(200);

  // Requests: MVP curated list (global)
  const reqs = await db.select().from(requests).orderBy(desc(requests.createdAt)).limit(200);

  // Load donor state rows for these opportunities
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

  for (const s of subs) {
    const key = `sub_${s.id}`;
    const cc = conciergeByKey.get(key);
    rows.push({
      key,
      source: 'submission',
      title: s.title || 'Submission',
      orgName: s.orgName || s.orgEmail || 'Unknown',
      summary: s.summary,
      amount: s.amountRequested ?? null,
      createdAt: toIsoTime(s.createdAt),
      state: stateByKey.get(key) ?? 'new',
      conciergeAction: (cc?.action as OpportunityRow['conciergeAction']) ?? null,
      conciergeReason: cc?.reason ?? null,
    });
  }

  for (const r of reqs) {
    const key = String(r.id);
    const cc = conciergeByKey.get(key);
    rows.push({
      key,
      source: 'request',
      title: r.title,
      orgName: 'Curated',
      location: r.location,
      category: r.category,
      summary: r.summary,
      amount: r.targetAmount ? Number(r.targetAmount) - Number(r.currentAmount ?? 0) : null,
      createdAt: toIsoTime(r.createdAt),
      state: stateByKey.get(key) ?? 'new',
      conciergeAction: (cc?.action as OpportunityRow['conciergeAction']) ?? null,
      conciergeReason: cc?.reason ?? null,
    });
  }

  for (const c of CHARIDY_CURATED) {
    const key = c.key;
    const cc = conciergeByKey.get(key);
    rows.push({
      key,
      source: 'charidy',
      title: c.title,
      orgName: c.orgName,
      location: c.location,
      category: c.category,
      summary: c.summary,
      amount: c.fundingGap,
      createdAt: null,
      state: stateByKey.get(key) ?? 'new',
      conciergeAction: (cc?.action as OpportunityRow['conciergeAction']) ?? null,
      conciergeReason: cc?.reason ?? null,
    });
  }

  // Sort newest first
  rows.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  return NextResponse.json({ opportunities: rows, hasVision, visionStage });
}
