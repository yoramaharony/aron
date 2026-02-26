import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
  dafGrantDocuments,
  dafGrants,
  donorOpportunityEvents,
  donorOpportunityState,
  opportunities,
} from '@/db/schema';
import { getSession } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const DEMO_ASSIST_ENABLED = process.env.NODE_ENV !== 'production';

async function upsertFundedState(donorId: string, opportunityKey: string, now: Date) {
  await db.insert(donorOpportunityState).values({
    id: uuidv4(),
    donorId,
    opportunityKey,
    state: 'funded',
    updatedAt: now,
  }).onConflictDoUpdate({
    target: [donorOpportunityState.donorId, donorOpportunityState.opportunityKey],
    set: {
      state: 'funded',
      updatedAt: now,
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const grant = await db.select().from(dafGrants).where(eq(dafGrants.id, id)).get();
  if (!grant) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const aiSimulated = Boolean(body?.aiSimulated);

  let authorized = false;
  if (session.role === 'admin') authorized = true;
  if (session.role === 'requestor') {
    const opp = await db
      .select()
      .from(opportunities)
      .where(and(eq(opportunities.id, grant.opportunityKey), eq(opportunities.createdBy, session.userId)))
      .get();
    authorized = Boolean(opp);
  }
  if (session.role === 'donor' && grant.donorId === session.userId && aiSimulated && DEMO_ASSIST_ENABLED) {
    authorized = true;
  }

  if (!authorized) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const fileUrl = typeof body?.fileUrl === 'string' ? body.fileUrl.trim() : '';
  const fileName = typeof body?.fileName === 'string' ? body.fileName.trim() : '';
  const now = new Date();

  await db
    .update(dafGrants)
    .set({
      status: 'received',
      receivedAt: now,
      updatedAt: now,
    })
    .where(eq(dafGrants.id, id));

  if (fileUrl && fileName) {
    await db.insert(dafGrantDocuments).values({
      id: uuidv4(),
      dafGrantId: id,
      type: 'receipt',
      fileUrl,
      fileName,
      uploadedByRole: session.role,
      createdAt: now,
    });
  } else if (aiSimulated) {
    await db.insert(dafGrantDocuments).values({
      id: uuidv4(),
      dafGrantId: id,
      type: 'receipt',
      fileUrl: '/api/receipts/demo?index=1',
      fileName: 'DAF_Receipt_Confirmation_Demo.html',
      uploadedByRole: 'system',
      createdAt: now,
    });
  }

  await db.insert(donorOpportunityEvents).values({
    id: uuidv4(),
    donorId: grant.donorId,
    opportunityKey: grant.opportunityKey,
    type: 'daf_received',
    metaJson: JSON.stringify({ dafGrantId: grant.id }),
    createdAt: now,
  });

  // Finalize using existing funded semantics so /donor/pledges picks it up.
  await upsertFundedState(grant.donorId, grant.opportunityKey, now);
  await db.update(opportunities).set({ status: 'funded' }).where(eq(opportunities.id, grant.opportunityKey));
  await db.insert(donorOpportunityEvents).values({
    id: uuidv4(),
    donorId: grant.donorId,
    opportunityKey: grant.opportunityKey,
    type: 'funded',
    metaJson: JSON.stringify({
      source: 'daf',
      dafGrantId: grant.id,
      sponsorName: grant.sponsorName,
      amount: grant.amount,
      note: 'Funding confirmed via DAF process',
    }),
    createdAt: now,
  });

  return NextResponse.json({ success: true });
}

