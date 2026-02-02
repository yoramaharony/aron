import { NextResponse } from 'next/server';
import { db } from '@/db';
import { donorProfiles } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

type Insight = {
  id: string;
  title: string;
  reason: string;
  privacy: string;
};

function buildInsightsFromVision(vision: any): Insight[] {
  const pillars: string[] = Array.isArray(vision?.pillars) ? vision.pillars : [];
  const geo: string[] = Array.isArray(vision?.geoFocus) ? vision.geoFocus : [];

  const top = pillars.length ? pillars.slice(0, 3) : ['Impact Discovery'];
  const geoText = geo.length ? geo.join(' • ') : 'Global';

  return top.map((p, idx) => ({
    id: `ins_${idx + 1}`,
    title: `Donor (private) — overlap on ${p}`,
    reason: `Potential co-funding synergy. Geo overlap: ${geoText}. Suggested: align diligence pack + co-leverage.`,
    privacy: `Opt-in insight only. No one is notified.`,
  }));
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const donorId = session.userId;
  const profile = await db.select().from(donorProfiles).where(eq(donorProfiles.donorId, donorId)).get();
  const optIn = Boolean(profile?.donorToDonorOptIn);

  if (!optIn) {
    return NextResponse.json({ optIn: false, insights: [] });
  }

  const vision = profile?.visionJson ? JSON.parse(profile.visionJson) : null;
  const insights = buildInsightsFromVision(vision);

  return NextResponse.json({ optIn: true, insights });
}

