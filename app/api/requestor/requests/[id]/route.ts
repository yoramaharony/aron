import { NextResponse } from 'next/server';
import { db } from '@/db';
import { opportunities, donorOpportunityState, donorOpportunityEvents, dafGrants, dafGrantDocuments } from '@/db/schema';
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
    .from(opportunities)
    .where(and(eq(opportunities.id, id), eq(opportunities.createdBy, session.userId)))
    .get();

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // opportunityKey is just the id — no prefix
  const opportunityKey = id;

  // Find donor-side progress (anonymized — no donor identity exposed)
  const stateRows = await db
    .select()
    .from(donorOpportunityState)
    .where(eq(donorOpportunityState.opportunityKey, opportunityKey))
    .limit(1);

  const donorState = stateRows[0] ?? null;
  const donorId = donorState?.donorId ?? null;

  let events: { type: string; meta: Record<string, unknown> | null; createdAt: string | null }[] = [];
  let daf: Array<{
    id: string;
    donorId: string;
    sponsorName: string;
    amount: number;
    designation: string;
    status: string;
    submittedAt: string | null;
    receivedAt: string | null;
    documents: Array<{ id: string; type: string; fileUrl: string; fileName: string; uploadedByRole: string; createdAt: string | null }>;
  }> = [];

  if (donorId) {
    const eventRows = await db
      .select()
      .from(donorOpportunityEvents)
      .where(
        and(
          eq(donorOpportunityEvents.donorId, donorId),
          eq(donorOpportunityEvents.opportunityKey, opportunityKey),
        ),
      )
      .orderBy(desc(donorOpportunityEvents.createdAt));

    events = eventRows.map((e) => ({
      type: e.type,
      meta: e.metaJson ? JSON.parse(e.metaJson) : null,
      createdAt: toIsoTime(e.createdAt),
    }));
  }

  const dafRows = await db
    .select()
    .from(dafGrants)
    .where(eq(dafGrants.opportunityKey, opportunityKey))
    .orderBy(desc(dafGrants.createdAt));

  daf = await Promise.all(
    dafRows.map(async (g) => {
      const docs = await db
        .select()
        .from(dafGrantDocuments)
        .where(eq(dafGrantDocuments.dafGrantId, g.id))
        .orderBy(desc(dafGrantDocuments.createdAt));
      return {
        id: g.id,
        donorId: g.donorId,
        sponsorName: g.sponsorName,
        amount: Number(g.amount || 0),
        designation: g.designation,
        status: g.status,
        submittedAt: toIsoTime(g.submittedAt),
        receivedAt: toIsoTime(g.receivedAt),
        documents: docs.map((d) => ({
          id: d.id,
          type: d.type,
          fileUrl: d.fileUrl,
          fileName: d.fileName,
          uploadedByRole: d.uploadedByRole,
          createdAt: toIsoTime(d.createdAt),
        })),
      };
    }),
  );

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
    daf,
  });
}
