import { NextResponse } from 'next/server';
import { db } from '@/db';
import {
    donorOpportunityEvents,
    donorOpportunityState,
    donorProfiles,
    opportunities,
    users,
} from '@/db/schema';
import { getSession } from '@/lib/auth';
import { desc, eq, or, isNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { reviewOpportunities } from '@/lib/concierge-match';
import { renderEmailFromTemplate } from '@/lib/email-templates';
import { sendMailgunEmail } from '@/lib/mailgun';
import type { ImpactVision } from '@/lib/vision-extract';

/** Upsert state using ON CONFLICT DO UPDATE */
async function upsertState(donorId: string, opportunityKey: string, state: string, now: Date) {
    await db.insert(donorOpportunityState)
        .values({
            id: uuidv4(),
            donorId,
            opportunityKey,
            state,
            updatedAt: now,
        })
        .onConflictDoUpdate({
            target: [donorOpportunityState.donorId, donorOpportunityState.opportunityKey],
            set: { state, updatedAt: now },
        });
}

type OpportunityLike = {
    key: string;
    category?: string | null;
    location?: string | null;
    title?: string | null;
    summary?: string | null;
    amount?: number | null;
    state: string;
};

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (session.role !== 'donor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const donorId = session.userId;

    // Load donor vision
    const profile = await db.select().from(donorProfiles).where(eq(donorProfiles.donorId, donorId)).get();
    const vision: ImpactVision | null = profile?.visionJson ? JSON.parse(profile.visionJson) : null;

    if (!vision) {
        return NextResponse.json({ reviewed: false, reason: 'no_vision' });
    }

    // Load all opportunities visible to this donor (single query)
    const allRows = await db
        .select()
        .from(opportunities)
        .where(
            or(
                eq(opportunities.originDonorId, donorId),
                isNull(opportunities.originDonorId),
            ),
        )
        .orderBy(desc(opportunities.createdAt))
        .limit(500);

    const states = await db
        .select()
        .from(donorOpportunityState)
        .where(eq(donorOpportunityState.donorId, donorId))
        .limit(500);

    const stateByKey = new Map<string, string>();
    for (const s of states) {
        stateByKey.set(String(s.opportunityKey), String(s.state || 'new'));
    }

    const allOpps: OpportunityLike[] = allRows.map((opp) => ({
        key: opp.id,
        title: opp.title,
        category: opp.category,
        location: opp.location,
        summary: opp.summary,
        amount: opp.targetAmount ? Number(opp.targetAmount) - Number(opp.currentAmount ?? 0) : null,
        state: stateByKey.get(opp.id) ?? 'new',
    }));

    // Load existing events to check prior concierge processing (with reset-aware replay)
    const existingEvents = await db
        .select()
        .from(donorOpportunityEvents)
        .where(eq(donorOpportunityEvents.donorId, donorId))
        .limit(2000);

    const latestDecisionByKey = new Map<string, { type: string; at: number; source: string | null }>();
    for (const evt of existingEvents) {
        const t = String(evt.type || '');
        if (t !== 'pass' && t !== 'request_info' && t !== 'concierge_review' && t !== 'reset') continue;
        const key = String(evt.opportunityKey);
        const at = evt.createdAt ? new Date(evt.createdAt as any).getTime() : 0;
        let source: string | null = null;
        if (evt.metaJson) {
            try {
                const meta = JSON.parse(evt.metaJson) as Record<string, unknown>;
                source = typeof meta?.source === 'string' ? meta.source : null;
            } catch {
                source = null;
            }
        }
        const prev = latestDecisionByKey.get(key);
        if (!prev || at >= prev.at) {
            latestDecisionByKey.set(key, { type: t, at, source });
        }
    }

    // Process opportunities that are new and either never reviewed or explicitly reset.
    const toProcess = allOpps.filter(
        (opp) => {
            if (opp.state !== 'new') return false;
            const latest = latestDecisionByKey.get(opp.key);
            return !latest || latest.type === 'reset';
        },
    );

    if (toProcess.length === 0) {
        return NextResponse.json({
            reviewed: true,
            stats: { total: 0, passed: 0, infoRequested: 0, keptInDiscover: 0, alreadyProcessed: allOpps.length },
            results: {},
        });
    }

    // Run matching
    const matchResults = reviewOpportunities(toProcess, vision);

    const stats = { total: toProcess.length, passed: 0, infoRequested: 0, keptInDiscover: 0, alreadyProcessed: latestDecisionByKey.size };
    const results: Record<string, { action: string; reason: string }> = {};
    const now = new Date();

    for (const opp of toProcess) {
        const result = matchResults.get(opp.key);
        if (!result) continue;
        const latestDecision = latestDecisionByKey.get(opp.key);
        const forceRequestInfo =
            latestDecision?.type === 'reset' && latestDecision?.source === 'donor_restore';

        if (!result.matched && !forceRequestInfo) {
            // Auto-pass
            await db.update(opportunities).set({ status: 'passed' }).where(eq(opportunities.id, opp.key));
            await upsertState(donorId, opp.key, 'passed', now);

            await db.insert(donorOpportunityEvents).values({
                id: uuidv4(),
                donorId,
                opportunityKey: opp.key,
                type: 'pass',
                metaJson: JSON.stringify({ source: 'concierge', reason: result.reason }),
                createdAt: now,
            });

            stats.passed++;
            results[opp.key] = { action: 'pass', reason: result.reason };
        } else if (forceRequestInfo || result.infoTier !== 'none') {
            // Mint more-info token on the opportunity
            const oppRow = await db.select().from(opportunities).where(eq(opportunities.id, opp.key)).get();
            let moreInfoToken = oppRow?.moreInfoToken ?? null;
            if (oppRow && !moreInfoToken) {
                moreInfoToken = uuidv4();
                await db
                    .update(opportunities)
                    .set({ moreInfoToken, moreInfoRequestedAt: now, status: 'more_info_requested' })
                    .where(eq(opportunities.id, opp.key));
            }

            // Upsert state so the org detail API can find the donor's events
            await upsertState(donorId, opp.key, 'shortlisted', now);

            // Send request_more_info email to the org
            if (oppRow && moreInfoToken) {
                let orgEmailAddr = (oppRow.orgEmail || oppRow.contactEmail || '').trim();
                if (!orgEmailAddr && oppRow.createdBy) {
                    const orgOwner = await db.select().from(users).where(eq(users.id, oppRow.createdBy)).get();
                    orgEmailAddr = String(orgOwner?.email || '').trim();
                }
                if (orgEmailAddr) {
                    try {
                        const donor = await db.select().from(users).where(eq(users.id, donorId)).get();
                        const inviterName = donor?.name || 'A donor';
                        const origin = new URL(request.url).origin;
                        const infoUrl = `${origin}/more-info/${moreInfoToken}`;

                        const rendered = await renderEmailFromTemplate({
                            key: 'request_more_info',
                            vars: {
                                inviter_name: inviterName,
                                opportunity_title: oppRow.title || 'Opportunity',
                                more_info_url: infoUrl,
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
                        console.error('Concierge request_info email failed for', opp.key, emailErr);
                    }
                }
            }

            await db.insert(donorOpportunityEvents).values({
                id: uuidv4(),
                donorId,
                opportunityKey: opp.key,
                type: 'request_info',
                metaJson: JSON.stringify({
                    source: 'concierge',
                    infoTier: forceRequestInfo ? 'basic' : result.infoTier,
                    reason: forceRequestInfo
                        ? 'Manually restored by donor — requesting additional information for concierge review'
                        : result.reason,
                    restoredByDonor: forceRequestInfo || undefined,
                }),
                createdAt: now,
            });

            stats.infoRequested++;
            results[opp.key] = {
                action: 'request_info',
                reason: forceRequestInfo
                    ? 'Manually restored by donor — requesting additional information for concierge review'
                    : result.reason,
            };
        } else {
            // Matched, no info needed — just annotate
            await db.insert(donorOpportunityEvents).values({
                id: uuidv4(),
                donorId,
                opportunityKey: opp.key,
                type: 'concierge_review',
                metaJson: JSON.stringify({ source: 'concierge', matched: true, reason: result.reason }),
                createdAt: now,
            });

            stats.keptInDiscover++;
            results[opp.key] = { action: 'keep', reason: result.reason };
        }
    }

    return NextResponse.json({ reviewed: true, stats, results });
}
