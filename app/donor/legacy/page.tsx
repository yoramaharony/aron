'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Send, User, Bot, ChevronRight, BarChart3, Globe, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ConciergeSuggestion = { label: string; content: string };

export default function ImpactVisionStudioPage() {
    const [refreshKey, setRefreshKey] = useState(0);
    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-[var(--bg-app)]">
            {/* LEFT: Chat Interface (40%) */}
            <div className="flex-1 border-b md:border-b-0 md:border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col shadow-xl z-10">
                <LegacyChat onUpdated={() => setRefreshKey((v) => v + 1)} />
            </div>

            {/* RIGHT: Dynamic Canvas (60%) */}
            <div className="impact-vision-pane-bg w-full md:w-[360px] lg:w-[420px] xl:w-[480px] shrink-0 p-5 md:p-6 overflow-y-auto">
                <LegacyCanvas refreshKey={refreshKey} />
            </div>
        </div>
    );
}

// --- CHAT COMPONENTS ---

function LegacyChat({ onUpdated }: { onUpdated: () => void }) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ role: 'donor' | 'assistant'; content: string }[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState('');
    const [suggestions, setSuggestions] = useState<ConciergeSuggestion[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch('/api/concierge')
            .then((r) => r.json())
            .then((data) => {
                const thread = Array.isArray(data?.messages) ? data.messages : [];
                setSuggestions(Array.isArray(data?.suggestions) ? data.suggestions : []);
                if (thread.length === 0) {
                    setMessages([
                        {
                            role: 'assistant',
                            content:
                                "Welcome. I’m your concierge. Tell me what kind of impact you want to create—causes, geographies, and what “success” feels like.",
                        },
                    ]);
                } else {
                    setMessages(thread);
                }
            })
            .catch(() => {});
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const sendMessage = async (userMsgRaw?: string) => {
        const userMsg = (typeof userMsgRaw === 'string' ? userMsgRaw : input).trim();
        if (!userMsg) return;
        if (isTyping) return;

        setInput('');
        setMessages(prev => [...prev, { role: 'donor', content: userMsg }]);
        setIsTyping(true);
        setError('');

        try {
            const res = await fetch('/api/concierge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: userMsg }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || 'Failed to send');
            if (data?.message?.content) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.message.content }]);
            }
            if (Array.isArray(data?.suggestions)) {
                setSuggestions(data.suggestions);
            }
            onUpdated();
        } catch (e: any) {
            setError(e?.message || 'Failed to send');
        } finally {
            setIsTyping(false);
        }
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
                        className={`flex gap-4 ${msg.role === 'donor' ? 'flex-row-reverse' : ''}`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'assistant'
                                ? 'bg-[rgba(var(--accent-rgb), 0.08)] border border-[rgba(var(--accent-rgb), 0.35)] text-[var(--color-gold)]'
                                : 'bg-[rgba(255,255,255,0.05)] border border-[var(--border-subtle)] text-[var(--text-secondary)]'
                                }`}
                        >
                            {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                        </div>
                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'assistant'
                                ? 'bg-[rgba(255,255,255,0.03)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-tl-none'
                                : 'bg-[rgba(var(--accent-rgb), 0.18)] border border-[rgba(var(--accent-rgb), 0.30)] text-[var(--text-primary)] rounded-tr-none'
                            }`}>
                            {msg.content}
                        </div>
                    </motion.div>
                ))}

                {error ? <div className="text-sm text-red-300">{error}</div> : null}

                {isTyping && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-[rgba(var(--accent-rgb), 0.08)] border border-[rgba(var(--accent-rgb), 0.35)] text-[var(--color-gold)] flex items-center justify-center">
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
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Describe your impact vision..."
                        className="w-full pl-4 pr-12 py-4 bg-[rgba(255,255,255,0.03)] border border-[var(--border-strong)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent transition-all"
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 top-2 p-2 bg-[rgba(var(--accent-rgb), 0.35)] border border-[rgba(var(--accent-rgb), 0.35)] text-[var(--text-primary)] rounded-lg hover:bg-[rgba(var(--accent-rgb), 0.45)] disabled:opacity-50 transition-colors"
                    >
                        <Send size={18} />
                    </button>

                    {/* Demo Prompt Helper */}
                    <div className="absolute -top-12 left-0 right-0 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {(suggestions ?? []).slice(0, 4).map((s, idx) => (
                            <button
                                key={`${s.label}-${idx}`}
                                onClick={() => sendMessage(s.content)}
                                disabled={isTyping}
                                className="whitespace-nowrap px-3 py-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-full text-xs text-[var(--text-secondary)] hover:bg-[var(--color-gold)] hover:text-black transition-colors disabled:opacity-60"
                                title={s.content}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- CANVAS COMPONENTS ---

function LegacyCanvas({ refreshKey }: { refreshKey: number }) {
    const [board, setBoard] = useState<any>(null);
    const [vision, setVision] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/concierge')
            .then((r) => r.json())
            .then((data) => {
                setVision(data?.vision ?? null);
                setBoard(data?.board ?? null);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [refreshKey]);

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <div className="text-sm text-[var(--text-tertiary)]">Loading canvas…</div>
            </div>
        );
    }

    if (!board) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.06)] border border-[var(--border-subtle)] mb-4 flex items-center justify-center">
                    <BarChart3 size={32} className="text-[var(--text-tertiary)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">Canvas Empty</h3>
                <p className="text-[var(--text-secondary)] max-w-sm mt-2">Start a conversation with the Concierge to begin structuring your Impact Vision.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-none mx-auto space-y-4 pb-16">

            {/* Header / Title (compact, match Figma proportions) */}
            <Card className="p-5 border border-[rgba(var(--accent-rgb),0.30)] shadow-[0_6px_20px_rgba(var(--accent-rgb),0.18)] bg-[linear-gradient(135deg,rgba(42,42,42,0.95),rgba(26,26,26,0.95))] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.05] pointer-events-none" style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }} />
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="text-2xl font-semibold text-[var(--color-gold)] leading-tight">
                            Impact Vision
                        </h1>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {(vision?.pillars ?? board?.pillars?.map((p: any) => p.title) ?? [])
                                .slice(0, 6)
                                .map((pillar: string, i: number) => (
                                    <span
                                        key={i}
                                        className={`px-3 py-1.5 rounded-full text-xs font-light tracking-[0.14em] border shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] bg-[linear-gradient(135deg,rgba(64,64,64,0.92),rgba(42,42,42,0.92))] ${
                                            i % 2 === 0
                                                ? 'text-[var(--color-gold)] border-[rgba(var(--accent-rgb),0.30)]'
                                                : 'text-[rgba(var(--silver-rgb),0.95)] border-[rgba(var(--silver-rgb),0.15)]'
                                        }`}
                                    >
                                        {pillar}
                                    </span>
                                ))}
                        </div>
                    </div>

                    <div className="text-right shrink-0">
                        <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.22em]">
                            Last updated
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] mt-1">
                            {vision?.lastUpdatedAt ? new Date(vision.lastUpdatedAt).toLocaleString() : '—'}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Visuals (stacked: 1 column, match Figma) */}
            <div className="grid grid-cols-1 gap-4">

                {/* 1. Impact Forecast */}
                <Card className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe size={16} className="text-[var(--color-gold)]" />
                        <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-secondary)]">Impact Forecast</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <div className="text-3xl font-semibold text-[var(--text-primary)] mb-1">
                                <CountUp end={vision?.pillars?.length ? 1200 + (vision.pillars.length * 900) : 2400} duration={2} />
                            </div>
                            <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Est. Lives Impacted</div>
                        </div>
                        <div>
                            <div className="text-3xl font-semibold text-[var(--color-green)] mb-1">
                                {vision?.pillars?.[0] === 'Impact Discovery' ? 72 : 88}%
                            </div>
                            <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Execution Confidence</div>
                        </div>
                    </div>

                    <div className="mt-5 pt-5 border-t border-[var(--border-subtle)]">
                        <div className="flex justify-between text-[10px] text-[var(--text-secondary)] mb-2 uppercase tracking-[0.18em]">
                            <span>Overhead Exposure</span>
                            <span className="font-semibold text-[var(--color-gold)]">Low (4.2%)</span>
                        </div>
                        <div className="w-full bg-[rgba(255,255,255,0.06)] h-2 rounded-full overflow-hidden">
                            <div className="bg-[var(--color-green)] h-full w-[4%]" />
                        </div>
                    </div>
                </Card>

                {/* 2. Budget Allocation */}
                <Card className="p-5 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 size={16} className="text-[var(--color-gold)]" />
                        <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-secondary)]">Focus</h3>
                    </div>

                    <div className="flex-1 space-y-3">
                        {(board?.focus ?? []).map((f: any, i: number) => (
                            <div key={i} className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-3.5">
                                <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-tertiary)]">{f.label}</div>
                                <div className="text-sm text-[var(--text-primary)] mt-1">{f.value}</div>
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
                            Your vision is now saved. Next, shortlist or pass opportunities, and create leverage offers when you’re ready.
                        </p>
                    </div>
                    <Button variant="gold" size="lg" asChild className="min-w-[200px] shadow-xl shadow-gold/20">
                        <a href="/donor">Go to Opportunities <ChevronRight size={18} className="ml-2" /></a>
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
