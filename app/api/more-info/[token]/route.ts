import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { donorOpportunityEvents, donorOpportunityState, requests, submissionEntries, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

async function findByToken(safeToken: string) {
  // Check submission_entries first, then requests
  const sub = await db.select().from(submissionEntries).where(eq(submissionEntries.moreInfoToken, safeToken)).get();
  if (sub) return { source: 'submission' as const, row: sub };

  const req = await db.select().from(requests).where(eq(requests.moreInfoToken, safeToken)).get();
  if (req) return { source: 'request' as const, row: req };

  return null;
}

export async function GET(_request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const safeToken = String(token || '');
  if (!safeToken) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  const found = await findByToken(safeToken);
  if (!found) return NextResponse.json({ error: 'Invalid token' }, { status: 404 });

  if (found.source === 'submission') {
    const row = found.row;
    return NextResponse.json({
      valid: true,
      submissionId: row.id,
      orgName: row.orgName ?? null,
      orgEmail: row.orgEmail ?? null,
      title: row.title ?? null,
      amountRequested: row.amountRequested ?? row.extractedAmount ?? null,
      submittedAt: row.moreInfoSubmittedAt ?? null,
      existing: row.detailsJson ? JSON.parse(row.detailsJson) : null,
    });
  }

  // source === 'request' — look up the creator's name/email
  const row = found.row;
  const creator = row.createdBy
    ? await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, row.createdBy)).get()
    : null;

  return NextResponse.json({
    valid: true,
    requestId: row.id,
    orgName: creator?.name ?? null,
    orgEmail: creator?.email ?? null,
    title: row.title ?? null,
    amountRequested: row.targetAmount ?? null,
    submittedAt: row.moreInfoSubmittedAt ?? null,
    existing: row.detailsJson ? JSON.parse(row.detailsJson) : null,
  });
}

export async function POST(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const safeToken = String(token || '');
  if (!safeToken) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  const found = await findByToken(safeToken);
  if (!found) return NextResponse.json({ error: 'Invalid token' }, { status: 404 });

  const body = await request.json().catch(() => ({}));

  const details = {
    orgWebsite: typeof body?.orgWebsite === 'string' ? body.orgWebsite.trim() : null,
    mission: typeof body?.mission === 'string' ? body.mission.trim() : null,
    program: typeof body?.program === 'string' ? body.program.trim() : null,
    geo: typeof body?.geo === 'string' ? body.geo.trim() : null,
    beneficiaries: typeof body?.beneficiaries === 'string' ? body.beneficiaries.trim() : null,
    budget: typeof body?.budget === 'string' ? body.budget.trim() : null,
    amountRequested: typeof body?.amountRequested === 'string' ? body.amountRequested.trim() : null,
    timeline: typeof body?.timeline === 'string' ? body.timeline.trim() : null,
    governance: typeof body?.governance === 'string' ? body.governance.trim() : null,
    leadership: typeof body?.leadership === 'string' ? body.leadership.trim() : null,
    proofLinks: typeof body?.proofLinks === 'string' ? body.proofLinks.trim() : null,
    supportingDocs: Array.isArray(body?.supportingDocs) ? body.supportingDocs : null,
    updatedAt: new Date().toISOString(),
  };

  // Determine the opportunity key used for donor tracking
  let opportunityKey: string;
  if (found.source === 'submission') {
    opportunityKey = `sub_${found.row.id}`;
    await db
      .update(submissionEntries)
      .set({
        detailsJson: JSON.stringify(details),
        moreInfoSubmittedAt: new Date(),
        status: 'more_info_submitted',
      })
      .where(eq(submissionEntries.id, found.row.id));
  } else {
    opportunityKey = found.row.id;
    await db
      .update(requests)
      .set({
        detailsJson: JSON.stringify(details),
        moreInfoSubmittedAt: new Date(),
        status: 'more_info_submitted',
      })
      .where(eq(requests.id, found.row.id));
  }

  // Record info_received event on the donor side so timeline + stepper update
  const stateRow = await db
    .select()
    .from(donorOpportunityState)
    .where(eq(donorOpportunityState.opportunityKey, opportunityKey))
    .get();

  if (stateRow) {
    await db.insert(donorOpportunityEvents).values({
      id: uuidv4(),
      donorId: stateRow.donorId,
      opportunityKey,
      type: 'info_received',
      metaJson: null,
      createdAt: new Date(),
    });
  }

  return NextResponse.json({ success: true });
}
