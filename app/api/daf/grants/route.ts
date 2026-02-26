import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
  dafGrantDocuments,
  dafGrants,
  donorFundingSources,
  donorOpportunityEvents,
  opportunities,
} from '@/db/schema';
import { getSession } from '@/lib/auth';
import { and, desc, eq, or, isNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { DAF_SPONSORS } from '@/lib/daf-sponsors';
import { toIsoTime } from '@/lib/time';

async function requireDonor() {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  if (session.role !== 'donor') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { session };
}

async function ensureVisibleOpportunity(opportunityKey: string, donorId: string) {
  const opp = await db
    .select()
    .from(opportunities)
    .where(
      and(
        eq(opportunities.id, opportunityKey),
        or(eq(opportunities.originDonorId, donorId), isNull(opportunities.originDonorId)),
      ),
    )
    .get();
  return opp;
}

export async function GET(request: NextRequest) {
  const { session, error } = await requireDonor();
  if (error || !session) return error!;

  const opportunityKey = request.nextUrl.searchParams.get('opportunityKey')?.trim() || '';
  let rows;
  if (opportunityKey) {
    rows = await db
      .select()
      .from(dafGrants)
      .where(and(eq(dafGrants.donorId, session.userId), eq(dafGrants.opportunityKey, opportunityKey)))
      .orderBy(desc(dafGrants.createdAt));
  } else {
    rows = await db
      .select()
      .from(dafGrants)
      .where(eq(dafGrants.donorId, session.userId))
      .orderBy(desc(dafGrants.createdAt))
      .limit(200);
  }

  const grantIds = rows.map((r) => r.id);
  const docs = grantIds.length
    ? await db
      .select()
      .from(dafGrantDocuments)
      .where(eq(dafGrantDocuments.dafGrantId, grantIds[0])) // first fast path below
    : [];
  const docsByGrant = new Map<string, Array<{ id: string; type: string; fileUrl: string; fileName: string; uploadedByRole: string; createdAt: string | null }>>();
  // Query all docs per grant (small N in MVP)
  for (const id of grantIds) {
    const d = await db
      .select()
      .from(dafGrantDocuments)
      .where(eq(dafGrantDocuments.dafGrantId, id))
      .orderBy(desc(dafGrantDocuments.createdAt));
    docsByGrant.set(
      id,
      d.map((x) => ({
        id: x.id,
        type: x.type,
        fileUrl: x.fileUrl,
        fileName: x.fileName,
        uploadedByRole: x.uploadedByRole,
        createdAt: toIsoTime(x.createdAt),
      })),
    );
  }
  void docs;

  return NextResponse.json({
    sponsors: DAF_SPONSORS,
    grants: rows.map((r) => ({
      id: r.id,
      opportunityKey: r.opportunityKey,
      donorId: r.donorId,
      fundingSourceId: r.fundingSourceId ?? null,
      sponsorName: r.sponsorName,
      amount: r.amount,
      designation: r.designation,
      status: r.status,
      sponsorReference: r.sponsorReference ?? '',
      donorNote: r.donorNote ?? '',
      submittedAt: toIsoTime(r.submittedAt),
      receivedAt: toIsoTime(r.receivedAt),
      createdAt: toIsoTime(r.createdAt),
      updatedAt: toIsoTime(r.updatedAt),
      documents: docsByGrant.get(r.id) ?? [],
    })),
  });
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireDonor();
  if (error || !session) return error!;

  const body = await request.json().catch(() => ({}));
  const opportunityKey = typeof body?.opportunityKey === 'string' ? body.opportunityKey.trim() : '';
  const sponsorName = typeof body?.sponsorName === 'string' ? body.sponsorName.trim() : '';
  const designation = typeof body?.designation === 'string' ? body.designation.trim() : '';
  const donorNote = typeof body?.donorNote === 'string' ? body.donorNote.trim() : '';
  const fundingSourceId = typeof body?.fundingSourceId === 'string' ? body.fundingSourceId.trim() : '';
  const amount = Number(body?.amount ?? 0);

  if (!opportunityKey || !sponsorName || !designation || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'opportunityKey, sponsorName, amount, designation are required' }, { status: 400 });
  }

  const opp = await ensureVisibleOpportunity(opportunityKey, session.userId);
  if (!opp) return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });

  let sourceId: string | null = null;
  if (fundingSourceId) {
    const source = await db
      .select()
      .from(donorFundingSources)
      .where(and(eq(donorFundingSources.id, fundingSourceId), eq(donorFundingSources.donorId, session.userId)))
      .get();
    if (!source) return NextResponse.json({ error: 'Funding source not found' }, { status: 404 });
    sourceId = source.id;
  }

  const now = new Date();
  const grantId = uuidv4();
  await db.insert(dafGrants).values({
    id: grantId,
    opportunityKey,
    donorId: session.userId,
    fundingSourceId: sourceId,
    sponsorName,
    amount: Math.round(amount),
    designation,
    donorNote: donorNote || null,
    status: 'packet_generated',
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(dafGrantDocuments).values({
    id: uuidv4(),
    dafGrantId: grantId,
    type: 'packet',
    fileUrl: `/api/daf/grants/${grantId}/packet`,
    fileName: `DAF_Grant_Packet_${opp.id}.txt`,
    uploadedByRole: 'system',
    createdAt: now,
  });

  await db.insert(donorOpportunityEvents).values({
    id: uuidv4(),
    donorId: session.userId,
    opportunityKey,
    type: 'daf_packet_generated',
    metaJson: JSON.stringify({ dafGrantId: grantId, sponsorName, amount: Math.round(amount) }),
    createdAt: now,
  });

  return NextResponse.json({ success: true, dafGrantId: grantId });
}

