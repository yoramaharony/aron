import type { ImpactVision } from './vision-extract';

export type MatchResult = {
    matched: boolean;
    pillarMatch: boolean;
    geoMatch: boolean;
    matchedPillars: string[];
    matchedGeos: string[];
    confidence: 'high' | 'medium' | 'low';
    infoTier: 'none' | 'basic' | 'detailed';
    reason: string;
};

type OpportunityLike = {
    key: string;
    category?: string | null;
    location?: string | null;
    title?: string | null;
    summary?: string | null;
    amount?: number | null;
};

// Maps opportunity categories (lowercased) to vision pillar names.
// Keys use the exact org-side category strings from lib/categories.ts (lowercased).
const CATEGORY_TO_PILLARS: Record<string, string[]> = {
    // Exact org-side categories
    'tzedakah / family assistance': ['Tzedakah / Family assistance'],
    'chesed / community support': ['Chesed / Community support'],
    'refuah / bikur cholim': ['Refuah / Bikur Cholim', 'Health & Healing'],
    'hatzolah / pikuach nefesh': ['Hatzalah / Emergency response'],
    'torah & chinuch': ['Torah & Chinuch'],
    'hachnasas kallah': ['Hachnasas Kallah'],
    'mikveh & taharas hamishpacha': ['Community infrastructure'],
    "gemach (g'mach) / free loans": ['Chesed / Community support', 'Tzedakah / Family assistance'],
    // Legacy / generic fallbacks
    chesed: ['Chesed / Community support', 'Hachnasas Kallah', 'Tzedakah / Family assistance'],
    education: ['Torah & Chinuch', 'Education & Mobility'],
    healthcare: ['Refuah / Bikur Cholim', 'Health & Healing'],
    health: ['Refuah / Bikur Cholim', 'Health & Healing'],
    emergency: ['Hatzalah / Emergency response'],
    infrastructure: ['Community infrastructure'],
    children: ['Children & Families'],
    family: ['Tzedakah / Family assistance', 'Children & Families'],
    environment: ['Environment'],
    water: ['Clean Water'],
    outreach: ['Kiruv / Outreach'],
};

// Keywords found in title/summary that map to pillars (mirrors vision-extract.ts)
const PILLAR_KEYWORDS: Record<string, string[]> = {
    'Children & Families': ['children', 'pediatric', 'family', 'families'],
    'Health & Healing': ['cancer', 'oncology', 'medical', 'health'],
    'Clean Water': ['water'],
    'Education & Mobility': ['education', 'school', 'stem'],
    'Environment': ['environment', 'climate', 'sustainab'],
    'Tzedakah / Family assistance': ['tzedakah', 'tzedaka', 'kimcha', 'maos chitim'],
    'Chesed / Community support': ['chesed', 'chessed', 'gemach', "g'mach", 'shabbos meal'],
    'Refuah / Bikur Cholim': ['bikur cholim', 'bikkur cholim', 'refuah', 'refua'],
    'Hachnasas Kallah': ['hachnasas kallah', 'hachnasat kallah', 'kallah'],
    'Torah & Chinuch': ['yeshiva', 'yeshivah', 'kollel', 'chinuch', 'talmud torah', 'torah', 'bochur', 'bochurim'],
    'Kiruv / Outreach': ['kiruv'],
    'Community infrastructure': ['mikvah', 'mikveh', 'eruv', 'erub'],
    'Hatzalah / Emergency response': ['hatzalah', 'hatzolah', 'hatzoloh', 'ambulance', 'pikuach nefesh'],
};

// Location keywords that map to vision geoFocus values
const GEO_ALIASES: Record<string, string[]> = {
    brooklyn: ['New York', 'Boro Park'],
    'boro park': ['New York', 'Boro Park'],
    'borough park': ['New York', 'Boro Park'],
    williamsburg: ['New York'],
    flatbush: ['New York'],
    nyc: ['New York'],
    'new york': ['New York'],
    jerusalem: ['Jerusalem', 'Israel'],
    yerushalayim: ['Jerusalem', 'Israel'],
    lakewood: ['Lakewood'],
    monsey: ['Monsey'],
    'bnei brak': ['Bnei Brak', 'Israel'],
    'bene braq': ['Bnei Brak', 'Israel'],
    israel: ['Israel'],
    africa: ['Africa'],
};

function matchPillars(opp: OpportunityLike, visionPillars: string[]): { matched: boolean; matchedPillars: string[] } {
    const matched: string[] = [];
    const lowerPillars = visionPillars.map((p) => p.toLowerCase());

    // 1. Category-based matching
    const cat = (opp.category || '').trim().toLowerCase();
    if (cat && CATEGORY_TO_PILLARS[cat]) {
        for (const mapped of CATEGORY_TO_PILLARS[cat]) {
            if (lowerPillars.some((p) => p === mapped.toLowerCase())) {
                matched.push(mapped);
            }
        }
    }

    // 2. Keyword fallback in title + summary
    if (matched.length === 0) {
        const text = `${opp.title || ''} ${opp.summary || ''}`.toLowerCase();
        for (const [pillar, keywords] of Object.entries(PILLAR_KEYWORDS)) {
            if (!lowerPillars.some((p) => p === pillar.toLowerCase())) continue;
            if (keywords.some((kw) => text.includes(kw))) {
                matched.push(pillar);
            }
        }
    }

    return { matched: matched.length > 0, matchedPillars: [...new Set(matched)] };
}

function matchGeo(opp: OpportunityLike, visionGeo: string[]): { matched: boolean; matchedGeos: string[] } {
    // Global = no geo preference → always matches
    if (visionGeo.length === 0 || (visionGeo.length === 1 && visionGeo[0] === 'Global')) {
        return { matched: true, matchedGeos: ['Global'] };
    }

    const matched: string[] = [];
    const lowerGeo = visionGeo.map((g) => g.toLowerCase());
    const text = `${opp.location || ''} ${opp.title || ''} ${opp.summary || ''}`.toLowerCase();

    for (const [keyword, mapsTo] of Object.entries(GEO_ALIASES)) {
        if (text.includes(keyword)) {
            for (const geo of mapsTo) {
                if (lowerGeo.some((g) => g === geo.toLowerCase())) {
                    matched.push(geo);
                }
            }
        }
    }

    return { matched: matched.length > 0, matchedGeos: [...new Set(matched)] };
}

export function determineInfoTier(amount: number | null | undefined): 'none' | 'basic' | 'detailed' {
    if (amount == null || amount < 25000) return 'none';
    if (amount <= 250000) return 'basic';
    return 'detailed';
}

/**
 * Parse a budget string like "$100k / year", "$2M over 24 months", "$250,000"
 * into a numeric annual amount. Returns null if unparseable.
 */
function parseBudgetToAnnual(budget: string | undefined): number | null {
    if (!budget) return null;
    const raw = budget.replace(/,/g, '');
    const m = raw.match(/\$\s*([\d.]+)\s*(m|mm|million|k|k\.|thousand)?/i);
    if (!m) return null;

    let amount = parseFloat(m[1]);
    if (isNaN(amount)) return null;

    const suffix = (m[2] || '').toLowerCase();
    if (suffix === 'm' || suffix === 'mm' || suffix === 'million') amount *= 1_000_000;
    else if (suffix === 'k' || suffix === 'k.' || suffix === 'thousand') amount *= 1_000;

    // Normalise to annual: "over 24 months" → divide by 2, "over 3 years" → divide by 3
    const overMatch = raw.match(/over\s+(\d+)\s*(months?|years?)/i);
    if (overMatch) {
        const n = parseInt(overMatch[1], 10);
        const unit = overMatch[2].toLowerCase();
        if (unit.startsWith('month') && n > 0) amount = (amount / n) * 12;
        else if (unit.startsWith('year') && n > 0) amount = amount / n;
    }

    return amount;
}

export function matchOpportunity(opp: OpportunityLike, vision: ImpactVision): MatchResult {
    // If vision only has 'Impact Discovery' → no real preferences, everything matches
    if (vision.pillars.length === 1 && vision.pillars[0] === 'Impact Discovery') {
        return {
            matched: true,
            pillarMatch: true,
            geoMatch: true,
            matchedPillars: [],
            matchedGeos: [],
            confidence: 'low',
            infoTier: 'none',
            reason: 'No specific pillars set — all opportunities shown',
        };
    }

    const pillarResult = matchPillars(opp, vision.pillars);
    const geoResult = matchGeo(opp, vision.geoFocus);

    // Budget filter: auto-reject if opportunity amount exceeds donor's annual budget
    const annualBudget = parseBudgetToAnnual(vision.givingBudget);
    const overBudget = annualBudget != null && opp.amount != null && opp.amount > annualBudget;

    // Determine which dimensions the donor has set
    const hasPillarPrefs = vision.pillars.length > 0;
    const hasGeoPrefs = vision.geoFocus.length > 0 && !(vision.geoFocus.length === 1 && vision.geoFocus[0] === 'Global');

    // Match requires ALL set dimensions to match (AND logic):
    //   - If donor set both pillar + geo → need BOTH to match
    //   - If donor set only pillar → pillar must match (geo is ignored)
    //   - If donor set only geo → geo must match (pillar is ignored)
    let dimensionMatch: boolean;
    if (hasPillarPrefs && hasGeoPrefs) {
        dimensionMatch = pillarResult.matched && geoResult.matched;
    } else if (hasPillarPrefs) {
        dimensionMatch = pillarResult.matched;
    } else if (hasGeoPrefs) {
        dimensionMatch = geoResult.matched;
    } else {
        dimensionMatch = true; // no preferences → everything matches
    }

    // Final decision: dimension match AND within budget
    const isMatch = dimensionMatch && !overBudget;

    const confidence = pillarResult.matched && geoResult.matched && !overBudget ? 'high'
        : isMatch ? 'medium'
            : 'low';

    const reasons: string[] = [];
    if (!dimensionMatch) {
        if (hasPillarPrefs && !pillarResult.matched) reasons.push(`pillars: ${vision.pillars.join(', ')}`);
        if (hasGeoPrefs && !geoResult.matched) reasons.push(`geo: ${vision.geoFocus.join(', ')}`);
    }
    if (overBudget) {
        reasons.push(`over budget ($${(opp.amount! / 1000).toFixed(0)}K vs $${(annualBudget! / 1000).toFixed(0)}K/yr)`);
    }

    let reason: string;
    if (!isMatch) {
        reason = `No match — ${reasons.join('; ')}`;
    } else if (pillarResult.matched && geoResult.matched) {
        reason = `Strong match — ${pillarResult.matchedPillars.join(', ')} in ${geoResult.matchedGeos.join(', ')}`;
    } else if (pillarResult.matched) {
        reason = `Pillar match — ${pillarResult.matchedPillars.join(', ')}`;
    } else if (geoResult.matched) {
        reason = `Geo match — ${geoResult.matchedGeos.join(', ')}`;
    } else {
        reason = 'Matched (no specific criteria set)';
    }

    return {
        matched: isMatch,
        pillarMatch: pillarResult.matched,
        geoMatch: geoResult.matched,
        matchedPillars: pillarResult.matchedPillars,
        matchedGeos: geoResult.matchedGeos,
        confidence,
        infoTier: determineInfoTier(opp.amount),
        reason,
    };
}

export function reviewOpportunities(
    opportunities: OpportunityLike[],
    vision: ImpactVision,
): Map<string, MatchResult> {
    const results = new Map<string, MatchResult>();
    for (const opp of opportunities) {
        results.set(opp.key, matchOpportunity(opp, vision));
    }
    return results;
}
