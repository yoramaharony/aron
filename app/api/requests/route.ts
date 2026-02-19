import { NextResponse } from 'next/server';
import { db } from '@/db';
import { donorOpportunityEvents, donorOpportunityState, donorProfiles, requests } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq, desc, isNotNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { matchOpportunity } from '@/lib/concierge-match';
import type { ImpactVision } from '@/lib/vision-extract';

export async function GET(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // If Requestor, show only their requests. If Donor, show all active/pending (simplified for MVP).
    if (session.role === 'requestor') {
        const myRequests = await db.select().from(requests).where(eq(requests.createdBy, session.userId)).orderBy(desc(requests.createdAt));
        return NextResponse.json({ requests: myRequests });
    } else {
        // Donor sees everything for now
        const allRequests = await db.select().from(requests).orderBy(desc(requests.createdAt));
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
        const { title, category, location, summary, targetAmount, coverUrl, evidence } = body;

        const evidenceJson =
            evidence && typeof evidence === 'object'
                ? JSON.stringify({
                    budget: evidence?.budget ?? null,
                    files: Array.isArray(evidence?.files) ? evidence.files : [],
                })
                : null;

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
            evidenceJson,
            status: 'pending', // Default to pending
            createdAt: new Date(),
        });

        // ── Auto-trigger concierge for every donor with an Impact Vision ──
        // Requests are global (shown to all donors), so process for each donor.
        try {
            const profiles = await db.select()
                .from(donorProfiles)
                .where(isNotNull(donorProfiles.visionJson))
                .limit(100);

            const now = new Date();
            const amount = typeof targetAmount === 'number' ? targetAmount : null;

            for (const profile of profiles) {
                const vision: ImpactVision | null = profile.visionJson ? JSON.parse(profile.visionJson) : null;
                if (!vision || (vision.pillars.length === 1 && vision.pillars[0] === 'Impact Discovery')) continue;

                const result = matchOpportunity(
                    { key: newId, category, location, title, summary, amount },
                    vision,
                );

                if (!result.matched) {
                    await db.insert(donorOpportunityState).values({
                        id: uuidv4(), donorId: profile.donorId, opportunityKey: newId, state: 'passed', updatedAt: now,
                    }).onConflictDoUpdate({
                        target: [donorOpportunityState.donorId, donorOpportunityState.opportunityKey],
                        set: { state: 'passed', updatedAt: now },
                    });
                    await db.insert(donorOpportunityEvents).values({
                        id: uuidv4(), donorId: profile.donorId, opportunityKey: newId,
                        type: 'pass', metaJson: JSON.stringify({ source: 'concierge', reason: result.reason }), createdAt: now,
                    });
                } else if (result.infoTier !== 'none') {
                    const reqRow = await db.select().from(requests).where(eq(requests.id, newId)).get();
                    if (reqRow && !reqRow.moreInfoToken) {
                        await db.update(requests)
                            .set({ moreInfoToken: uuidv4(), moreInfoRequestedAt: now, status: 'more_info_requested' })
                            .where(eq(requests.id, newId));
                    }
                    await db.insert(donorOpportunityEvents).values({
                        id: uuidv4(), donorId: profile.donorId, opportunityKey: newId,
                        type: 'request_info', metaJson: JSON.stringify({ source: 'concierge', infoTier: result.infoTier, reason: result.reason }), createdAt: now,
                    });
                } else {
                    await db.insert(donorOpportunityEvents).values({
                        id: uuidv4(), donorId: profile.donorId, opportunityKey: newId,
                        type: 'concierge_review', metaJson: JSON.stringify({ source: 'concierge', matched: true, reason: result.reason }), createdAt: now,
                    });
                }
            }
        } catch (err) {
            // Non-fatal: request was created even if concierge fails
            console.error('Concierge auto-review failed for request', newId, err);
        }

        return NextResponse.json({ success: true, id: newId });
    } catch (error) {
        console.error(error);
        const msg = String((error as any)?.message || '');
        if (
            msg.toLowerCase().includes('no column') &&
            msg.toLowerCase().includes('evidence_json')
        ) {
            return NextResponse.json(
                {
                    error:
                        'DB schema is out of date (missing requests.evidence_json). Run: npm run db:ensure',
                },
                { status: 500 }
            );
        }
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
