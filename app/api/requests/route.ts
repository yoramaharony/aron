import { NextResponse } from 'next/server';
import { db } from '@/db';
import { requests } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // If Requestor, show only their requests. If Donor, show all active/pending (simplified for MVP).
    if (session.role === 'requestor') {
        const myRequests = await db.select().from(requests).where(eq(requests.createdBy, session.userId));
        return NextResponse.json({ requests: myRequests });
    } else {
        // Donor sees everything for now
        const allRequests = await db.select().from(requests);
        return NextResponse.json({ requests: allRequests });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'requestor') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, category, location, summary, targetAmount, coverUrl } = body;

        const newId = uuidv4();
        await db.insert(requests).values({
            id: newId,
            title,
            category,
            location,
            summary,
            targetAmount,
            createdBy: session.userId,
            coverUrl: typeof coverUrl === 'string' && coverUrl.trim() ? coverUrl.trim() : null,
            status: 'pending' // Default to pending
        });

        return NextResponse.json({ success: true, id: newId });
    } catch (error) {
        console.error(error);
        const msg = String((error as any)?.message || '');
        if (
            msg.toLowerCase().includes('no column') &&
            msg.toLowerCase().includes('cover_url')
        ) {
            return NextResponse.json(
                {
                    error:
                        'DB schema is out of date (missing requests.cover_url). Run: npm run db:ensure',
                },
                { status: 500 }
            );
        }
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
