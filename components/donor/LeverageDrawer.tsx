'use client';

import React, { useState, useEffect } from 'react';
import { useLeverage, LeverageOffer } from '@/components/providers/LeverageContext';
import { Button } from '@/components/ui/Button';
import { X, Calendar, ChevronRight, CheckCircle2 } from 'lucide-react';
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
                        className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-[500px] bg-white z-[101] shadow-2xl overflow-y-auto"
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
    const [deadline, setDeadline] = useState<string>(() => {
        const d = new Date();
        d.setDate(d.getDate() + 60);
        return d.toISOString().split('T')[0];
    });

    // Terms
    const [proofRequired, setProofRequired] = useState(true);
    const [milestones, setMilestones] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Derived Logic
    const challengeGoal = matchMode === 'match'
        ? anchor
        : Math.max(0, opportunity.fundingGap - anchor);

    const topUpAmount = matchMode === 'match' ? anchor : challengeGoal; // Simplified 1:1 logic
    const totalDeployed = anchor + topUpAmount;

    const handleCreate = () => {
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
        onCreate(offer);
        onClose();
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

                    <div className="bg-gray-50 p-6 rounded-lg w-full text-left space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Anchor (Pay Now)</span>
                            <span className="font-bold">${anchor.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Condition</span>
                            <span className="font-bold">Raises ${challengeGoal.toLocaleString()}</span>
                        </div>
                        <div className="border-t pt-2 mt-2 flex justify-between text-lg">
                            <span className="font-bold">Total Max</span>
                            <span className="font-bold text-[var(--color-gold)]">${totalDeployed.toLocaleString()}</span>
                        </div>
                    </div>

                    <Button variant="gold" size="lg" className="w-full" onClick={handleCreate}>
                        Create Offer
                    </Button>
                    <p className="text-xs text-gray-400">Funds are held in escrow until verification.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-lg font-serif">Structure Leverage</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 space-y-8 overflow-y-auto">

                {/* Section A: Brief */}
                <div className="space-y-3">
                    <div className="flex gap-2 mb-2">
                        <span className="bg-[var(--bg-ivory)] border border-[var(--color-gold)] text-[var(--color-gold)] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">{opportunity.category}</span>
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Gap: ${(opportunity.fundingGap / 1000).toFixed(0)}k</span>
                    </div>
                    <h1 className="text-2xl font-serif leading-tight">{opportunity.title}</h1>
                    <p className="text-sm text-gray-500">{opportunity.orgName} • {opportunity.location}</p>
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
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${anchor === amt
                                            ? 'bg-[var(--text-primary)] text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
                            <button
                                onClick={() => setMatchMode('match')}
                                className={`py-2 text-xs font-bold rounded-md transition-all ${matchMode === 'match' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                            >
                                Match Me (1:1)
                            </button>
                            <button
                                onClick={() => setMatchMode('remainder')}
                                className={`py-2 text-xs font-bold rounded-md transition-all ${matchMode === 'remainder' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                            >
                                Cover Remainder
                            </button>
                        </div>
                        <div className="mt-3 text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-100">
                            Required to raise: <span className="font-bold">${challengeGoal.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* B4: Deadline */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Challenge Deadline</label>
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:ring-[var(--color-gold)]"
                        />
                    </div>

                    {/* Terms */}
                    <div className="space-y-2 pt-2">
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input type="checkbox" checked={proofRequired} onChange={e => setProofRequired(e.target.checked)} className="rounded text-[var(--color-gold)] focus:ring-[var(--color-gold)]" />
                            Require 3rd party verification
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input type="checkbox" checked={milestones} onChange={e => setMilestones(e.target.checked)} className="rounded text-[var(--color-gold)] focus:ring-[var(--color-gold)]" />
                            Release in milestones (50/50)
                        </label>
                    </div>

                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-[var(--bg-surface)] sticky bottom-0">
                {/* Live Summary */}
                <div className="mb-4 text-sm leading-relaxed text-gray-600 bg-white p-3 rounded border shadow-sm">
                    Commit <span className="font-bold text-black">${anchor.toLocaleString()}</span> now.
                    If they raise <span className="font-bold text-black">${challengeGoal.toLocaleString()}</span> by {deadline},
                    we release <span className="font-bold text-black">${topUpAmount.toLocaleString()}</span>.
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button variant="gold" className="flex-[2]" onClick={() => setShowConfirm(true)}>Create Offer</Button>
                </div>
            </div>
        </div>
    );
}
