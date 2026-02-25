import { NextResponse } from 'next/server';
import { db } from '@/db';
import { donorOpportunityEvents, donorOpportunityState, opportunities } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { and, desc, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

type MeetingAction = 'accept' | 'reschedule' | 'propose_new_time';

function parseMeta(metaJson: string | null): Record<string, unknown> {
  if (!metaJson) return {};
  try {
    const parsed = JSON.parse(metaJson);
    if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>;
    return {};
  } catch {
    return {};
  }
}

function normalizeMeetingType(value: unknown): 'zoom' | 'phone' | 'in_person' {
  const safe = String(value || '').trim().toLowerCase();
  if (safe === 'phone') return 'phone';
  if (safe === 'in_person' || safe === 'in-person') return 'in_person';
  return 'zoom';
}

function locationForType(meetingType: 'zoom' | 'phone' | 'in_person', fallback: unknown): string {
  if (typeof fallback === 'string' && fallback.trim()) return fallback.trim();
  if (meetingType === 'phone') return 'Phone call';
  if (meetingType === 'in_person') return 'TBD';
  return 'Zoom (link will be sent)';
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTime(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
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
  const action = String(body?.action || '') as MeetingAction;

  if (!action || !['accept', 'reschedule', 'propose_new_time'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  // Verify ownership: requestor can only act on their own request/opportunity.
  const opp = await db
    .select()
    .from(opportunities)
    .where(and(eq(opportunities.id, id), eq(opportunities.createdBy, session.userId)))
    .get();
  if (!opp) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const opportunityKey = opp.id;

  const stateRow = await db
    .select()
    .from(donorOpportunityState)
    .where(eq(donorOpportunityState.opportunityKey, opportunityKey))
    .get();
  if (!stateRow) {
    return NextResponse.json({ error: 'No donor workflow found for this request' }, { status: 400 });
  }

  const latestScheduled = await db
    .select()
    .from(donorOpportunityEvents)
    .where(
      and(
        eq(donorOpportunityEvents.donorId, stateRow.donorId),
        eq(donorOpportunityEvents.opportunityKey, opportunityKey),
        eq(donorOpportunityEvents.type, 'scheduled'),
      ),
    )
    .orderBy(desc(donorOpportunityEvents.createdAt))
    .get();
  if (!latestScheduled) {
    return NextResponse.json({ error: 'No scheduled meeting found' }, { status: 400 });
  }

  const now = new Date();
  const latestMeta = parseMeta(latestScheduled.metaJson ?? null);
  const note = typeof body?.note === 'string' ? body.note.trim() : '';
  let nextMeta: Record<string, unknown>;

  if (action === 'accept') {
    nextMeta = {
      ...latestMeta,
      orgResponse: 'accepted',
      orgRespondedAt: now.toISOString(),
      orgNote: note || null,
    };
  } else {
    const rawDate = String(body?.scheduledDate || '').trim();
    const rawTime = String(body?.scheduledTime || '').trim();
    if (!isValidDate(rawDate) || !isValidTime(rawTime)) {
      return NextResponse.json({ error: 'scheduledDate and scheduledTime are required' }, { status: 400 });
    }

    const meetingType = normalizeMeetingType(body?.meetingType || latestMeta?.meetingType);
    nextMeta = {
      ...latestMeta,
      concierge: false,
      meetingType,
      scheduledFor: `${rawDate}T${rawTime}`,
      scheduledDate: rawDate,
      scheduledTime: rawTime,
      location: locationForType(meetingType, body?.location),
      orgResponse: action === 'reschedule' ? 'reschedule_requested' : 'proposed_new_time',
      orgRespondedAt: now.toISOString(),
      orgNote: note || null,
    };
  }

  await db.insert(donorOpportunityEvents).values({
    id: uuidv4(),
    donorId: stateRow.donorId,
    opportunityKey,
    type: 'scheduled',
    metaJson: JSON.stringify(nextMeta),
    createdAt: now,
  });

  await db
    .update(donorOpportunityState)
    .set({ state: 'scheduled', updatedAt: now })
    .where(eq(donorOpportunityState.id, stateRow.id));

  return NextResponse.json({ success: true, action });
}
