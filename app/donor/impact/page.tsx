'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Globe, ShieldCheck, Sparkles, Target } from 'lucide-react';

type VisionBoard = {
  headline: string;
  pillars: { title: string; description: string }[];
  focus: { label: string; value: string }[];
  signals: { label: string; value: string }[];
};

export default function ImpactPage() {
    const [board, setBoard] = useState<VisionBoard | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/concierge')
            .then((r) => r.json())
            .then((data) => setBoard(data?.board ?? null))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="fade-in">
            <header className="mb-8">
                <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Impact Vision Board</h1>
                <p className="text-secondary">A living snapshot of your giving intent, derived from your Concierge conversation.</p>
            </header>

            {loading ? (
                <div className="text-[var(--text-tertiary)]">Loading…</div>
            ) : !board ? (
                <Card className="p-8">
                    <div className="text-sm text-[var(--text-secondary)]">
                        No vision board yet. Start a conversation in <span className="font-semibold text-[var(--text-primary)]">Concierge AI</span>.
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="p-6 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <Sparkles size={18} className="text-[var(--color-gold)]" />
                            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                                {board.headline}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {board.pillars.map((p) => (
                                <div
                                    key={p.title}
                                    className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-5"
                                >
                                    <div className="text-lg font-semibold text-[var(--text-primary)]">{p.title}</div>
                                    <div className="text-sm text-[var(--text-secondary)] mt-1">{p.description}</div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <Card className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Target size={18} className="text-[var(--color-gold)]" />
                                <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                                    Focus
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {board.focus.map((f) => (
                                    <div key={f.label} className="flex items-start justify-between gap-4">
                                        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">{f.label}</div>
                                        <div className="text-sm text-[var(--text-primary)] text-right">{f.value}</div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <ShieldCheck size={18} className="text-[var(--color-gold)]" />
                                <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                                    Signals
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {board.signals.map((s) => (
                                    <div key={s.label} className="flex items-start justify-between gap-4">
                                        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">{s.label}</div>
                                        <div className="text-sm text-[var(--text-primary)] text-right">{s.value}</div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Globe size={18} className="text-[var(--color-gold)]" />
                                <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                                    Next step
                                </h3>
                            </div>
                            <div className="text-sm text-[var(--text-secondary)]">
                                Go back to Concierge AI and answer the 12‑month outcome question to strengthen matching.
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
