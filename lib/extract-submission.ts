export type ExtractedSubmission = {
  cause?: string;
  geo?: string[];
  amount?: number;
  urgency?: string;
  confidence: 'demo';
};

function uniq(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean)));
}

function parseAmount(text: string): number | undefined {
  const t = text.toLowerCase();

  // $250k, $3m, $2.5mm
  const m1 = t.match(/\$([\d,.]+)\s*(k|m|mm|million|thousand)?/i);
  if (m1) {
    const raw = Number(String(m1[1]).replace(/,/g, ''));
    if (!Number.isFinite(raw)) return undefined;
    const unit = (m1[2] || '').toLowerCase();
    if (unit === 'k' || unit === 'thousand' || unit === 'k.') return Math.round(raw * 1000);
    if (unit === 'm' || unit === 'mm' || unit === 'million') return Math.round(raw * 1_000_000);
    return Math.round(raw);
  }

  // "need 250000" (plain)
  const m2 = t.match(/\b(\d{5,9})\b/);
  if (m2) {
    const raw = Number(m2[1]);
    if (Number.isFinite(raw)) return raw;
  }

  return undefined;
}

function parseUrgency(text: string): string | undefined {
  const t = text.toLowerCase();
  if (t.includes('urgent') || t.includes('immediately') || t.includes('asap')) return 'Urgent';

  const m = t.match(/within\s+(\d+)\s*(day|days|week|weeks|month|months)/i);
  if (m) return `Within ${m[1]} ${m[2].toLowerCase()}`;

  const m2 = t.match(/\b(\d+)\s*(day|days|week|weeks|month|months)\b/i);
  if (m2 && (t.includes('in ') || t.includes('within'))) return `In ${m2[1]} ${m2[2].toLowerCase()}`;

  return undefined;
}

function parseGeo(text: string): string[] {
  const t = text.toLowerCase();
  const geo: string[] = [];

  const add = (cond: boolean, label: string) => {
    if (cond) geo.push(label);
  };

  add(t.includes('israel'), 'Israel');
  add(t.includes('jerusalem') || t.includes('yerushalayim'), 'Jerusalem');
  add(t.includes('bnei brak') || t.includes('bene braq'), 'Bnei Brak');
  add(t.includes('lakewood'), 'Lakewood');
  add(t.includes('monsey'), 'Monsey');
  add(t.includes('boro park') || t.includes('borough park') || t.includes('boropark'), 'Boro Park');
  add(t.includes('miami'), 'Miami');
  add(t.includes('new york') || t.includes('nyc'), 'New York');
  add(t.includes('africa'), 'Africa');
  add(t.includes('emerging market'), 'Emerging markets');
  add(t.includes('tel aviv'), 'Tel Aviv');
  add(t.includes('berlin'), 'Berlin');

  return uniq(geo);
}

function parseCause(text: string): string | undefined {
  const t = text.toLowerCase();
  // Jewish / Yiddish common terms (demo-friendly; respectful; not exhaustive)
  if (t.includes('bikur cholim') || t.includes('bikkur cholim') || t.includes('refuah') || t.includes('refua'))
    return 'Refuah / Bikur Cholim';
  if (t.includes('hatzalah') || t.includes('emergency response')) return 'Hatzalah / Emergency response';
  if (t.includes('hachnasas kallah') || t.includes('hachnasat kallah') || t.includes('kallah')) return 'Hachnasas Kallah';
  if (t.includes('tzedakah') || t.includes('tzedaka') || t.includes('tzedokeh') || t.includes('kimcha d\'pischa'))
    return 'Tzedakah / Family assistance';
  if (t.includes('yeshiva') || t.includes('yeshivah') || t.includes('kollel') || t.includes('chinuch') || t.includes('talmud torah'))
    return 'Torah & Chinuch (Education)';
  if (t.includes('kiruv') || t.includes('outreach')) return 'Kiruv / Outreach';
  if (t.includes('mikvah') || t.includes('mikveh') || t.includes('eruv') || t.includes('erub')) return 'Community infrastructure';
  if (t.includes('gemach') || t.includes('g\'mach') || t.includes('gmach')) return 'Gemach / Community support';
  if (t.includes('chessed') || t.includes('chesed')) return 'Chesed / Community support';

  if (t.includes('emergency') || t.includes('kits') || t.includes('relief')) return 'Emergency relief';
  if (t.includes('water') || t.includes('well')) return 'Clean water';
  if (t.includes('cancer') || t.includes('oncology') || t.includes('medical') || t.includes('health')) return 'Health';
  if (t.includes('education') || t.includes('school') || t.includes('stem')) return 'Education';
  if (t.includes('climate') || t.includes('environment') || t.includes('resilience')) return 'Environment';
  if (t.includes('shabbat') || t.includes('community')) return 'Community support';
  return undefined;
}

export function extractSubmissionSignals(input: {
  title?: string | null;
  summary: string;
  orgName?: string | null;
  orgEmail?: string | null;
  videoUrl?: string | null;
  amountRequested?: number | null;
}): ExtractedSubmission {
  const blob = [
    input.title ?? '',
    input.summary ?? '',
    input.orgName ?? '',
    input.orgEmail ?? '',
    input.videoUrl ?? '',
  ]
    .join('\n')
    .trim();

  const amount = input.amountRequested ?? parseAmount(blob);
  const geo = parseGeo(blob);
  const urgency = parseUrgency(blob);
  const cause = parseCause(blob);

  return {
    cause,
    geo: geo.length ? geo : undefined,
    amount: amount ?? undefined,
    urgency,
    confidence: 'demo',
  };
}

