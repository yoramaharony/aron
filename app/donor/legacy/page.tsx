'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Send, User, Bot, ChevronRight, BarChart3, Globe, ShieldCheck, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ConciergeSuggestion = { label: string; content: string };

export default function ImpactVisionStudioPage() {
    const [refreshKey, setRefreshKey] = useState(0);
    return (
        <div className="donor-full-bleed">
            <div className="flex flex-col md:flex-row h-[calc(100vh-64px-80px)] md:h-[calc(100vh-64px)] overflow-hidden bg-[var(--bg-app)]">
                {/* LEFT: Chat Interface (flex) */}
                <div className="flex-1 border-b md:border-b-0 md:border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col shadow-xl z-10">
                    <LegacyChat onUpdated={() => setRefreshKey((v) => v + 1)} />
                </div>

                {/* RIGHT: Dynamic Canvas (fixed width on desktop) */}
                <div className="impact-vision-pane-bg w-full md:w-[360px] lg:w-[420px] xl:w-[480px] shrink-0 p-5 md:p-6 overflow-y-auto">
                    <LegacyCanvas refreshKey={refreshKey} />
                </div>
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
    const [resetting, setResetting] = useState(false);

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

    const resetVision = async () => {
        if (resetting || isTyping) return;
        const ok = window.confirm(
            'Reset Vision?\n\nThis clears your Concierge conversation and board, as if you just opened Aron for the first time.'
        );
        if (!ok) return;
        setResetting(true);
        setError('');
        try {
            const res = await fetch('/api/concierge/reset', { method: 'POST' });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || 'Reset failed');

            // Clear local thread immediately (feels instant), then re-fetch the new server state.
            setMessages([
                {
                    role: 'assistant',
                    content:
                        "Welcome. I’m your concierge. Tell me what kind of impact you want to create—causes, geographies, and what “success” feels like.",
                },
            ]);
            setSuggestions([]);
            setInput('');
            onUpdated();

            fetch('/api/concierge')
                .then((r) => r.json())
                .then((d) => {
                    const thread = Array.isArray(d?.messages) ? d.messages : [];
                    setSuggestions(Array.isArray(d?.suggestions) ? d.suggestions : []);
                    if (thread.length > 0) setMessages(thread);
                })
                .catch(() => {});
        } catch (e: any) {
            setError(e?.message || 'Reset failed');
        } finally {
            setResetting(false);
        }
    };

    return (
        <div className="flex flex-col h-full font-sans">
            {/* Messages area (radial + subtle stripes, match Figma) */}
            <div
                className="flex-1 overflow-y-auto p-6 space-y-6"
                style={{
                    backgroundImage: `
                        radial-gradient(ellipse at top right, #1A1A1A 0%, #0A0A0A 50%),
                        repeating-linear-gradient(
                          90deg,
                          transparent,
                          transparent 2px,
                          rgba(255, 255, 255, 0.04) 2px,
                          rgba(255, 255, 255, 0.04) 4px
                        )
                      `,
                }}
                ref={scrollRef}
            >
                {messages.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-4 ${msg.role === 'donor' ? 'flex-row-reverse' : ''}`}
                    >
                        <div
                            className={msg.role === 'assistant'
                                ? 'w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center bg-[linear-gradient(135deg,#2A2A2A_0%,#404040_100%)] border border-[rgba(var(--silver-rgb),0.30)] shadow-[0_4px_20px_rgba(0,0,0,0.30),inset_0_1px_0_rgba(255,255,255,0.10)]'
                                : 'w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center bg-[linear-gradient(135deg,#2A2A2A_0%,#1A1A1A_100%)] border border-[rgba(var(--silver-rgb),0.15)] shadow-[0_4px_20px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.06)]'
                            }
                        >
                            {msg.role === 'assistant' ? (
                                <Bot size={20} className="text-[rgba(var(--silver-rgb),0.95)]" />
                            ) : (
                                <User size={20} className="text-[var(--text-secondary)]" />
                            )}
                        </div>
                        <div
                            className={msg.role === 'assistant'
                                ? 'flex-1 p-5 rounded-xl relative overflow-hidden border border-[rgba(var(--silver-rgb),0.15)] shadow-[0_4px_16px_rgba(0,0,0,0.30)] text-[var(--text-primary)] font-light leading-relaxed bg-[linear-gradient(135deg,#1A1A1A_0%,#2A2A2A_100%)]'
                                : 'flex-1 p-5 rounded-xl relative overflow-hidden border border-[rgba(var(--accent-rgb),0.25)] shadow-[0_6px_18px_rgba(var(--accent-rgb),0.14)] text-[var(--text-primary)] font-light leading-relaxed bg-[linear-gradient(135deg,#2A2A2A_0%,#1A1A1A_100%)]'}
                            style={{
                                backgroundImage:
                                    msg.role === 'assistant'
                                        ? `
                                          linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%),
                                          repeating-linear-gradient(
                                            -45deg,
                                            transparent,
                                            transparent 2px,
                                            rgba(255, 255, 255, 0.04) 2px,
                                            rgba(255, 255, 255, 0.04) 3px
                                          )
                                        `
                                        : undefined,
                                backgroundBlendMode: 'normal',
                            }}
                        >
                            <div
                                className="absolute top-0 right-0 w-32 h-32 opacity-[0.05] pointer-events-none"
                                style={{
                                    background:
                                        msg.role === 'assistant'
                                            ? 'radial-gradient(circle at top right, #C0C0C0 0%, transparent 70%)'
                                            : 'radial-gradient(circle at top right, #D4AF37 0%, transparent 70%)',
                                }}
                            />
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

            {/* Input (match Figma) */}
            <div className="p-6 border-t border-[rgba(var(--silver-rgb),0.15)] shadow-[0_-2px_20px_rgba(0,0,0,0.5)] bg-[linear-gradient(135deg,#1A1A1A_0%,#0A0A0A_100%)] bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.05)_2px,rgba(255,255,255,0.05)_3px)]">
                <div className="relative">
                    {/* Demo Prompt Helper */}
                    <div className="absolute -top-12 left-0 right-0 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {(suggestions ?? []).slice(0, 4).map((s, idx) => (
                            <button
                                key={`${s.label}-${idx}`}
                                onClick={() => sendMessage(s.content)}
                                disabled={isTyping || resetting}
                                className="whitespace-nowrap px-3 py-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-full text-xs text-[var(--text-secondary)] hover:bg-[var(--color-gold)] hover:text-black transition-colors disabled:opacity-60"
                                title={s.content}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Reset Vision (Figma-style: rotating arrow + tooltip away from button) */}
                        <button
                            type="button"
                            onClick={resetVision}
                            disabled={isTyping || resetting}
                            aria-label="Reset Vision"
                            className="group relative w-12 h-12 rounded-lg icon-tile-gold disabled:opacity-50 flex items-center justify-center"
                        >
                            <RotateCcw
                                size={20}
                                strokeWidth={1.75}
                                className="text-[var(--color-gold)] transition-transform duration-200 ease-out group-hover:rotate-45"
                            />
                            <div
                                className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 translate-x-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150"
                                role="tooltip"
                            >
                                <div className="px-3 py-1.5 rounded-md text-xs tracking-wide font-light whitespace-nowrap border border-[rgba(var(--accent-rgb),0.22)] bg-[linear-gradient(135deg,#1A1A1A_0%,#0A0A0A_100%)] shadow-[0_10px_28px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] text-[rgba(var(--silver-rgb),0.95)]">
                                    Reset Vision
                                </div>
                            </div>
                        </button>

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Describe your impact vision..."
                            className="flex-1 min-w-0 px-5 py-4 rounded-lg outline-none transition-all font-light bg-[linear-gradient(135deg,#2A2A2A_0%,#1A1A1A_100%)] border border-[rgba(var(--silver-rgb),0.15)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.30)] focus:border-[rgba(var(--accent-rgb),0.35)]"
                        />

                        {/* Send (outside the input, like Figma) */}
                        <button
                            type="button"
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || isTyping || resetting}
                            aria-label="Send message"
                            className="group relative z-20 w-12 h-12 rounded-lg icon-tile-gold flex items-center justify-center transition-all hover:scale-[1.03] active:scale-[0.96] disabled:opacity-100 disabled:cursor-not-allowed disabled:brightness-95 disabled:saturate-75"
                        >
                            <Send
                                size={20}
                                strokeWidth={1.75}
                                className="relative z-10 text-[var(--color-gold)] transition-transform duration-150 ease-out group-active:-translate-x-[1px] group-active:translate-y-[1px] group-active:rotate-[-6deg]"
                            />
                        </button>
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
            <Card
                className="no-halo min-h-0 px-5 pt-3.5 pb-4 rounded-xl relative overflow-hidden border border-[rgba(var(--accent-rgb),0.30)] shadow-[0_6px_20px_rgba(var(--accent-rgb),0.18),inset_0_1px_0_rgba(var(--accent-rgb),0.15)] bg-[linear-gradient(135deg,rgba(42,42,42,0.95),rgba(26,26,26,0.95))]"
                style={{
                    backgroundImage: `
                      linear-gradient(135deg, rgba(42,42,42,0.95), rgba(26,26,26,0.95)),
                      repeating-linear-gradient(
                        -45deg,
                        transparent,
                        transparent 1.5px,
                        rgba(212, 175, 55, 0.02) 1.5px,
                        rgba(212, 175, 55, 0.02) 3px
                      )
                    `,
                    backgroundBlendMode: 'normal',
                }}
            >
                <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.05] pointer-events-none" style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }} />
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="text-xl md:text-2xl font-semibold text-[var(--color-gold)] leading-tight">
                            Impact Vision
                        </h1>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {(
                                [
                                    // Primary: pillars (causes / themes)
                                    ...((vision?.pillars ?? board?.pillars?.map((p: any) => p.title) ?? [])
                                        .filter((p: string) => p && p !== 'Impact Discovery')),
                                    // Secondary: geo focus (explicitly labeled so it doesn't look like a "cause")
                                    ...((vision?.geoFocus ?? []).map((g: string) => (g ? `Geo: ${g}` : ''))),
                                ].filter(Boolean) as string[]
                            )
                                .slice(0, 6)
                                .map((pillar: string, i: number) => (
                                    <span
                                        key={i}
                                        className={`px-3 py-1 rounded-full text-[11px] font-light tracking-[0.12em] border shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] bg-[linear-gradient(135deg,rgba(64,64,64,0.92),rgba(42,42,42,0.92))] ${
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
                        <div className="text-xs text-[var(--text-secondary)] mt-1 leading-snug">
                            {vision?.lastUpdatedAt ? new Date(vision.lastUpdatedAt).toLocaleString() : '—'}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Visuals (stacked: 1 column, match Figma) */}
            <div className="grid grid-cols-1 gap-4">

                {/* 1. Impact Forecast */}
                <Card
                    className="no-halo p-6 rounded-xl relative overflow-hidden border border-[rgba(var(--silver-rgb),0.15)] shadow-[0_4px_16px_rgba(0,0,0,0.30)]"
                    style={{
                        backgroundImage: `
                          linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%),
                          repeating-linear-gradient(
                            90deg,
                            transparent,
                            transparent 1.5px,
                            rgba(255, 255, 255, 0.05) 1.5px,
                            rgba(255, 255, 255, 0.05) 2.5px
                          )
                        `,
                        backgroundBlendMode: 'normal',
                    }}
                >
                    <div className="flex items-center gap-2 mb-5 relative">
                        <div className="p-1.5 rounded bg-[linear-gradient(135deg,#D4AF37_0%,#E5C158_100%)] shadow-[0_2px_8px_rgba(var(--accent-rgb),0.30)]">
                            <Globe size={16} className="text-[#0A0A0A]" strokeWidth={2} />
                        </div>
                        <div className="text-xs tracking-[0.2em] font-light text-[var(--color-gold)]">IMPACT FORECAST</div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="p-4 rounded-lg relative overflow-hidden bg-[linear-gradient(135deg,#2A2A2A_0%,#404040_100%)] border border-[rgba(var(--accent-rgb),0.30)] shadow-[inset_0_1px_0_rgba(var(--accent-rgb),0.15)]">
                            <div className="absolute top-0 right-0 w-16 h-16 opacity-[0.05]" style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }} />
                            <div className="text-4xl mb-2 font-light relative text-[var(--color-gold)]">
                                <CountUp end={vision?.pillars?.length ? 1200 + (vision.pillars.length * 900) : 2400} duration={2} />
                            </div>
                            <div className="text-xs tracking-wide font-light text-[var(--text-secondary)]">EST. LIVES IMPACTED</div>
                        </div>
                        <div className="p-4 rounded-lg relative overflow-hidden bg-[linear-gradient(135deg,#2A2A2A_0%,#404040_100%)] border border-[rgba(var(--silver-rgb),0.15)] shadow-[inset_0_1px_0_rgba(var(--silver-rgb),0.15)]">
                            <div className="absolute top-0 right-0 w-16 h-16 opacity-[0.05]" style={{ background: 'radial-gradient(circle, #C0C0C0 0%, transparent 70%)' }} />
                            <div className="text-4xl mb-2 font-light relative text-[rgba(var(--silver-rgb),0.95)]">
                                {vision?.pillars?.[0] === 'Impact Discovery' ? 72 : 88}%
                            </div>
                            <div className="text-xs tracking-wide font-light text-[var(--text-secondary)]">EXECUTION CONFIDENCE</div>
                        </div>
                    </div>

                    <div className="space-y-3 relative">
                        <div className="flex justify-between text-xs font-light text-[var(--text-secondary)]">
                            <span className="tracking-wide">Overhead Exposure</span>
                            <span className="text-[var(--color-gold)]">Low (4.2%)</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full relative overflow-hidden bg-[#1A1A1A] border border-[rgba(var(--silver-rgb),0.15)]">
                            <div
                                className="h-full rounded-full relative"
                                style={{
                                    width: '15%',
                                    background:
                                        'linear-gradient(90deg, #B8941F 0%, #D4AF37 50%, #E5C158 100%)',
                                    boxShadow:
                                        '0 0 12px rgba(212, 175, 55, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.30)',
                                }}
                            />
                        </div>
                    </div>
                </Card>

                {/* 2. Budget Allocation */}
                <Card className="no-halo p-6 rounded-xl relative overflow-hidden border border-[rgba(var(--silver-rgb),0.15)] shadow-[0_4px_16px_rgba(0,0,0,0.30)] bg-[linear-gradient(135deg,#1A1A1A_0%,#2A2A2A_100%)]">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="p-1.5 rounded bg-[linear-gradient(135deg,#C0C0C0_0%,#D8D8D8_100%)] shadow-[0_2px_8px_rgba(var(--silver-rgb),0.20)]">
                            <BarChart3 size={16} className="text-[#0A0A0A]" strokeWidth={2} />
                        </div>
                        <div className="text-xs tracking-[0.2em] font-light text-[rgba(var(--silver-rgb),0.95)]">FOCUS</div>
                    </div>

                    <div className="space-y-5">
                        {(board?.focus ?? []).map((f: any, i: number) => (
                            <div
                                key={i}
                                className="pb-4 border-b last:border-b-0"
                                style={{ borderColor: 'rgba(192,192,192,0.15)' }}
                            >
                                <div className="text-xs mb-2 tracking-wider font-light text-[var(--text-secondary)]">
                                    {String(f.label ?? '').toUpperCase()}
                                </div>
                                <div
                                    className="text-lg font-light"
                                    style={{
                                        color:
                                            String(f.label ?? '').toLowerCase() === 'status' ||
                                            String(f.label ?? '').toLowerCase().includes('time') ||
                                            String(f.label ?? '').toLowerCase().includes('12')
                                                ? '#D4AF37'
                                                : '#C0C0C0',
                                    }}
                                >
                                    {f.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* 3. Timeline / Activation */}
            <Card
                className="no-halo p-6 rounded-xl relative overflow-hidden border border-[rgba(var(--accent-rgb),0.30)] shadow-[0_8px_30px_rgba(var(--accent-rgb),0.30),inset_0_1px_0_rgba(var(--accent-rgb),0.20)]"
                style={{
                    backgroundImage: `
                      linear-gradient(135deg, #2A2A2A 0%, #1A1A1A 100%),
                      repeating-linear-gradient(
                        -45deg,
                        transparent,
                        transparent 1.5px,
                        rgba(212, 175, 55, 0.06) 1.5px,
                        rgba(212, 175, 55, 0.06) 2.5px
                      )
                    `,
                    backgroundBlendMode: 'normal',
                }}
            >
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] pointer-events-none" style={{ background: 'radial-gradient(circle at center, #D4AF37 0%, transparent 70%)' }} />
                <div className="flex items-center gap-2 mb-3 relative">
                    <ShieldCheck size={20} className="text-[var(--color-gold)]" />
                    <h3 className="text-xl font-light tracking-wide text-[var(--color-gold)]">Ready to Activate?</h3>
                </div>
                <p className="text-sm mb-5 relative font-light leading-relaxed text-[rgba(var(--silver-rgb),0.95)]">
                    Your vision is now saved. Next, shortlist or pass opportunities, and create leverage offers when you’re ready.
                </p>
                <a
                    href="/donor/opportunities"
                    className="w-full px-6 py-4 rounded-lg flex items-center justify-between transition-all relative overflow-hidden hover:scale-[1.02]"
                    style={{
                        background: 'linear-gradient(135deg, #D4AF37 0%, #E5C158 100%)',
                        color: '#0A0A0A',
                        border: '1px solid #D4AF37',
                        boxShadow: '0 6px 25px rgba(212,175,55,0.30), inset 0 1px 0 rgba(255,255,255,0.30)',
                        fontSize: '16px',
                    }}
                >
                    <span className="font-medium tracking-wide">Go to Opportunities</span>
                    <ChevronRight size={22} strokeWidth={2} />
                </a>
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
