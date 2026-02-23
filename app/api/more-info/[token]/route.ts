import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { donorOpportunityEvents, donorOpportunityState, opportunities, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

async function findByToken(safeToken: string) {
  const row = await db.select().from(opportunities).where(eq(opportunities.moreInfoToken, safeToken)).get();
  if (row) return row;
  return null;
}

export async function GET(_request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const safeToken = String(token || '');
  if (!safeToken) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  const row = await findByToken(safeToken);
  if (!row) return NextResponse.json({ error: 'Invalid token' }, { status: 404 });

  // Look up the creator's name/email for display
  const creator = row.createdBy
    ? await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, row.createdBy)).get()
    : null;

  return NextResponse.json({
    valid: true,
    opportunityId: row.id,
    orgName: row.orgName ?? creator?.name ?? null,
    orgEmail: row.orgEmail ?? creator?.email ?? null,
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

  const row = await findByToken(safeToken);
  if (!row) return NextResponse.json({ error: 'Invalid token' }, { status: 404 });

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

  // opportunityKey is just the row id — no prefix
  const opportunityKey = row.id;

  await db
    .update(opportunities)
    .set({
      detailsJson: JSON.stringify(details),
      moreInfoSubmittedAt: new Date(),
      status: 'more_info_submitted',
    })
    .where(eq(opportunities.id, row.id));

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

    // Concierge auto-schedules a meeting 3 days out
    const now = new Date();
    const meetingDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    await db.insert(donorOpportunityEvents).values({
      id: uuidv4(),
      donorId: stateRow.donorId,
      opportunityKey,
      type: 'scheduled',
      metaJson: JSON.stringify({
        concierge: true,
        meetingType: 'zoom',
        scheduledFor: meetingDate.toISOString().slice(0, 16),
        scheduledDate: meetingDate.toISOString().slice(0, 10),
        scheduledTime: '14:00',
        location: 'Zoom (link will be sent)',
        agenda: `Review ${row.title} — program overview, financial sustainability, and impact metrics.`,
        conciergeName: 'David Goldstein',
      }),
      createdAt: new Date(),
    });

    // Advance state to scheduled
    await db
      .update(donorOpportunityState)
      .set({ state: 'scheduled', updatedAt: new Date() })
      .where(eq(donorOpportunityState.id, stateRow.id));
  }

  return NextResponse.json({ success: true });
}
