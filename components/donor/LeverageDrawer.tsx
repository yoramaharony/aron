'use client';

import React, { useRef, useState } from 'react';
import { useLeverage, LeverageOffer } from '@/components/providers/LeverageContext';
import { Button } from '@/components/ui/Button';
import { X, Calendar, CheckCircle2 } from 'lucide-react';
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

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.98 }}
                        transition={{ type: 'spring', damping: 24, stiffness: 220 }}
                        className="fixed inset-0 z-[101] p-4 sm:p-6 flex items-center justify-center"
                    >
                        <div
                            className="w-full max-w-[760px] max-h-[92vh] rounded-2xl shadow-[0_40px_120px_-70px_rgba(0,0,0,0.9)] overflow-y-auto border border-[rgba(255,255,255,0.12)] bg-[radial-gradient(900px_500px_at_20%_0%,rgba(var(--accent-rgb),0.10),transparent_55%),linear-gradient(180deg,rgba(8,8,14,0.98),rgba(6,6,10,0.96))]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <LeverageForm onClose={closeLeverageDrawer} opportunity={activeOpportunity} onCreate={createOffer} />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function roundToStep(value: number, step = 5000) {
    if (!Number.isFinite(value)) return step;
    return Math.max(step, Math.round(value / step) * step);
}

function LeverageForm({ onClose, opportunity, onCreate }: { onClose: () => void, opportunity: any, onCreate: (o: LeverageOffer) => void }) {
    const fundingGap = Math.max(0, Number(opportunity?.fundingGap || 0));
    const [plan, setPlan] = useState<'half' | 'third'>('half');
    const matchMode: 'match' = 'match';
    const deadlineRef = useRef<HTMLInputElement | null>(null);
    const [deadline, setDeadline] = useState<string>(() => {
        const d = new Date();
        d.setDate(d.getDate() + 60);
        return d.toISOString().split('T')[0];
    });

    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitErr, setSubmitErr] = useState<string | null>(null);

    // Simple model: donor pays now (1/2 or 1/3), organization raises the rest on Charidy.
    const donorFraction = plan === 'half' ? 0.5 : 1 / 3;
    const safeAnchor = Math.min(fundingGap, roundToStep(fundingGap * donorFraction, 500));
    const challengeGoal = Math.max(0, fundingGap - safeAnchor);
    const topUpAmount = 0;
    const totalDeployed = safeAnchor;
    const outcomeTotal = safeAnchor + challengeGoal;
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
        const opportunityKey = String(opportunity.id || opportunity.key || '').trim();
        if (!opportunityKey) {
            setSubmitErr('Missing opportunity key. Please close and reopen this challenge flow.');
            setSubmitting(false);
            return;
        }
        const offer: LeverageOffer = {
            id: `offer_${Date.now()}`,
            opportunityId: opportunityKey,
            opportunityTitle: opportunity.title,
            opportunityOrg: opportunity.orgName,
            askAmount: opportunity.fundingGap,
            anchorAmount: safeAnchor,
            challengeGoal: challengeGoal,
            topUpCap: topUpAmount,
            matchRatio: 1,
            deadline: deadline,
            terms: {
                proofRequired: true,
                milestoneRelease: false,
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
                    opportunityKey,
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
            <div className="h-full min-h-[660px] flex flex-col p-8">
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
                            <span className="font-bold">${safeAnchor.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">Challenge type</span>
                            <span className="font-bold">Organization Raise Challenge</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">Condition</span>
                            <span className="font-bold">Raises ${challengeGoal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">Deadline</span>
                            <span className="font-bold">{deadlineLabel}</span>
                        </div>
                        <div className="border-t pt-2 mt-2 flex justify-between text-lg">
                            <span className="font-bold">Total Request Target</span>
                            <span className="font-bold text-[var(--color-gold)]">${fundingGap.toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-[var(--text-tertiary)] mt-1">
                            Donor contributes now; organization is challenged to raise the remaining amount.
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
        <div className="min-h-[660px]">
            {/* Header */}
            <div className="p-6 border-b border-[rgba(255,255,255,0.10)] flex justify-between items-center">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Structure Leverage</h2>
                <button onClick={onClose} className="p-2 hover:bg-[rgba(255,255,255,0.06)] rounded-full"><X size={20} /></button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">

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

                    {/* Simple contribution plan */}
                    <div>
                        <label className="block text-sm font-medium mb-3">Choose donor contribution plan</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                            <button
                                type="button"
                                onClick={() => setPlan('half')}
                                className={`px-3 py-3 rounded-lg text-sm font-semibold transition-all border focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(var(--accent-rgb),0.22)] ${
                                    plan === 'half'
                                        ? 'bg-[rgba(var(--accent-rgb),0.20)] text-[var(--text-primary)] border-[rgba(var(--accent-rgb),0.35)] shadow-[0_18px_50px_-34px_rgba(var(--accent-rgb),0.9)]'
                                        : 'bg-[rgba(255,255,255,0.04)] text-[var(--text-secondary)] border-[rgba(255,255,255,0.10)] hover:bg-[rgba(255,255,255,0.07)] hover:text-[var(--text-primary)]'
                                }`}
                            >
                                Donor pays half (50%)
                            </button>
                            <button
                                type="button"
                                onClick={() => setPlan('third')}
                                className={`px-3 py-3 rounded-lg text-sm font-semibold transition-all border focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(var(--accent-rgb),0.22)] ${
                                    plan === 'third'
                                        ? 'bg-[rgba(var(--accent-rgb),0.20)] text-[var(--text-primary)] border-[rgba(var(--accent-rgb),0.35)] shadow-[0_18px_50px_-34px_rgba(var(--accent-rgb),0.9)]'
                                        : 'bg-[rgba(255,255,255,0.04)] text-[var(--text-secondary)] border-[rgba(255,255,255,0.10)] hover:bg-[rgba(255,255,255,0.07)] hover:text-[var(--text-primary)]'
                                }`}
                            >
                                Donor pays one-third (33%)
                            </button>
                        </div>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div className="bg-[rgba(var(--accent-rgb), 0.08)] p-3 rounded border border-[rgba(var(--accent-rgb), 0.18)]">
                                Donor pays now: <span className="font-bold text-[var(--text-primary)]">${safeAnchor.toLocaleString()}</span>
                            </div>
                            <div className="bg-[rgba(255,255,255,0.04)] p-3 rounded border border-[rgba(255,255,255,0.14)]">
                                Required to raise: <span className="font-bold text-[var(--text-primary)]">${challengeGoal.toLocaleString()}</span>
                            </div>
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

                    <div className="rounded-lg border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.06)] p-3 text-xs text-[var(--text-secondary)]">
                        Total target remains ${fundingGap.toLocaleString()}. If the organization raises the required amount by the deadline, the request is considered fulfilled.
                    </div>

                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-[var(--bg-surface)]">
                {/* Live Summary */}
                <div className="mb-4 text-sm leading-relaxed text-[var(--text-secondary)] bg-[rgba(255,255,255,0.03)] p-3 rounded border border-[rgba(255,255,255,0.10)] shadow-[0_12px_40px_-28px_rgba(0,0,0,0.9)]">
                    Commit <span className="font-bold text-[var(--text-primary)]">${safeAnchor.toLocaleString()}</span> now.
                    If they raise <span className="font-bold text-[var(--text-primary)]">${challengeGoal.toLocaleString()}</span> by {deadline},
                    the organization reaches the full ${outcomeTotal.toLocaleString()} request target.
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button variant="gold" className="flex-[2]" onClick={() => setShowConfirm(true)}>
                        Create Offer
                    </Button>
                </div>
            </div>
        </div>
    );
}
