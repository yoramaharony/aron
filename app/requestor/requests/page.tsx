'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OpportunityStepper } from '@/components/shared/OpportunityStepper';
import { deriveWorkflow } from '@/lib/workflow';
import { PlusCircle, Loader2, ChevronRight, DollarSign, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface RequestRow {
    id: string;
    title: string;
    targetAmount: number;
    status: string;
    category: string;
    createdAt?: string | null;
    evidenceJson?: string | null;
}

interface ProgressData {
    state: string;
    events: { type: string }[];
}

type OrgTab = 'active' | 'declined';

export default function MyRequestsPage() {
    const [requests, setRequests] = useState<RequestRow[]>([]);
    const [progressMap, setProgressMap] = useState<Record<string, ProgressData>>({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<OrgTab>('active');
    const router = useRouter();

    useEffect(() => {
        fetch('/api/requests')
            .then(res => res.json())
            .then(async (data) => {
                const list: RequestRow[] = data.requests ?? [];
                setRequests(list);

                // Fetch progress for each request in parallel
                const progressEntries = await Promise.allSettled(
                    list.map(async (req) => {
                        const res = await fetch(`/api/requestor/requests/${encodeURIComponent(req.id)}`);
                        if (!res.ok) return null;
                        const d = await res.json();
                        return { id: req.id, state: d.state, events: d.events ?? [] };
                    }),
                );
                const map: Record<string, ProgressData> = {};
                for (const entry of progressEntries) {
                    if (entry.status === 'fulfilled' && entry.value) {
                        map[entry.value.id] = { state: entry.value.state, events: entry.value.events };
                    }
                }
                setProgressMap(map);
            })
            .finally(() => setLoading(false));
    }, []);

    const isDeclined = (req: RequestRow) => req.status === 'passed';

    const activeCount = useMemo(() => requests.filter((r) => !isDeclined(r)).length, [requests]);
    const declinedCount = useMemo(() => requests.filter((r) => isDeclined(r)).length, [requests]);
    const filtered = useMemo(
        () => requests.filter((r) => (activeTab === 'declined' ? isDeclined(r) : !isDeclined(r))),
        [requests, activeTab],
    );

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold" size={32} /></div>;

    return (
        <div>
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-semibold text-[var(--text-primary)]">My Requests</h1>
                    <p className="text-secondary">Track submissions and donor progress.</p>
                </div>
                <Button asChild leftIcon={<PlusCircle size={16} />}>
                    <Link href="/requestor">Create New</Link>
                </Button>
            </header>

            {/* Tabs */}
            <div className="flex gap-8 border-b border-[var(--border-subtle)] mb-6">
                {(['active', 'declined'] as const).map((tab) => {
                    const count = tab === 'active' ? activeCount : declinedCount;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-sm font-medium transition-colors relative ${
                                activeTab === tab
                                    ? 'text-[var(--text-primary)]'
                                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                            }`}
                        >
                            {tab === 'active' ? 'Active' : 'Declined'}
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

            {requests.length === 0 ? (
                <Card className="text-center py-16">
                    <h3 className="text-lg font-medium mb-2">No Requests Yet</h3>
                    <p className="text-secondary mb-6">Start your first funding request to get noticed by our donor network.</p>
                    <Button asChild variant="gold">
                        <Link href="/requestor">Create Request</Link>
                    </Button>
                </Card>
            ) : filtered.length === 0 ? (
                <Card className="text-center py-16">
                    <p className="text-secondary">
                        {activeTab === 'declined' ? 'No declined requests.' : 'No active requests.'}
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filtered.map((req) => {
                        const progress = progressMap[req.id];
                        const workflow = progress ? deriveWorkflow(progress) : null;
                        return (
                            <button
                                key={req.id}
                                type="button"
                                onClick={() => router.push(`/requestor/requests/${encodeURIComponent(req.id)}`)}
                                className="w-full text-left"
                            >
                                <Card className="hover:border-[rgba(212,175,55,0.3)] transition-colors cursor-pointer">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-medium truncate">{req.title}</h3>
                                                <span
                                                    className={[
                                                        'shrink-0 text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-bold border',
                                                        req.status === 'active' || req.status === 'more_info_requested' || req.status === 'more_info_submitted'
                                                            ? 'bg-[rgba(34,197,94,0.12)] text-[rgba(34,197,94,0.92)] border-[rgba(34,197,94,0.22)]'
                                                            : req.status === 'passed'
                                                                ? 'bg-[rgba(239,68,68,0.10)] text-[rgba(239,68,68,0.85)] border-[rgba(239,68,68,0.22)]'
                                                                : req.status === 'funded'
                                                                    ? 'bg-[rgba(212,175,55,0.12)] text-[var(--color-gold)] border-[rgba(212,175,55,0.22)]'
                                                                    : 'bg-[rgba(255,255,255,0.04)] text-[var(--text-tertiary)] border-[rgba(255,255,255,0.10)]',
                                                    ].join(' ')}
                                                >
                                                    {req.status === 'passed' ? 'Declined' : req.status === 'funded' ? 'Funded' : req.status === 'more_info_requested' ? 'In Progress' : req.status === 'more_info_submitted' ? 'In Progress' : req.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                                                <span className="inline-flex items-center gap-1">{req.category}</span>
                                                <span className="inline-flex items-center gap-1 text-[var(--color-gold)]"><DollarSign size={12} />${req.targetAmount.toLocaleString()}</span>
                                                {req.createdAt && (
                                                    <span className="inline-flex items-center gap-1 text-[var(--text-tertiary)]"><Calendar size={12} />{new Date(req.createdAt).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                            {/* Mini stepper */}
                                            {workflow && (
                                                <div className="mt-3 max-w-md">
                                                    <OpportunityStepper
                                                        stage={workflow.stage}
                                                        isPassed={workflow.isPassed}
                                                        isCommitted={workflow.isCommitted}
                                                        compact
                                                        orgLabels
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <ChevronRight size={18} className="text-[var(--text-tertiary)] shrink-0 mt-2" />
                                    </div>
                                </Card>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
