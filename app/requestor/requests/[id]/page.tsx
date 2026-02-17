'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OpportunityStepper } from '@/components/shared/OpportunityStepper';
import {
    type WorkflowStage,
    type WorkflowView,
    deriveWorkflow,
    humanizeEventTypeOrg,
    WORKFLOW_STAGES,
} from '@/lib/workflow';
import {
    ArrowLeft,
    Calendar,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock3,
    DollarSign,
    FileCheck2,
    FileText,
    Heart,
    Loader2,
    MapPin,
    MessageSquare,
    Paperclip,
    Shield,
    X as XIcon,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

/* ─── Types ─── */
interface RequestData {
    id: string;
    title: string;
    category: string;
    location: string;
    summary: string;
    targetAmount: number;
    currentAmount: number;
    status: string;
    coverUrl?: string | null;
    evidence?: { budget?: { url: string; name: string }; files?: { url: string; name: string }[] } | null;
    createdAt?: string | null;
}

interface EventData {
    type: string;
    meta: Record<string, unknown> | null;
    createdAt: string | null;
}

/* ─── Helpers ─── */
const ADVANCE_STAGES: { key: string; label: string }[] = [
    { key: 'info_requested', label: 'Info Requested' },
    { key: 'scheduled', label: 'Meeting Scheduled' },
    { key: 'meeting_completed', label: 'Meeting Completed' },
    { key: 'diligence_completed', label: 'Diligence Completed' },
    { key: 'funded', label: 'Funded' },
];

function timelineIcon(type: string) {
    if (type === 'save' || type === 'shortlist') return <Check size={15} />;
    if (type === 'request_info') return <MessageSquare size={15} />;
    if (type === 'info_received') return <CheckCircle2 size={15} />;
    if (type === 'scheduled') return <Calendar size={15} />;
    if (type === 'meeting_completed') return <CheckCircle2 size={15} />;
    if (type === 'diligence_completed') return <FileCheck2 size={15} />;
    if (type === 'funded') return <CheckCircle2 size={15} />;
    if (type === 'pass') return <XIcon size={15} />;
    return <Clock3 size={15} />;
}

function eventTimestamp(event: EventData) {
    const scheduledFor = event.meta?.scheduledFor as string | undefined;
    if (event.type === 'scheduled' && scheduledFor) {
        return String(scheduledFor).slice(0, 16).replace('T', ' ');
    }
    return event.createdAt ? String(event.createdAt).slice(0, 19).replace('T', ' ') : '—';
}

function stageIndex(stage: WorkflowStage): number {
    return WORKFLOW_STAGES.indexOf(stage);
}

function advanceStageForWorkflow(stage: WorkflowStage): string | null {
    const map: Record<WorkflowStage, string | null> = {
        discover: 'info_requested',
        info_requested: 'scheduled',
        meeting: 'meeting_completed',
        due_diligence: 'diligence_completed',
        decision: 'funded',
    };
    return map[stage] ?? null;
}

/* ─── Main page ─── */
export default function RequestDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [request, setRequest] = useState<RequestData | null>(null);
    const [state, setState] = useState<string>('new');
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [advancing, setAdvancing] = useState(false);
    const [advanceToast, setAdvanceToast] = useState<string | null>(null);
    const [timelineOpen, setTimelineOpen] = useState(true);
    const [meetingOpen, setMeetingOpen] = useState(true);
    const [diligenceOpen, setDiligenceOpen] = useState(true);

    const load = useCallback(async () => {
        try {
            const res = await fetch(`/api/requestor/requests/${encodeURIComponent(id)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Failed to load');
            setRequest(data.request);
            setState(data.state);
            setEvents(data.events ?? []);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const workflow: WorkflowView = deriveWorkflow({ state, events });

    /* Demo advance — clicking stepper dots */
    const handleStepClick = async (clickedStage: WorkflowStage) => {
        if (advancing) return;
        const clickedIdx = stageIndex(clickedStage);
        const currentIdx = stageIndex(workflow.stage);

        // Only allow advancing forward by exactly one step (or to the next logical stage)
        if (clickedIdx <= currentIdx && !(clickedStage === 'decision' && !workflow.isCommitted && !workflow.isPassed)) return;

        const nextAdvance = advanceStageForWorkflow(workflow.stage);
        if (!nextAdvance) return;

        setAdvancing(true);
        try {
            const res = await fetch(`/api/requestor/requests/${encodeURIComponent(id)}/demo-advance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stage: nextAdvance }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Advance failed');
            setAdvanceToast(`Advanced to: ${ADVANCE_STAGES.find(s => s.key === nextAdvance)?.label ?? nextAdvance}`);
            setTimeout(() => setAdvanceToast(null), 2500);
            await load();
        } catch {
            setAdvanceToast('Failed to advance stage');
            setTimeout(() => setAdvanceToast(null), 2500);
        } finally {
            setAdvancing(false);
        }
    };

    /* Extract concierge data from events */
    const meetingEvent = events.find(e => e.type === 'meeting_completed');
    const scheduledEvent = events.find(e => e.type === 'scheduled');
    const diligenceEvent = events.find(e => e.type === 'diligence_completed');
    const infoRequestEvent = events.find(e => e.type === 'request_info');
    const fundedEvent = events.find(e => e.type === 'funded');

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-gold" size={32} />
            </div>
        );
    }

    if (error || !request) {
        return (
            <div className="max-w-2xl mx-auto py-20 text-center">
                <p className="text-red-400 mb-4">{error || 'Request not found'}</p>
                <Button variant="outline" onClick={() => router.push('/requestor/requests')}>
                    Back to Requests
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Back nav */}
            <button
                type="button"
                onClick={() => router.push('/requestor/requests')}
                className="inline-flex items-center gap-1.5 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
            >
                <ArrowLeft size={14} /> Back to My Requests
            </button>

            {/* Toast */}
            <AnimatePresence>
                {advanceToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl border border-[rgba(212,175,55,0.3)] bg-[rgba(24,24,28,0.95)] text-sm text-[var(--color-gold)] shadow-lg backdrop-blur-sm"
                    >
                        {advanceToast}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <Card className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="text-3xl font-light text-[var(--text-primary)]">{request.title}</h1>
                        <p className="text-sm text-[var(--text-secondary)] mt-2">{request.summary}</p>
                    </div>
                    <span
                        className={[
                            'shrink-0 text-[10px] px-3 py-1.5 rounded-full uppercase tracking-wider font-bold border',
                            request.status === 'active'
                                ? 'bg-[rgba(34,197,94,0.12)] text-[rgba(34,197,94,0.92)] border-[rgba(34,197,94,0.22)]'
                                : 'bg-[rgba(255,255,255,0.04)] text-[var(--text-tertiary)] border-[rgba(255,255,255,0.10)]',
                        ].join(' ')}
                    >
                        {request.status}
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Category</div>
                        <div className="text-[var(--text-primary)] inline-flex items-center gap-1.5"><Heart size={13} className="text-[var(--color-gold)]" />{request.category}</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Amount</div>
                        <div className="text-[var(--color-gold)] inline-flex items-center gap-1.5"><DollarSign size={13} />${request.targetAmount.toLocaleString()}</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Location</div>
                        <div className="text-[var(--text-primary)] inline-flex items-center gap-1.5"><MapPin size={13} className="text-[var(--color-gold)]" />{request.location}</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Submitted</div>
                        <div className="text-[var(--text-primary)] inline-flex items-center gap-1.5"><Calendar size={13} className="text-[var(--color-gold)]" />{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '—'}</div>
                    </div>
                </div>
            </Card>

            {/* Stepper with demo advance */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-medium text-[var(--text-primary)]">Progress</h2>
                    <span className="text-[10px] px-2 py-1 rounded-full border border-[rgba(212,175,55,0.25)] text-[var(--color-gold)] bg-[rgba(212,175,55,0.08)]">
                        Demo — click dots to advance
                    </span>
                </div>
                <OpportunityStepper
                    stage={workflow.stage}
                    isPassed={workflow.isPassed}
                    isCommitted={workflow.isCommitted}
                    orgLabels
                    onStepClick={handleStepClick}
                />
                {advancing && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-[var(--text-tertiary)]">
                        <Loader2 size={14} className="animate-spin" /> Advancing stage...
                    </div>
                )}
            </Card>

            {/* Info Request section */}
            {infoRequestEvent && (
                <Card className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-lg font-medium text-[var(--text-primary)]">
                        <MessageSquare size={18} className="text-[var(--color-gold)]" />
                        Information Requested
                    </div>
                    {Boolean(infoRequestEvent.meta?.note) && (
                        <p className="text-sm text-[var(--text-secondary)]">{String(infoRequestEvent.meta?.note)}</p>
                    )}
                    {Array.isArray(infoRequestEvent.meta?.requestedDocs) && (
                        <div className="space-y-2">
                            <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Required Documents</div>
                            <ul className="space-y-1.5">
                                {(infoRequestEvent.meta?.requestedDocs as string[]).map((doc, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                        <FileText size={13} className="text-[var(--color-gold)] shrink-0" />
                                        {doc}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="pt-2">
                        <span className="text-[10px] px-2 py-1 rounded-full bg-[rgba(234,179,8,0.12)] text-amber-400 border border-[rgba(234,179,8,0.2)]">
                            Pending Response
                        </span>
                    </div>
                </Card>
            )}

            {/* Meeting Scheduling section */}
            {scheduledEvent && (
                <Card className="p-6 space-y-4">
                    <button
                        type="button"
                        onClick={() => setMeetingOpen(v => !v)}
                        className="w-full flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2 text-lg font-medium text-[var(--text-primary)]">
                            <Calendar size={18} className="text-[var(--color-gold)]" />
                            Meeting Details
                        </div>
                        {meetingOpen ? <ChevronUp size={16} className="text-[var(--text-tertiary)]" /> : <ChevronDown size={16} className="text-[var(--text-tertiary)]" />}
                    </button>
                    {meetingOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-3"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                {Boolean(scheduledEvent.meta?.scheduledDate) && (
                                    <div>
                                        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Date</div>
                                        <div className="text-[var(--text-primary)]">{String(scheduledEvent.meta?.scheduledDate)}</div>
                                    </div>
                                )}
                                {Boolean(scheduledEvent.meta?.scheduledTime) && (
                                    <div>
                                        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Time</div>
                                        <div className="text-[var(--text-primary)]">{String(scheduledEvent.meta?.scheduledTime)}</div>
                                    </div>
                                )}
                                {Boolean(scheduledEvent.meta?.meetingType) && (
                                    <div>
                                        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Type</div>
                                        <div className="text-[var(--text-primary)] capitalize">{String(scheduledEvent.meta?.meetingType)}</div>
                                    </div>
                                )}
                                {Boolean(scheduledEvent.meta?.location) && (
                                    <div>
                                        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Location</div>
                                        <div className="text-[var(--text-primary)]">{String(scheduledEvent.meta?.location)}</div>
                                    </div>
                                )}
                                {Boolean(scheduledEvent.meta?.conciergeName) && (
                                    <div>
                                        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Concierge</div>
                                        <div className="text-[var(--text-primary)]">{String(scheduledEvent.meta?.conciergeName)}</div>
                                    </div>
                                )}
                            </div>
                            {Boolean(scheduledEvent.meta?.agenda) && (
                                <div>
                                    <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Agenda</div>
                                    <p className="text-sm text-[var(--text-secondary)]">{String(scheduledEvent.meta?.agenda)}</p>
                                </div>
                            )}

                            {/* Meeting action buttons for org */}
                            {!meetingEvent && (
                                <div className="flex items-center gap-3 pt-2">
                                    <Button variant="gold" size="sm" onClick={() => alert('Meeting accepted. (Demo — in production, this would confirm with the concierge.)')}>
                                        Accept
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => alert('Reschedule request sent. (Demo — in production, the concierge would receive this.)')}>
                                        Reschedule
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => alert('Alternative time proposed. (Demo — in production, you would pick a new time.)')}>
                                        Propose New Time
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </Card>
            )}

            {/* Meeting Outcomes (AI-generated) */}
            {meetingEvent?.meta && (
                <Card className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-lg font-medium text-[var(--text-primary)]">
                        <CheckCircle2 size={18} className="text-[var(--color-gold)]" />
                        Meeting Outcomes
                        {Boolean(meetingEvent.meta?.aiGenerated) && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(96,165,250,0.12)] text-blue-400 border border-[rgba(96,165,250,0.2)]">
                                AI Generated
                            </span>
                        )}
                    </div>

                    {Boolean(meetingEvent.meta?.summary) && (
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{String(meetingEvent.meta?.summary)}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {Boolean(meetingEvent.meta?.tone) && (
                            <div>
                                <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Tone</div>
                                <div className={
                                    String(meetingEvent.meta?.tone).toLowerCase() === 'promising' ? 'text-sky-400' :
                                    String(meetingEvent.meta?.tone).toLowerCase() === 'very positive' ? 'text-emerald-400' :
                                    'text-[var(--text-primary)]'
                                }>
                                    {String(meetingEvent.meta?.tone)}
                                </div>
                            </div>
                        )}
                        {Boolean(meetingEvent.meta?.confirmRequestedAmount) && (
                            <div>
                                <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Amount Confirmed</div>
                                <div className="text-[var(--text-primary)] capitalize">{String(meetingEvent.meta?.confirmRequestedAmount)}</div>
                            </div>
                        )}
                        {Boolean(meetingEvent.meta?.expectedTimeline) && (
                            <div>
                                <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Expected Timeline</div>
                                <div className="text-[var(--text-primary)]">{String(meetingEvent.meta?.expectedTimeline)}</div>
                            </div>
                        )}
                    </div>

                    {/* Follow-ups */}
                    {(meetingEvent.meta?.followUps != null && typeof meetingEvent.meta?.followUps === 'object') && (
                        <div>
                            <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Follow-up Items</div>
                            <div className="space-y-1.5">
                                {Object.entries(meetingEvent.meta?.followUps as Record<string, boolean>).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2 text-sm">
                                        {value ? (
                                            <CheckCircle2 size={14} className="text-emerald-400" />
                                        ) : (
                                            <XIcon size={14} className="text-[var(--text-tertiary)]" />
                                        )}
                                        <span className={value ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}>
                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {/* Due Diligence (read-only) */}
            {diligenceEvent?.meta && (
                <Card className="p-6 space-y-4">
                    <button
                        type="button"
                        onClick={() => setDiligenceOpen(v => !v)}
                        className="w-full flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2 text-lg font-medium text-[var(--text-primary)]">
                            <Shield size={18} className="text-[var(--color-gold)]" />
                            Due Diligence Review
                        </div>
                        {diligenceOpen ? <ChevronUp size={16} className="text-[var(--text-tertiary)]" /> : <ChevronDown size={16} className="text-[var(--text-tertiary)]" />}
                    </button>
                    {diligenceOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-4"
                        >
                            {Boolean(diligenceEvent.meta?.assessment) && (
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{String(diligenceEvent.meta?.assessment)}</p>
                            )}

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {Boolean(diligenceEvent.meta?.riskLevel) && (
                                    <div>
                                        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Risk Level</div>
                                        <div className={
                                            String(diligenceEvent.meta?.riskLevel).toLowerCase() === 'low' ? 'text-emerald-400' :
                                            String(diligenceEvent.meta?.riskLevel).toLowerCase() === 'medium' ? 'text-amber-400' :
                                            'text-red-400'
                                        }>
                                            {String(diligenceEvent.meta?.riskLevel)}
                                        </div>
                                    </div>
                                )}
                                {Boolean(diligenceEvent.meta?.recommendation) && (
                                    <div>
                                        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Recommendation</div>
                                        <div className="text-emerald-400">{String(diligenceEvent.meta?.recommendation)}</div>
                                    </div>
                                )}
                            </div>

                            {/* Checklist results */}
                            {(diligenceEvent.meta?.checklistResults != null && typeof diligenceEvent.meta?.checklistResults === 'object') && (
                                <div>
                                    <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Checklist</div>
                                    <div className="space-y-2">
                                        {Object.entries(diligenceEvent.meta?.checklistResults as Record<string, { done: boolean; note: string }>).map(([key, result]) => (
                                            <div key={key} className="flex items-start gap-3 text-sm">
                                                <div className="mt-0.5">
                                                    {result.done ? (
                                                        <CheckCircle2 size={15} className="text-emerald-400" />
                                                    ) : (
                                                        <Clock3 size={15} className="text-[var(--text-tertiary)]" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-[var(--text-primary)] font-medium">
                                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())}
                                                    </div>
                                                    <div className="text-xs text-[var(--text-tertiary)]">{result.note}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </Card>
            )}

            {/* Funded / Decision */}
            {fundedEvent?.meta && (
                <Card className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-lg font-medium text-emerald-400">
                        <DollarSign size={18} />
                        Funding Approved
                    </div>
                    {Boolean(fundedEvent.meta?.note) && (
                        <p className="text-sm text-[var(--text-secondary)]">{String(fundedEvent.meta?.note)}</p>
                    )}
                    {Boolean(fundedEvent.meta?.pledgeAmount) && (
                        <div className="text-2xl font-light text-[var(--color-gold)]">
                            ${Number(fundedEvent.meta?.pledgeAmount).toLocaleString()}
                        </div>
                    )}
                    {Boolean(fundedEvent.meta?.recommendation) && (
                        <p className="text-sm text-[var(--text-secondary)]">{String(fundedEvent.meta?.recommendation)}</p>
                    )}
                </Card>
            )}

            {/* Materials */}
            {request.evidence && (
                <Card className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-lg font-medium text-[var(--text-primary)]">
                        <Paperclip size={18} className="text-[var(--color-gold)]" />
                        Materials
                    </div>
                    {request.evidence.budget && (
                        <div>
                            <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1.5">Budget</div>
                            <a
                                href={request.evidence.budget.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-[var(--color-gold)] hover:underline"
                            >
                                <FileText size={13} />
                                {request.evidence.budget.name || 'Budget document'}
                            </a>
                        </div>
                    )}
                    {request.evidence.files && request.evidence.files.length > 0 && (
                        <div>
                            <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1.5">Supporting Documents</div>
                            <div className="space-y-1.5">
                                {request.evidence.files.map((f, i) => (
                                    <a
                                        key={i}
                                        href={f.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 text-sm text-[var(--color-gold)] hover:underline"
                                    >
                                        <Paperclip size={13} />
                                        {f.name || `Document ${i + 1}`}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {/* Engagement Timeline */}
            <Card className="p-6">
                <button
                    type="button"
                    onClick={() => setTimelineOpen(v => !v)}
                    className="w-full flex items-center justify-between"
                >
                    <div className="flex items-center gap-2 text-lg font-medium text-[var(--text-primary)]">
                        <Clock3 size={18} className="text-[var(--color-gold)]" />
                        Timeline
                    </div>
                    {timelineOpen ? <ChevronUp size={16} className="text-[var(--text-tertiary)]" /> : <ChevronDown size={16} className="text-[var(--text-tertiary)]" />}
                </button>
                {timelineOpen && (
                    <div className="mt-4">
                        {events.length === 0 ? (
                            <div className="text-sm text-[var(--text-tertiary)]">No activity yet. Click the stepper dots above to simulate concierge progress.</div>
                        ) : (
                            <div className="relative">
                                <div className="absolute z-0 left-[22px] top-2 bottom-2 w-px bg-[var(--border-subtle)]" />
                                <div className="relative z-10 space-y-4">
                                    {events.map((e, i) => (
                                        <div key={i} className="relative pl-16">
                                            <div className="absolute left-0 top-0 h-11 w-11 rounded-xl border border-[rgba(var(--accent-rgb),0.45)] bg-[linear-gradient(180deg,rgba(18,19,22,1),rgba(18,19,22,1)),linear-gradient(135deg,rgba(212,175,55,0.18),rgba(212,175,55,0.10))] text-[var(--color-gold)] flex items-center justify-center">
                                                {timelineIcon(e.type)}
                                            </div>
                                            <div className="text-xl font-light text-[var(--text-primary)] leading-none pt-1">
                                                {humanizeEventTypeOrg(e.type)}
                                            </div>
                                            <div className="text-xs text-[var(--text-tertiary)] mt-1">
                                                {eventTimestamp(e)}
                                            </div>
                                            {/* Show concierge note if present */}
                                            {Boolean(e.meta?.note) && (
                                                <div className="mt-2 text-sm text-[var(--text-secondary)] bg-[rgba(255,255,255,0.02)] rounded-lg px-3 py-2 border border-[var(--border-subtle)]">
                                                    {String(e.meta?.note)}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
}
