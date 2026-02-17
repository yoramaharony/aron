import { NextResponse } from 'next/server';
import { db } from '@/db';
import { requests, donorOpportunityState, donorOpportunityEvents } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { and, desc, eq } from 'drizzle-orm';
import { toIsoTime } from '@/lib/time';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'requestor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  const row = await db
    .select()
    .from(requests)
    .where(and(eq(requests.id, id), eq(requests.createdBy, session.userId)))
    .get();

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Find donor-side progress for this request (anonymized — no donor identity exposed)
  const stateRows = await db
    .select()
    .from(donorOpportunityState)
    .where(eq(donorOpportunityState.opportunityKey, id))
    .limit(1);

  const donorState = stateRows[0] ?? null;
  const donorId = donorState?.donorId ?? null;

  let events: { type: string; meta: Record<string, unknown> | null; createdAt: string | null }[] = [];

  if (donorId) {
    const eventRows = await db
      .select()
      .from(donorOpportunityEvents)
      .where(
        and(
          eq(donorOpportunityEvents.donorId, donorId),
          eq(donorOpportunityEvents.opportunityKey, id),
        ),
      )
      .orderBy(desc(donorOpportunityEvents.createdAt));

    events = eventRows.map((e) => ({
      type: e.type,
      meta: e.metaJson ? JSON.parse(e.metaJson) : null,
      createdAt: toIsoTime(e.createdAt),
    }));
  }

  const evidence = row.evidenceJson ? JSON.parse(row.evidenceJson) : null;

  return NextResponse.json({
    request: {
      id: row.id,
      title: row.title,
      category: row.category,
      location: row.location,
      summary: row.summary,
      targetAmount: row.targetAmount,
      currentAmount: row.currentAmount,
      status: row.status,
      coverUrl: row.coverUrl,
      evidence,
      moreInfoToken: row.moreInfoToken ?? null,
      moreInfoSubmittedAt: toIsoTime(row.moreInfoSubmittedAt),
      details: row.detailsJson ? JSON.parse(row.detailsJson) : null,
      createdAt: toIsoTime(row.createdAt),
    },
    state: donorState?.state ?? 'new',
    events,
  });
}
