import { NextResponse } from 'next/server';
import { db } from '@/db';
import { donorOpportunityEvents, donorOpportunityState, submissionEntries } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(request: Request, { params }: { params: { key: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return forbidden();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolvedParams: any = await (params as any);
  const key = String(resolvedParams?.key || '');
  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const action = typeof body?.action === 'string' ? body.action : '';

  const actionToState: Record<string, string> = {
    save: 'shortlisted',
    shortlist: 'shortlisted',
    pass: 'passed',
    reset: 'new',
    request_info: 'requested_info',
    scheduled: 'scheduled',
    funded: 'funded',
  };

  if (!action || !actionToState[action]) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const donorId = session.userId;
  const state = actionToState[action];
  let moreInfoUrl: string | null = null;

  // Upsert state row (via unique index donor+key)
  const existing = await db
    .select()
    .from(donorOpportunityState)
    .where(eq(donorOpportunityState.donorId, donorId))
    .limit(500);
  const row = existing.find((r) => String(r.opportunityKey) === key);

  const now = new Date();
  if (!row) {
    await db.insert(donorOpportunityState).values({
      id: uuidv4(),
      donorId,
      opportunityKey: key,
      state,
      updatedAt: now,
    });
  } else {
    await db
      .update(donorOpportunityState)
      .set({ state, updatedAt: now })
      .where(eq(donorOpportunityState.id, row.id));
  }

  await db.insert(donorOpportunityEvents).values({
    id: uuidv4(),
    donorId,
    opportunityKey: key,
    type: action,
    metaJson: body?.meta ? JSON.stringify(body.meta) : null,
  });

  // Progressive disclosure: on request_info for submissions, mint token + link
  if (action === 'request_info' && key.startsWith('sub_')) {
    const submissionId = key.slice('sub_'.length);
    const sub = await db.select().from(submissionEntries).where(eq(submissionEntries.id, submissionId)).get();
    if (sub && String(sub.donorId) === String(donorId)) {
      const token = sub.moreInfoToken || uuidv4();
      if (!sub.moreInfoToken) {
        await db
          .update(submissionEntries)
          .set({ moreInfoToken: token, moreInfoRequestedAt: new Date(), status: 'more_info_requested' })
          .where(eq(submissionEntries.id, submissionId));
      }
      const origin = new URL(request.url).origin;
      moreInfoUrl = `${origin}/more-info/${token}`;
    }
  }

  return NextResponse.json({ success: true, state, moreInfoUrl });
}

