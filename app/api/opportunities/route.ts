import { NextResponse } from 'next/server';
import { db } from '@/db';
import { donorOpportunityState, requests, submissionEntries } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';
import { toIsoTime } from '@/lib/time';

type OpportunityRow = {
  key: string;
  source: 'request' | 'submission';
  title: string;
  orgName: string;
  location?: string;
  category?: string;
  summary: string;
  amount?: number | null;
  createdAt?: string | null;
  state: string; // new/shortlisted/passed/...
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

  const allKeys = [
    ...subs.map((s) => `sub_${s.id}`),
    ...reqs.map((r) => String(r.id)),
  ];

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

  const rows: OpportunityRow[] = [];

  for (const s of subs) {
    const key = `sub_${s.id}`;
    rows.push({
      key,
      source: 'submission',
      title: s.title || 'Submission',
      orgName: s.orgName || s.orgEmail || 'Unknown',
      summary: s.summary,
      amount: s.amountRequested ?? null,
      createdAt: toIsoTime(s.createdAt),
      state: stateByKey.get(key) ?? 'new',
    });
  }

  for (const r of reqs) {
    const key = String(r.id);
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
    });
  }

  // Sort newest first
  rows.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  return NextResponse.json({ opportunities: rows });
}

