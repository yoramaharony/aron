export type ImpactVision = {
  pillars: string[];
  geoFocus: string[];
  timeHorizon?: string;
  givingBudget?: string;
  notes: string[];
  lastUpdatedAt: string;
};

export type VisionBoard = {
  headline: string;
  pillars: { title: string; description: string }[];
  focus: { label: string; value: string }[];
  signals: { label: string; value: string }[];
};

function uniq(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean)));
}

function extractMoney(text: string): string | null {
  // very simple heuristic: "$3M", "$500k", "$2,000,000"
  const m = text.match(/\$[\d,.]+\s*(m|mm|million|k|k\.|thousand)?/i);
  if (!m) return null;
  return m[0].replace(/\s+/g, '');
}

function extractTimeHorizon(text: string): string | null {
  const m = text.match(/(\d+)\s*(year|years|month|months|weeks|week)/i);
  if (!m) return null;
  return `${m[1]} ${m[2].toLowerCase()}`;
}

export function extractVision(messages: { role: string; content: string }[]): ImpactVision {
  const all = messages.map((m) => m.content).join('\n');
  const lower = all.toLowerCase();

  const pillars: string[] = [];
  const geo: string[] = [];
  const notes: string[] = [];

  const addIf = (cond: boolean, label: string) => {
    if (cond) pillars.push(label);
  };

  addIf(lower.includes('children') || lower.includes('pediatric'), 'Children & Families');
  addIf(lower.includes('cancer') || lower.includes('oncology') || lower.includes('medical') || lower.includes('health'), 'Health & Healing');
  addIf(lower.includes('water'), 'Clean Water');
  addIf(lower.includes('education') || lower.includes('school') || lower.includes('stem'), 'Education & Mobility');
  addIf(lower.includes('israel'), 'Israel');
  addIf(lower.includes('environment') || lower.includes('climate') || lower.includes('sustainab'), 'Environment');

  if (lower.includes('africa')) geo.push('Africa');
  if (lower.includes('israel')) geo.push('Israel');
  if (lower.includes('new york') || lower.includes('nyc')) geo.push('New York');
  if (lower.includes('emerging market')) geo.push('Emerging markets');

  const money = extractMoney(all);
  const horizon = extractTimeHorizon(all);

  // Preserve a small set of raw notes (last 3 donor messages)
  const donorNotes = messages.filter((m) => m.role === 'donor').slice(-3).map((m) => m.content.trim());
  notes.push(...donorNotes);

  const now = new Date().toISOString();
  return {
    pillars: uniq(pillars.length ? pillars : ['Impact Discovery']),
    geoFocus: uniq(geo.length ? geo : ['Global']),
    givingBudget: money ?? undefined,
    timeHorizon: horizon ?? undefined,
    notes: uniq(notes).slice(0, 6),
    lastUpdatedAt: now,
  };
}

export function buildBoard(vision: ImpactVision): VisionBoard {
  const headline = `Impact Vision`;
  const focus = [
    { label: 'Geo focus', value: vision.geoFocus.join(' • ') },
    { label: 'Time horizon', value: vision.timeHorizon ?? 'Open-ended' },
    { label: 'Giving budget', value: vision.givingBudget ?? 'To be determined' },
  ];

  const pillars = vision.pillars.slice(0, 4).map((p) => ({
    title: p,
    description:
      p === 'Impact Discovery'
        ? 'We are still shaping the vision. Share a few causes, geographies, and what “success” feels like.'
        : `A priority pillar derived from your concierge conversation.`,
  }));

  const signals = [
    { label: 'Preference clarity', value: vision.pillars[0] === 'Impact Discovery' ? 'Draft' : 'Strong' },
    { label: 'Update cadence', value: 'Quarterly' },
    { label: 'Verification', value: 'Concierge-reviewed (MVP)' },
  ];

  return { headline, pillars, focus, signals };
}

