import { NextResponse } from 'next/server';
import { db } from '@/db';
import { opportunities, donorOpportunityState, donorOpportunityEvents, users } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { and, desc, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * Demo-only endpoint: simulates a concierge advancing the stage of a request.
 * Each stage advance injects realistic concierge-generated detail into the event log.
 */

type AdvanceStage = 'info_requested' | 'scheduled' | 'meeting_completed' | 'diligence_completed' | 'funded';

const ACTION_MAP: Record<AdvanceStage, string> = {
  info_requested: 'request_info',
  scheduled: 'scheduled',
  meeting_completed: 'meeting_completed',
  diligence_completed: 'diligence_completed',
  funded: 'funded',
};

const STATE_MAP: Record<AdvanceStage, string> = {
  info_requested: 'shortlisted',
  scheduled: 'scheduled',
  meeting_completed: 'scheduled',
  diligence_completed: 'shortlisted',
  funded: 'funded',
};

function generateConciergeData(stage: AdvanceStage, request: { title: string; targetAmount: number | null }): Record<string, unknown> {
  const now = new Date();
  const meetingDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const amount = request.targetAmount ?? 50000;

  switch (stage) {
    case 'info_requested':
      return {
        concierge: true,
        note: 'Additional documentation requested — financial statements, board resolution, and program impact report.',
        requestedDocs: ['Financial statements (last 2 years)', 'Board resolution', 'Program impact report'],
      };

    case 'scheduled':
      return {
        concierge: true,
        meetingType: 'zoom',
        scheduledFor: meetingDate.toISOString().slice(0, 16),
        scheduledDate: meetingDate.toISOString().slice(0, 10),
        scheduledTime: '14:00',
        location: 'Zoom (link will be sent)',
        agenda: `Review ${request.title} — program overview, financial sustainability, and impact metrics.`,
        conciergeName: 'David Goldstein',
      };

    case 'meeting_completed':
      return {
        concierge: true,
        aiGenerated: true,
        occurredAt: now.toISOString(),
        summary: `Meeting with organization leadership was productive. They presented a clear operational plan with defined milestones. The team demonstrated strong community ties and transparent financial management. Key discussion points included funding allocation timeline, measurable outcomes, and reporting cadence.`,
        tone: 'Promising',
        confirmRequestedAmount: amount > 100000 ? 'partially' : 'yes',
        amountNegotiable: 'yes',
        expectedTimeline: amount > 100000 ? '12 months' : '6 months',
        followUps: {
          siteVisit: amount > 100000,
          referenceCalls: true,
          financialAudit: amount > 50000,
          rabbinicEndorsement: true,
          legalStructureVerification: false,
        },
      };

    case 'diligence_completed':
      return {
        concierge: true,
        assessment: 'Organization meets all due diligence criteria. Financial records are well-maintained, references are strong, and community impact is well-documented.',
        checklistResults: {
          siteVisit: { done: amount > 100000, note: amount > 100000 ? 'Site visit completed — facilities well-maintained' : 'Not required for this amount' },
          referenceCalls: { done: true, note: '3 references contacted — all highly positive' },
          financialAudit: { done: amount > 50000, note: amount > 50000 ? 'Financial audit reviewed — clean opinion' : 'Not required for this amount' },
          rabbinicEndorsement: { done: true, note: 'Endorsed by community Rav' },
        },
        riskLevel: 'Low',
        recommendation: 'Recommended for funding',
      };

    case 'funded':
      return {
        concierge: true,
        note: 'Approved by concierge team. Commitment confirmed and pledge recorded.',
        pledgeAmount: amount,
        recommendation: `Full funding of $${amount.toLocaleString()} recommended based on completed due diligence.`,
      };
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'requestor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const stage = body?.stage as AdvanceStage;

  if (!stage || !ACTION_MAP[stage]) {
    return NextResponse.json({ error: 'Invalid stage. Use: info_requested, scheduled, meeting_completed, diligence_completed, funded' }, { status: 400 });
  }

  // Verify the opportunity belongs to this requestor
  const row = await db
    .select()
    .from(opportunities)
    .where(and(eq(opportunities.id, id), eq(opportunities.createdBy, session.userId)))
    .get();

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const opportunityKey = id;
  const title = row.title;
  const targetAmount = row.targetAmount ?? null;

  // Find or create a donor state for this opportunity.
  let stateRow = await db
    .select()
    .from(donorOpportunityState)
    .where(eq(donorOpportunityState.opportunityKey, opportunityKey))
    .get();

  let donorId: string;

  if (stateRow) {
    donorId = stateRow.donorId;
  } else {
    const donor = await db.select().from(users).where(eq(users.role, 'donor')).get();
    if (!donor) return NextResponse.json({ error: 'No donor user found in DB (needed for demo)' }, { status: 400 });
    donorId = donor.id;

    await db.insert(donorOpportunityState).values({
      id: uuidv4(),
      donorId,
      opportunityKey,
      state: 'shortlisted',
      updatedAt: new Date(),
    });
  }

  if (stage === 'meeting_completed') {
    const latestScheduled = await db
      .select()
      .from(donorOpportunityEvents)
      .where(
        and(
          eq(donorOpportunityEvents.donorId, donorId),
          eq(donorOpportunityEvents.opportunityKey, opportunityKey),
          eq(donorOpportunityEvents.type, 'scheduled'),
        ),
      )
      .orderBy(desc(donorOpportunityEvents.createdAt))
      .get();

    let confirmed = false;
    if (latestScheduled?.metaJson) {
      try {
        const meta = JSON.parse(latestScheduled.metaJson) as Record<string, unknown>;
        confirmed = String(meta?.orgResponse || '') === 'accepted';
      } catch {
        confirmed = false;
      }
    }

    if (!confirmed) {
      return NextResponse.json(
        { error: 'Meeting can only be completed after schedule is confirmed by the organization.' },
        { status: 400 },
      );
    }
  }

  // Update state
  await db
    .update(donorOpportunityState)
    .set({ state: STATE_MAP[stage], updatedAt: new Date() })
    .where(
      and(
        eq(donorOpportunityState.donorId, donorId),
        eq(donorOpportunityState.opportunityKey, opportunityKey),
      ),
    );

  // Insert event with concierge-generated data
  const meta = generateConciergeData(stage, { title, targetAmount });

  await db.insert(donorOpportunityEvents).values({
    id: uuidv4(),
    donorId,
    opportunityKey,
    type: ACTION_MAP[stage],
    metaJson: JSON.stringify(meta),
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true, stage, state: STATE_MAP[stage] });
}
