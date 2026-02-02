export type ImpactVision = {
  pillars: string[];
  geoFocus: string[];
  timeHorizon?: string;
  givingBudget?: string;
  outcome12m?: string;
  constraints?: string[];
  stage?: 'discover' | 'clarify' | 'confirm' | 'activated';
  lastQuestionKey?: QuestionKey;
  notes: string[];
  lastUpdatedAt: string;
};

export type QuestionKey = 'outcome12m' | 'budget' | 'horizon' | 'geo' | 'constraints' | 'confirm' | 'activated';

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
  const constraints: string[] = [];

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

  // Very small "outcome" detector: if donor mentions "in 12 months" or "12 months" store the sentence.
  let outcome12m: string | undefined = undefined;
  const donorMsgs = messages.filter((m) => m.role === 'donor').map((m) => m.content);
  for (let i = donorMsgs.length - 1; i >= 0; i--) {
    const t = donorMsgs[i];
    if (t.toLowerCase().includes('12 months') || t.toLowerCase().includes('in 12')) {
      outcome12m = t.trim();
      break;
    }
  }

  // Simple constraints signals
  if (lower.includes('measurable') || lower.includes('metrics') || lower.includes('audit')) constraints.push('Measurable outcomes');
  if (lower.includes('quiet') || lower.includes('private')) constraints.push('Privacy / quiet giving');
  if (lower.includes('verified') || lower.includes('verification')) constraints.push('Verification required');

  // Preserve a small set of raw notes (last 3 donor messages)
  const donorNotes = messages.filter((m) => m.role === 'donor').slice(-3).map((m) => m.content.trim());
  notes.push(...donorNotes);

  const now = new Date().toISOString();
  return {
    pillars: uniq(pillars.length ? pillars : ['Impact Discovery']),
    geoFocus: uniq(geo.length ? geo : ['Global']),
    givingBudget: money ?? undefined,
    timeHorizon: horizon ?? undefined,
    outcome12m,
    constraints: uniq(constraints),
    notes: uniq(notes).slice(0, 6),
    lastUpdatedAt: now,
  };
}

export function buildBoard(vision: ImpactVision): VisionBoard {
  const headline = `Impact Vision`;
  const focus = [
    { label: 'Status', value: vision.stage === 'activated' ? 'Confirmed' : 'Draft' },
    { label: 'Geo focus', value: vision.geoFocus.join(' • ') },
    { label: 'Time horizon', value: vision.timeHorizon ?? 'Open-ended' },
    { label: 'Giving budget', value: vision.givingBudget ?? 'To be determined' },
    { label: '12‑month outcome', value: vision.outcome12m ? 'Captured' : 'Not set' },
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

function isLowInfo(msg: string) {
  const t = msg.trim();
  if (t.length <= 8) return true;
  const words = t.split(/\s+/g).filter(Boolean);
  return words.length <= 2;
}

function sameVision(a: ImpactVision | null | undefined, b: ImpactVision) {
  if (!a) return false;
  const pick = (v: ImpactVision) => ({
    pillars: v.pillars,
    geo: v.geoFocus,
    budget: v.givingBudget ?? null,
    horizon: v.timeHorizon ?? null,
    outcome12m: v.outcome12m ?? null,
    constraints: v.constraints ?? [],
    stage: v.stage ?? null,
  });
  return JSON.stringify(pick(a)) === JSON.stringify(pick(b));
}

function computeStage(v: ImpactVision): ImpactVision['stage'] {
  if (v.stage === 'activated') return 'activated';
  const completeCount =
    (v.outcome12m ? 1 : 0) +
    (v.givingBudget ? 1 : 0) +
    (v.timeHorizon ? 1 : 0) +
    (v.geoFocus && v.geoFocus[0] !== 'Global' ? 1 : 0) +
    (v.constraints && v.constraints.length ? 1 : 0);

  if (completeCount >= 4) return 'confirm';
  if (completeCount >= 2) return 'clarify';
  return 'discover';
}

export function nextBestQuestionKey(vision: ImpactVision): QuestionKey {
  if (vision.stage === 'activated') return 'activated';
  if (!vision.outcome12m) return 'outcome12m';
  if (!vision.givingBudget) return 'budget';
  if (!vision.timeHorizon) return 'horizon';
  if (!vision.geoFocus || vision.geoFocus[0] === 'Global') return 'geo';
  if (!vision.constraints || vision.constraints.length === 0) return 'constraints';
  return 'confirm';
}

function questionText(key: QuestionKey): string {
  switch (key) {
    case 'outcome12m':
      return 'What is the single measurable outcome you’d be proud to see in 12 months?';
    case 'budget':
      return 'What annual range feels comfortable to deploy (rough order of magnitude is fine)?';
    case 'horizon':
      return 'Over what time horizon do you want this vision to play out (1 year, 3 years, 10 years)?';
    case 'geo':
      return 'Which geographies matter most to you (and which should we avoid)?';
    case 'constraints':
      return 'What’s your biggest non-negotiable constraint (privacy, verification, overhead cap, political neutrality, etc.)?';
    case 'confirm':
      return 'If this looks right, reply: “confirm”. If not, tell me what to change.';
    case 'activated':
      return 'Confirmed. Next: open Opportunities and start shortlisting.';
    default:
      return 'What should we refine next?';
  }
}

function guidedPrompt(key: QuestionKey): string {
  switch (key) {
    case 'budget':
      return `Pick a range:\n- $25–100k / year\n- $100–500k / year\n- $500k–$3M / year\n- other (type your own)`;
    case 'horizon':
      return `Pick a horizon:\n- 12 months\n- 3 years\n- 10 years\n- open-ended`;
    case 'geo':
      return `Name 1–3 geographies (or say “global”):\nExamples: Israel, NYC, Miami, Africa, Emerging markets`;
    case 'constraints':
      return `Pick one to lock first:\n- privacy\n- verification\n- overhead cap\n- political neutrality\n- speed to impact`;
    case 'outcome12m':
      return `Give a 12‑month outcome in one line:\nExample: “5,000 households protected and audited delivery within 12 months.”`;
    default:
      return '';
  }
}

export function composeAssistantReply(
  vision: ImpactVision,
  lastDonorMessage: string,
  opts?: { prevVision?: ImpactVision | null }
): { reply: string; nextKey: QuestionKey; stage: ImpactVision['stage'] } {
  const prev = opts?.prevVision ?? null;

  // Confirmation flow
  const donorSaidConfirm = ['confirm', 'confirmed', 'yes', 'yep', 'looks good', 'approved'].includes(
    lastDonorMessage.trim().toLowerCase()
  );

  const stage = donorSaidConfirm && (prev?.stage === 'confirm' || computeStage(vision) === 'confirm')
    ? 'activated'
    : computeStage(vision);
  vision.stage = stage;

  let nextKey = nextBestQuestionKey(vision);

  // If user repeats/low-info and we're not making progress, switch to guided prompt to "unstick" the demo.
  const noProgress = sameVision(prev, vision);
  if (noProgress && isLowInfo(lastDonorMessage) && nextKey !== 'confirm' && nextKey !== 'activated') {
    const guided = guidedPrompt(nextKey);
    const summary = [
      `Got it — ${lastDonorMessage.trim() || 'noted'}.`,
      `To move forward quickly, choose one option:`,
      guided,
    ]
      .filter(Boolean)
      .join('\n');

    vision.lastQuestionKey = nextKey;
    return { reply: summary, nextKey, stage };
  }

  // Confirmation stage copy
  if (stage === 'confirm') {
    nextKey = 'confirm';
  }
  if (stage === 'activated') {
    nextKey = 'activated';
  }

  const summary = [
    stage === 'activated' ? `Impact Vision confirmed.` : `Draft Impact Vision updated.`,
    `Pillars: ${vision.pillars.join(', ')}.`,
    `Geo: ${vision.geoFocus.join(', ')}.`,
    vision.givingBudget ? `Budget signal: ${vision.givingBudget}.` : null,
    vision.timeHorizon ? `Horizon: ${vision.timeHorizon}.` : null,
    vision.outcome12m ? `12‑month outcome: captured.` : null,
    vision.constraints?.length ? `Constraints: ${vision.constraints.join(' • ')}.` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const q = questionText(nextKey);

  // Make it feel responsive to new inputs
  const echo = lastDonorMessage.trim().length > 0 ? `\n\nNoted: “${lastDonorMessage.trim().slice(0, 120)}${lastDonorMessage.trim().length > 120 ? '…' : ''}”` : '';

  vision.lastQuestionKey = nextKey;
  return { reply: `${summary}${echo}\n\nNext: ${q}`, nextKey, stage };
}

