'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Bot, Building2, Calendar, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock3, DollarSign, FileText, Heart, Loader2, MapPin, Paperclip, StickyNote, X as XIcon, Zap } from 'lucide-react';
import { useLeverage } from '@/components/providers/LeverageContext';
import { AnimatePresence, motion } from 'framer-motion';
import {
    type WorkflowView,
    deriveWorkflow,
    humanizeEventType,
} from '@/lib/workflow';

type OpportunityRow = {
    key: string;
    source: 'request' | 'submission' | 'charidy';
    title: string;
    orgName: string;
    location?: string;
    category?: string;
    summary: string;
    amount?: number | null;
    createdAt?: string | null;
    state: string;
    conciergeAction?: 'pass' | 'request_info' | 'keep' | null;
    conciergeReason?: string | null;
    progressBadge?: 'meeting_scheduled' | 'info_received' | 'meeting_completed' | 'in_review' | 'funded' | null;
};

function deriveStatusMessage(flow: WorkflowView) {
    if (flow.isPassed) return 'Passed on this opportunity';
    if (flow.isCommitted) return 'Commitment confirmed';
    if (flow.stage === 'discover') return 'New opportunity — review and decide';
    if (flow.stage === 'info_requested') return 'Additional information requested';
    if (flow.stage === 'meeting') return 'Meeting in progress';
    if (flow.stage === 'due_diligence') return 'Under review by concierge';
    return 'Ready for decision';
}

function humanizeMeetingType(value: any) {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return '';
    if (raw === 'in_person' || raw === 'in-person') return 'In person';
    if (raw === 'zoom') return 'Zoom';
    if (raw === 'phone') return 'Phone';
    return raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function eventDisplayTimestamp(event: any) {
    const type = String(event?.type || '');
    const scheduledFor = event?.meta?.scheduledFor || event?.scheduledFor || event?.meta?.scheduled_for;
    if (type === 'scheduled' && scheduledFor) {
        return String(scheduledFor).slice(0, 19).replace('T', ' ');
    }
    return event?.createdAt ? String(event.createdAt).slice(0, 19).replace('T', ' ') : '—';
}

function summarizeOpportunity(opportunity: any) {
    return {
        cause: opportunity?.extractedCause ?? opportunity?.category ?? '—',
        geo: opportunity?.extractedGeo ?? opportunity?.location ?? '—',
        amount: opportunity?.extractedAmount ?? opportunity?.amountRequested ?? opportunity?.targetAmount ?? null,
        urgency: opportunity?.extractedUrgency ?? '—',
    };
}

function parseProofLinks(raw?: string | null) {
    if (!raw) return [] as string[];
    return raw
        .split(/\n|,|;/g)
        .map((s) => s.trim())
        .filter(Boolean);
}

function ensureHref(value: string) {
    if (/^https?:\/\//i.test(value)) return value;
    return `https://${value}`;
}

function timelineIcon(type: string) {
    const t = String(type || '');
    if (t === 'save' || t === 'shortlist') return <Check size={15} />;
    if (t === 'request_info') return <AlertCircle size={15} />;
    if (t === 'info_received') return <CheckCircle2 size={15} />;
    if (t === 'scheduled') return <Clock3 size={15} />;
    if (t === 'meeting_completed') return <CheckCircle2 size={15} />;
    if (t === 'diligence_completed') return <CheckCircle2 size={15} />;
    if (t === 'leverage_created') return <CheckCircle2 size={15} />;
    if (t === 'funded') return <CheckCircle2 size={15} />;
    if (t === 'pass') return <XIcon size={15} />;
    return <Clock3 size={15} />;
}

function progressBadgeChip(progressBadge?: OpportunityRow['progressBadge'] | null) {
    if (!progressBadge) return null;
    if (progressBadge === 'meeting_scheduled') {
        return (
            <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.10)] text-emerald-300">
                meeting scheduled
            </span>
        );
    }
    if (progressBadge === 'info_received') {
        return (
            <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[rgba(56,189,248,0.35)] bg-[rgba(56,189,248,0.10)] text-sky-300">
                info received
            </span>
        );
    }
    if (progressBadge === 'meeting_completed') {
        return (
            <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[rgba(59,130,246,0.35)] bg-[rgba(59,130,246,0.10)] text-blue-300">
                meeting done
            </span>
        );
    }
    if (progressBadge === 'in_review') {
        return (
            <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.10)] text-violet-300">
                in review
            </span>
        );
    }
    if (progressBadge === 'funded') {
        return (
            <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.10)] text-green-300">
                funded
            </span>
        );
    }
    return null;
}

export default function DonorFeed() {
    const [activeTab, setActiveTab] = useState<'discover' | 'passed'>('discover');
    const [rows, setRows] = useState<OpportunityRow[]>([]);
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const [detail, setDetail] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [seeMoreOpen, setSeeMoreOpen] = useState(true);
    const [timelineOpen, setTimelineOpen] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [rescheduleOpen, setRescheduleOpen] = useState(false);
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleTime, setRescheduleTime] = useState('14:00');
    const [rescheduleType, setRescheduleType] = useState('zoom');
    const [rescheduling, setRescheduling] = useState(false);
    const [requestingInfo, setRequestingInfo] = useState(false);
    const [notesText, setNotesText] = useState('');
    const [notesEditing, setNotesEditing] = useState(false);
    const [notesSaving, setNotesSaving] = useState(false);
    const notesSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const detailCache = useRef<Map<string, any>>(new Map());
    const latestRequestRef = useRef<string>('');
    const scheduledCardRef = useRef<HTMLDivElement | null>(null);
    const [passedFilter, setPassedFilter] = useState<'all' | 'concierge' | 'manual'>('all');
    const [hasVision, setHasVision] = useState(true); // optimistic default
    const [conciergeReviewing, setConciergeReviewing] = useState(false);
    const [conciergeStats, setConciergeStats] = useState<{ passed: number; infoRequested: number; keptInDiscover: number } | null>(null);

    const router = useRouter();
    const { lastOpportunityUpdate, openLeverageDrawer } = useLeverage();

    const stateToTab = (s: string): 'discover' | 'passed' => {
        if (s === 'passed') return 'passed';
        return 'discover';
    };

    const filterRows = (all: OpportunityRow[], tab: 'discover' | 'passed') =>
        all.filter((r) => stateToTab(r.state) === tab);

    const nextKeyAfter = (list: OpportunityRow[], currentKey: string) => {
        if (!list.length) return null;
        const idx = list.findIndex((r) => r.key === currentKey);
        if (idx < 0) return list[0].key;
        return list[idx + 1]?.key ?? list[idx - 1]?.key ?? null;
    };

    const refresh = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/opportunities');
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Failed to load opportunities');
            const next = (data.opportunities ?? []) as OpportunityRow[];
            setRows(next);
            if (typeof data.hasVision === 'boolean') setHasVision(data.hasVision);
            return next;
        } catch (e: any) {
            setError(e?.message || 'Failed to load opportunities');
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        (async () => {
            const data = await refresh();
            if (!data) return;
            // Auto-trigger concierge review for new opportunities
            setConciergeReviewing(true);
            const minDelay = new Promise((r) => setTimeout(r, 1200)); // minimum visible time
            try {
                const [, res] = await Promise.all([minDelay, fetch('/api/opportunities/concierge-review', { method: 'POST' })]);
                const result = await res.json();
                if (result.reviewed && result.stats) {
                    const s = result.stats;
                    if (s.passed > 0 || s.infoRequested > 0 || s.keptInDiscover > 0) {
                        setConciergeStats(s);
                        await refresh(); // re-fetch with updated states
                        setTimeout(() => setConciergeStats(null), 8000);
                    }
                }
                if (result.reason === 'no_vision') setHasVision(false);
            } catch { /* silent */ }
            setConciergeReviewing(false);
        })();
    }, []);

    const filtered = useMemo(() => {
        let list = filterRows(rows, activeTab);
        if (activeTab === 'passed' && passedFilter !== 'all') {
            list = list.filter((r) =>
                passedFilter === 'concierge' ? r.conciergeAction === 'pass' : r.conciergeAction !== 'pass',
            );
        }
        return list;
    }, [rows, activeTab, passedFilter]);

    const loadDetail = async (key: string) => {
        latestRequestRef.current = key;
        setSelectedKey(key);
        setTimelineOpen(false);
        setNotesEditing(false);
        setRescheduleOpen(false);

        // Use cache for instant transition
        const cached = detailCache.current.get(key);
        if (cached) {
            setDetail(cached);
            setNotesText(cached?.notes || '');
            setDetailLoading(false);
        } else {
            setDetailLoading(true);
        }

        try {
            const res = await fetch(`/api/opportunities/${encodeURIComponent(key)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Failed to load');
            detailCache.current.set(key, data);
            if (latestRequestRef.current === key) {
                setDetail(data);
                setNotesText(data?.notes || '');
                setDetailLoading(false);
            }
        } catch {
            if (latestRequestRef.current === key && !cached) {
                setDetail(null);
            }
            if (latestRequestRef.current === key) {
                setDetailLoading(false);
            }
        }
    };

    const prefetchDetail = (key: string) => {
        if (detailCache.current.has(key)) return;
        fetch(`/api/opportunities/${encodeURIComponent(key)}`)
            .then((res) => res.json())
            .then((data) => { detailCache.current.set(key, data); })
            .catch(() => {});
    };

    const saveNotes = (text: string) => {
        if (!currentKey) return;
        if (notesSaveTimer.current) clearTimeout(notesSaveTimer.current);
        setNotesSaving(true);
        notesSaveTimer.current = setTimeout(async () => {
            try {
                await fetch(`/api/opportunities/${encodeURIComponent(currentKey)}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notes: text }),
                });
            } catch { /* silent */ }
            setNotesSaving(false);
        }, 600);
    };

    useEffect(() => {
        if (!lastOpportunityUpdate?.key) return;
        if (!selectedKey) return;
        if (String(lastOpportunityUpdate.key) !== String(selectedKey)) return;
        loadDetail(selectedKey).catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastOpportunityUpdate?.at]);

    const act = async (key: string, action: string, meta?: any) => {
        try {
            detailCache.current.delete(key); // invalidate before re-fetch
            const listBefore = filterRows(rows, activeTab);
            const nextAfterBefore = nextKeyAfter(listBefore, key);

            const res = await fetch(`/api/opportunities/${encodeURIComponent(key)}/actions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, meta: meta || undefined }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Failed');
            const updated = (await refresh()) ?? rows;

            if (selectedKey === key) {
                const listNow = filterRows(updated, activeTab);
                const stillInTab = listNow.some((r) => r.key === key);
                if (stillInTab) {
                    await loadDetail(key);
                } else {
                    const candidate =
                        (nextAfterBefore && listNow.some((r) => r.key === nextAfterBefore) ? nextAfterBefore : null) ??
                        listNow[0]?.key ??
                        null;
                    if (candidate) {
                        await loadDetail(candidate);
                    } else {
                        setSelectedKey(null);
                        setDetail(null);
                    }
                }
            }
            return data;
        } catch (e: any) {
            setError(e?.message || 'Action failed');
            return null;
        }
    };

    useEffect(() => {
        if (loading) return;
        const list = filterRows(rows, activeTab);
        if (!list.length) {
            if (selectedKey !== null) setSelectedKey(null);
            if (detail !== null) setDetail(null);
            return;
        }
        if (!selectedKey || !list.some((r) => r.key === selectedKey)) {
            loadDetail(list[0].key).catch(() => {});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, rows]);

    const workflow = useMemo(() => deriveWorkflow(detail), [detail]);
    const summary = useMemo(() => summarizeOpportunity(detail?.opportunity), [detail?.opportunity]);
    const timelineEvents = useMemo(() => {
        const src = Array.isArray(detail?.events) ? detail.events : [];
        const deduped = src.filter((e: any, idx: number, arr: any[]) => idx === 0 || String(e?.type) !== String(arr[idx - 1]?.type));
        return [...deduped].reverse();
    }, [detail?.events]);
    const proofLinks = useMemo(() => parseProofLinks(detail?.opportunity?.details?.proofLinks), [detail?.opportunity?.details?.proofLinks]);
    const meetingDocs = useMemo(() => {
        const meetingEvt = timelineEvents.find((e: any) => String(e?.type || '') === 'meeting_completed');
        if (!meetingEvt?.meta) return [] as Array<{ name: string; url: string }>;
        const m = meetingEvt.meta;
        if (Array.isArray(m.documents)) return m.documents.filter((d: any) => d?.name) as Array<{ name: string; url: string }>;
        if (Array.isArray(m.documentNames)) return m.documentNames.filter(Boolean).map((n: string) => ({ name: n, url: '' }));
        return [] as Array<{ name: string; url: string }>;
    }, [timelineEvents]);
    const scheduledEvent = useMemo(() => {
        const src = Array.isArray(detail?.events) ? detail.events : [];
        return src.find((e: any) => String(e?.type || '') === 'scheduled');
    }, [detail?.events]);
    const hasMeetingCompleted = useMemo(() => {
        const src = Array.isArray(detail?.events) ? detail.events : [];
        return src.some((e: any) => String(e?.type || '') === 'meeting_completed');
    }, [detail?.events]);
    const currentKey = String(detail?.opportunity?.key || '');
    const selectedRow = useMemo(() => rows.find((r) => r.key === selectedKey), [rows, selectedKey]);
    const statusMessage = useMemo(() => {
        const base = deriveStatusMessage(workflow);
        // Override for concierge-reviewed items that were kept in Discover
        if (workflow.stage === 'discover' && !workflow.isPassed && selectedRow?.conciergeAction === 'keep') {
            return 'Concierge reviewed — matches your Impact Vision';
        }
        // Override for concierge request_info items
        if (selectedRow?.conciergeAction === 'request_info' && workflow.stage === 'info_requested') {
            return 'Concierge requested additional info from the organization';
        }
        // Differentiate meeting stage: scheduled vs just info received
        if (workflow.stage === 'meeting') {
            if (scheduledEvent?.meta?.scheduledDate) {
                return `Meeting scheduled — ${String(scheduledEvent.meta.scheduledDate)}`;
            }
            return 'Info received — scheduling meeting...';
        }
        return base;
    }, [workflow, selectedRow, scheduledEvent]);
    const canManualRequestInfo = useMemo(() => {
        if (workflow.isCommitted || workflow.isPassed) return false;
        return workflow.stage === 'discover';
    }, [workflow]);

    const openReschedulePanel = () => {
        if (!scheduledEvent?.meta) return;
        setRescheduleDate(String(scheduledEvent.meta?.scheduledDate || ''));
        setRescheduleTime(String(scheduledEvent.meta?.scheduledTime || '14:00'));
        setRescheduleType(String(scheduledEvent.meta?.meetingType || 'zoom'));
        setRescheduleOpen(true);
        requestAnimationFrame(() => {
            scheduledCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

    /* Prev / Next navigation */
    const currentIndex = useMemo(() => {
        if (!selectedKey) return -1;
        return filtered.findIndex((r) => r.key === selectedKey);
    }, [filtered, selectedKey]);
    const canGoPrev = currentIndex > 0;
    const canGoNext = currentIndex >= 0 && currentIndex < filtered.length - 1;

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            if (e.key === 'ArrowLeft' || e.key === 'k') {
                if (currentIndex > 0) loadDetail(filtered[currentIndex - 1].key);
            }
            if (e.key === 'ArrowRight' || e.key === 'j') {
                if (currentIndex >= 0 && currentIndex < filtered.length - 1) loadDetail(filtered[currentIndex + 1].key);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIndex, filtered]);

    // Prefetch adjacent items for instant prev/next navigation
    useEffect(() => {
        if (currentIndex < 0) return;
        if (currentIndex > 0) prefetchDetail(filtered[currentIndex - 1].key);
        if (currentIndex < filtered.length - 1) prefetchDetail(filtered[currentIndex + 1].key);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIndex, filtered]);

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end gap-6">
                <div>
                    <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Opportunities</h1>
                    <p className="text-secondary">Review, decide, and commit.</p>
                </div>
            </header>

            {/* No-vision banner */}
            {!hasVision && (
                <div className="rounded-xl border border-[rgba(var(--accent-rgb),0.35)] bg-[rgba(212,175,55,0.06)] px-5 py-4 flex items-center gap-3">
                    <AlertCircle size={18} className="text-[var(--color-gold)] shrink-0" />
                    <div className="flex-1">
                        <div className="text-sm font-medium text-[var(--text-primary)]">Set up your Impact Vision</div>
                        <div className="text-xs text-[var(--text-secondary)] mt-0.5">Chat with your concierge to enable smart filtering and auto-review of opportunities.</div>
                    </div>
                    <Button variant="gold" onClick={() => router.push('/donor/legacy')}>Start</Button>
                </div>
            )}

            {/* Concierge reviewing animation */}
            {conciergeReviewing && (
                <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-[rgba(var(--accent-rgb),0.35)] bg-[rgba(212,175,55,0.06)] px-5 py-4 flex items-center gap-3"
                >
                    <Loader2 size={18} className="animate-spin text-[var(--color-gold)]" />
                    <div>
                        <div className="text-sm font-medium text-[var(--text-primary)]">Concierge reviewing opportunities...</div>
                        <div className="text-xs text-[var(--text-secondary)] mt-0.5">Matching against your Impact Vision</div>
                    </div>
                </motion.div>
            )}

            {/* Concierge review summary */}
            <AnimatePresence>
                {conciergeStats && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-lg bg-[rgba(212,175,55,0.06)] border border-[var(--border-subtle)] px-4 py-3 text-xs text-[var(--text-secondary)] flex items-center gap-2"
                    >
                        <Bot size={13} className="text-[var(--color-gold)]" />
                        <span>
                            Concierge reviewed {conciergeStats.passed + conciergeStats.infoRequested + conciergeStats.keptInDiscover} opportunities:
                            {conciergeStats.passed > 0 ? ` ${conciergeStats.passed} auto-passed,` : ''}
                            {conciergeStats.infoRequested > 0 ? ` ${conciergeStats.infoRequested} matched (info requested),` : ''}
                            {conciergeStats.keptInDiscover > 0 ? ` ${conciergeStats.keptInDiscover} matched.` : ''}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TABS */}
            <div className="flex gap-8 border-b border-[var(--border-subtle)]">
                {(['discover', 'passed'] as const).map((tab) => {
                    const count = filterRows(rows, tab).length;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === tab
                                ? 'text-[var(--text-primary)]'
                                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                                }`}
                        >
                            {tab === 'discover' ? 'Discover' : 'Passed'}
                            {count > 0 && (
                                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(212,175,55,0.12)] text-[var(--color-gold)]">
                                    {count}
                                </span>
                            )}
                            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-gold)]" />}
                        </button>
                    );
                })}
            </div>

            {error ? <div className="text-sm text-red-300">{error}</div> : null}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: list */}
                <Card className="p-0 lg:col-span-1 overflow-hidden">
                    <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                            {activeTab === 'discover' ? 'Discover' : 'Passed'}
                        </div>
                        {activeTab === 'passed' && (
                            <div className="flex gap-1 mt-2">
                                {(['all', 'concierge', 'manual'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setPassedFilter(f)}
                                        className={`text-[10px] px-2.5 py-1 rounded-full uppercase tracking-widest font-bold border transition-colors ${
                                            passedFilter === f
                                                ? 'border-[rgba(var(--accent-rgb),0.5)] bg-[rgba(212,175,55,0.12)] text-[var(--color-gold)]'
                                                : 'border-[var(--border-subtle)] bg-[rgba(255,255,255,0.04)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                                        }`}
                                    >
                                        {f === 'all' ? 'All' : f === 'concierge' ? 'Concierge' : 'Manual'}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="divide-y divide-[var(--border-subtle)]">
                        {loading ? (
                            <div className="p-5 text-sm text-[var(--text-tertiary)]">Loading…</div>
                        ) : filtered.length === 0 ? (
                            <div className="p-5 text-sm text-[var(--text-tertiary)]">No items.</div>
                        ) : (
                            filtered.map((r) => (
                                <button
                                    key={r.key}
                                    onClick={() => loadDetail(r.key)}
                                    className={[
                                        'relative w-full text-left p-5 transition-colors',
                                        selectedKey === r.key
                                            ? 'bg-[rgba(var(--accent-rgb), 0.10)]'
                                            : 'hover:bg-[rgba(255,255,255,0.04)]',
                                    ].join(' ')}
                                >
                                    {selectedKey === r.key ? (
                                        <span
                                            className="pointer-events-none absolute left-0 top-3 bottom-3 w-[2px] rounded-full"
                                            style={{
                                                background: 'linear-gradient(180deg, rgba(212,175,55,0), rgba(212,175,55,0.95), rgba(212,175,55,0))',
                                                boxShadow: '0 0 16px rgba(212,175,55,0.28)',
                                            }}
                                        />
                                    ) : null}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="text-[var(--text-primary)] font-semibold truncate">{r.title}</div>
                                            <div className="text-xs text-[var(--text-tertiary)] truncate">{r.orgName}</div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {progressBadgeChip(r.progressBadge)}
                                            {!r.progressBadge && r.conciergeAction === 'pass' && (
                                                <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[rgba(var(--accent-rgb),0.35)] bg-[rgba(212,175,55,0.08)] text-[var(--color-gold)]">
                                                    concierge pass
                                                </span>
                                            )}
                                            {!r.progressBadge && r.conciergeAction === 'request_info' && (
                                                <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[rgba(var(--accent-rgb),0.35)] bg-[rgba(212,175,55,0.08)] text-[var(--color-gold)]">
                                                    info requested
                                                </span>
                                            )}
                                            {!r.progressBadge && r.conciergeAction === 'keep' && (
                                                <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.08)] text-green-400">
                                                    matched
                                                </span>
                                            )}
                                            <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.04)] text-[var(--text-tertiary)]">
                                                {r.source === 'submission' ? 'submission' : 'curated'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-sm text-[var(--text-secondary)] mt-2 line-clamp-2">{r.summary}</div>
                                </button>
                            ))
                        )}
                    </div>
                </Card>

                {/* RIGHT: detail */}
                <Card className="p-6 lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {!detail?.opportunity ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.18 }}
                                className="text-sm text-[var(--text-tertiary)]"
                            >
                                {detailLoading ? 'Loading…' : 'Select an opportunity to view details.'}
                            </motion.div>
                        ) : (
                            <motion.div
                                key={detail?.opportunity?.key ?? 'detail'}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.22, ease: [0.2, 0.9, 0.2, 1] }}
                                className="space-y-5"
                            >
                            <div className="space-y-5">
                                {/* Title + org + summary */}
                                <div className="min-w-0">
                                    <h2 className="pt-1 text-4xl leading-[1.15] font-light text-[var(--text-primary)]">
                                        {detail.opportunity.title}
                                    </h2>
                                    <div className="text-2xl font-light text-[var(--color-gold)] mt-1">{detail.opportunity.orgName}</div>
                                    <button
                                        type="button"
                                        className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] tracking-wide text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors group"
                                        title="Copy opportunity ID"
                                        onClick={() => {
                                            navigator.clipboard.writeText(detail.opportunity.key).catch(() => {});
                                            setCopiedId(detail.opportunity.key);
                                            setTimeout(() => setCopiedId(null), 2000);
                                        }}
                                    >
                                        <span className="font-mono opacity-70 group-hover:opacity-100">{detail.opportunity.key}</span>
                                        {copiedId === detail.opportunity.key ? (
                                            <Check size={11} className="text-emerald-400" />
                                        ) : (
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                        )}
                                    </button>
                                    <p className="text-sm text-[var(--text-secondary)] mt-3">{detail.opportunity.summary}</p>
                                </div>

                                {/* Prev / Next navigation */}
                                <div className="flex items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { if (canGoPrev) loadDetail(filtered[currentIndex - 1].key); }}
                                        disabled={!canGoPrev}
                                        className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-[rgba(var(--accent-rgb),0.55)] bg-[var(--color-gold)] px-5 text-[15px] font-medium text-[#151515] shadow-[0_4px_12px_rgba(212,175,55,0.18)] transition-all hover:shadow-[0_8px_20px_rgba(212,175,55,0.25)] hover:translate-y-[-1px] active:scale-[0.98] disabled:opacity-30 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={18} /> Prev
                                    </button>
                                    <span className="text-sm font-medium text-[var(--text-tertiary)] shrink-0 tabular-nums">
                                        {currentIndex >= 0 ? `${currentIndex + 1} of ${filtered.length}` : ''}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => { if (canGoNext) loadDetail(filtered[currentIndex + 1].key); }}
                                        disabled={!canGoNext}
                                        className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-[rgba(var(--accent-rgb),0.55)] bg-[var(--color-gold)] px-5 text-[15px] font-medium text-[#151515] shadow-[0_4px_12px_rgba(212,175,55,0.18)] transition-all hover:shadow-[0_8px_20px_rgba(212,175,55,0.25)] hover:translate-y-[-1px] active:scale-[0.98] disabled:opacity-30 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed"
                                    >
                                        Next <ChevronRight size={18} />
                                    </button>
                                </div>

                                {/* Status message */}
                                <div className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] px-4 py-3 flex items-center gap-2">
                                    {workflow.isCommitted ? <CheckCircle2 size={16} className="text-[var(--color-gold)]" />
                                        : workflow.isPassed ? <XIcon size={16} className="text-red-400" />
                                            : (selectedRow?.conciergeAction === 'keep' || selectedRow?.conciergeAction === 'request_info') ? <Bot size={16} className="text-green-400" />
                                                : <AlertCircle size={16} className="text-[var(--color-gold)]" />}
                                    <span className="text-sm text-[var(--text-secondary)]">{statusMessage}</span>
                                </div>

                                {/* Meeting stage quick action (primary glance + actionable) */}
                                {workflow.stage === 'meeting' && scheduledEvent?.meta && !hasMeetingCompleted ? (
                                    <button
                                        type="button"
                                        onClick={openReschedulePanel}
                                        className="w-full rounded-xl border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.04)] px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-[rgba(34,197,94,0.08)] transition-colors"
                                    >
                                        <div className="min-w-0">
                                            <div className="text-sm text-[var(--text-primary)] font-medium">
                                                Meeting scheduled — {String(scheduledEvent.meta?.scheduledDate || '')}
                                                {scheduledEvent.meta?.scheduledTime ? ` ${String(scheduledEvent.meta?.scheduledTime)}` : ''}
                                            </div>
                                            <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                                                Click to manage meeting and reschedule if needed
                                            </div>
                                        </div>
                                        <span className="text-xs px-2 py-1 rounded-full border border-[rgba(34,197,94,0.35)] text-green-400">
                                            Manage
                                        </span>
                                    </button>
                                ) : null}

                                {/* Concierge auto-pass explanation */}
                                {workflow.isPassed && selectedRow?.conciergeAction === 'pass' && (
                                    <div className="rounded-xl border border-[rgba(var(--accent-rgb),0.25)] bg-[rgba(212,175,55,0.04)] px-4 py-3 flex items-center gap-2">
                                        <Bot size={16} className="text-[var(--color-gold)]" />
                                        <span className="text-sm text-[var(--text-secondary)]">
                                            Auto-passed by concierge: {selectedRow?.conciergeReason || 'Does not match your Impact Vision'}
                                        </span>
                                    </div>
                                )}
                                {/* Concierge match explanation */}
                                {(selectedRow?.conciergeAction === 'keep' || selectedRow?.conciergeAction === 'request_info') && (
                                    <div className="rounded-xl border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.04)] px-4 py-3 flex items-center gap-2">
                                        <Bot size={16} className="text-green-400" />
                                        <span className="text-sm text-[var(--text-secondary)]">
                                            {selectedRow?.conciergeReason || 'Matches your Impact Vision'}
                                        </span>
                                    </div>
                                )}

                                {/* Summary grid — always visible */}
                                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Cause</div>
                                        <div className="text-[var(--text-primary)] inline-flex items-center gap-2"><Heart size={14} className="text-[var(--color-gold)]" />{summary.cause}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Amount</div>
                                        <div className="text-[var(--color-gold)] inline-flex items-center gap-2"><DollarSign size={14} />{summary.amount ? `$${Number(summary.amount).toLocaleString()}` : '—'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Geography</div>
                                        <div className="text-[var(--text-primary)] inline-flex items-center gap-2"><MapPin size={14} className="text-[var(--color-gold)]" />{summary.geo}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Urgency</div>
                                        <div className="text-[var(--text-primary)] inline-flex items-center gap-2"><Clock3 size={14} className="text-[var(--color-gold)]" />{summary.urgency}</div>
                                    </div>
                                </div>

                                {/* Three action buttons: Pass | See More | Pledge */}
                                {!workflow.isCommitted && !workflow.isPassed ? (
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button variant="outline" onClick={() => act(detail.opportunity.key, 'pass')}>
                                            Pass
                                        </Button>
                                        {canManualRequestInfo ? (
                                            <Button
                                                variant="outline"
                                                isLoading={requestingInfo}
                                                onClick={async () => {
                                                    setRequestingInfo(true);
                                                    await act(detail.opportunity.key, 'request_info', {
                                                        sendEmail: true,
                                                        note: 'Please share additional details, budget usage, and impact reporting for this request.',
                                                    });
                                                    setRequestingInfo(false);
                                                }}
                                            >
                                                Request Info
                                            </Button>
                                        ) : null}
                                        <Button
                                            variant={seeMoreOpen ? 'outline' : 'gold'}
                                            onClick={() => setSeeMoreOpen((v) => !v)}
                                        >
                                            {seeMoreOpen ? 'Show Less' : 'See More'}
                                        </Button>
                                        <Button
                                            variant="gold"
                                            onClick={async () => {
                                                await act(detail.opportunity.key, 'funded');
                                                router.push('/donor/pledges');
                                            }}
                                        >
                                            Pledge
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                openLeverageDrawer({
                                                    id: detail.opportunity.key,
                                                    title: detail.opportunity.title,
                                                    orgName: detail.opportunity.orgName,
                                                    category: detail.opportunity.category || summary.cause || '',
                                                    location: detail.opportunity.location || summary.geo || '',
                                                    fundingGap: Number(detail.opportunity.amountRequested || detail.opportunity.targetAmount || summary.amount) || 0,
                                                    summary: detail.opportunity.summary || '',
                                                } as any);
                                            }}
                                        >
                                            <Zap size={15} /> Structure Leverage
                                        </Button>
                                    </div>
                                ) : null}

                                {/* Restore button for auto-passed items */}
                                {workflow.isPassed && selectedRow?.conciergeAction === 'pass' && (
                                    <div className="flex items-center gap-3">
                                        <Button variant="outline" onClick={() => act(detail.opportunity.key, 'reset', { source: 'donor_restore' })}>
                                            Restore to Discover
                                        </Button>
                                    </div>
                                )}

                                {/* "See More" expanded content */}
                                {seeMoreOpen ? (
                                    <div className="space-y-5">
                                        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-6">
                                            <div className="text-2xl font-light text-[var(--text-primary)] inline-flex items-center gap-2 mb-3"><FileText size={18} className="text-[var(--color-gold)]" />Overview</div>
                                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{detail.opportunity.details?.mission || detail.opportunity.summary}</p>
                                        </div>

                                        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-6">
                                            <div className="text-2xl font-light text-[var(--text-primary)] inline-flex items-center gap-2 mb-3"><DollarSign size={18} className="text-[var(--color-gold)]" />Financials</div>
                                            <div className="space-y-3 text-sm">
                                                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3"><span className="text-[var(--text-tertiary)] uppercase text-xs tracking-widest">Total budget</span><span className="text-[var(--text-primary)]">{detail.opportunity.details?.budget || (summary.amount ? `$${Number(summary.amount).toLocaleString()}` : '—')}</span></div>
                                                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3"><span className="text-[var(--text-tertiary)] uppercase text-xs tracking-widest">Funding gap</span><span className="text-[var(--text-primary)]">{summary.amount ? `$${Number(summary.amount).toLocaleString()}` : '—'}</span></div>
                                                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3"><span className="text-[var(--text-tertiary)] uppercase text-xs tracking-widest">Timeline</span><span className="text-[var(--text-primary)]">{detail.opportunity.details?.timeline || summary.urgency}</span></div>
                                                <div className="flex items-center justify-between"><span className="text-[var(--text-tertiary)] uppercase text-xs tracking-widest">Allocation</span><span className="text-[var(--text-primary)]">{detail.opportunity.details?.program || '—'}</span></div>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-6">
                                            <div className="text-2xl font-light text-[var(--text-primary)] inline-flex items-center gap-2 mb-3"><Building2 size={18} className="text-[var(--color-gold)]" />Organization</div>
                                            <div className="space-y-3 text-sm text-[var(--text-secondary)]">
                                                <div><div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Leadership</div>{detail.opportunity.details?.leadership || detail.opportunity.orgName}</div>
                                                <div><div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Track record</div>{detail.opportunity.details?.governance || 'Trusted community organization'}</div>
                                                <div><div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Current programs</div>{detail.opportunity.details?.program || detail.opportunity.summary}</div>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-6 space-y-4">
                                            <div className="text-2xl font-light text-[var(--text-primary)] inline-flex items-center gap-2"><Paperclip size={18} className="text-[var(--color-gold)]" />Materials</div>
                                            <div>
                                                <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Organization Documents</div>
                                                <div className="space-y-1">
                                                    {proofLinks.length ? (
                                                        proofLinks.slice(0, 5).map((link, idx) => (
                                                            <div key={`org-${idx}`} className="flex items-center gap-2 text-sm">
                                                                <Paperclip size={13} className="text-[var(--color-gold)] shrink-0" />
                                                                <a href={ensureHref(link)} target="_blank" rel="noreferrer" className="text-[var(--color-gold)] underline underline-offset-2 hover:text-[var(--text-primary)] transition-colors">{`Document ${idx + 1}`}</a>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-sm text-[var(--text-tertiary)] italic">None submitted</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Video</div>
                                                <div className="space-y-1">
                                                    {detail.opportunity.videoUrl ? (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Paperclip size={13} className="text-[var(--color-gold)] shrink-0" />
                                                            <a href={detail.opportunity.videoUrl} target="_blank" rel="noreferrer" className="text-[var(--color-gold)] underline underline-offset-2 hover:text-[var(--text-primary)] transition-colors">Watch video</a>
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-[var(--text-tertiary)] italic">Not attached</div>
                                                    )}
                                                </div>
                                            </div>
                                            {meetingDocs.length > 0 ? (
                                                <div>
                                                    <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Meeting Documents</div>
                                                    <div className="space-y-1">
                                                        {meetingDocs.map((doc: { name: string; url: string }, i: number) => (
                                                            <div key={`mdoc-${i}`} className="flex items-center gap-2 text-sm">
                                                                <Paperclip size={13} className="text-[var(--color-gold)] shrink-0" />
                                                                {doc.url ? (
                                                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-gold)] underline underline-offset-2 hover:text-[var(--text-primary)] transition-colors">{doc.name}</a>
                                                                ) : (
                                                                    <span className="text-[var(--text-secondary)]">{doc.name}</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                ) : null}

                                {/* Meeting Outcomes — read-only card, shown if meeting_completed event exists */}
                                {(() => {
                                    const meetingEvt = timelineEvents.find((e: any) => String(e?.type || '') === 'meeting_completed');
                                    if (!meetingEvt?.meta) return null;
                                    const m = meetingEvt.meta;
                                    const toneMap: Record<string, { label: string; color: string }> = {
                                        very_positive: { label: 'Very Positive', color: 'text-emerald-400' },
                                        promising: { label: 'Promising', color: 'text-sky-400' },
                                        neutral: { label: 'Neutral', color: 'text-[var(--text-secondary)]' },
                                        concerning: { label: 'Concerning', color: 'text-amber-400' },
                                    };
                                    const tone = toneMap[m.tone] || { label: m.tone, color: 'text-[var(--text-secondary)]' };
                                    const confirmMap: Record<string, string> = { yes: 'Yes', no: 'No', partially: 'Partially' };
                                    const negotiableMap: Record<string, string> = { yes: 'Yes', no: 'No', unknown: 'Unknown' };
                                    const followUps = m.followUps || {};
                                    const activeFollowUps = Object.entries(followUps)
                                        .filter(([, v]) => Boolean(v))
                                        .map(([k]) => k.replace(/([A-Z])/g, ' $1').replace(/^./, (c: string) => c.toUpperCase()));
                                    return (
                                        <div className="rounded-2xl border border-[rgba(var(--accent-rgb),0.35)] bg-[rgba(255,255,255,0.02)] p-6 space-y-5">
                                            <div className="text-2xl font-light text-[var(--text-primary)] inline-flex items-center gap-2">
                                                <StickyNote size={18} className="text-[var(--color-gold)]" />Meeting Outcomes
                                            </div>
                                            {m.summary ? (
                                                <div>
                                                    <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Summary</div>
                                                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{m.summary}</p>
                                                </div>
                                            ) : null}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div>
                                                    <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Tone</div>
                                                    <div className={`text-sm font-medium ${tone.color}`}>{tone.label}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Amount Confirmed</div>
                                                    <div className="text-sm text-[var(--text-primary)]">{confirmMap[m.funding?.confirmRequestedAmount] || m.funding?.confirmRequestedAmount || '—'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Negotiable</div>
                                                    <div className="text-sm text-[var(--text-primary)]">{negotiableMap[m.funding?.amountNegotiable] || m.funding?.amountNegotiable || '—'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Expected Timeline</div>
                                                    <div className="text-sm text-[var(--text-primary)]">{m.funding?.expectedTimeline || '—'}</div>
                                                </div>
                                            </div>
                                            {activeFollowUps.length > 0 ? (
                                                <div>
                                                    <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Follow-ups Identified</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {activeFollowUps.map((label) => (
                                                            <span key={label} className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.04)] px-3 py-1 text-xs text-[var(--text-secondary)]">
                                                                <AlertCircle size={11} className="text-[var(--color-gold)]" />{label}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    );
                                })()}

                                {/* Scheduled Meeting — shown when scheduled but not yet completed */}
                                {scheduledEvent?.meta && !hasMeetingCompleted ? (
                                    <div ref={scheduledCardRef} className="rounded-2xl border border-[rgba(var(--accent-rgb),0.35)] bg-[rgba(255,255,255,0.02)] p-6 space-y-5">
                                        <div className="flex items-center justify-between">
                                            <div className="text-2xl font-light text-[var(--text-primary)] inline-flex items-center gap-2">
                                                <Calendar size={18} className="text-[var(--color-gold)]" />Scheduled Meeting
                                            </div>
                                            {scheduledEvent.meta?.concierge && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(212,175,55,0.12)] text-[var(--color-gold)] border border-[rgba(212,175,55,0.25)]">
                                                    Concierge
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                            {scheduledEvent.meta?.scheduledDate && (
                                                <div>
                                                    <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Date</div>
                                                    <div className="text-[var(--text-primary)]">{String(scheduledEvent.meta.scheduledDate)}</div>
                                                </div>
                                            )}
                                            {scheduledEvent.meta?.scheduledTime && (
                                                <div>
                                                    <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Time</div>
                                                    <div className="text-[var(--text-primary)]">{String(scheduledEvent.meta.scheduledTime)}</div>
                                                </div>
                                            )}
                                            {scheduledEvent.meta?.meetingType && (
                                                <div>
                                                    <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Type</div>
                                                    <div className="text-[var(--text-primary)]">{humanizeMeetingType(scheduledEvent.meta.meetingType)}</div>
                                                </div>
                                            )}
                                            {scheduledEvent.meta?.location && (
                                                <div>
                                                    <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Location</div>
                                                    <div className="text-[var(--text-primary)]">{String(scheduledEvent.meta.location)}</div>
                                                </div>
                                            )}
                                            {scheduledEvent.meta?.conciergeName && (
                                                <div>
                                                    <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Concierge</div>
                                                    <div className="text-[var(--text-primary)]">{String(scheduledEvent.meta.conciergeName)}</div>
                                                </div>
                                            )}
                                        </div>
                                        {scheduledEvent.meta?.agenda && (
                                            <div>
                                                <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Agenda</div>
                                                <p className="text-sm text-[var(--text-secondary)]">{String(scheduledEvent.meta.agenda)}</p>
                                            </div>
                                        )}

                                        {!rescheduleOpen ? (
                                            <Button variant="outline" onClick={() => {
                                                setRescheduleDate(String(scheduledEvent.meta?.scheduledDate || ''));
                                                setRescheduleTime(String(scheduledEvent.meta?.scheduledTime || '14:00'));
                                                setRescheduleType(String(scheduledEvent.meta?.meetingType || 'zoom'));
                                                setRescheduleOpen(true);
                                            }}>
                                                Reschedule
                                            </Button>
                                        ) : (
                                            <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)]">
                                                <div className="text-sm font-medium text-[var(--text-primary)]">Reschedule Meeting</div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1 block">Date</label>
                                                        <input
                                                            type="date"
                                                            value={rescheduleDate}
                                                            onChange={(e) => setRescheduleDate(e.target.value)}
                                                            className="w-full rounded-lg px-3 py-2 bg-[rgba(255,255,255,0.03)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] outline-none focus:border-[rgba(var(--accent-rgb),0.35)]"
                                                            style={{ colorScheme: 'dark' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1 block">Time</label>
                                                        <input
                                                            type="time"
                                                            value={rescheduleTime}
                                                            onChange={(e) => setRescheduleTime(e.target.value)}
                                                            className="w-full rounded-lg px-3 py-2 bg-[rgba(255,255,255,0.03)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] outline-none focus:border-[rgba(var(--accent-rgb),0.35)]"
                                                            style={{ colorScheme: 'dark' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1 block">Type</label>
                                                        <select
                                                            value={rescheduleType}
                                                            onChange={(e) => setRescheduleType(e.target.value)}
                                                            className="w-full rounded-lg px-3 py-2 bg-[rgba(255,255,255,0.03)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] outline-none focus:border-[rgba(var(--accent-rgb),0.35)]"
                                                        >
                                                            <option value="zoom">Zoom</option>
                                                            <option value="phone">Phone</option>
                                                            <option value="in_person">In Person</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Button
                                                        variant="gold"
                                                        isLoading={rescheduling}
                                                        onClick={async () => {
                                                            if (!rescheduleDate) return;
                                                            setRescheduling(true);
                                                            await act(detail.opportunity.key, 'scheduled', {
                                                                concierge: false,
                                                                meetingType: rescheduleType,
                                                                scheduledFor: `${rescheduleDate}T${rescheduleTime}`,
                                                                scheduledDate: rescheduleDate,
                                                                scheduledTime: rescheduleTime,
                                                                location: rescheduleType === 'zoom' ? 'Zoom (link will be sent)' : rescheduleType === 'phone' ? 'Phone call' : 'TBD',
                                                                agenda: scheduledEvent.meta?.agenda ? String(scheduledEvent.meta.agenda) : '',
                                                            });
                                                            setRescheduling(false);
                                                            setRescheduleOpen(false);
                                                        }}
                                                    >
                                                        Confirm New Time
                                                    </Button>
                                                    <Button variant="outline" onClick={() => setRescheduleOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : null}

                                {/* History — collapsible */}
                                <button
                                    type="button"
                                    onClick={() => setTimelineOpen((v) => !v)}
                                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] px-4 py-4 flex items-center justify-between text-lg font-light text-[var(--text-primary)]"
                                >
                                    <span className="inline-flex items-center gap-2"><Clock3 size={18} className="text-[var(--color-gold)]" />History</span>
                                    {timelineOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                {timelineOpen ? (
                                    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-6">
                                        {timelineEvents.length === 0 ? (
                                            <div className="text-sm text-[var(--text-tertiary)]">No actions yet.</div>
                                        ) : (
                                            <div className="relative">
                                                <div className="absolute z-0 left-[22px] top-2 bottom-2 w-px bg-[var(--border-subtle)]" />
                                                <div className="relative z-10 space-y-4">
                                                    {timelineEvents.map((e: any) => (
                                                        <div key={e.id} className="relative pl-16">
                                                            <div className="absolute left-0 top-0 h-11 w-11 rounded-xl border border-[rgba(var(--accent-rgb),0.45)] bg-[linear-gradient(180deg,rgba(18,19,22,1),rgba(18,19,22,1)),linear-gradient(135deg,rgba(212,175,55,0.18),rgba(212,175,55,0.10))] text-[var(--color-gold)] flex items-center justify-center">
                                                                {timelineIcon(e.type)}
                                                            </div>
                                                            <div className="text-xl font-light text-[var(--text-primary)] leading-none pt-1">{humanizeEventType(e.type)}</div>
                                                            <div className="text-xs text-[var(--text-tertiary)] mt-1">
                                                                {eventDisplayTimestamp(e)}
                                                                {String(e?.type || '') === 'scheduled' && humanizeMeetingType(e?.meta?.meetingType || e?.meetingType || e?.meta?.meeting_type)
                                                                    ? ` (${humanizeMeetingType(e?.meta?.meetingType || e?.meetingType || e?.meta?.meeting_type)})`
                                                                    : ''}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : null}

                                {/* Notes */}
                                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-2xl font-light text-[var(--text-primary)] inline-flex items-center gap-2"><StickyNote size={18} className="text-[var(--color-gold)]" />Notes</div>
                                        <div className="flex items-center gap-2">
                                            {notesSaving ? <span className="text-[10px] text-[var(--text-tertiary)]">Saving...</span> : notesEditing ? <span className="text-[10px] text-emerald-400">Auto-saved</span> : null}
                                            {!notesEditing ? (
                                                <button type="button" onClick={() => setNotesEditing(true)} className="text-xs text-[var(--text-tertiary)] hover:text-[var(--color-gold)] transition-colors">Edit</button>
                                            ) : (
                                                <button type="button" onClick={() => setNotesEditing(false)} className="text-xs text-[var(--text-tertiary)] hover:text-[var(--color-gold)] transition-colors">Done</button>
                                            )}
                                        </div>
                                    </div>
                                    {notesEditing ? (
                                        <textarea
                                            rows={4}
                                            value={notesText}
                                            onChange={(e) => { setNotesText(e.target.value); saveNotes(e.target.value); }}
                                            placeholder="Add your personal notes about this opportunity..."
                                            className="w-full rounded-lg px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[rgba(var(--accent-rgb),0.35)] resize-y"
                                            autoFocus
                                        />
                                    ) : (
                                        <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line cursor-pointer" onClick={() => setNotesEditing(true)}>
                                            {notesText || <span className="text-[var(--text-tertiary)] italic">Click to add notes...</span>}
                                        </p>
                                    )}
                                </div>
                            </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </div>
        </div>
    );
}
