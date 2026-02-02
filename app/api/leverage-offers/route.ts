import { NextResponse } from 'next/server';
import { db } from '@/db';
import { donorOpportunityEvents, leverageOffers } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return forbidden();

  const url = new URL(request.url);
  const key = url.searchParams.get('opportunityKey');

  const rows = await db
    .select()
    .from(leverageOffers)
    .where(eq(leverageOffers.donorId, session.userId))
    .orderBy(desc(leverageOffers.createdAt))
    .limit(100);

  const filtered = key ? rows.filter((r) => String(r.opportunityKey) === key) : rows;

  return NextResponse.json({
    offers: filtered.map((o) => ({
      id: o.id,
      opportunityKey: o.opportunityKey,
      anchorAmount: o.anchorAmount,
      matchMode: o.matchMode,
      challengeGoal: o.challengeGoal,
      topUpCap: o.topUpCap,
      deadline: o.deadline,
      terms: o.termsJson ? JSON.parse(o.termsJson) : null,
      status: o.status,
      createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : null,
      updatedAt: o.updatedAt ? new Date(o.updatedAt).toISOString() : null,
    })),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return forbidden();

  const body = await request.json().catch(() => ({}));
  const opportunityKey = typeof body?.opportunityKey === 'string' ? body.opportunityKey : '';
  const anchorAmount = Number(body?.anchorAmount);
  const matchMode = typeof body?.matchMode === 'string' ? body.matchMode : 'match';
  const challengeGoal = Number(body?.challengeGoal);
  const topUpCap = Number(body?.topUpCap);
  const deadline = typeof body?.deadline === 'string' ? body.deadline : '';
  const terms = body?.terms ?? null;

  if (!opportunityKey || !deadline) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  if (!Number.isFinite(anchorAmount) || anchorAmount <= 0) return NextResponse.json({ error: 'Invalid anchorAmount' }, { status: 400 });
  if (!Number.isFinite(challengeGoal) || challengeGoal < 0) return NextResponse.json({ error: 'Invalid challengeGoal' }, { status: 400 });
  if (!Number.isFinite(topUpCap) || topUpCap < 0) return NextResponse.json({ error: 'Invalid topUpCap' }, { status: 400 });
  if (matchMode !== 'match' && matchMode !== 'remainder') return NextResponse.json({ error: 'Invalid matchMode' }, { status: 400 });

  const id = uuidv4();
  const now = new Date();

  await db.insert(leverageOffers).values({
    id,
    donorId: session.userId,
    opportunityKey,
    anchorAmount,
    matchMode,
    challengeGoal,
    topUpCap,
    deadline,
    termsJson: terms ? JSON.stringify(terms) : null,
    status: 'created',
    updatedAt: now,
  });

  await db.insert(donorOpportunityEvents).values({
    id: uuidv4(),
    donorId: session.userId,
    opportunityKey,
    type: 'leverage_created',
    metaJson: JSON.stringify({ leverageOfferId: id, anchorAmount, challengeGoal, deadline }),
  });

  return NextResponse.json({ success: true, offerId: id });
}

