'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Card } from './Card';
import { Button } from './Button';
import { X, Heart, Zap, RefreshCcw, MessageSquare } from 'lucide-react';
import { DonationRequest } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { useLeverage } from '@/components/providers/LeverageContext';

export function SwipeStack({ items }: { items: DonationRequest[] }) {
    const router = useRouter(); // Initialize Router
    const { saveOpportunity, passOpportunity, openLeverageDrawer } = useLeverage();
    // ... existing state ...
    const [stack, setStack] = useState(items);
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [declineReason, setDeclineReason] = useState('');
    const [pendingDeclineId, setPendingDeclineId] = useState<string | null>(null);

    // ... existing checks ...
    if (stack.length === 0) {
        // ... existing empty state ...
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 fade-in">
                <h3 className="text-xl font-serif text-[var(--text-primary)] mb-2">You're all caught up!</h3>
                <p className="text-[var(--text-secondary)]">Check back later for more tailored opportunities.</p>
                <Button onClick={() => setStack(items)} variant="outline" className="mt-6" leftIcon={<RefreshCcw size={16} />}>
                    Reset Feed
                </Button>
            </div>
        );
    }

    const activeIndex = 0;
    const activeItem = stack[activeIndex];
    const nextItem = stack[activeIndex + 1];

    const removeTopCard = () => {
        setStack((prev) => prev.slice(1));
    };

    const handleTap = (id: string) => {
        router.push(`/donor/${id}`);
    };

    // ... handleSwipe ...
    const handleSwipe = (id: string, dir: 'left' | 'right' | 'up') => {
        if (dir === 'left') {
            setPendingDeclineId(id);
            removeTopCard();
            passOpportunity(id);
        } else if (dir === 'right') {
            saveOpportunity(id);
            removeTopCard();
        } else if (dir === 'up') {
            openLeverageDrawer(activeItem);
        }
    };

    // ... submitDecline ...
    const submitDecline = () => {
        if (pendingDeclineId) {
            passOpportunity(pendingDeclineId);
            console.log(`Declined ${pendingDeclineId} because: ${declineReason}`);
        }
        setShowDeclineModal(false);
        setDeclineReason('');
        setPendingDeclineId(null);
    };

    return (
        <div className="relative h-[500px] w-full max-w-md mx-auto mt-4 flex items-center justify-center">

            {/* BACKGROUND/NEXT CARD */}
            {nextItem && (
                <div className="absolute w-full h-full scale-[0.95] translate-y-4 opacity-100 -z-10">
                    <StaticCard item={nextItem} />
                </div>
            )}

            {/* ACTIVE CARD */}
            <AnimatePresence>
                <DraggableCard
                    key={activeItem.id}
                    item={activeItem}
                    // ... existing props ...
                    onSwipe={(id, dir) => handleSwipe(id, dir)}
                    onLeverage={() => openLeverageDrawer(activeItem)}
                    onTap={() => handleTap(activeItem.id)}
                />
            </AnimatePresence>
            {/* ... controls ... */}
            <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-4 items-center z-50">
                <Button
                    variant="outline"
                    className="h-12 px-6 rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:scale-105 transition-transform text-gray-500 shadow-sm flex items-center gap-2"
                    onClick={() => handleSwipe(activeItem.id, 'left')}
                    title="Pass"
                >
                    <X size={18} />
                    <span className="font-medium text-sm">Pass</span>
                </Button>

                <Button
                    variant="gold"
                    className="h-14 px-8 rounded-full shadow-xl shadow-gold/20 -mt-2 border-2 border-[var(--bg-app)] flex items-center gap-2 hover:scale-105 transition-transform"
                    onClick={() => openLeverageDrawer(activeItem)}
                >
                    <Zap size={20} fill="currentColor" />
                    <span className="font-bold text-sm">Leverage</span>
                </Button>

                <Button
                    variant="outline"
                    className="h-12 px-6 rounded-full border border-green-200 bg-white text-green-600 hover:bg-green-50 hover:border-green-300 hover:scale-105 transition-transform shadow-sm flex items-center gap-2"
                    onClick={() => handleSwipe(activeItem.id, 'right')}
                >
                    <Heart size={18} />
                    <span className="font-medium text-sm">Save</span>
                </Button>
            </div>

            {/* DECLINE REASON MODAL */}
            {showDeclineModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl"
                    >
                        <h3 className="text-lg font-serif mb-4">Why is this not a match?</h3>
                        <textarea
                            className="w-full p-3 border border-gray-200 rounded-lg mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
                            rows={3}
                            placeholder="e.g. Too high risk, Wrong geography..."
                            value={declineReason}
                            onChange={(e) => setDeclineReason(e.target.value)}
                            autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="ghost" onClick={submitDecline}>Skip reason</Button>
                            <Button size="sm" variant="primary" onClick={submitDecline}>Submit Feedback</Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

function DraggableCard({ item, onSwipe, onLeverage, onTap }: { item: DonationRequest, onSwipe: (id: string, dir: 'left' | 'right' | 'up') => void, onLeverage: () => void, onTap: () => void }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Interpolations for stamps and transforms
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacityAccept = useTransform(x, [50, 150], [0, 1]); // Right = Save/Love
    const opacityReject = useTransform(x, [-150, -50], [1, 0]); // Left = Pass
    const opacitySuper = useTransform(y, [-150, -50], [0, 1]);   // Up = Leverage

    const handleDragEnd = (_: any, info: PanInfo) => {
        const threshold = 100;
        if (info.offset.x > threshold) {
            onSwipe(item.id, 'right');
        } else if (info.offset.x < -threshold) {
            onSwipe(item.id, 'left');
        } else if (info.offset.y < -threshold) {
            onLeverage(); // Open drawer instead
        }
    };

    return (
        <motion.div
            style={{ x, y, rotate }}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            onTap={onTap}
            initial={{ scale: 0.95, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="absolute w-full h-full cursor-grab active:cursor-grabbing"
            whileTap={{ cursor: "grabbing" }}
        >
            <Card noPadding className="h-full flex flex-col overflow-hidden border-[var(--border-subtle)] shadow-2xl bg-white select-none">

                {/* STAMPS */}
                <motion.div style={{ opacity: opacityAccept }} className="absolute top-8 left-8 border-4 border-green-500 text-green-500 font-bold text-4xl px-4 py-2 rounded -rotate-12 z-20 pointer-events-none">
                    SAVE
                </motion.div>
                <motion.div style={{ opacity: opacityReject }} className="absolute top-8 right-8 border-4 border-red-500 text-red-500 font-bold text-4xl px-4 py-2 rounded rotate-12 z-20 pointer-events-none">
                    PASS
                </motion.div>
                {/* Leverage visual hint removed to reduce clutter */}

                {/* IMAGE */}
                <div className="relative h-[40%]">
                    <img src={item.imageUrl} className="w-full h-full object-cover pointer-events-none" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 p-5 text-white w-full">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-[var(--color-gold)] text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                {item.matchPotential}% Match
                            </div>
                            <div className="bg-white/20 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                {item.category}
                            </div>
                        </div>
                        <h2 className="text-2xl font-serif text-shadow-sm leading-tight">{item.title}</h2>
                        <div className="text-white/80 text-xs mt-1">{item.orgName} • {item.location}</div>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="p-5 flex-1 bg-white relative flex flex-col">
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-3 line-clamp-3 flex-1">
                        {item.summary}
                    </p>

                    <div className="flex gap-3 mb-3">
                        <div className="flex-1 p-2 bg-gray-50 rounded border border-gray-100">
                            <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-bold mb-0.5">Gap</div>
                            <div className="text-lg font-medium text-[var(--color-gold)]">${(item.fundingGap / 1000).toFixed(0)}k</div>
                        </div>
                        <div className="flex-1 p-2 bg-gray-50 rounded border border-gray-100">
                            <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-bold mb-0.5">Impact</div>
                            <div className="text-xs font-medium leading-tight">High Community Alignment</div>
                        </div>
                    </div>

                    {item.aiRecommendation && (
                        <div className="bg-[var(--bg-ivory)] p-2 rounded border border-[var(--color-sage)]/20 text-xs text-[var(--color-sage-dark)] flex gap-2 items-start">
                            <Zap size={12} className="shrink-0 mt-0.5 text-[var(--color-gold)]" fill="currentColor" />
                            <span className="leading-tight">{item.aiRecommendation}</span>
                        </div>
                    )}
                </div>
            </Card>
        </motion.div>
    );
}

function StaticCard({ item }: { item: DonationRequest }) {
    return (
        <Card noPadding className="h-full flex flex-col overflow-hidden border-[var(--border-subtle)] shadow-sm bg-white select-none">
            <div className="relative h-[40%] bg-gray-200">
                <img src={item.imageUrl} className="w-full h-full object-cover opacity-50 grayscale" alt="" />
            </div>
            <div className="p-5 flex-1">
                <div className="h-4 w-3/4 bg-gray-100 rounded mb-2" />
                <div className="h-3 w-1/2 bg-gray-100 rounded mb-4" />
                <div className="h-12 w-full bg-gray-50 rounded" />
            </div>
        </Card>
    );
}
