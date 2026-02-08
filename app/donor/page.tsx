'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Zap } from 'lucide-react';
import { useLeverage } from '@/components/providers/LeverageContext';
import { AnimatePresence, motion } from 'framer-motion';

type OpportunityRow = {
    key: string;
    source: 'request' | 'submission' | 'charidy';
    title: string;
    orgName: string;
    location?: string;
    category?: string;
    summary: string;
    amount?: number | null;
    createdAt?: string | null;
    state: string;
};

export default function DonorFeed() {
    const [activeTab, setActiveTab] = useState<'discover' | 'shortlist' | 'passed'>('discover');
    const [rows, setRows] = useState<OpportunityRow[]>([]);
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const [detail, setDetail] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [detailTab, setDetailTab] = useState<'promise' | 'diligence'>('promise');

    const { openLeverageDrawer } = useLeverage();

    const stateToTab = (s: string) => {
        if (s === 'passed') return 'passed';
        if (s === 'shortlisted') return 'shortlist';
        return 'discover';
    };

    const filterRows = (all: OpportunityRow[], tab: 'discover' | 'shortlist' | 'passed') =>
        all.filter((r) => stateToTab(r.state) === tab);

    const nextKeyAfter = (list: OpportunityRow[], currentKey: string) => {
        if (!list.length) return null;
        const idx = list.findIndex((r) => r.key === currentKey);
        if (idx < 0) return list[0].key;
        return list[idx + 1]?.key ?? list[idx - 1]?.key ?? null;
    };

    const refresh = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/opportunities');
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Failed to load opportunities');
            const next = (data.opportunities ?? []) as OpportunityRow[];
            setRows(next);
            return next;
        } catch (e: any) {
            setError(e?.message || 'Failed to load opportunities');
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh().catch(() => {});
    }, []);

    const filtered = useMemo(() => {
        return filterRows(rows, activeTab);
    }, [rows, activeTab]);

    const completenessLabel = (details: any) => {
        if (!details) return 'Basic';
        const fields = [
            details.orgWebsite,
            details.mission,
            details.program,
            details.geo,
            details.beneficiaries,
            details.budget,
            details.amountRequested,
            details.timeline,
            details.governance,
            details.leadership,
            details.proofLinks,
        ].filter((v) => typeof v === 'string' && v.trim().length > 0);
        if (fields.length >= 9) return 'Comprehensive';
        if (fields.length >= 5) return 'Detailed';
        return 'Basic';
    };

    const loadDetail = async (key: string) => {
        setSelectedKey(key);
        setDetailTab('promise');
        try {
            setDetailLoading(true);
            const res = await fetch(`/api/opportunities/${encodeURIComponent(key)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Failed to load');
            setDetail(data);
        } catch {
            setDetail(null);
        } finally {
            setDetailLoading(false);
        }
    };

    const act = async (key: string, action: string) => {
        try {
            const listBefore = filterRows(rows, activeTab);
            const nextAfterBefore = nextKeyAfter(listBefore, key);

            const res = await fetch(`/api/opportunities/${encodeURIComponent(key)}/actions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Failed');
            const updated = (await refresh()) ?? rows;

            // If the acted-on row was selected, advance selection to the next item in the left list.
            // This prevents the right pane from showing a row that no longer exists in the active tab.
            if (selectedKey === key) {
                const listNow = filterRows(updated, activeTab);
                const stillInTab = listNow.some((r) => r.key === key);
                if (stillInTab) {
                    await loadDetail(key);
                } else {
                    const candidate =
                        (nextAfterBefore && listNow.some((r) => r.key === nextAfterBefore) ? nextAfterBefore : null) ??
                        listNow[0]?.key ??
                        null;
                    if (candidate) {
                        await loadDetail(candidate);
                    } else {
                        setSelectedKey(null);
                        setDetail(null);
                    }
                }
            }
            return data;
        } catch (e: any) {
            setError(e?.message || 'Action failed');
            return null;
        }
    };

    // Keep selection in sync with the active tab/list.
    useEffect(() => {
        if (loading) return;
        const list = filterRows(rows, activeTab);
        if (!list.length) {
            if (selectedKey !== null) setSelectedKey(null);
            if (detail !== null) setDetail(null);
            return;
        }
        if (!selectedKey || !list.some((r) => r.key === selectedKey)) {
            // Auto-select the first item in the tab.
            loadDetail(list[0].key).catch(() => {});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, rows]);

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end gap-6">
                <div>
                    <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Opportunities</h1>
                    <p className="text-secondary">Email-list-first dashboard. Actions persist.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refresh().catch(() => {})} disabled={loading}>
                        Refresh
                    </Button>
                </div>
            </header>

            {/* TABS */}
            <div className="flex gap-8 border-b border-[var(--border-subtle)]">
                <button
                    onClick={() => setActiveTab('discover')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'discover'
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                        }`}
                >
                    Discover
                    {activeTab === 'discover' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-gold)]" />}
                </button>
                <button
                    onClick={() => setActiveTab('shortlist')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'shortlist'
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                        }`}
                >
                    Shortlist
                    {activeTab === 'shortlist' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-gold)]" />}
                </button>
                <button
                    onClick={() => setActiveTab('passed')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'passed'
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                        }`}
                >
                    Passed
                    {activeTab === 'passed' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-gold)]" />}
                </button>
            </div>

            {error ? <div className="text-sm text-red-300">{error}</div> : null}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: list */}
                <Card className="p-0 lg:col-span-1 overflow-hidden">
                    <div className="px-5 py-4 border-b border-[var(--border-subtle)] text-sm font-semibold text-[var(--text-primary)]">
                        {activeTab === 'discover' ? 'Discover' : activeTab === 'shortlist' ? 'Shortlist' : 'Passed'}
                    </div>
                    <div className="divide-y divide-[var(--border-subtle)]">
                        {loading ? (
                            <div className="p-5 text-sm text-[var(--text-tertiary)]">Loading…</div>
                        ) : filtered.length === 0 ? (
                            <div className="p-5 text-sm text-[var(--text-tertiary)]">No items.</div>
                        ) : (
                            filtered.map((r) => (
                                <button
                                    key={r.key}
                                    onClick={() => loadDetail(r.key)}
                                    className={[
                                        'relative w-full text-left p-5 transition-colors',
                                        selectedKey === r.key
                                            ? 'bg-[rgba(var(--accent-rgb), 0.10)]'
                                            : 'hover:bg-[rgba(255,255,255,0.04)]',
                                    ].join(' ')}
                                >
                                    {selectedKey === r.key ? (
                                        <span
                                            className="pointer-events-none absolute left-0 top-3 bottom-3 w-[2px] rounded-full"
                                            style={{
                                                background: 'linear-gradient(180deg, rgba(212,175,55,0), rgba(212,175,55,0.95), rgba(212,175,55,0))',
                                                boxShadow: '0 0 16px rgba(212,175,55,0.28)',
                                            }}
                                        />
                                    ) : null}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="text-[var(--text-primary)] font-semibold truncate">{r.title}</div>
                                            <div className="text-xs text-[var(--text-tertiary)] truncate">{r.orgName}</div>
                                        </div>
                                        <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.04)] text-[var(--text-tertiary)]">
                                            {r.source === 'submission' ? 'submission' : 'curated'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-[var(--text-secondary)] mt-2 line-clamp-2">{r.summary}</div>
                                </button>
                            ))
                        )}
                    </div>
                </Card>

                {/* RIGHT: detail */}
                <Card className="p-6 lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {!detail?.opportunity ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.18 }}
                                className="text-sm text-[var(--text-tertiary)]"
                            >
                                {detailLoading ? 'Loading…' : 'Select an opportunity to view details.'}
                            </motion.div>
                        ) : (
                            <motion.div
                                key={detail?.opportunity?.key ?? 'detail'}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.22, ease: [0.2, 0.9, 0.2, 1] }}
                                className="space-y-5"
                            >
                            <div className="flex items-start justify-between gap-6">
                                <div>
                                    <div className="text-2xl font-semibold text-[var(--text-primary)]">
                                        {detail.opportunity.title}
                                    </div>
                                    <div className="text-sm text-[var(--text-secondary)] mt-1">
                                        {detail.opportunity.orgName}
                                        {detail.opportunity.location ? ` • ${detail.opportunity.location}` : null}
                                        {detail.opportunity.category ? ` • ${detail.opportunity.category}` : null}
                                    </div>
                                    {detail.opportunity.details ? (
                                        <div className="mt-2">
                                            <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.04)] text-[var(--text-tertiary)]">
                                                {completenessLabel(detail.opportunity.details)}
                                            </span>
                                        </div>
                                    ) : null}
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    {detail.opportunity.source === 'submission' ? (
                                        <Button
                                            variant="outline"
                                            onClick={async () => {
                                                const r = await act(detail.opportunity.key, 'request_info');
                                                if (r?.moreInfoUrl) {
                                                    try {
                                                        await navigator.clipboard.writeText(r.moreInfoUrl);
                                                    } catch {
                                                        // ignore
                                                    }
                                                    setError(`Request sent. Link copied: ${r.moreInfoUrl}`);
                                                }
                                            }}
                                        >
                                            Request more info
                                        </Button>
                                    ) : null}
                                    <Button variant="outline" onClick={() => act(detail.opportunity.key, 'pass')}>Pass</Button>
                                    <Button variant="outline" onClick={() => act(detail.opportunity.key, 'save')}>Shortlist</Button>
                                    <Button
                                        variant="gold"
                                        onClick={() => {
                                            // Open drawer using the existing provider; feed it the minimal fields it needs.
                                            openLeverageDrawer({
                                                id: detail.opportunity.key,
                                                title: detail.opportunity.title,
                                                orgName: detail.opportunity.orgName,
                                                location: detail.opportunity.location ?? '',
                                                category: detail.opportunity.category ?? 'Opportunity',
                                                fundingTotal: 0,
                                                fundingRaised: 0,
                                                fundingGap: Number(detail.opportunity.amountRequested ?? detail.opportunity.targetAmount ?? 100000),
                                                deadline: new Date().toISOString().slice(0, 10),
                                                kpis: [],
                                                summary: detail.opportunity.summary,
                                                riskScore: 'Low',
                                                riskFactors: [],
                                                matchPotential: 0,
                                                aiRecommendation: '',
                                                verified: false,
                                                executionConfidence: 0,
                                                overhead: 0,
                                                lastVerified: '',
                                                aiInsights: {
                                                    matchReason: [],
                                                    risks: [],
                                                    leverageRecommendation: { anchorAmount: 50000, challengeGoal: 100000, deadline: new Date().toISOString().slice(0, 10), matchRatio: 1, verification: [] },
                                                },
                                                diligence: { financials: 'Pending', governance: 'Pending', budget: 'Pending', references: 'Pending', siteVisit: 'Pending' },
                                            } as any);
                                        }}
                                    >
                                        <span className="inline-flex items-center gap-2">
                                            <Zap size={16} />
                                            Leverage
                                        </span>
                                    </Button>
                                </div>
                            </div>

                            <div className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{detail.opportunity.summary}</div>

                            {/* Promise vs Due Diligence */}
                            <div className="border-t border-[var(--border-subtle)] pt-4">
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setDetailTab('promise')}
                                        className={[
                                            'px-3 py-2 rounded-lg text-sm font-semibold border transition-colors',
                                            detailTab === 'promise'
                                                ? 'bg-[rgba(var(--accent-rgb), 0.14)] border-[rgba(var(--accent-rgb), 0.28)] text-[var(--text-primary)]'
                                                : 'bg-[rgba(255,255,255,0.03)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                                        ].join(' ')}
                                    >
                                        Promise
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDetailTab('diligence')}
                                        className={[
                                            'px-3 py-2 rounded-lg text-sm font-semibold border transition-colors',
                                            detailTab === 'diligence'
                                                ? 'bg-[rgba(var(--accent-rgb), 0.14)] border-[rgba(var(--accent-rgb), 0.28)] text-[var(--text-primary)]'
                                                : 'bg-[rgba(255,255,255,0.03)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                                        ].join(' ')}
                                    >
                                        Due diligence
                                    </button>
                                </div>

                                {detailTab === 'promise' ? (
                                    <div className="mt-4 space-y-4">
                                        {detail.opportunity.outcomes ? (
                                            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-5">
                                                <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">
                                                    Outcomes
                                                </div>
                                                <ul className="text-sm text-[var(--text-secondary)] list-disc pl-5 space-y-1">
                                                    {detail.opportunity.outcomes.map((o: string, i: number) => (
                                                        <li key={i}>{o}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : null}

                                        {detail.opportunity.whyNow ? (
                                            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-5">
                                                <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">
                                                    Why now
                                                </div>
                                                <div className="text-sm text-[var(--text-secondary)]">{detail.opportunity.whyNow}</div>
                                            </div>
                                        ) : null}
                                    </div>
                                ) : (
                                    <div className="mt-4 space-y-4">
                                        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-5">
                                            <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">
                                                Verification & governance
                                            </div>
                                            <div className="text-sm text-[var(--text-secondary)]">
                                                {detail.opportunity.details ? (
                                                    <div className="space-y-2">
                                                        {detail.opportunity.details.governance ? <div>Governance: {detail.opportunity.details.governance}</div> : null}
                                                        {detail.opportunity.details.leadership ? <div>Leadership: {detail.opportunity.details.leadership}</div> : null}
                                                        {detail.opportunity.details.proofLinks ? (
                                                            <div>
                                                                Proof links: {detail.opportunity.details.proofLinks}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                ) : (
                                                    <div>More diligence will appear here after “Request more info”.</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-xs text-[var(--text-tertiary)]">
                                            Note: overhead/financials are intentionally placed in Due diligence (not in Promise).
                                        </div>
                                    </div>
                                )}
                            </div>

                            {(detail.opportunity.extractedCause ||
                                detail.opportunity.extractedGeo ||
                                detail.opportunity.extractedUrgency ||
                                detail.opportunity.extractedAmount) ? (
                                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-5">
                                    <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-3">
                                        Auto-extraction (demo)
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="text-[var(--text-tertiary)]">Cause</div>
                                            <div className="text-[var(--text-primary)] text-right">{detail.opportunity.extractedCause ?? '—'}</div>
                                        </div>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="text-[var(--text-tertiary)]">Geo</div>
                                            <div className="text-[var(--text-primary)] text-right">{detail.opportunity.extractedGeo ?? '—'}</div>
                                        </div>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="text-[var(--text-tertiary)]">Amount</div>
                                            <div className="text-[var(--text-primary)] text-right">
                                                {detail.opportunity.extractedAmount ? `$${Number(detail.opportunity.extractedAmount).toLocaleString()}` : '—'}
                                            </div>
                                        </div>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="text-[var(--text-tertiary)]">Urgency</div>
                                            <div className="text-[var(--text-primary)] text-right">{detail.opportunity.extractedUrgency ?? '—'}</div>
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {detail.opportunity.details ? (
                                <div className="rounded-2xl border border-[rgba(var(--accent-rgb), 0.18)] bg-[rgba(var(--accent-rgb), 0.06)] p-5">
                                    <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-3">
                                        More info received
                                    </div>
                                    <div className="text-sm text-[var(--text-secondary)] space-y-2">
                                        {detail.opportunity.details.mission ? (
                                            <div><span className="text-[var(--text-tertiary)]">Mission:</span> {detail.opportunity.details.mission}</div>
                                        ) : null}
                                        {detail.opportunity.details.program ? (
                                            <div><span className="text-[var(--text-tertiary)]">Program:</span> {detail.opportunity.details.program}</div>
                                        ) : null}
                                        {detail.opportunity.details.budget ? (
                                            <div><span className="text-[var(--text-tertiary)]">Budget:</span> {detail.opportunity.details.budget}</div>
                                        ) : null}
                                        {detail.opportunity.details.amountRequested ? (
                                            <div><span className="text-[var(--text-tertiary)]">Ask:</span> {detail.opportunity.details.amountRequested}</div>
                                        ) : null}
                                        {detail.opportunity.details.proofLinks ? (
                                            <div><span className="text-[var(--text-tertiary)]">Proof links:</span> {detail.opportunity.details.proofLinks}</div>
                                        ) : null}
                                    </div>
                                </div>
                            ) : detail.opportunity.moreInfoRequestedAt ? (
                                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-5">
                                    <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">
                                        More info requested
                                    </div>
                                    <div className="text-sm text-[var(--text-secondary)]">
                                        Waiting for the organization to submit the detailed form.
                                    </div>
                                </div>
                            ) : null}

                            {detail.opportunity.videoUrl ? (
                                <div className="text-sm">
                                    <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Video</div>
                                    <a className="text-[var(--color-gold)] underline" href={detail.opportunity.videoUrl} target="_blank" rel="noreferrer">
                                        Open video link
                                    </a>
                                </div>
                            ) : null}

                            <div className="border-t border-[var(--border-subtle)] pt-4">
                                <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">History</div>
                                {(detail.events?.length ?? 0) === 0 ? (
                                    <div className="text-sm text-[var(--text-tertiary)]">No actions yet.</div>
                                ) : (
                                    <div className="space-y-2">
                                        {(() => {
                                            const humanize = (type: string) => {
                                                const t = String(type || '');
                                                const map: Record<string, string> = {
                                                    save: 'Shortlisted',
                                                    shortlist: 'Shortlisted',
                                                    pass: 'Passed',
                                                    request_info: 'Requested more info',
                                                    leverage_created: 'Drafted leverage offer',
                                                    scheduled: 'Scheduled',
                                                    funded: 'Marked funded',
                                                    reset: 'Reset',
                                                };
                                                if (map[t]) return map[t];
                                                return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                                            };

                                            const items = (detail.events ?? []).filter((e: any, idx: number, arr: any[]) => {
                                                // Collapse consecutive duplicates (e.g., double-click)
                                                if (idx === 0) return true;
                                                return String(e.type) !== String(arr[idx - 1]?.type);
                                            });

                                            return items.map((e: any) => (
                                                <div key={e.id} className="text-sm text-[var(--text-secondary)] flex items-start gap-3">
                                                    <span className="font-mono text-[var(--text-tertiary)] shrink-0">
                                                        {e.createdAt ? String(e.createdAt).slice(0, 19).replace('T', ' ') : '—'}
                                                    </span>
                                                    <span className="text-[var(--text-secondary)]">
                                                        {humanize(e.type)}
                                                        {e?.meta?.moreInfoUrl ? (
                                                            <>
                                                                {' '}
                                                                <button
                                                                    type="button"
                                                                    className="text-[var(--color-gold)] hover:underline"
                                                                    onClick={async () => {
                                                                        try {
                                                                            await navigator.clipboard.writeText(e.meta.moreInfoUrl);
                                                                        } catch {
                                                                            // ignore
                                                                        }
                                                                    }}
                                                                >
                                                                    (copy link)
                                                                </button>
                                                            </>
                                                        ) : null}
                                                    </span>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                )}
                            </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </div>
        </div>
    );
}
