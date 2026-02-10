'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useLeverage, LeverageOffer } from '@/components/providers/LeverageContext';
import { Button } from '@/components/ui/Button';
import { X, Calendar, ChevronRight, CheckCircle2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function LeverageDrawer() {
    const { isDrawerOpen, closeLeverageDrawer, activeOpportunity, createOffer } = useLeverage();

    if (!isDrawerOpen || !activeOpportunity) return null;

    return (
        <AnimatePresence>
            {isDrawerOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeLeverageDrawer}
                        className="fixed inset-0 bg-black/85 z-[100] backdrop-blur-[6px]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-[500px] z-[101] shadow-[0_40px_120px_-70px_rgba(0,0,0,0.9)] overflow-y-auto border-l border-[rgba(255,255,255,0.12)] bg-[radial-gradient(900px_500px_at_20%_0%,rgba(var(--accent-rgb), 0.10),transparent_55%),linear-gradient(180deg,rgba(8,8,14,0.98),rgba(6,6,10,0.96))]"
                    >
                        <LeverageForm onClose={closeLeverageDrawer} opportunity={activeOpportunity} onCreate={createOffer} />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function LeverageForm({ onClose, opportunity, onCreate }: { onClose: () => void, opportunity: any, onCreate: (o: LeverageOffer) => void }) {
    const [anchor, setAnchor] = useState<number>(100000);
    const [matchMode, setMatchMode] = useState<'match' | 'remainder'>('match');
    const deadlineRef = useRef<HTMLInputElement | null>(null);
    const [deadline, setDeadline] = useState<string>(() => {
        const d = new Date();
        d.setDate(d.getDate() + 60);
        return d.toISOString().split('T')[0];
    });

    // Terms
    const [proofRequired, setProofRequired] = useState(true);
    const [milestones, setMilestones] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitErr, setSubmitErr] = useState<string | null>(null);

    // Derived Logic
    const challengeGoal = matchMode === 'match'
        ? anchor
        : Math.max(0, opportunity.fundingGap - anchor);

    const topUpAmount = matchMode === 'match' ? anchor : challengeGoal; // Simplified 1:1 logic
    const totalDeployed = anchor + topUpAmount;

    const matchModeLabel = matchMode === 'match' ? 'Match Me (1:1)' : 'Cover Remainder';
    const deadlineLabel = (() => {
        try {
            if (!deadline) return '—';
            const d = new Date(`${deadline}T00:00:00`);
            if (Number.isNaN(d.getTime())) return deadline;
            return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
        } catch {
            return deadline;
        }
    })();

    const handleCreate = async () => {
        setSubmitting(true);
        setSubmitErr(null);
        const offer: LeverageOffer = {
            id: `offer_${Date.now()}`,
            opportunityId: opportunity.id,
            opportunityTitle: opportunity.title,
            opportunityOrg: opportunity.orgName,
            askAmount: opportunity.fundingGap,
            anchorAmount: anchor,
            challengeGoal: challengeGoal,
            topUpCap: topUpAmount,
            matchRatio: 1,
            deadline: deadline,
            terms: {
                proofRequired,
                milestoneRelease: milestones,
                quarterlyUpdates: true,
                namingRights: false,
                revokeOnMisrep: true
            },
            status: 'created',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        // Persist via API (await) so the parent page refresh sees the History event immediately.
        try {
            const res = await fetch('/api/leverage-offers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    opportunityKey: opportunity.id,
                    anchorAmount: offer.anchorAmount,
                    matchMode,
                    challengeGoal: offer.challengeGoal,
                    topUpCap: offer.topUpCap,
                    deadline: offer.deadline,
                    terms: offer.terms,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || 'Failed to create leverage offer');

            onCreate(offer);
            onClose();
        } catch (e: any) {
            setSubmitErr(String(e?.message || 'Failed to create leverage offer'));
        } finally {
            setSubmitting(false);
        }
    };

    if (showConfirm) {
        return (
            <div className="h-full flex flex-col p-8">
                <Button variant="ghost" className="self-start -ml-4 mb-4" onClick={() => setShowConfirm(false)}>Back</Button>
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)] flex items-center justify-center">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-serif">Confirm Conditional Offer?</h2>

                    <div className="bg-[rgba(255,255,255,0.03)] p-6 rounded-lg w-full text-left space-y-3 border border-[rgba(255,255,255,0.10)]">
                        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">
                            {opportunity.title}
                        </div>
                        <div className="text-xs text-[var(--text-tertiary)] -mt-1">
                            {opportunity.orgName} • {opportunity.location}
                        </div>
                        <div className="border-t border-[rgba(255,255,255,0.10)] pt-3 mt-3" />
                        <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">Anchor (Pay Now)</span>
                            <span className="font-bold">${anchor.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">Challenge type</span>
                            <span className="font-bold">{matchModeLabel}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">Condition</span>
                            <span className="font-bold">Raises ${challengeGoal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">Deadline</span>
                            <span className="font-bold">{deadlineLabel}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">Terms</span>
                            <span className="font-bold text-right">
                                {proofRequired ? 'Verification required' : 'No verification'}{milestones ? ' • Milestones 50/50' : ''}
                            </span>
                        </div>
                        <div className="border-t pt-2 mt-2 flex justify-between text-lg">
                            <span className="font-bold">Total Max</span>
                            <span className="font-bold text-[var(--color-gold)]">${totalDeployed.toLocaleString()}</span>
                        </div>
                    </div>

                    <Button variant="gold" size="lg" className="w-full" onClick={handleCreate} isLoading={submitting} disabled={submitting}>
                        Create Offer
                    </Button>
                    {submitErr ? (
                        <div className="-mt-2 text-xs text-red-300 text-center">
                            {submitErr}
                        </div>
                    ) : null}
                    <p className="text-xs text-[var(--text-tertiary)]">Funds are held in escrow until verification.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-[rgba(255,255,255,0.10)] flex justify-between items-center sticky top-0 bg-[rgba(10,10,16,0.88)] backdrop-blur z-10">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Structure Leverage</h2>
                <button onClick={onClose} className="p-2 hover:bg-[rgba(255,255,255,0.06)] rounded-full"><X size={20} /></button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 space-y-8 overflow-y-auto">

                {/* Section A: Brief */}
                <div className="space-y-3">
                    <div className="flex gap-2 mb-2">
                        <span className="bg-[var(--bg-ivory)] border border-[var(--color-gold)] text-[var(--color-gold)] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">{opportunity.category}</span>
                        <span className="bg-[rgba(255,255,255,0.06)] text-[var(--text-secondary)] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-[rgba(255,255,255,0.10)]">Gap: ${(opportunity.fundingGap / 1000).toFixed(0)}k</span>
                    </div>
                    <h1 className="text-2xl font-semibold leading-tight text-[var(--text-primary)]">{opportunity.title}</h1>
                    <p className="text-sm text-[var(--text-secondary)]">{opportunity.orgName} • {opportunity.location}</p>
                </div>

                {/* Section B: Builder */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)] border-b pb-2">Offer Terms</h3>

                    {/* B1: Anchor */}
                    <div>
                        <label className="block text-sm font-medium mb-3">Anchor Commitment (Now)</label>
                        <div className="flex gap-2 mb-3">
                            {[50000, 100000, 250000].map(amt => (
                                <button
                                    key={amt}
                                    onClick={() => setAnchor(amt)}
                                    className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all border focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(var(--accent-rgb), 0.22)] ${anchor === amt
                                        ? 'bg-[rgba(var(--accent-rgb), 0.20)] text-[var(--text-primary)] border-[rgba(var(--accent-rgb), 0.35)] shadow-[0_18px_50px_-34px_rgba(var(--accent-rgb), 0.9)]'
                                        : 'bg-[rgba(255,255,255,0.04)] text-[var(--text-secondary)] border-[rgba(255,255,255,0.10)] hover:bg-[rgba(255,255,255,0.07)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    ${(amt / 1000).toFixed(0)}k
                                </button>
                            ))}
                        </div>
                        <input
                            type="range" min="10000" max={opportunity.fundingGap} step="5000"
                            value={anchor} onChange={(e) => setAnchor(Number(e.target.value))}
                            className="w-full accent-[var(--color-gold)] mb-2"
                        />
                        <div className="text-right font-mono font-bold text-lg">${anchor.toLocaleString()}</div>
                    </div>

                    {/* B2: Goal */}
                    <div>
                        <label className="block text-sm font-medium mb-3">Challenge Goal</label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-[rgba(255,255,255,0.04)] rounded-lg border border-[rgba(255,255,255,0.10)]">
                            <button
                                onClick={() => setMatchMode('match')}
                                className={`py-2 text-xs font-bold rounded-md transition-all ${matchMode === 'match' ? 'bg-[rgba(var(--accent-rgb), 0.12)] shadow-[0_0_0_1px_rgba(var(--accent-rgb), 0.25)] text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
                            >
                                Match Me (1:1)
                            </button>
                            <button
                                onClick={() => setMatchMode('remainder')}
                                className={`py-2 text-xs font-bold rounded-md transition-all ${matchMode === 'remainder' ? 'bg-[rgba(var(--accent-rgb), 0.12)] shadow-[0_0_0_1px_rgba(var(--accent-rgb), 0.25)] text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
                            >
                                Cover Remainder
                            </button>
                        </div>
                        <div className="mt-3 text-sm text-[var(--text-secondary)] bg-[rgba(var(--accent-rgb), 0.08)] p-3 rounded border border-[rgba(var(--accent-rgb), 0.18)]">
                            Required to raise: <span className="font-bold text-[var(--text-primary)]">${challengeGoal.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* B4: Deadline */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Challenge Deadline</label>
                        <div className="relative">
                            <input
                                ref={deadlineRef}
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="input-field pr-12"
                            />
                            <button
                                type="button"
                                className={[
                                    'absolute right-2 top-1/2 -translate-y-1/2',
                                    'h-9 w-9 rounded-lg border border-[rgba(var(--silver-rgb),0.18)]',
                                    'bg-[linear-gradient(180deg,rgba(26,26,26,0.72),rgba(10,10,10,0.78))]',
                                    'text-[rgba(var(--accent-rgb),0.95)]',
                                    'shadow-[0_18px_60px_-50px_rgba(var(--accent-rgb),0.55)]',
                                    'hover:bg-[linear-gradient(180deg,rgba(42,42,42,0.68),rgba(10,10,10,0.82))]',
                                    'transition-colors',
                                ].join(' ')}
                                aria-label="Pick deadline date"
                                title="Pick a date"
                                onClick={() => {
                                    const el = deadlineRef.current;
                                    if (!el) return;
                                    // Chromium supports showPicker(); Safari/Firefox fall back to focus/click.
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const anyEl: any = el as any;
                                    try {
                                        if (typeof anyEl.showPicker === 'function') {
                                            anyEl.showPicker();
                                            return;
                                        }
                                    } catch {
                                        // ignore
                                    }
                                    el.focus();
                                    el.click();
                                }}
                            >
                                <Calendar size={16} className="mx-auto" />
                            </button>
                        </div>
                        <div className="mt-2 text-xs text-[var(--text-tertiary)]">
                            Default is 60 days out. Click the calendar to pick a date.
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="space-y-2 pt-2">
                        <label className="group flex items-center gap-3 text-sm text-[var(--text-secondary)] cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={proofRequired}
                                onChange={e => setProofRequired(e.target.checked)}
                                className="peer sr-only"
                            />
                            <span className="h-5 w-5 rounded-md border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.04)] flex items-center justify-center transition-all group-hover:bg-[rgba(255,255,255,0.06)] peer-checked:bg-[rgba(var(--accent-rgb), 0.22)] peer-checked:border-[rgba(var(--accent-rgb), 0.45)] peer-focus-visible:shadow-[0_0_0_3px_rgba(var(--accent-rgb), 0.22)] peer-checked:[&>span]:opacity-100 peer-checked:[&>span]:scale-100">
                                <span className="text-[var(--text-primary)] opacity-0 scale-75 transition-all">
                                    <Check size={14} strokeWidth={3} />
                                </span>
                            </span>
                            <span className="group-hover:text-[var(--text-primary)] transition-colors">
                                Require 3rd party verification
                            </span>
                        </label>
                        <label className="group flex items-center gap-3 text-sm text-[var(--text-secondary)] cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={milestones}
                                onChange={e => setMilestones(e.target.checked)}
                                className="peer sr-only"
                            />
                            <span className="h-5 w-5 rounded-md border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.04)] flex items-center justify-center transition-all group-hover:bg-[rgba(255,255,255,0.06)] peer-checked:bg-[rgba(var(--accent-rgb), 0.22)] peer-checked:border-[rgba(var(--accent-rgb), 0.45)] peer-focus-visible:shadow-[0_0_0_3px_rgba(var(--accent-rgb), 0.22)] peer-checked:[&>span]:opacity-100 peer-checked:[&>span]:scale-100">
                                <span className="text-[var(--text-primary)] opacity-0 scale-75 transition-all">
                                    <Check size={14} strokeWidth={3} />
                                </span>
                            </span>
                            <span className="group-hover:text-[var(--text-primary)] transition-colors">
                                Release in milestones (50/50)
                            </span>
                        </label>
                    </div>

                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-[var(--bg-surface)] sticky bottom-0">
                {/* Live Summary */}
                <div className="mb-4 text-sm leading-relaxed text-[var(--text-secondary)] bg-[rgba(255,255,255,0.03)] p-3 rounded border border-[rgba(255,255,255,0.10)] shadow-[0_12px_40px_-28px_rgba(0,0,0,0.9)]">
                    Commit <span className="font-bold text-[var(--text-primary)]">${anchor.toLocaleString()}</span> now.
                    If they raise <span className="font-bold text-[var(--text-primary)]">${challengeGoal.toLocaleString()}</span> by {deadline},
                    we release <span className="font-bold text-[var(--text-primary)]">${topUpAmount.toLocaleString()}</span>.
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button variant="gold" className="flex-[2]" onClick={() => setShowConfirm(true)}>Create Offer</Button>
                </div>
            </div>
        </div>
    );
}
