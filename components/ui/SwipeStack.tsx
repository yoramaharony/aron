'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Card } from './Card';
import { Button } from './Button';
import { X, Heart, Zap, RefreshCcw, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { DonationRequest } from '@/lib/mock-data';
import { useLeverage } from '@/components/providers/LeverageContext';

export function SwipeStack({ items, variant = 'compact' }: { items: DonationRequest[], variant?: 'compact' | 'detail' }) {
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
        <div
            className={variant === 'detail'
                ? 'relative w-full mx-auto mt-4 flex items-center justify-center h-[calc(100vh-260px)] min-h-[620px] px-4 md:px-[10vw] pt-16'
                : 'relative h-[500px] w-full max-w-md mx-auto mt-4 flex items-center justify-center'
            }
        >
            {/* Top-centered action bar (detail variant) */}
            {variant === 'detail' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[rgba(10,10,16,0.82)] backdrop-blur shadow-[0_20px_70px_-45px_rgba(0,0,0,0.9)]">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            onClick={() => handleSwipe(activeItem.id, 'left')}
                        >
                            <X size={16} />
                            Pass
                        </Button>
                        <Button
                            variant="gold"
                            size="sm"
                            className="gap-2"
                            onClick={() => openLeverageDrawer(activeItem)}
                        >
                            <Zap size={16} />
                            Leverage
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleSwipe(activeItem.id, 'right')}
                        >
                            <Heart size={16} />
                            Save
                        </Button>
                    </div>
                </div>
            )}

            {/* BACKGROUND/NEXT CARD */}
            {nextItem && (
                <div className="absolute w-full h-full scale-[0.95] translate-y-4 opacity-100 -z-10">
                    {variant === 'detail' ? <StaticCard item={nextItem} variant="detail" /> : <StaticCard item={nextItem} />}
                </div>
            )}

            {/* ACTIVE CARD */}
            <AnimatePresence>
                {variant === 'detail' ? (
                    <DraggableDetailCard
                        key={activeItem.id}
                        item={activeItem}
                        onSwipe={(id, dir) => handleSwipe(id, dir)}
                        onLeverage={() => openLeverageDrawer(activeItem)}
                    />
                ) : (
                <DraggableCard
                    key={activeItem.id}
                    item={activeItem}
                    onSwipe={(id, dir) => handleSwipe(id, dir)}
                    onLeverage={() => openLeverageDrawer(activeItem)}
                        onTap={() => {}}
                />
                )}
            </AnimatePresence>
            {/* ... controls ... */}
            {variant !== 'detail' && (
            <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-4 items-center z-50">
                <Button
                    variant="outline"
                    className="h-12 px-6 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] hover:scale-105 transition-transform text-[var(--text-secondary)] shadow-[0_12px_40px_-28px_rgba(0,0,0,0.9)] flex items-center gap-2"
                    onClick={() => handleSwipe(activeItem.id, 'left')}
                    title="Pass"
                >
                    <X size={18} />
                    <span className="font-medium text-sm">Pass</span>
                </Button>

                <Button
                    variant="gold"
                    className="h-14 px-8 rounded-full -mt-2 border border-[rgba(var(--accent-rgb), 0.45)] flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_0_1px_rgba(var(--accent-rgb), 0.18),0_20px_70px_-35px_rgba(var(--accent-rgb), 0.55)]"
                    onClick={() => openLeverageDrawer(activeItem)}
                >
                    <Zap size={20} fill="currentColor" />
                    <span className="font-bold text-sm">Leverage</span>
                </Button>

                <Button
                    variant="outline"
                    className="h-12 px-6 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.06)] hover:scale-105 transition-transform shadow-[0_12px_40px_-28px_rgba(0,0,0,0.9)] flex items-center gap-2"
                    onClick={() => handleSwipe(activeItem.id, 'right')}
                >
                    <Heart size={18} />
                    <span className="font-medium text-sm">Save</span>
                </Button>
            </div>
            )}

            {/* DECLINE REASON MODAL */}
            {showDeclineModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl p-6 w-full max-w-sm border border-[rgba(255,255,255,0.10)] shadow-[0_30px_90px_-50px_rgba(0,0,0,0.9)] bg-[radial-gradient(900px_500px_at_20%_0%,rgba(var(--accent-rgb), 0.16),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]"
                    >
                        <h3 className="text-lg font-serif mb-4">Why is this not a match?</h3>
                        <textarea
                            className="w-full p-3 border border-[rgba(255,255,255,0.12)] rounded-lg mb-4 text-sm bg-[rgba(255,255,255,0.03)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
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
            <Card noPadding className="h-full flex flex-col overflow-hidden border-[var(--border-subtle)] shadow-2xl select-none">

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
                            <div className="bg-[var(--color-gold)] text-[#120014] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
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
                <div className="p-5 flex-1 relative flex flex-col">
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-3 line-clamp-3 flex-1">
                        {item.summary}
                    </p>

                    <div className="flex gap-3 mb-3">
                        <div className="flex-1 p-2 bg-[rgba(255,255,255,0.03)] rounded border border-[rgba(255,255,255,0.08)]">
                            <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-bold mb-0.5">Gap</div>
                            <div className="text-lg font-medium text-[var(--color-gold)]">${(item.fundingGap / 1000).toFixed(0)}k</div>
                        </div>
                        <div className="flex-1 p-2 bg-[rgba(255,255,255,0.03)] rounded border border-[rgba(255,255,255,0.08)]">
                            <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-bold mb-0.5">Impact</div>
                            <div className="text-xs font-medium leading-tight text-[var(--text-primary)]">High Community Alignment</div>
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

function DraggableDetailCard({ item, onSwipe, onLeverage }: { item: DonationRequest, onSwipe: (id: string, dir: 'left' | 'right' | 'up') => void, onLeverage: () => void }) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-220, 220], [-6, 6]);

    const handleDragEnd = (_: any, info: PanInfo) => {
        const threshold = 120;
        if (info.offset.x > threshold) {
            onSwipe(item.id, 'right');
        } else if (info.offset.x < -threshold) {
            onSwipe(item.id, 'left');
        }
    };

    return (
        <motion.div
            style={{ x, rotate }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18, transition: { duration: 0.15 } }}
            className="absolute w-full h-full"
        >
            <Card noPadding className="h-full overflow-hidden border-[var(--border-subtle)] shadow-2xl select-none">
                {/* Content (full detail) */}
                <div className="h-full overflow-y-auto">
                    {/* HERO */}
                    <div className="relative h-[320px] md:h-[420px] overflow-hidden">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <div className="absolute top-5 left-5 flex gap-2">
                            <span className="bg-[rgba(255,255,255,0.10)] border border-[var(--border-subtle)] backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
                                {item.matchPotential}% Match
                            </span>
                            <span className="bg-black/50 border border-[rgba(255,255,255,0.10)] backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-white">
                                {item.category}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 md:p-8 space-y-8">
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-semibold text-[var(--text-primary)] leading-tight">
                                {item.title}
                            </h1>
                            <p className="text-[var(--text-secondary)] text-lg">
                                {item.orgName} • {item.location}
                            </p>
                            <p className="text-[var(--text-secondary)] text-lg leading-relaxed max-w-3xl">
                                {item.summary}
                            </p>
                        </div>

                        {/* METRICS */}
                        <Card className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)]">
                            <div className="p-4 text-center">
                                <div className="text-xs text-secondary uppercase tracking-wider mb-1">Funding Gap</div>
                                <div className="text-xl font-bold text-[var(--text-primary)]">${(item.fundingGap / 1000).toFixed(0)}k</div>
                            </div>
                            <div className="p-4 text-center">
                                <div className="text-xs text-secondary uppercase tracking-wider mb-1">Timeline</div>
                                <div className="text-xl font-bold text-[var(--text-primary)]">6 mo</div>
                            </div>
                            <div className="p-4 text-center">
                                <div className="text-xs text-secondary uppercase tracking-wider mb-1">Confidence</div>
                                <div className="text-xl font-bold text-[var(--color-green)]">{item.executionConfidence}%</div>
                            </div>
                            <div className="p-4 text-center">
                                <div className="text-xs text-secondary uppercase tracking-wider mb-1">Overhead</div>
                                <div className="text-xl font-bold text-[var(--text-primary)]">{item.overhead}%</div>
                            </div>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* AI INSIGHTS */}
                            <div>
                                <Card className="overflow-hidden relative border-[rgba(var(--accent-rgb), 0.20)] bg-[rgba(var(--accent-rgb), 0.06)]">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                        <Zap size={80} />
                                    </div>
                                    <div className="p-6 relative">
                                        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Zap size={16} className="text-[var(--color-gold)]" fill="currentColor" />
                                            AI Insights
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">Why It Matches</h4>
                                                <div className="space-y-2">
                                                    {item.aiInsights?.matchReason?.map((reason, i) => (
                                                        <div key={i} className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
                                                            <CheckCircle size={14} className="mt-0.5 text-[var(--color-gold)] shrink-0" />
                                                            <span>{reason.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="h-px bg-[var(--border-subtle)]" />

                                            <div>
                                                <h4 className="text-xs font-bold text-[rgba(248,113,113,1)] uppercase mb-2">Risks & Mitigations</h4>
                                                <div className="space-y-3">
                                                    {item.aiInsights?.risks?.map((risk, i) => (
                                                        <div key={i} className="bg-[rgba(255,255,255,0.03)] p-3 rounded border border-[var(--border-subtle)]">
                                                            <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                                                                <AlertTriangle size={14} className={risk.severity === 'High' ? 'text-red-500' : 'text-amber-500'} />
                                                                {risk.label}
                                                            </div>
                                                            {risk.mitigation && (
                                                                <div className="text-xs text-[var(--text-tertiary)] ml-6 mt-1">
                                                                    Mitigation: {risk.mitigation}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* DILIGENCE */}
                            <div>
                                <Card>
                                    <div className="p-6">
                                        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <ShieldCheck size={16} />
                                            Diligence Pack
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {item.diligence && Object.entries(item.diligence).map(([key, status]) => (
                                                <div key={key} className="flex justify-between items-center text-sm py-2 border-b border-[var(--border-subtle)] last:border-0">
                                                    <span className="capitalize text-[var(--text-secondary)]">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${status === 'Reviewed'
                                                            ? 'bg-[rgba(34,197,94,0.14)] text-[var(--color-green)] border-[rgba(34,197,94,0.22)]'
                                                            : 'bg-[rgba(255,255,255,0.04)] text-[var(--text-tertiary)] border-[var(--border-subtle)]'
                                                            }`}
                                                    >
                                                        {status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        <div className="pb-10 text-xs text-[var(--text-tertiary)]">
                            Tip: swipe left/right to Pass/Save (optional).
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

function StaticCard({ item, variant = 'compact' }: { item: DonationRequest, variant?: 'compact' | 'detail' }) {
    return (
        <Card noPadding className="h-full flex flex-col overflow-hidden border-[var(--border-subtle)] shadow-sm select-none opacity-90">
            <div className={variant === 'detail' ? 'relative h-[320px] bg-[rgba(255,255,255,0.03)]' : 'relative h-[40%] bg-[rgba(255,255,255,0.03)]'}>
                <img src={item.imageUrl} className="w-full h-full object-cover opacity-50 grayscale" alt="" />
            </div>
            <div className="p-5 flex-1">
                <div className="h-4 w-3/4 bg-[rgba(255,255,255,0.06)] rounded mb-2" />
                <div className="h-3 w-1/2 bg-[rgba(255,255,255,0.06)] rounded mb-4" />
                <div className="h-12 w-full bg-[rgba(255,255,255,0.03)] rounded" />
            </div>
        </Card>
    );
}
