import { NextResponse } from 'next/server';
import { db } from '@/db';
import { conciergeMessages, donorProfiles } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return forbidden();

  // Clear the thread + derived artifacts so the donor sees a "fresh" concierge.
  await db.delete(conciergeMessages).where(eq(conciergeMessages.donorId, session.userId));
  await db.delete(donorProfiles).where(eq(donorProfiles.donorId, session.userId));

  return NextResponse.json({ success: true });
}

