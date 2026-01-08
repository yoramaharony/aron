import { NextResponse } from 'next/server';
import { db } from '@/db';
import { campaigns } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // For this MVP, we'll just return all campaigns or filter by user if we had a relation
    const allCampaigns = await db.select().from(campaigns);
    return NextResponse.json({ campaigns: allCampaigns });
}
