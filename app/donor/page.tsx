'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Zap } from 'lucide-react';
import { useLeverage } from '@/components/providers/LeverageContext';

type OpportunityRow = {
    key: string;
    source: 'request' | 'submission';
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { openLeverageDrawer } = useLeverage();

    const refresh = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/opportunities');
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Failed to load opportunities');
            setRows(data.opportunities ?? []);
        } catch (e: any) {
            setError(e?.message || 'Failed to load opportunities');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh().catch(() => {});
    }, []);

    const filtered = useMemo(() => {
        const stateToTab = (s: string) => {
            if (s === 'passed') return 'passed';
            if (s === 'shortlisted') return 'shortlist';
            return 'discover';
        };
        return rows.filter((r) => stateToTab(r.state) === activeTab);
    }, [rows, activeTab]);

    const loadDetail = async (key: string) => {
        setSelectedKey(key);
        try {
            const res = await fetch(`/api/opportunities/${encodeURIComponent(key)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Failed to load');
            setDetail(data);
        } catch {
            setDetail(null);
        }
    };

    const act = async (key: string, action: string) => {
        try {
            const res = await fetch(`/api/opportunities/${encodeURIComponent(key)}/actions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Failed');
            await refresh();
            if (selectedKey === key) await loadDetail(key);
        } catch (e: any) {
            setError(e?.message || 'Action failed');
        }
    };

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
                                        'w-full text-left p-5 transition-colors',
                                        selectedKey === r.key ? 'bg-[rgba(255,43,214,0.10)]' : 'hover:bg-[rgba(255,255,255,0.04)]',
                                    ].join(' ')}
                                >
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
                    {!detail?.opportunity ? (
                        <div className="text-sm text-[var(--text-tertiary)]">Select an opportunity to view details.</div>
                    ) : (
                        <div className="space-y-5">
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
                                </div>
                                <div className="flex gap-2 shrink-0">
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
                                        {detail.events.map((e: any) => (
                                            <div key={e.id} className="text-sm text-[var(--text-secondary)]">
                                                <span className="font-mono text-[var(--text-tertiary)]">{e.createdAt?.slice(0, 19)?.replace('T', ' ')}</span>{' '}
                                                — {e.type}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
