import { NextResponse } from 'next/server';
import { db } from '@/db';
import { donorProfiles } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const donorId = session.userId;
  const profile = await db.select().from(donorProfiles).where(eq(donorProfiles.donorId, donorId)).get();
  const optIn = Boolean(profile?.donorToDonorOptIn);

  return NextResponse.json({
    optIn,
    settings: profile?.collabSettingsJson ? JSON.parse(profile.collabSettingsJson) : null,
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const optIn = Boolean(body?.optIn);

  const donorId = session.userId;
  const existing = await db.select().from(donorProfiles).where(eq(donorProfiles.donorId, donorId)).get();

  if (!existing) {
    await db.insert(donorProfiles).values({
      donorId,
      donorToDonorOptIn: optIn ? 1 : 0,
      updatedAt: new Date(),
    });
  } else {
    await db
      .update(donorProfiles)
      .set({
        donorToDonorOptIn: optIn ? 1 : 0,
        updatedAt: new Date(),
      })
      .where(eq(donorProfiles.donorId, donorId));
  }

  return NextResponse.json({ success: true, optIn });
}

