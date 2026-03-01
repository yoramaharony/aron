import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dafGrants, donorFundingSources } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { and, desc, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { DAF_SPONSORS } from '@/lib/daf-sponsors';

async function requireDonor() {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  if (session.role !== 'donor') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { session };
}

export async function GET() {
  const { session, error } = await requireDonor();
  if (error || !session) return error!;

  const rows = await db
    .select()
    .from(donorFundingSources)
    .where(eq(donorFundingSources.donorId, session.userId))
    .orderBy(desc(donorFundingSources.isDefault), desc(donorFundingSources.createdAt));

  return NextResponse.json({
    sponsors: DAF_SPONSORS,
    fundingSources: rows.map((r) => ({
      id: r.id,
      type: r.type,
      sponsorName: r.sponsorName,
      accountNickname: r.accountNickname ?? '',
      isDefault: Boolean(r.isDefault),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    })),
  });
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireDonor();
  if (error || !session) return error!;

  const body = await request.json().catch(() => ({}));
  const sponsorName = typeof body?.sponsorName === 'string' ? body.sponsorName.trim() : '';
  const accountNickname = typeof body?.accountNickname === 'string' ? body.accountNickname.trim() : '';
  const isDefault = Boolean(body?.isDefault);

  if (!sponsorName) {
    return NextResponse.json({ error: 'sponsorName is required' }, { status: 400 });
  }

  const now = new Date();
  if (isDefault) {
    await db
      .update(donorFundingSources)
      .set({ isDefault: 0, updatedAt: now })
      .where(eq(donorFundingSources.donorId, session.userId));
  }

  const id = uuidv4();
  await db.insert(donorFundingSources).values({
    id,
    donorId: session.userId,
    type: 'daf',
    sponsorName,
    accountNickname: accountNickname || null,
    isDefault: isDefault ? 1 : 0,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ success: true, id });
}

export async function PATCH(request: NextRequest) {
  const { session, error } = await requireDonor();
  if (error || !session) return error!;

  const body = await request.json().catch(() => ({}));
  const id = typeof body?.id === 'string' ? body.id.trim() : '';
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const existing = await db
    .select()
    .from(donorFundingSources)
    .where(and(eq(donorFundingSources.id, id), eq(donorFundingSources.donorId, session.userId)))
    .get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const sponsorName = typeof body?.sponsorName === 'string' ? body.sponsorName.trim() : existing.sponsorName;
  const accountNickname = typeof body?.accountNickname === 'string'
    ? body.accountNickname.trim()
    : (existing.accountNickname ?? '');
  const isDefault = body?.isDefault == null ? Boolean(existing.isDefault) : Boolean(body.isDefault);
  const now = new Date();

  if (isDefault) {
    await db
      .update(donorFundingSources)
      .set({ isDefault: 0, updatedAt: now })
      .where(eq(donorFundingSources.donorId, session.userId));
  }

  await db
    .update(donorFundingSources)
    .set({
      sponsorName,
      accountNickname: accountNickname || null,
      isDefault: isDefault ? 1 : 0,
      updatedAt: now,
    })
    .where(and(eq(donorFundingSources.id, id), eq(donorFundingSources.donorId, session.userId)));

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { session, error } = await requireDonor();
  if (error || !session) return error!;

  const id = request.nextUrl.searchParams.get('id')?.trim() || '';
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const source = await db
    .select()
    .from(donorFundingSources)
    .where(and(eq(donorFundingSources.id, id), eq(donorFundingSources.donorId, session.userId)))
    .get();
  if (!source) return NextResponse.json({ error: 'Funding source not found' }, { status: 404 });

  try {
    // Keep historical grants intact by unlinking this source reference first.
    await db
      .update(dafGrants)
      .set({ fundingSourceId: null, updatedAt: new Date() })
      .where(and(eq(dafGrants.fundingSourceId, id), eq(dafGrants.donorId, session.userId)));

    await db
      .delete(donorFundingSources)
      .where(and(eq(donorFundingSources.id, id), eq(donorFundingSources.donorId, session.userId)));
  } catch {
    return NextResponse.json(
      { error: 'Unable to remove funding source right now. Please try again.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

