import { NextResponse } from 'next/server';
import { db } from '@/db';
import { donorOpportunityEvents, donorOpportunityState, donorProfiles, opportunities } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq, desc, isNotNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { matchOpportunity } from '@/lib/concierge-match';
import { renderEmailFromTemplate } from '@/lib/email-templates';
import { sendMailgunEmail } from '@/lib/mailgun';
import type { ImpactVision } from '@/lib/vision-extract';

export async function GET(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (session.role === 'requestor') {
        const myRequests = await db
            .select()
            .from(opportunities)
            .where(eq(opportunities.createdBy, session.userId))
            .orderBy(desc(opportunities.createdAt));

        return NextResponse.json({ requests: myRequests });
    } else {
        // Donor sees everything for now
        const allRequests = await db.select().from(opportunities).orderBy(desc(opportunities.createdAt));
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
        await db.insert(opportunities).values({
            id: newId,
            title,
            category,
            location,
            summary,
            targetAmount,
            createdBy: session.userId,
            source: 'portal',
            coverUrl: typeof coverUrl === 'string' && coverUrl.trim() ? coverUrl.trim() : null,
            evidenceJson,
            status: 'pending',
            createdAt: new Date(),
        });

        // ── Auto-trigger concierge for every donor with an Impact Vision ──
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
                    await db.update(opportunities).set({ status: 'passed' }).where(eq(opportunities.id, newId));
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
                    const reqRow = await db.select().from(opportunities).where(eq(opportunities.id, newId)).get();
                    let moreInfoToken = reqRow?.moreInfoToken ?? null;
                    if (reqRow && !moreInfoToken) {
                        moreInfoToken = uuidv4();
                        await db.update(opportunities)
                            .set({ moreInfoToken, moreInfoRequestedAt: now, status: 'more_info_requested' })
                            .where(eq(opportunities.id, newId));

                        // Send request_more_info email to org (once per opportunity)
                        const orgEmailAddr = (reqRow.orgEmail || reqRow.contactEmail || '').trim();
                        if (orgEmailAddr) {
                            try {
                                const origin = new URL(request.url).origin;
                                const rendered = await renderEmailFromTemplate({
                                    key: 'request_more_info',
                                    vars: {
                                        inviter_name: 'Aron Concierge',
                                        opportunity_title: reqRow.title || 'Opportunity',
                                        more_info_url: `${origin}/more-info/${moreInfoToken}`,
                                        note: '',
                                    },
                                });
                                await sendMailgunEmail({
                                    to: orgEmailAddr,
                                    subject: rendered.subject,
                                    text: rendered.text,
                                    html: rendered.html,
                                    from: rendered.from,
                                });
                            } catch (emailErr) {
                                console.error('Auto-concierge request_info email failed for', newId, emailErr);
                            }
                        }
                    }
                    // Upsert state so org detail API can discover donor events
                    await db.insert(donorOpportunityState).values({
                        id: uuidv4(), donorId: profile.donorId, opportunityKey: newId, state: 'shortlisted', updatedAt: now,
                    }).onConflictDoUpdate({
                        target: [donorOpportunityState.donorId, donorOpportunityState.opportunityKey],
                        set: { state: 'shortlisted', updatedAt: now },
                    });
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
            console.error('Concierge auto-review failed for request', newId, err);
        }

        return NextResponse.json({ success: true, id: newId });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
