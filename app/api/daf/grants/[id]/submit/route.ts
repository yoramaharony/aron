import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dafGrantDocuments, dafGrants, donorOpportunityEvents } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const grant = await db.select().from(dafGrants).where(eq(dafGrants.id, id)).get();
  if (!grant) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (session.role !== 'donor' || grant.donorId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const sponsorReference = typeof body?.sponsorReference === 'string' ? body.sponsorReference.trim() : '';
  const fileUrl = typeof body?.fileUrl === 'string' ? body.fileUrl.trim() : '';
  const fileName = typeof body?.fileName === 'string' ? body.fileName.trim() : '';
  const aiSimulated = Boolean(body?.aiSimulated);
  const now = new Date();

  await db
    .update(dafGrants)
    .set({
      status: 'submitted',
      sponsorReference: sponsorReference || null,
      submittedAt: now,
      updatedAt: now,
    })
    .where(eq(dafGrants.id, id));

  if (fileUrl && fileName) {
    await db.insert(dafGrantDocuments).values({
      id: uuidv4(),
      dafGrantId: id,
      type: 'sponsor_confirmation',
      fileUrl,
      fileName,
      uploadedByRole: 'donor',
      createdAt: now,
    });
  } else if (aiSimulated) {
    await db.insert(dafGrantDocuments).values({
      id: uuidv4(),
      dafGrantId: id,
      type: 'sponsor_confirmation',
      fileUrl: '/api/receipts/demo?index=0',
      fileName: 'DAF_Sponsor_Confirmation_Demo.html',
      uploadedByRole: 'system',
      createdAt: now,
    });
  }

  await db.insert(donorOpportunityEvents).values({
    id: uuidv4(),
    donorId: grant.donorId,
    opportunityKey: grant.opportunityKey,
    type: 'daf_submitted',
    metaJson: JSON.stringify({ dafGrantId: grant.id, sponsorReference: sponsorReference || null }),
    createdAt: now,
  });

  return NextResponse.json({ success: true });
}

