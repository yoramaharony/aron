import { NextResponse } from 'next/server';
import { db } from '@/db';
import { donorProfiles } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const donorId = session.userId;
  const profile = await db.select().from(donorProfiles).where(eq(donorProfiles.donorId, donorId)).get();

  const token = profile?.shareToken || uuidv4();

  if (!profile) {
    await db.insert(donorProfiles).values({
      donorId,
      shareToken: token,
      updatedAt: new Date(),
    });
  } else if (!profile.shareToken) {
    await db.update(donorProfiles).set({ shareToken: token, updatedAt: new Date() }).where(eq(donorProfiles.donorId, donorId));
  }

  const url = new URL(request.url);
  const origin = url.origin;

  return NextResponse.json({
    token,
    sharePath: `/share/impact/${token}`,
    shareUrl: `${origin}/share/impact/${token}`,
  });
}

