import { NextResponse } from 'next/server';
import { db } from '@/db';
import {
    donorOpportunityEvents,
    donorOpportunityState,
    donorProfiles,
    requests,
    submissionEntries,
} from '@/db/schema';
import { getSession } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { CHARIDY_CURATED } from '@/lib/charidy-curated';
import { reviewOpportunities } from '@/lib/concierge-match';
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

function loadOpportunities(
    subs: any[],
    reqs: any[],
    stateByKey: Map<string, string>,
    donorId: string,
): OpportunityLike[] {
    const rows: OpportunityLike[] = [];

    for (const s of subs) {
        const key = `sub_${s.id}`;
        rows.push({
            key,
            title: s.title || 'Submission',
            summary: s.summary,
            amount: s.amountRequested ?? null,
            category: s.extractedCause ?? null,
            location: s.extractedGeo ?? null,
            state: stateByKey.get(key) ?? 'new',
        });
    }

    for (const r of reqs) {
        const key = String(r.id);
        rows.push({
            key,
            title: r.title,
            category: r.category,
            location: r.location,
            summary: r.summary,
            amount: r.targetAmount ? Number(r.targetAmount) - Number(r.currentAmount ?? 0) : null,
            state: stateByKey.get(key) ?? 'new',
        });
    }

    for (const c of CHARIDY_CURATED) {
        rows.push({
            key: c.key,
            title: c.title,
            category: c.category,
            location: c.location,
            summary: c.summary,
            amount: c.fundingGap,
            state: stateByKey.get(c.key) ?? 'new',
        });
    }

    return rows;
}

export async function POST() {
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

    // Load opportunities
    const subs = await db
        .select()
        .from(submissionEntries)
        .where(eq(submissionEntries.donorId, donorId))
        .orderBy(desc(submissionEntries.createdAt))
        .limit(200);

    const reqs = await db.select().from(requests).orderBy(desc(requests.createdAt)).limit(200);

    const states = await db
        .select()
        .from(donorOpportunityState)
        .where(eq(donorOpportunityState.donorId, donorId))
        .limit(500);

    const stateByKey = new Map<string, string>();
    for (const s of states) {
        stateByKey.set(String(s.opportunityKey), String(s.state || 'new'));
    }

    const allOpps = loadOpportunities(subs, reqs, stateByKey, donorId);

    // Load existing events to check for prior concierge processing (idempotency)
    const existingEvents = await db
        .select()
        .from(donorOpportunityEvents)
        .where(eq(donorOpportunityEvents.donorId, donorId))
        .limit(2000);

    const conciergeProcessedKeys = new Set<string>();
    for (const evt of existingEvents) {
        const meta = evt.metaJson ? JSON.parse(evt.metaJson) : null;
        if (meta?.source === 'concierge') {
            conciergeProcessedKeys.add(String(evt.opportunityKey));
        }
    }

    // Only process opportunities that are 'new' and not already concierge-processed
    const toProcess = allOpps.filter(
        (opp) => opp.state === 'new' && !conciergeProcessedKeys.has(opp.key),
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

    const stats = { total: toProcess.length, passed: 0, infoRequested: 0, keptInDiscover: 0, alreadyProcessed: conciergeProcessedKeys.size };
    const results: Record<string, { action: string; reason: string }> = {};
    const now = new Date();

    for (const opp of toProcess) {
        const result = matchResults.get(opp.key);
        if (!result) continue;

        if (!result.matched) {
            // Auto-pass
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
        } else if (result.infoTier !== 'none') {
            // Annotate with request_info event (mint token, but don't change state —
            // matched items stay in Discover for the donor to manually shortlist)

            // Mint more-info token for submissions
            if (opp.key.startsWith('sub_')) {
                const submissionId = opp.key.slice('sub_'.length);
                const sub = await db.select().from(submissionEntries).where(eq(submissionEntries.id, submissionId)).get();
                if (sub && !sub.moreInfoToken) {
                    await db
                        .update(submissionEntries)
                        .set({ moreInfoToken: uuidv4(), moreInfoRequestedAt: now, status: 'more_info_requested' })
                        .where(eq(submissionEntries.id, submissionId));
                }
            } else if (!opp.key.startsWith('charidy_')) {
                const reqRow = await db.select().from(requests).where(eq(requests.id, opp.key)).get();
                if (reqRow && !reqRow.moreInfoToken) {
                    await db
                        .update(requests)
                        .set({ moreInfoToken: uuidv4(), moreInfoRequestedAt: now, status: 'more_info_requested' })
                        .where(eq(requests.id, opp.key));
                }
            }

            await db.insert(donorOpportunityEvents).values({
                id: uuidv4(),
                donorId,
                opportunityKey: opp.key,
                type: 'request_info',
                metaJson: JSON.stringify({ source: 'concierge', infoTier: result.infoTier, reason: result.reason }),
                createdAt: now,
            });

            stats.infoRequested++;
            results[opp.key] = { action: 'request_info', reason: result.reason };
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
