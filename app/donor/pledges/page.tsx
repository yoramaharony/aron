'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, ChevronRight, Download, ExternalLink, Zap, X, Heart, Check, DollarSign, Clock3, CheckCircle2, TrendingUp, Compass, Sparkles, FileCheck2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ---- Types ----

type LeverageOfferSummary = {
    id: string;
    anchorAmount: number;
    challengeGoal: number;
    matchMode: string;
    topUpCap: number;
    deadline: string;
    status: string;
    createdAt: string | null;
};

type Pledge = {
    opportunityKey: string;
    source: 'request' | 'submission' | 'charidy';
    title: string;
    orgName: string;
    category: string | null;
    location: string | null;
    summary: string;
    totalPledge: number;
    paidToDate: number;
    status: string;
    grantId: string;
    commitmentDate: string | null;
    leverageOffers: LeverageOfferSummary[];
};

// ---- Jewish-themed past fulfillment (demo) ----

const PAST_FULFILLMENT = [
    {
        title: 'Hachnasas Kallah Essentials Fund 5784',
        orgName: 'Keren Hachnasas Kallah of Greater New York',
        fulfilledDate: 'Fulfilled Kislev 15, 5784 (Nov 28, 2023)',
        amount: 180000,
        grantId: 'GR-5784-HK01',
    },
    {
        title: 'Chesed Shel Emes Emergency Appeal',
        orgName: 'Chesed Shel Emes Burial Society',
        fulfilledDate: 'Fulfilled Tishrei 3, 5784 (Sep 18, 2023)',
        amount: 50000,
        grantId: 'GR-5784-CS02',
    },
    {
        title: 'Beit Midrash Renovation \u2014 Yeshivat Ohr Somayach',
        orgName: 'Yeshivat Ohr Somayach \u2014 Jerusalem Campus',
        fulfilledDate: 'Fulfilled Adar II 20, 5784 (Mar 30, 2024)',
        amount: 360000,
        grantId: 'GR-5784-OS03',
    },
];

// ---- Payments Modal ----

function PaymentsModal({ pledge, onClose }: { pledge: Pledge; onClose: () => void }) {
    const quarterly = pledge.totalPledge > 0 ? Math.round(pledge.totalPledge / 4) : 0;
    const commitYear = pledge.commitmentDate
        ? new Date(pledge.commitmentDate).getFullYear()
        : new Date().getFullYear();

    const [paidQuarters, setPaidQuarters] = useState<Set<number>>(new Set());

    const quarters = [
        { label: `Q1 ${commitYear}`, due: `Mar 31, ${commitYear}` },
        { label: `Q2 ${commitYear}`, due: `Jun 30, ${commitYear}` },
        { label: `Q3 ${commitYear}`, due: `Sep 30, ${commitYear}` },
        { label: `Q4 ${commitYear}`, due: `Dec 31, ${commitYear}` },
    ];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="fixed inset-0 bg-black/60" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-[var(--bg-paper)] rounded-lg shadow-2xl border border-[var(--border-subtle)] w-full max-w-md mx-4 overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-[var(--border-subtle)]">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Payment Schedule</h3>
                            <div className="text-sm text-secondary mt-1">{pledge.title}</div>
                            <div className="text-xs text-[var(--text-tertiary)] font-mono mt-0.5">{pledge.grantId}</div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-[var(--bg-surface)] rounded-full transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Schedule */}
                <div className="p-6 space-y-3">
                    {quarters.map((q, i) => {
                        const isPaid = paidQuarters.has(i);
                        return (
                            <div key={i} className={`flex items-center justify-between p-4 rounded border transition-colors ${isPaid ? 'bg-[rgba(34,197,94,0.08)] border-green-500/30' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)]'}`}>
                                <div className="flex-1">
                                    <div className="font-medium text-sm text-[var(--text-primary)]">{q.label}</div>
                                    <div className="text-xs text-[var(--text-tertiary)]">Due {q.due}</div>
                                </div>
                                <div className="text-right mr-4">
                                    <div className="font-medium text-sm">${quarterly.toLocaleString()}</div>
                                </div>
                                {isPaid ? (
                                    <span className="flex items-center gap-1 text-xs font-medium text-green-500 bg-green-500/10 px-3 py-1.5 rounded">
                                        <Check size={12} /> Paid
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => setPaidQuarters((prev) => new Set([...prev, i]))}
                                        className="flex items-center gap-1 text-xs font-medium text-[var(--color-gold)] border border-[var(--color-gold)]/40 px-3 py-1.5 rounded hover:bg-[rgba(212,175,55,0.08)] transition-colors"
                                    >
                                        <DollarSign size={12} /> Record
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    {/* Total */}
                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">Total Pledge</span>
                        <span className="text-lg font-semibold text-[var(--text-primary)]">
                            {pledge.totalPledge > 0 ? `$${pledge.totalPledge.toLocaleString()}` : 'TBD'}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                    <div className="p-3 bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.15)] rounded text-xs text-[var(--text-secondary)] leading-relaxed">
                        Payment methods and schedule adjustments are managed through your dedicated concierge.
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ---- Main Page ----

export default function DonorPledges() {
    const [pledges, setPledges] = useState<Pledge[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPledge, setSelectedPledge] = useState<Pledge | null>(null);
    const [paymentsModalPledge, setPaymentsModalPledge] = useState<Pledge | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/pledges');
                if (!res.ok) throw new Error('Failed to load');
                const data = await res.json();
                setPledges(data.pledges ?? []);
            } catch {
                setPledges([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Flatten leverage offers across all pledges for the Conditional Offers section
    const allLeverageOffers = useMemo(
        () =>
            pledges.flatMap((p) =>
                p.leverageOffers.map((lo) => ({
                    ...lo,
                    opportunityTitle: p.title,
                    opportunityOrg: p.orgName,
                })),
            ),
        [pledges],
    );

    const progressPct = (p: Pledge) =>
        p.totalPledge > 0 ? Math.round((p.paidToDate / p.totalPledge) * 100) : 0;

    // ---- Export Report (CSV) ----
    const handleExportReport = useCallback(() => {
        const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
        const headers = ['Grant ID', 'Title', 'Organization', 'Amount', 'Paid', 'Status', 'Commitment Date'];
        const rows: string[][] = [];

        for (const p of pledges) {
            rows.push([
                p.grantId,
                p.title,
                p.orgName,
                p.totalPledge.toString(),
                p.paidToDate.toString(),
                p.status,
                p.commitmentDate ? new Date(p.commitmentDate).toLocaleDateString() : '',
            ]);
        }

        for (const pf of PAST_FULFILLMENT) {
            rows.push([
                pf.grantId,
                pf.title,
                pf.orgName,
                pf.amount.toString(),
                pf.amount.toString(),
                'Fulfilled',
                '',
            ]);
        }

        const csv = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'aron-pledges-report.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [pledges]);

    return (
        <div className="relative">
            {/* HEADER */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-[var(--text-primary)]">My Pledges</h1>
                    <p className="text-secondary">Track your commitments and payment schedules</p>
                </div>
                <Button variant="outline" size="sm" leftIcon={<Download size={16} />} onClick={handleExportReport}>
                    Export Report
                </Button>
            </div>

            {/* CONDITIONAL OFFERS (LEVERAGE) */}
            {allLeverageOffers.length > 0 && (
                <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-[var(--color-gold)] text-[#120014] rounded">
                            <Zap size={16} fill="currentColor" />
                        </div>
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Conditional Offers</h2>
                    </div>

                    <div className="space-y-4">
                        {allLeverageOffers.map((offer) => (
                            <Card key={offer.id} className="flex flex-col md:flex-row gap-6 items-center p-6 border-[var(--color-gold)]/30 bg-[var(--bg-ivory)]">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-[rgba(255,255,255,0.04)] px-2 py-0.5 rounded border border-[rgba(var(--accent-rgb),0.30)] text-[var(--color-gold)]">
                                            {offer.status.replace('_', ' ')}
                                        </span>
                                        {offer.createdAt && (
                                            <span className="text-xs text-secondary">Created {new Date(offer.createdAt).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-semibold text-[var(--text-primary)]">{offer.opportunityTitle}</h3>
                                    <div className="text-sm text-secondary">{offer.opportunityOrg}</div>
                                </div>

                                <div className="flex gap-8 text-center">
                                    <div>
                                        <div className="text-xs text-secondary uppercase tracking-wider mb-1">Anchor</div>
                                        <div className="font-bold text-lg">${offer.anchorAmount.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-secondary uppercase tracking-wider mb-1">Challenge</div>
                                        <div className="font-bold text-lg">Raises ${offer.challengeGoal.toLocaleString()}</div>
                                    </div>
                                    <div className="hidden md:block">
                                        <div className="text-xs text-secondary uppercase tracking-wider mb-1">Deadline</div>
                                        <div className="font-bold text-lg">{new Date(offer.deadline + 'T00:00:00').toLocaleDateString()}</div>
                                    </div>
                                </div>

                                <div className="flex gap-2 w-full md:w-auto">
                                    <Button variant="outline" className="flex-1 md:flex-none">Manage</Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* ACTIVE COMMITMENTS */}
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Active Commitments
            </h2>

            {loading ? (
                <div className="text-secondary text-sm py-12 text-center">Loading pledges...</div>
            ) : pledges.length === 0 ? (
                <Card className="relative overflow-hidden border border-[rgba(212,175,55,0.35)] bg-[linear-gradient(145deg,rgba(20,20,20,0.97)_0%,rgba(28,28,28,0.94)_55%,rgba(20,20,20,0.97)_100%)] shadow-[0_0_34px_rgba(212,175,55,0.18)] mb-10">
                    <div className="absolute inset-0 opacity-[0.14] pointer-events-none bg-[radial-gradient(circle_at_50%_22%,rgba(212,175,55,0.50)_0%,rgba(212,175,55,0.10)_27%,transparent_62%)]" />
                    <div className="relative px-6 py-8 md:px-10 md:py-9 text-center">
                        <div className="mx-auto h-20 w-20 rounded-3xl border border-[rgba(212,175,55,0.35)] bg-[linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] flex items-center justify-center shadow-[0_0_24px_rgba(212,175,55,0.24)]">
                            <Heart size={30} className="text-[var(--color-gold)]" />
                        </div>

                        <h3 className="mt-5 text-3xl md:text-4xl font-medium tracking-tight text-[var(--text-primary)]">
                            Your Commitment Portfolio Awaits
                        </h3>
                        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
                            Begin your philanthropic journey by reviewing curated opportunities. Once you commit to an opportunity, your pledges and payment schedules will appear here.
                        </p>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[
                                { label: 'Commitments', icon: CheckCircle2 },
                                { label: 'In Progress', icon: Clock3 },
                                { label: 'Fulfilled', icon: TrendingUp },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] px-5 py-5"
                                >
                                    <item.icon size={16} className="mx-auto text-[var(--text-tertiary)]" />
                                    <div className="mt-4 text-2xl leading-none text-[var(--text-secondary)]">—</div>
                                    <div className="mt-3 text-xs uppercase tracking-widest text-[var(--text-tertiary)]">{item.label}</div>
                                </div>
                            ))}
                        </div>

                        <a
                            href="/donor/opportunities"
                            className="mt-6 inline-flex items-center justify-center gap-3 rounded-2xl px-8 py-3.5 text-lg font-medium text-[#121212] bg-[linear-gradient(145deg,#D4AF37,#E5C158)] border border-[rgba(212,175,55,0.65)] shadow-[0_0_24px_rgba(212,175,55,0.36)] hover:brightness-105 transition-all"
                        >
                            <Compass size={20} />
                            Explore Opportunities
                            <ChevronRight size={20} />
                        </a>
                    </div>

                    <div className="relative border-t border-[rgba(255,255,255,0.08)] px-6 py-3.5 md:px-10 flex flex-col md:flex-row items-center justify-center gap-5 text-[var(--text-secondary)]">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-[var(--color-gold)]" />
                            <span>Curated for your vision</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileCheck2 size={16} className="text-[var(--color-gold)]" />
                            <span>Full due diligence support</span>
                        </div>
                    </div>
                </Card>
            ) : (
                <div className="space-y-4 mb-12">
                    {pledges.map((pledge) => (
                        <div key={pledge.opportunityKey} onClick={() => setSelectedPledge(pledge)} className="cursor-pointer">
                            <Card className="flex flex-col md:flex-row gap-6 items-center p-6 hover:shadow-md transition-shadow group border border-[var(--border-subtle)] hover:border-[var(--color-gold)]">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="w-2 h-2 rounded-full bg-[var(--color-gold)]"></span>
                                        <span className="text-xs text-secondary font-medium">{pledge.status}</span>
                                        <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{pledge.grantId}</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-gold)] transition-colors">{pledge.title}</h3>
                                    <div className="text-sm text-secondary">{pledge.orgName}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-medium">{pledge.totalPledge > 0 ? `$${pledge.totalPledge.toLocaleString()}` : 'TBD'}</div>
                                    <div className="text-xs text-secondary">Total Committed</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-medium">${pledge.paidToDate.toLocaleString()}</div>
                                    <div className="text-xs text-secondary">Paid to Date</div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]">
                                    <ChevronRight size={20} />
                                </Button>
                            </Card>
                        </div>
                    ))}
                </div>
            )}

            {/* PAST FULFILLMENT */}
            <section className={pledges.length > 0 ? '' : 'mt-12'}>
                <h2 className="text-xl mb-4 text-secondary">Past Fulfillment</h2>
                <div className="flex flex-col gap-4">
                    {PAST_FULFILLMENT.map((item, i) => (
                        <Card key={i} className="flex justify-between items-center opacity-75 hover:opacity-100 transition-opacity p-6">
                            <div>
                                <div className="font-medium mb-1">{item.title}</div>
                                <div className="text-sm text-secondary">{item.fulfilledDate}</div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="font-semibold text-[var(--text-primary)]">${item.amount.toLocaleString()}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    rightIcon={<Download size={14} />}
                                    onClick={() => window.open(`/api/receipts/demo?index=${i}`, '_blank')}
                                >
                                    Receipt
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* DETAIL DRAWER */}
            <AnimatePresence>
                {selectedPledge && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedPledge(null)}
                            className="fixed inset-0 bg-black z-40"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full max-w-lg bg-[var(--bg-paper)] shadow-2xl z-50 border-l border-[var(--border-subtle)] flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-start">
                                <div>
                                    <div className="text-xs uppercase tracking-widest text-[var(--color-sage)] font-bold mb-2">Commitment Details</div>
                                    <h2 className="text-2xl font-semibold text-[var(--text-primary)]">{selectedPledge.title}</h2>
                                    <div className="text-sm text-[var(--text-secondary)]">{selectedPledge.orgName} &bull; {selectedPledge.grantId}</div>
                                </div>
                                <button onClick={() => setSelectedPledge(null)} className="p-2 hover:bg-[var(--bg-surface)] rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                {/* Key Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-[var(--bg-surface)] rounded border border-[var(--border-subtle)]">
                                        <div className="text-xs uppercase text-[var(--text-tertiary)] mb-1">Total Pledge</div>
                                        <div className="text-xl font-serif text-[var(--text-primary)]">
                                            {selectedPledge.totalPledge > 0 ? `$${selectedPledge.totalPledge.toLocaleString()}` : 'TBD'}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-[var(--bg-surface)] rounded border border-[var(--border-subtle)]">
                                        <div className="text-xs uppercase text-[var(--text-tertiary)] mb-1">Paid</div>
                                        <div className="text-xl font-serif text-[var(--text-primary)]">${selectedPledge.paidToDate.toLocaleString()}</div>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div>
                                    <div className="w-full bg-[var(--bg-surface)] h-2 rounded-full overflow-hidden mb-2">
                                        <div
                                            className="bg-[var(--color-gold)] h-full transition-all"
                                            style={{ width: `${progressPct(selectedPledge)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                                        <span>{progressPct(selectedPledge)}% Fulfilled</span>
                                    </div>
                                </div>

                                {/* Commitment Date */}
                                {selectedPledge.commitmentDate && (
                                    <div className="p-4 bg-[var(--bg-surface)] rounded border border-[var(--border-subtle)]">
                                        <div className="text-xs uppercase text-[var(--text-tertiary)] mb-1">Commitment Date</div>
                                        <div className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                                            <Calendar size={14} className="text-[var(--color-gold)]" />
                                            {new Date(selectedPledge.commitmentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                    </div>
                                )}

                                {/* Leverage Offers */}
                                {selectedPledge.leverageOffers.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-lg text-[var(--text-primary)] mb-3 flex items-center gap-2">
                                            <Zap size={16} className="text-[var(--color-gold)]" />
                                            Leverage Offers
                                        </h3>
                                        {selectedPledge.leverageOffers.map((lo) => (
                                            <div key={lo.id} className="p-4 bg-[rgba(var(--accent-rgb),0.06)] rounded border border-[rgba(var(--accent-rgb),0.18)] mb-2">
                                                <div className="grid grid-cols-3 gap-3 text-sm">
                                                    <div>
                                                        <div className="text-xs uppercase text-[var(--text-tertiary)] mb-0.5">Anchor</div>
                                                        <div className="font-medium">${lo.anchorAmount.toLocaleString()}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs uppercase text-[var(--text-tertiary)] mb-0.5">Challenge</div>
                                                        <div className="font-medium">${lo.challengeGoal.toLocaleString()}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs uppercase text-[var(--text-tertiary)] mb-0.5">Deadline</div>
                                                        <div className="font-medium">{new Date(lo.deadline + 'T00:00:00').toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-[var(--text-tertiary)] mt-2">
                                                    Status: <span className="text-[var(--color-gold)] font-medium">{lo.status.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-lg text-[var(--text-primary)]">Actions</h3>
                                    <button
                                        onClick={() => alert('Grant agreement document will be generated by your concierge team.')}
                                        className="w-full flex items-center justify-between p-4 bg-[rgba(255,255,255,0.02)] border border-[var(--border-subtle)] rounded hover:border-[var(--color-gold)] hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left group"
                                    >
                                        <span className="font-medium text-[var(--text-primary)]">View Grant Agreement</span>
                                        <ExternalLink size={16} className="text-[var(--text-tertiary)] group-hover:text-[var(--color-gold)]" />
                                    </button>
                                    <button
                                        onClick={() => alert('Tax receipt will be available after your first payment is processed.')}
                                        className="w-full flex items-center justify-between p-4 bg-[rgba(255,255,255,0.02)] border border-[var(--border-subtle)] rounded hover:border-[var(--color-gold)] hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left group"
                                    >
                                        <span className="font-medium text-[var(--text-primary)]">Download Tax Receipt</span>
                                        <Download size={16} className="text-[var(--text-tertiary)] group-hover:text-[var(--color-gold)]" />
                                    </button>
                                </div>

                                {/* Status message */}
                                <div className="p-4 bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.18)] text-sm rounded flex items-center gap-2">
                                    <span className="w-2 h-2 bg-[var(--color-gold)] rounded-full" />
                                    <span className="text-[var(--text-secondary)]">New commitment. Payment schedule will be configured by your concierge.</span>
                                </div>
                            </div>

                            <div className="p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                                <Button className="w-full" onClick={() => setPaymentsModalPledge(selectedPledge)}>
                                    Manage Payments
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* PAYMENTS MODAL */}
            <AnimatePresence>
                {paymentsModalPledge && (
                    <PaymentsModal
                        pledge={paymentsModalPledge}
                        onClose={() => setPaymentsModalPledge(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
