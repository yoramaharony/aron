'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, ChevronRight, Download, ExternalLink, RefreshCw, Zap, X } from 'lucide-react';
import { useLeverage, LeverageOffer } from '@/components/providers/LeverageContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function DonorPledges() {
    const { offers } = useLeverage();
    const [selectedCommitment, setSelectedCommitment] = useState<any>(null);

    // Mock Active Data (Consolidated)
    const activeCommitments = [
        {
            id: 'comm-1',
            title: 'Community Center Renewal',
            org: 'Tel Aviv Foundation',
            status: 'On Track',
            totalPledge: 50000,
            paidToDate: 25000,
            nextPayment: { amount: 25000, date: '2025-06-30' },
            grantId: 'GR-2024-9912'
        },
        {
            id: 'comm-2',
            title: 'Scholarship Fund 2025',
            org: 'Beit Morasha',
            status: 'On Track',
            totalPledge: 120000,
            paidToDate: 120000,
            nextPayment: null, // Complete
            grantId: 'GR-2024-5521'
        },
        {
            id: 'comm-3',
            title: 'Children’s Cancer Support Center',
            org: 'Jerusalem Foundation',
            status: 'Active',
            totalPledge: 1200000,
            paidToDate: 400000,
            nextPayment: { amount: 400000, date: '2026-06-30' },
            grantId: 'GR-2025-8821'
        }
    ];

    return (
        <div style={{ paddingTop: '2rem' }} className="relative">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-serif">My Pledges</h1>
                    <p className="text-secondary">Track your commitments and payment schedules</p>
                </div>
                <Button variant="outline" size="sm" leftIcon={<Download size={16} />}>
                    Export Report
                </Button>
            </div>

            {/* CONDITIONAL OFFERS (LEVERAGE RIPPLE) */}
            {offers.length > 0 && (
                <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-[var(--color-gold)] text-black rounded">
                            <Zap size={16} fill="currentColor" />
                        </div>
                        <h2 className="text-lg font-serif">Conditional Offers</h2>
                    </div>

                    <div className="space-y-4">
                        {offers.map((offer: LeverageOffer) => (
                            <Card key={offer.id} className="flex flex-col md:flex-row gap-6 items-center p-6 border-[var(--color-gold)]/30 bg-[var(--bg-ivory)]">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-[var(--color-gold)] text-[var(--color-gold)]">
                                            {offer.status.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs text-secondary">Created {new Date(offer.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-xl font-serif">{offer.opportunityTitle}</h3>
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
                                        <div className="font-bold text-lg">{new Date(offer.deadline).toLocaleDateString()}</div>
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

            {/* ACTIVE COMMITMENTS (Consolidated List) */}
            <h2 className="text-lg font-serif mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Active Commitments
            </h2>
            <div className="space-y-4 mb-12">
                {activeCommitments.map((comm) => (
                    <div key={comm.id} onClick={() => setSelectedCommitment(comm)} className="cursor-pointer">
                        <Card className="flex flex-col md:flex-row gap-6 items-center p-6 hover:shadow-md transition-shadow group border border-[var(--border-subtle)] hover:border-[var(--color-gold)]">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`w-2 h-2 rounded-full ${comm.status === 'On Track' || comm.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                    <span className="text-xs text-secondary font-medium">{comm.status}</span>
                                </div>
                                <h3 className="text-xl font-serif group-hover:text-[var(--color-gold)] transition-colors">{comm.title}</h3>
                                <div className="text-sm text-secondary">{comm.org}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-medium">${comm.totalPledge.toLocaleString()}</div>
                                <div className="text-xs text-secondary">Total Committed</div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-medium">${comm.paidToDate.toLocaleString()}</div>
                                <div className="text-xs text-secondary">Paid to Date</div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]">
                                <ChevronRight size={20} />
                            </Button>
                        </Card>
                    </div>
                ))}
            </div>

            <section>
                <h2 className="text-xl mb-4 text-secondary">Past Fulfillment</h2>
                <div className="flex flex-col gap-4">
                    <Card className="flex justify-between items-center opacity-75 hover:opacity-100 transition-opacity p-6">
                        <div>
                            <div className="font-medium mb-1">2024 Water Initiative</div>
                            <div className="text-sm text-secondary">Fulfilled Dec 12, 2024</div>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className="font-serif">$500,000</span>
                            <Button variant="ghost" size="sm" rightIcon={<Download size={14} />}>Receipt</Button>
                        </div>
                    </Card>

                    <Card className="flex justify-between items-center opacity-75 hover:opacity-100 transition-opacity p-6">
                        <div>
                            <div className="font-medium mb-1">Emergency Relief Fund</div>
                            <div className="text-sm text-secondary">Fulfilled Oct 05, 2024</div>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className="font-serif">$50,000</span>
                            <Button variant="ghost" size="sm" rightIcon={<Download size={14} />}>Receipt</Button>
                        </div>
                    </Card>
                </div>
            </section>

            {/* DETAIL DRAWER / MODAL */}
            <AnimatePresence>
                {selectedCommitment && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedCommitment(null)}
                            className="fixed inset-0 bg-black z-40"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full max-w-lg bg-[var(--bg-paper)] shadow-2xl z-50 border-l border-[var(--border-subtle)] flex flex-col"
                        >
                            <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-start">
                                <div>
                                    <div className="text-xs uppercase tracking-widest text-[var(--color-sage)] font-bold mb-2">Commitment Details</div>
                                    <h2 className="text-2xl font-serif text-[var(--text-primary)]">{selectedCommitment.title}</h2>
                                    <div className="text-sm text-[var(--text-secondary)]">{selectedCommitment.org} • {selectedCommitment.grantId}</div>
                                </div>
                                <button onClick={() => setSelectedCommitment(null)} className="p-2 hover:bg-[var(--bg-surface)] rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                {/* Key Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-[var(--bg-surface)] rounded border border-[var(--border-subtle)]">
                                        <div className="text-xs uppercase text-[var(--text-tertiary)] mb-1">Total Pledge</div>
                                        <div className="text-xl font-serif text-[var(--text-primary)]">${selectedCommitment.totalPledge.toLocaleString()}</div>
                                    </div>
                                    <div className="p-4 bg-[var(--bg-surface)] rounded border border-[var(--border-subtle)]">
                                        <div className="text-xs uppercase text-[var(--text-tertiary)] mb-1">Paid</div>
                                        <div className="text-xl font-serif text-[var(--text-primary)]">${selectedCommitment.paidToDate.toLocaleString()}</div>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div>
                                    <div className="w-full bg-[var(--bg-surface)] h-2 rounded-full overflow-hidden mb-2">
                                        <div
                                            className="bg-[var(--color-gold)] h-full"
                                            style={{ width: `${(selectedCommitment.paidToDate / selectedCommitment.totalPledge) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                                        <span>{(selectedCommitment.paidToDate / selectedCommitment.totalPledge * 100).toFixed(0)}% Fulfilled</span>
                                        {selectedCommitment.nextPayment && (
                                            <span>Next: ${selectedCommitment.nextPayment.amount.toLocaleString()} due {new Date(selectedCommitment.nextPayment.date).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3">
                                    <h3 className="font-serif text-lg">Actions</h3>
                                    <button className="w-full flex items-center justify-between p-4 bg-white border border-[var(--border-subtle)] rounded hover:border-[var(--color-gold)] transition-colors text-left group">
                                        <span className="font-medium text-[var(--text-primary)]">View Grant Agreement</span>
                                        <ExternalLink size={16} className="text-[var(--text-tertiary)] group-hover:text-[var(--color-gold)]" />
                                    </button>
                                    <button className="w-full flex items-center justify-between p-4 bg-white border border-[var(--border-subtle)] rounded hover:border-[var(--color-gold)] transition-colors text-left group">
                                        <span className="font-medium text-[var(--text-primary)]">Download Tax Receipt</span>
                                        <Download size={16} className="text-[var(--text-tertiary)] group-hover:text-[var(--color-gold)]" />
                                    </button>
                                </div>

                                {/* Payment Schedule */}
                                {selectedCommitment.nextPayment ? (
                                    <div>
                                        <h3 className="font-serif text-lg mb-3">Upcoming Schedules</h3>
                                        <div className="flex items-center gap-4 py-3 border-b border-[var(--border-subtle)]">
                                            <Calendar size={18} className="text-[var(--text-tertiary)]" />
                                            <div className="flex-1">
                                                <div className="font-medium">{new Date(selectedCommitment.nextPayment.date).toLocaleDateString()}</div>
                                                <div className="text-xs text-[var(--text-secondary)]">Scheduled Wire Transfer</div>
                                            </div>
                                            <div className="font-bold">${selectedCommitment.nextPayment.amount.toLocaleString()}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-green-50 text-green-800 text-sm rounded flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                                        This pledge is fully fulfilled.
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                                <Button className="w-full bg-[var(--text-primary)] text-white hover:bg-black">
                                    Manage Payments
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
