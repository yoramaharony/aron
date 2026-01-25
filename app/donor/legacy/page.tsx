'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLegacy } from '@/components/providers/LegacyContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Send, User, Bot, ChevronRight, BarChart3, Globe, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LegacyStudioPage() {
    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[var(--bg-app)]">
            {/* LEFT: Chat Interface (40%) */}
            <div className="w-[40%] border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col shadow-xl z-10">
                <LegacyChat />
            </div>

            {/* RIGHT: Dynamic Canvas (60%) */}
            <div className="w-[60%] bg-[var(--bg-surface)] p-8 overflow-y-auto">
                <LegacyCanvas />
            </div>
        </div>
    );
}

// --- CHAT COMPONENTS ---

function LegacyChat() {
    const { generateMockPlan } = useLegacy();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
        { role: 'ai', text: "Welcome to Legacy Studio. I'm your private foundation architect. Tell me, what kind of impact do you want your legacy to have on the world?" }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsTyping(true);

        // Simulation delay
        setTimeout(() => {
            // Trigger the "Brain" update
            generateMockPlan(userMsg);

            setIsTyping(false);
            setMessages(prev => [...prev, {
                role: 'ai',
                text: "I've structured a draft plan based on your vision. I've identified key pillars, allocated a preliminary budget, and forecast the potential impact. How does this allocation look to you?"
            }]);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full font-sans">
            <div className="p-6 border-b border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--bg-app)] border border-[var(--color-gold)] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px] text-[var(--color-gold)]">
                            auto_awesome
                        </span>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Concierge AI</h2>
                        <div className="text-xs text-[var(--color-green)] flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[var(--color-green)] animate-pulse" />
                            Online
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[var(--bg-app)]" ref={scrollRef}>
                {messages.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'ai'
                                ? 'bg-[rgba(255,43,214,0.08)] border border-[rgba(255,43,214,0.35)] text-[var(--color-gold)]'
                                : 'bg-[rgba(255,255,255,0.05)] border border-[var(--border-subtle)] text-[var(--text-secondary)]'
                                }`}
                        >
                            {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
                        </div>
                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'ai'
                                ? 'bg-[rgba(255,255,255,0.03)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-tl-none'
                                : 'bg-[rgba(255,43,214,0.18)] border border-[rgba(255,43,214,0.30)] text-[var(--text-primary)] rounded-tr-none'
                            }`}>
                            {msg.text}
                        </div>
                    </motion.div>
                ))}

                {isTyping && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-[rgba(255,43,214,0.08)] border border-[rgba(255,43,214,0.35)] text-[var(--color-gold)] flex items-center justify-center">
                            <Bot size={16} />
                        </div>
                        <div className="bg-[rgba(255,255,255,0.03)] border border-[var(--border-subtle)] p-4 rounded-2xl rounded-tl-none flex gap-1 items-center h-12 shadow-sm">
                            <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce delay-75" />
                            <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce delay-150" />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-[rgba(255,255,255,0.02)] border-t border-[var(--border-subtle)]">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Describe your legacy goals..."
                        className="w-full pl-4 pr-12 py-4 bg-[rgba(255,255,255,0.03)] border border-[var(--border-strong)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent transition-all"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 top-2 p-2 bg-[rgba(255,43,214,0.35)] border border-[rgba(255,43,214,0.35)] text-[var(--text-primary)] rounded-lg hover:bg-[rgba(255,43,214,0.45)] disabled:opacity-50 transition-colors"
                    >
                        <Send size={18} />
                    </button>

                    {/* Demo Prompt Helper */}
                    <div className="absolute -top-12 left-0 right-0 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        <button onClick={() => setInput("Saving children, quiet giving, Israel + emerging markets, $3M over 3 years.")} className="whitespace-nowrap px-3 py-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-full text-xs text-[var(--text-secondary)] hover:bg-[var(--color-gold)] hover:text-white transition-colors">
                            Demo Script: "Saving children..."
                        </button>
                        <button onClick={() => setInput("Clean water infrastructure in Africa, focus on sustainability.")} className="whitespace-nowrap px-3 py-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-full text-xs text-[var(--text-secondary)] hover:bg-[var(--color-gold)] hover:text-white transition-colors">
                            Demo Script: "Clean Water..."
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- CANVAS COMPONENTS ---

function LegacyCanvas() {
    const { plan, activatePlan } = useLegacy();

    if (plan.budget.total === '$0') {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.06)] border border-[var(--border-subtle)] mb-4 flex items-center justify-center">
                    <BarChart3 size={32} className="text-[var(--text-tertiary)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">Canvas Empty</h3>
                <p className="text-[var(--text-secondary)] max-w-sm mt-2">Start a conversation with the Concierge to begin structuring your legacy plan.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-32">

            {/* Header / Title */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-semibold text-[var(--text-primary)] mb-2">My Legacy Structure</h1>
                    <div className="flex gap-2">
                        {plan.pillars.map((pillar, i) => (
                            <span key={i} className="px-3 py-1 bg-[var(--bg-ivory)] border border-[var(--color-gold)] text-[var(--color-gold)] text-xs font-bold uppercase tracking-wider rounded-full">
                                {pillar}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-[var(--text-primary)]">{plan.budget.total}</div>
                    <div className="text-sm text-[var(--text-secondary)]">Target / {plan.budget.period}</div>
                </div>
            </div>

            {/* Visuals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. Impact Forecast */}
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Globe size={18} className="text-[var(--color-gold)]" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">Impact Forecast</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <div className="text-4xl font-semibold text-[var(--text-primary)] mb-1">
                                <CountUp end={plan.forecast.livesImpacted} duration={2} />
                            </div>
                            <div className="text-xs text-[var(--text-tertiary)] uppercase">Est. Lives Impacted</div>
                        </div>
                        <div>
                            <div className="text-4xl font-semibold text-[var(--color-green)] mb-1">
                                {plan.forecast.confidence}%
                            </div>
                            <div className="text-xs text-[var(--text-tertiary)] uppercase">Execution Confidence</div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
                        <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-2">
                            <span>Overhead Exposure</span>
                            <span className="font-bold text-[var(--text-primary)]">Low (4.2%)</span>
                        </div>
                        <div className="w-full bg-[rgba(255,255,255,0.06)] h-2 rounded-full overflow-hidden">
                            <div className="bg-[var(--color-green)] h-full w-[4%]" />
                        </div>
                    </div>
                </Card>

                {/* 2. Budget Allocation */}
                <Card className="p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 size={18} className="text-[var(--color-gold)]" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">Allocation Map</h3>
                    </div>

                    <div className="flex-1 space-y-4">
                        {plan.budget.allocation.map((alloc, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-[var(--text-primary)]">{alloc.category}</span>
                                    <span className="text-[var(--text-secondary)]">{alloc.percent}%</span>
                                </div>
                                <div className="w-full bg-[rgba(255,255,255,0.06)] h-3 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${alloc.percent}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className="bg-[var(--color-gold)] h-full opacity-80"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* 3. Timeline / Activation */}
            <Card className="p-8 border-[var(--color-gold)]/20 bg-[var(--bg-ivory)] shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <ShieldCheck size={120} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h3 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">Ready to Activate?</h3>
                        <p className="text-[var(--text-secondary)] max-w-md">
                            Activating this plan will reconfigure your entire dashboard. Opportunities will be filtered, pledges structured, and your concierge will begin legal preparation.
                        </p>
                    </div>
                    <Button
                        variant="gold"
                        size="lg"
                        onClick={activatePlan}
                        disabled={plan.isActive}
                        className="min-w-[200px] shadow-xl shadow-gold/20"
                    >
                        {plan.isActive ? 'Plan Active' : 'Activate Legacy Plan'}
                        <ChevronRight size={18} className="ml-2" />
                    </Button>
                </div>
            </Card>

        </div>
    );
}

// Helper for number animation
function CountUp({ end, duration }: { end: number, duration: number }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / (duration * 1000), 1);

            setCount(Math.floor(end * percentage));

            if (progress < duration * 1000) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);

    return <>{count.toLocaleString()}</>;
}
