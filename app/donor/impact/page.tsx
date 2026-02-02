'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Globe, ShieldCheck, Sparkles, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type VisionBoard = {
  headline: string;
  pillars: { title: string; description: string }[];
  focus: { label: string; value: string }[];
  signals: { label: string; value: string }[];
};

export default function ImpactPage() {
    const [board, setBoard] = useState<VisionBoard | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);
    const [summaryCopied, setSummaryCopied] = useState(false);
    const [shareUrl, setShareUrl] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/concierge')
            .then((r) => r.json())
            .then((data) => setBoard(data?.board ?? null))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="fade-in">
            <header className="mb-8 flex items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Impact Vision Board</h1>
                    <p className="text-secondary">A living snapshot of your giving intent, derived from your Concierge conversation.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={async () => {
                            if (!board) return;
                            const summary = [
                                'Impact Vision',
                                ...(board.pillars ?? []).map((p) => `- ${p.title}: ${p.description}`),
                                '',
                                'Focus:',
                                ...(board.focus ?? []).map((f) => `- ${f.label}: ${f.value}`),
                                '',
                                'Signals:',
                                ...(board.signals ?? []).map((s) => `- ${s.label}: ${s.value}`),
                            ].join('\n');
                            try {
                                await navigator.clipboard.writeText(summary);
                                setSummaryCopied(true);
                                window.setTimeout(() => setSummaryCopied(false), 1200);
                            } catch {
                                // ignore
                            }
                        }}
                    >
                        {summaryCopied ? 'Summary copied' : 'Copy summary'}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={async () => {
                            try {
                                const res = await fetch('/api/impact/share');
                                const data = await res.json();
                                if (!res.ok) throw new Error(data?.error || 'Failed to create share link');
                                setShareUrl(data.shareUrl);
                                await navigator.clipboard.writeText(data.shareUrl);
                                setShareCopied(true);
                                window.setTimeout(() => setShareCopied(false), 1200);
                            } catch {
                                // ignore
                            }
                        }}
                    >
                        {shareCopied ? 'Link copied' : 'Copy share link'}
                    </Button>

                    <Button
                        variant="gold"
                        onClick={async () => {
                            try {
                                const res = await fetch('/api/impact/share');
                                const data = await res.json();
                                if (!res.ok) throw new Error(data?.error || 'Failed to create share link');
                                const url = `${data.shareUrl}?print=1`;
                                setShareUrl(data.shareUrl);
                                window.open(url, '_blank', 'noopener,noreferrer');
                            } catch {
                                // ignore
                            }
                        }}
                    >
                        Print / PDF
                    </Button>
                </div>
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
                            <div className="mt-4 rounded-xl border border-[rgba(255,43,214,0.22)] bg-[rgba(255,43,214,0.08)] p-4">
                                <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Happy path example</div>
                                <div className="mt-2 text-sm text-[var(--text-primary)] font-mono">
                                    In 12 months I want 5,000 households protected with measurable outcomes. Budget $250k/year. Israel + Miami.
                                </div>
                                <button
                                    type="button"
                                    className="mt-3 text-xs font-semibold text-[var(--color-gold)] hover:underline"
                                    onClick={async () => {
                                        try {
                                            await navigator.clipboard.writeText(
                                                'In 12 months I want 5,000 households protected with measurable outcomes. Budget $250k/year. Israel + Miami.'
                                            );
                                            setCopied(true);
                                            window.setTimeout(() => setCopied(false), 1200);
                                        } catch {
                                            // ignore
                                        }
                                    }}
                                >
                                    {copied ? 'Copied' : 'Copy to clipboard'}
                                </button>
                            </div>

                            {shareUrl ? (
                                <div className="mt-4 text-xs text-[var(--text-tertiary)] font-mono break-all">
                                    Share link: {shareUrl}
                                </div>
                            ) : null}
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
