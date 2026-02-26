'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
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
    ChevronRight,
    Clock3,
    Copy,
    DollarSign,
    ExternalLink,
    FileCheck2,
    FileText,
    Heart,
    Loader2,
    MapPin,
    MessageSquare,
    Paperclip,
    Shield,
    Sparkles,
    Upload,
    X as XIcon,
} from 'lucide-react';
import { getMoreInfoDemoData } from '@/lib/demo-autofill';
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
    moreInfoToken?: string | null;
    moreInfoSubmittedAt?: string | null;
    details?: Record<string, string | null> | null;
    createdAt?: string | null;
}

interface EventData {
    type: string;
    meta: Record<string, unknown> | null;
    createdAt: string | null;
}

interface DafDoc {
    id: string;
    type: string;
    fileUrl: string;
    fileName: string;
    uploadedByRole: string;
    createdAt: string | null;
}

interface DafGrantData {
    id: string;
    donorId: string;
    sponsorName: string;
    amount: number;
    designation: string;
    status: string;
    submittedAt: string | null;
    receivedAt: string | null;
    documents: DafDoc[];
}

type TabKey = 'overview' | 'tasks' | 'details' | 'documents';

/* ─── Task model ─── */
interface TaskItem {
    id: string;
    label: string;
    description: string;
    status: 'pending' | 'completed';
    action?: 'open-more-info' | 'meeting-action';
    completedAt?: string | null;
}

function computeTasks(
    hasInfoRequest: boolean,
    hasSubmittedInfo: boolean,
    moreInfoSubmittedAt: string | null | undefined,
    scheduledEvent: EventData | undefined,
    meetingResponse: string | null,
    meetingEvent: EventData | undefined,
    diligenceEvent: EventData | undefined,
    fundedEvent: EventData | undefined,
): { pending: TaskItem[]; completed: TaskItem[] } {
    const pending: TaskItem[] = [];
    const completed: TaskItem[] = [];

    if (hasInfoRequest) {
        if (!hasSubmittedInfo) {
            pending.push({
                id: 'more-info',
                label: 'Provide additional information',
                description: 'A donor has requested more details about your submission.',
                status: 'pending',
                action: 'open-more-info',
            });
        } else {
            completed.push({
                id: 'more-info',
                label: 'Additional information submitted',
                description: 'You submitted the requested details.',
                status: 'completed',
                completedAt: moreInfoSubmittedAt ?? null,
            });
        }
    }

    if (scheduledEvent) {
        if (!meetingEvent && !meetingResponse) {
            pending.push({
                id: 'meeting',
                label: 'Accept or reschedule meeting',
                description: 'A meeting has been scheduled. Please confirm or propose a new time.',
                status: 'pending',
                action: 'meeting-action',
            });
        } else if (!meetingEvent && meetingResponse) {
            const responseCopy: Record<string, { label: string; description: string }> = {
                accepted: {
                    label: 'Meeting time confirmed',
                    description: 'You confirmed the proposed meeting time.',
                },
                reschedule_requested: {
                    label: 'Reschedule requested',
                    description: 'You requested a new meeting time.',
                },
                proposed_new_time: {
                    label: 'New time proposed',
                    description: 'You proposed an alternative meeting time.',
                },
            };
            const copy = responseCopy[meetingResponse] || {
                label: 'Meeting response submitted',
                description: 'Your scheduling response was sent.',
            };
            completed.push({
                id: 'meeting-response',
                label: copy.label,
                description: copy.description,
                status: 'completed',
                completedAt: scheduledEvent.createdAt,
            });
        } else {
            completed.push({
                id: 'meeting',
                label: 'Meeting completed',
                description: 'The meeting was held.',
                status: 'completed',
                completedAt: meetingEvent?.createdAt ?? scheduledEvent.createdAt,
            });
        }
    }

    if (diligenceEvent) {
        completed.push({
            id: 'diligence',
            label: 'Due diligence completed',
            description: 'The due diligence review has been finalized.',
            status: 'completed',
            completedAt: diligenceEvent.createdAt,
        });
    }

    if (fundedEvent) {
        completed.push({
            id: 'funded',
            label: 'Funding approved',
            description: 'Your request has been approved for funding.',
            status: 'completed',
            completedAt: fundedEvent.createdAt,
        });
    }

    return { pending, completed };
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
    return event.createdAt ? String(event.createdAt).slice(0, 19).replace('T', ' ') : '—';
}

function scheduledForTimestamp(event: EventData) {
    const scheduledFor = event.meta?.scheduledFor as string | undefined;
    if (!scheduledFor) return null;
    return String(scheduledFor).slice(0, 16).replace('T', ' ');
}

function humanizeMeetingType(value: unknown) {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return '';
    if (raw === 'in_person' || raw === 'in-person') return 'In person';
    if (raw === 'zoom') return 'Zoom';
    if (raw === 'phone') return 'Phone';
    return raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function humanizeMeetingResponse(value: unknown) {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return '';
    if (raw === 'accepted') return 'Accepted by organization';
    if (raw === 'reschedule_requested') return 'Reschedule requested';
    if (raw === 'proposed_new_time') return 'New time proposed';
    return raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function defaultLocationForMeetingType(value: unknown) {
    const raw = String(value || '').trim().toLowerCase();
    if (raw === 'phone') return 'Phone call';
    if (raw === 'in_person' || raw === 'in-person') return 'TBD';
    return 'Zoom (link will be sent)';
}

function eventOrderWeight(type: string) {
    const map: Record<string, number> = {
        request_info: 10,
        info_received: 20,
        scheduled: 30,
        meeting_completed: 40,
        diligence_completed: 50,
        funded: 60,
        pass: 70,
        reset: 80,
    };
    return map[type] ?? 999;
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

function taskIcon(task: TaskItem) {
    if (task.id === 'more-info') return <MessageSquare size={16} className="text-amber-400" />;
    if (task.id === 'meeting') return <Calendar size={16} className="text-amber-400" />;
    return <Clock3 size={16} className="text-amber-400" />;
}

/* ─── More-info inline form ─── */
type UploadedFile = { name: string; url: string; size: number; type: string };

function MoreInfoForm({ token, existing, amount, onSubmitted }: {
    token: string;
    existing: Record<string, string | null> | null;
    amount: number;
    onSubmitted: () => void;
}) {
    const [form, setForm] = useState({
        orgWebsite: existing?.orgWebsite ?? '',
        mission: existing?.mission ?? '',
        program: existing?.program ?? '',
        geo: existing?.geo ?? '',
        beneficiaries: existing?.beneficiaries ?? '',
        budget: existing?.budget ?? '',
        amountRequested: existing?.amountRequested ?? '',
        timeline: existing?.timeline ?? '',
        governance: existing?.governance ?? '',
        leadership: existing?.leadership ?? '',
        proofLinks: existing?.proofLinks ?? '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [supportingDocs, setSupportingDocs] = useState<UploadedFile[]>(
        Array.isArray((existing as any)?.supportingDocs) ? (existing as any).supportingDocs : [],
    );
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const complexity = amount <= 25000 ? 'basic' : amount <= 100000 ? 'detailed' : 'comprehensive';

    const uploadFiles = async (files: FileList | File[]) => {
        setUploading(true);
        setUploadError('');
        try {
            const fd = new FormData();
            Array.from(files).forEach((f) => fd.append('files', f));
            const res = await fetch(`/api/more-info/${encodeURIComponent(token)}/upload`, { method: 'POST', body: fd });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || 'Upload failed');
            setSupportingDocs((prev) => [...prev, ...(data?.files ?? [])]);
        } catch (e: unknown) {
            setUploadError(e instanceof Error ? e.message : 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const removeDoc = (url: string) => {
        setSupportingDocs((prev) => prev.filter((d) => d.url !== url));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setSubmitError('');
        try {
            const res = await fetch(`/api/more-info/${encodeURIComponent(token)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, supportingDocs }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || 'Failed to submit');
            onSubmitted();
        } catch (e: unknown) {
            setSubmitError(e instanceof Error ? e.message : 'Failed to submit');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="label">Org website</label>
                    <input className="input-field" value={form.orgWebsite} onChange={(e) => setForm((p) => ({ ...p, orgWebsite: e.target.value }))} />
                </div>
                <div>
                    <label className="label">Geo (where you operate)</label>
                    <input className="input-field" value={form.geo} onChange={(e) => setForm((p) => ({ ...p, geo: e.target.value }))} />
                </div>
                <div>
                    <label className="label">Budget (high level)</label>
                    <input className="input-field" value={form.budget} onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))} placeholder="e.g. $2.1M annual" />
                </div>
                <div>
                    <label className="label">Amount requested</label>
                    <input className="input-field" value={form.amountRequested} onChange={(e) => setForm((p) => ({ ...p, amountRequested: e.target.value }))} placeholder="e.g. $250k" />
                </div>
            </div>

            <div>
                <label className="label">Mission (2-3 sentences)</label>
                <textarea className="input-field min-h-[90px] resize-y" value={form.mission} onChange={(e) => setForm((p) => ({ ...p, mission: e.target.value }))} />
            </div>

            <div>
                <label className="label">Program detail (what you'll do with the funds)</label>
                <textarea className="input-field min-h-[110px] resize-y" value={form.program} onChange={(e) => setForm((p) => ({ ...p, program: e.target.value }))} />
            </div>

            {complexity !== 'basic' && (
                <div>
                    <label className="label">Beneficiaries + outcomes</label>
                    <textarea className="input-field min-h-[100px] resize-y" value={form.beneficiaries} onChange={(e) => setForm((p) => ({ ...p, beneficiaries: e.target.value }))} />
                </div>
            )}

            {complexity !== 'basic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Timeline</label>
                        <textarea className="input-field min-h-[90px] resize-y" value={form.timeline} onChange={(e) => setForm((p) => ({ ...p, timeline: e.target.value }))} placeholder="e.g. start in 14 days, complete in 6 months" />
                    </div>
                    <div>
                        <label className="label">Governance (board / oversight)</label>
                        <textarea className="input-field min-h-[90px] resize-y" value={form.governance} onChange={(e) => setForm((p) => ({ ...p, governance: e.target.value }))} />
                    </div>
                </div>
            )}

            {complexity === 'comprehensive' && (
                <div>
                    <label className="label">Leadership (key people)</label>
                    <textarea className="input-field min-h-[90px] resize-y" value={form.leadership} onChange={(e) => setForm((p) => ({ ...p, leadership: e.target.value }))} />
                </div>
            )}

            <div>
                <label className="label">Proof links (optional)</label>
                <textarea className="input-field min-h-[70px] resize-y" value={form.proofLinks} onChange={(e) => setForm((p) => ({ ...p, proofLinks: e.target.value }))} placeholder="Paste links to docs, audited statements, reports, references..." />
            </div>

            {/* Supporting documents upload */}
            <div>
                <label className="label">Supporting documents (optional)</label>
                <div
                    className={[
                        'p-6 border-dashed rounded-lg flex flex-col items-center justify-center gap-3 transition-all cursor-pointer',
                        dragOver ? 'bg-[rgba(var(--accent-rgb),0.10)]' : 'hover:bg-[var(--bg-surface)]',
                    ].join(' ')}
                    style={{ border: '2px dashed var(--border-subtle)' }}
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={async (e) => {
                        e.preventDefault();
                        setDragOver(false);
                        if (e.dataTransfer?.files?.length) await uploadFiles(e.dataTransfer.files);
                    }}
                >
                    {uploading ? (
                        <div className="text-sm text-[var(--text-secondary)]">Uploading…</div>
                    ) : (
                        <>
                            <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-tertiary)]">
                                <Upload size={20} />
                            </div>
                            <div className="text-center">
                                <div className="text-sm font-medium">Drop files here or click to browse</div>
                                <div className="text-xs text-[var(--text-tertiary)] mt-1">PDF, Excel, or images — max 10MB each</div>
                            </div>
                        </>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.xls,.xlsx,.png,.jpg,.jpeg,.webp"
                    className="sr-only"
                    onChange={async (e) => {
                        const picked = Array.from(e.currentTarget.files ?? []);
                        e.currentTarget.value = '';
                        if (picked.length) await uploadFiles(picked);
                    }}
                />
                {uploadError && <div className="mt-2 text-xs text-red-300">{uploadError}</div>}
                {supportingDocs.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {supportingDocs.map((doc) => (
                            <div key={doc.url} className="flex items-center justify-between p-3 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                                <div className="flex items-center gap-2 min-w-0">
                                    <FileText size={16} className="text-[var(--text-tertiary)] shrink-0" />
                                    <a href={doc.url} target="_blank" rel="noreferrer" className="text-sm truncate text-[var(--text-primary)] hover:underline">{doc.name}</a>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Check size={14} className="text-[rgba(34,197,94,0.92)]" />
                                    <button type="button" onClick={() => removeDoc(doc.url)} className="text-[var(--text-tertiary)] hover:text-red-400 transition-colors" title="Remove">
                                        <XIcon size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {submitError && <div className="text-sm text-red-300">{submitError}</div>}

            <div className="pt-2 flex items-center justify-end gap-3">
                <button
                    type="button"
                    onClick={() => setForm(getMoreInfoDemoData())}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-purple-400 border border-purple-400/25 bg-purple-400/8 hover:bg-purple-400/15 transition-colors"
                    title="Auto-fill with demo data"
                >
                    <Sparkles size={14} />
                    AI Fill
                </button>
                <Button variant="gold" onClick={handleSubmit} isLoading={submitting}>
                    Submit Information
                </Button>
            </div>
        </div>
    );
}

/* ─── Main page ─── */
export default function RequestDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [request, setRequest] = useState<RequestData | null>(null);
    const [state, setState] = useState<string>('new');
    const [events, setEvents] = useState<EventData[]>([]);
    const [dafGrants, setDafGrants] = useState<DafGrantData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [advancing, setAdvancing] = useState(false);
    const [advanceToast, setAdvanceToast] = useState<string | null>(null);
    const [linkCopied, setLinkCopied] = useState(false);
    const [copiedId, setCopiedId] = useState(false);
    const [moreInfoModalOpen, setMoreInfoModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [meetingModalMode, setMeetingModalMode] = useState<'reschedule' | 'propose_new_time' | null>(null);
    const [meetingDate, setMeetingDate] = useState('');
    const [meetingTime, setMeetingTime] = useState('14:00');
    const [meetingType, setMeetingType] = useState('zoom');
    const [meetingLocation, setMeetingLocation] = useState('');
    const [meetingNote, setMeetingNote] = useState('');
    const [meetingSubmitting, setMeetingSubmitting] = useState(false);
    const [meetingError, setMeetingError] = useState('');

    const load = useCallback(async () => {
        try {
            const res = await fetch(`/api/requestor/requests/${encodeURIComponent(id)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Failed to load');
            setRequest(data.request);
            setState(data.state);
            setEvents(data.events ?? []);
            setDafGrants(Array.isArray(data.daf) ? data.daf : []);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const workflow: WorkflowView = deriveWorkflow({ state, events });

    /* Deduplicate consecutive same-type events, then sort chronologically.
       Tie-break same-timestamp events by workflow order for deterministic UI. */
    const timelineEvents = useMemo(() => {
        const deduped = events.filter((e, idx, arr) => idx === 0 || e.type !== arr[idx - 1].type);
        return [...deduped].sort((a, b) => {
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            if (ta !== tb) return ta - tb;
            return eventOrderWeight(a.type) - eventOrderWeight(b.type);
        });
    }, [events]);

    /* Demo advance — clicking stepper dots */
    const handleStepClick = async (clickedStage: WorkflowStage) => {
        if (advancing) return;
        const clickedIdx = stageIndex(clickedStage);
        const currentIdx = stageIndex(workflow.stage);

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
    const meetingResponse = typeof scheduledEvent?.meta?.orgResponse === 'string'
        ? String(scheduledEvent.meta.orgResponse)
        : null;

    /* More-info state */
    const hasInfoRequest = Boolean(infoRequestEvent || request?.moreInfoToken);
    const hasSubmittedInfo = Boolean(request?.moreInfoSubmittedAt);
    const moreInfoLink = request?.moreInfoToken ? `${typeof window !== 'undefined' ? window.location.origin : ''}/more-info/${request.moreInfoToken}` : null;

    /* Task computation */
    const { pending: pendingTasks, completed: completedTasks } = computeTasks(
        hasInfoRequest,
        hasSubmittedInfo,
        request?.moreInfoSubmittedAt,
        scheduledEvent,
        meetingResponse,
        meetingEvent,
        diligenceEvent,
        fundedEvent,
    );
    const latestDaf = dafGrants[0] ?? null;
    const pendingTasksMerged = useMemo(() => {
        const base = [...pendingTasks];
        if (!latestDaf) return base;
        if (latestDaf.status === 'packet_generated') {
            base.push({
                id: 'daf-awaiting-submission',
                label: 'DAF packet generated',
                description: `Awaiting donor submission confirmation via ${latestDaf.sponsorName}.`,
                status: 'pending',
            });
        } else if (latestDaf.status === 'submitted') {
            base.push({
                id: 'daf-awaiting-receipt',
                label: 'Awaiting DAF funds receipt',
                description: 'Donor marked submission. Confirm when funds are received.',
                status: 'pending',
            });
        }
        return base;
    }, [pendingTasks, latestDaf]);
    const completedTasksMerged = useMemo(() => {
        const base = [...completedTasks];
        if (!latestDaf) return base;
        if (latestDaf.status === 'submitted' || latestDaf.status === 'received') {
            base.push({
                id: 'daf-submitted',
                label: 'DAF submission confirmed',
                description: `${latestDaf.sponsorName} recommendation submitted.`,
                status: 'completed',
                completedAt: latestDaf.submittedAt,
            });
        }
        if (latestDaf.status === 'received') {
            base.push({
                id: 'daf-received',
                label: 'DAF funds received',
                description: 'Funding receipt confirmed.',
                status: 'completed',
                completedAt: latestDaf.receivedAt,
            });
        }
        return base;
    }, [completedTasks, latestDaf]);
    const pendingCountMerged = pendingTasksMerged.length;

    const handleTaskAction = (task: TaskItem) => {
        if (task.action === 'open-more-info') {
            setMoreInfoModalOpen(true);
        } else if (task.action === 'meeting-action') {
            setActiveTab('tasks');
        }
    };

    const copyLink = () => {
        if (moreInfoLink) {
            navigator.clipboard.writeText(moreInfoLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        }
    };

    const openMeetingModal = (mode: 'reschedule' | 'propose_new_time') => {
        if (!scheduledEvent) return;
        const nextType = String(scheduledEvent.meta?.meetingType || 'zoom');
        const currentLocation = String(scheduledEvent.meta?.location || '').trim();
        setMeetingModalMode(mode);
        setMeetingDate(String(scheduledEvent.meta?.scheduledDate || ''));
        setMeetingTime(String(scheduledEvent.meta?.scheduledTime || '14:00'));
        setMeetingType(nextType);
        setMeetingLocation(currentLocation || defaultLocationForMeetingType(nextType));
        setMeetingNote('');
        setMeetingError('');
    };

    const submitMeetingAction = async (
        action: 'accept' | 'reschedule' | 'propose_new_time',
        payload?: { scheduledDate: string; scheduledTime: string; meetingType: string; location: string; note: string },
    ) => {
        setMeetingSubmitting(true);
        setMeetingError('');
        try {
            const res = await fetch(`/api/requestor/requests/${encodeURIComponent(id)}/meeting`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, ...(payload || {}) }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || 'Failed to update meeting');
            setMeetingModalMode(null);
            await load();
        } catch (e: unknown) {
            setMeetingError(e instanceof Error ? e.message : 'Failed to update meeting');
        } finally {
            setMeetingSubmitting(false);
        }
    };

    /* Documents check */
    const hasDocuments = Boolean(
        request?.evidence?.budget ||
        (request?.evidence?.files && request.evidence.files.length > 0) ||
        (Array.isArray((request?.details as any)?.supportingDocs) && (request?.details as any).supportingDocs.length > 0),
    );

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

            {/* ── Tab Navigation ── */}
            <div className="flex gap-8 border-b border-[var(--border-subtle)]">
                {([
                    { key: 'overview' as TabKey, label: 'Overview' },
                    { key: 'tasks' as TabKey, label: 'Tasks', badge: pendingCountMerged },
                    { key: 'details' as TabKey, label: 'Request Details' },
                    { key: 'documents' as TabKey, label: 'Documents' },
                ]).map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`pb-3 text-sm font-medium transition-colors relative ${
                            activeTab === tab.key
                                ? 'text-[var(--text-primary)]'
                                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                        }`}
                    >
                        <span className="flex items-center gap-1.5">
                            {tab.label}
                            {tab.badge != null && tab.badge > 0 && (
                                <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-bold bg-[rgba(212,175,55,0.15)] text-[var(--color-gold)] border border-[rgba(212,175,55,0.3)]">
                                    {tab.badge}
                                </span>
                            )}
                        </span>
                        {activeTab === tab.key && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-gold)]" />
                        )}
                    </button>
                ))}
            </div>

            {/* ── Progress Stepper (below tabs, always visible) ── */}
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

            {/* ── More Info Modal (fixed overlay — always accessible) ── */}
            <AnimatePresence>
                {moreInfoModalOpen && request.moreInfoToken && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-6"
                        onClick={(e) => { if (e.target === e.currentTarget) setMoreInfoModalOpen(false); }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.97 }}
                            className="w-full max-w-3xl my-8"
                        >
                            <Card className="p-6 md:p-8 space-y-5">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-medium text-[var(--text-primary)]">Provide Additional Information</h2>
                                    <button
                                        type="button"
                                        onClick={() => setMoreInfoModalOpen(false)}
                                        className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                                    >
                                        <XIcon size={20} />
                                    </button>
                                </div>

                                {infoRequestEvent && Boolean(infoRequestEvent.meta?.note) && (
                                    <div className="text-sm text-[var(--text-secondary)] bg-[rgba(255,255,255,0.02)] rounded-lg px-3 py-2 border border-[var(--border-subtle)]">
                                        {String(infoRequestEvent.meta?.note)}
                                    </div>
                                )}

                                <MoreInfoForm
                                    token={request.moreInfoToken}
                                    existing={request.details ?? null}
                                    amount={request.targetAmount}
                                    onSubmitted={() => {
                                        setMoreInfoModalOpen(false);
                                        load();
                                    }}
                                />
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Meeting response modal ── */}
            <AnimatePresence>
                {meetingModalMode && scheduledEvent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-6"
                        onClick={(e) => { if (e.target === e.currentTarget) setMeetingModalMode(null); }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.97 }}
                            className="w-full max-w-2xl my-8"
                        >
                            <Card className="p-6 md:p-8 space-y-5">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-medium text-[var(--text-primary)]">
                                        {meetingModalMode === 'reschedule' ? 'Reschedule meeting' : 'Propose a new meeting time'}
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => setMeetingModalMode(null)}
                                        className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                                    >
                                        <XIcon size={20} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="label">Date</label>
                                        <input
                                            type="date"
                                            value={meetingDate}
                                            onChange={(e) => setMeetingDate(e.target.value)}
                                            className="input-field"
                                            style={{ colorScheme: 'dark' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Time</label>
                                        <input
                                            type="time"
                                            value={meetingTime}
                                            onChange={(e) => setMeetingTime(e.target.value)}
                                            className="input-field"
                                            style={{ colorScheme: 'dark' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Type</label>
                                        <select
                                            value={meetingType}
                                            onChange={(e) => {
                                                const nextType = e.target.value;
                                                setMeetingType(nextType);
                                                setMeetingLocation(defaultLocationForMeetingType(nextType));
                                            }}
                                            className="input-field"
                                        >
                                            <option value="zoom">Zoom</option>
                                            <option value="phone">Phone</option>
                                            <option value="in_person">In Person</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Location (optional override)</label>
                                    <input
                                        value={meetingLocation}
                                        onChange={(e) => setMeetingLocation(e.target.value)}
                                        className="input-field"
                                        placeholder="Defaults from meeting type if left blank"
                                    />
                                </div>

                                <div>
                                    <label className="label">Note (optional)</label>
                                    <textarea
                                        className="input-field min-h-[90px] resize-y"
                                        value={meetingNote}
                                        onChange={(e) => setMeetingNote(e.target.value)}
                                        placeholder="Share context for the concierge and donor."
                                    />
                                </div>

                                {meetingError && <div className="text-sm text-red-300">{meetingError}</div>}

                                <div className="pt-1 flex items-center justify-end gap-3">
                                    <Button variant="outline" onClick={() => setMeetingModalMode(null)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="gold"
                                        isLoading={meetingSubmitting}
                                        onClick={() => {
                                            if (!meetingDate || !meetingTime) {
                                                setMeetingError('Please choose both date and time.');
                                                return;
                                            }
                                            submitMeetingAction(meetingModalMode, {
                                                scheduledDate: meetingDate,
                                                scheduledTime: meetingTime,
                                                meetingType,
                                                location: meetingLocation,
                                                note: meetingNote,
                                            });
                                        }}
                                    >
                                        {meetingModalMode === 'reschedule' ? 'Request Reschedule' : 'Propose Time'}
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ════════════════════════════════════════════════════════════ */}
            {/* ── TAB: Overview ── */}
            {/* ════════════════════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
                <>
                    {/* Main Info Card */}
                    <Card className="p-6 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <h1 className="text-3xl font-light text-[var(--text-primary)]">{request.title}</h1>
                                <button
                                    type="button"
                                    className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] tracking-wide text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors group"
                                    title="Copy opportunity ID"
                                    onClick={() => {
                                        navigator.clipboard.writeText(request.id).catch(() => {});
                                        setCopiedId(true);
                                        setTimeout(() => setCopiedId(false), 2000);
                                    }}
                                >
                                    <span className="font-mono opacity-70 group-hover:opacity-100">{request.id}</span>
                                    {copiedId ? (
                                        <Check size={11} className="text-emerald-400" />
                                    ) : (
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                    )}
                                </button>
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
                                <div className="text-[var(--text-primary)] inline-flex items-start gap-1.5"><Heart size={16} className="text-[var(--color-gold)] shrink-0 mt-0.5" />{request.category}</div>
                            </div>
                            <div>
                                <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Amount</div>
                                <div className="text-[var(--color-gold)] inline-flex items-start gap-1.5"><DollarSign size={16} className="shrink-0 mt-0.5" />${request.targetAmount.toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Location</div>
                                <div className="text-[var(--text-primary)] inline-flex items-start gap-1.5"><MapPin size={16} className="text-[var(--color-gold)] shrink-0 mt-0.5" />{request.location}</div>
                            </div>
                            <div>
                                <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Submitted</div>
                                <div className="text-[var(--text-primary)] inline-flex items-start gap-1.5"><Calendar size={16} className="text-[var(--color-gold)] shrink-0 mt-0.5" />{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '—'}</div>
                            </div>
                        </div>
                    </Card>

                    {/* What to do next */}
                    {pendingTasksMerged.length > 0 && (
                        <Card className="p-6 space-y-4 border-[rgba(212,175,55,0.25)]">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium text-[var(--text-primary)]">What to do next</h2>
                                <span className="text-xs text-[var(--text-tertiary)]">
                                    {pendingCountMerged} task{pendingCountMerged !== 1 ? 's' : ''} remaining
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleTaskAction(pendingTasksMerged[0])}
                                className="w-full flex items-center justify-between p-4 rounded-xl bg-[rgba(212,175,55,0.06)] border border-[rgba(212,175,55,0.2)] hover:bg-[rgba(212,175,55,0.10)] transition-colors text-left"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-10 w-10 rounded-xl bg-[rgba(212,175,55,0.12)] flex items-center justify-center text-[var(--color-gold)]">
                                        {taskIcon(pendingTasksMerged[0])}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-[var(--text-primary)]">
                                            {pendingTasksMerged[0].label}
                                        </div>
                                        <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                                            {pendingTasksMerged[0].description}
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-[var(--text-tertiary)] shrink-0 ml-3" />
                            </button>

                            {pendingCountMerged > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('tasks')}
                                    className="text-sm text-[var(--color-gold)] hover:underline"
                                >
                                    View all {pendingCountMerged} tasks
                                </button>
                            )}
                        </Card>
                    )}

                    {/* Timeline */}
                    <Card className="p-6">
                        <div className="flex items-center gap-2 text-lg font-medium text-[var(--text-primary)] mb-4">
                            <Clock3 size={18} className="text-[var(--color-gold)]" />
                            Timeline
                        </div>
                        {timelineEvents.length === 0 ? (
                            <div className="text-sm text-[var(--text-tertiary)]">No activity yet. Click the stepper dots above to simulate concierge progress.</div>
                        ) : (
                            <div className="relative">
                                <div className="absolute z-0 left-[22px] top-2 bottom-2 w-px bg-[var(--border-subtle)]" />
                                <div className="relative z-10 space-y-4">
                                    {timelineEvents.map((e, i) => (
                                        <div key={i} className="relative pl-16">
                                            <div className="absolute left-0 top-0 h-11 w-11 rounded-xl border border-[rgba(var(--accent-rgb),0.45)] bg-[linear-gradient(180deg,rgba(18,19,22,1),rgba(18,19,22,1)),linear-gradient(135deg,rgba(212,175,55,0.18),rgba(212,175,55,0.10))] text-[var(--color-gold)] flex items-center justify-center">
                                                {timelineIcon(e.type)}
                                            </div>
                                            <div className="text-xl font-light text-[var(--text-primary)] leading-none pt-1">
                                                {humanizeEventTypeOrg(e.type)}
                                            </div>
                                            <div className="text-xs text-[var(--text-tertiary)] mt-1">
                                                {eventTimestamp(e)}
                                                {e.type === 'scheduled' && scheduledForTimestamp(e)
                                                    ? ` • meeting at ${scheduledForTimestamp(e)}`
                                                    : ''}
                                            </div>
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
                    </Card>
                </>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* ── TAB: Tasks ── */}
            {/* ════════════════════════════════════════════════════════════ */}
            {activeTab === 'tasks' && (
                <>
                    {/* Tasks to complete */}
                    {pendingTasksMerged.length > 0 && (
                        <Card className="p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center min-w-[28px] h-[28px] px-1.5 rounded-lg text-sm font-bold bg-[rgba(234,179,8,0.12)] text-amber-400">
                                    {pendingCountMerged}
                                </span>
                                <h2 className="text-lg font-medium text-[var(--text-primary)]">Tasks to complete</h2>
                            </div>
                            <div className="divide-y divide-[var(--border-subtle)]">
                                {pendingTasksMerged.map((task) => (
                                    <div key={task.id}>
                                        <button
                                            type="button"
                                            onClick={() => handleTaskAction(task)}
                                            className="w-full flex items-center justify-between py-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors text-left -mx-2 px-2 rounded-lg"
                                        >
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium text-[var(--text-primary)]">{task.label}</div>
                                                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{task.description}</div>
                                            </div>
                                            <ChevronRight size={18} className="text-[var(--text-tertiary)] shrink-0 ml-3" />
                                        </button>

                                        {/* Inline: more-info concierge note + share links */}
                                        {task.id === 'more-info' && (
                                            <div className="pb-4 space-y-3">
                                                {infoRequestEvent && Boolean(infoRequestEvent.meta?.note) && (
                                                    <div className="text-sm text-[var(--text-secondary)] bg-[rgba(255,255,255,0.02)] rounded-lg px-3 py-2 border border-[var(--border-subtle)]">
                                                        {String(infoRequestEvent.meta?.note)}
                                                    </div>
                                                )}
                                                {infoRequestEvent && Array.isArray(infoRequestEvent.meta?.requestedDocs) && (
                                                    <div className="space-y-1.5">
                                                        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Required Documents</div>
                                                        {(infoRequestEvent.meta?.requestedDocs as string[]).map((doc, i) => (
                                                            <div key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                                                <FileText size={13} className="text-[var(--color-gold)] shrink-0" />
                                                                {doc}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {moreInfoLink && (
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={copyLink}
                                                            className="inline-flex items-center gap-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--color-gold)] transition-colors"
                                                        >
                                                            <Copy size={12} />
                                                            {linkCopied ? 'Copied!' : 'Copy link'}
                                                        </button>
                                                        <a
                                                            href={moreInfoLink}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--color-gold)] transition-colors"
                                                        >
                                                            <ExternalLink size={12} />
                                                            Open in new tab
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Inline: meeting action buttons */}
                                        {task.id === 'meeting' && scheduledEvent && (
                                            <div className="pb-4 space-y-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
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
                                                            <div className="text-[var(--text-primary)]">{humanizeMeetingType(scheduledEvent.meta?.meetingType)}</div>
                                                        </div>
                                                    )}
                                                    {Boolean(scheduledEvent.meta?.location) && (
                                                        <div>
                                                            <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Location</div>
                                                            <div className="text-[var(--text-primary)]">{String(scheduledEvent.meta?.location)}</div>
                                                        </div>
                                                    )}
                                                </div>
                                                {Boolean(scheduledEvent.meta?.orgResponse) && (
                                                    <div className="text-xs text-[var(--text-tertiary)]">
                                                        Status: {humanizeMeetingResponse(scheduledEvent.meta?.orgResponse)}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3">
                                                    <Button
                                                        variant="gold"
                                                        size="sm"
                                                        isLoading={meetingSubmitting}
                                                        onClick={() => submitMeetingAction('accept', {
                                                            scheduledDate: String(scheduledEvent.meta?.scheduledDate || ''),
                                                            scheduledTime: String(scheduledEvent.meta?.scheduledTime || '14:00'),
                                                            meetingType: String(scheduledEvent.meta?.meetingType || 'zoom'),
                                                            location: String(scheduledEvent.meta?.location || ''),
                                                            note: '',
                                                        })}
                                                    >
                                                        Accept
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => openMeetingModal('reschedule')}>
                                                        Reschedule
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => openMeetingModal('propose_new_time')}>
                                                        Propose New Time
                                                    </Button>
                                                </div>
                                                {meetingError && (
                                                    <div className="text-xs text-red-300">{meetingError}</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Tasks completed */}
                    {completedTasksMerged.length > 0 && (
                        <Card className="p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center min-w-[28px] h-[28px] px-1.5 rounded-lg text-sm font-bold bg-[rgba(34,197,94,0.12)] text-emerald-400">
                                    {completedTasksMerged.length}
                                </span>
                                <h2 className="text-lg font-medium text-[var(--text-primary)]">Tasks completed</h2>
                            </div>
                            <div className="divide-y divide-[var(--border-subtle)]">
                                {completedTasksMerged.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center gap-3 py-4"
                                    >
                                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-sm text-[var(--text-secondary)]">{task.label}</div>
                                            {task.completedAt && (
                                                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                                                    {new Date(task.completedAt).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                        <ChevronRight size={16} className="text-[var(--text-tertiary)] shrink-0" />
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Empty state */}
                    {pendingTasksMerged.length === 0 && completedTasksMerged.length === 0 && (
                        <Card className="p-6 text-center">
                            <div className="text-[var(--text-tertiary)] text-sm py-8">
                                No tasks yet. Tasks will appear as your request progresses through the review process.
                            </div>
                        </Card>
                    )}
                </>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* ── TAB: Request Details ── */}
            {/* ════════════════════════════════════════════════════════════ */}
            {activeTab === 'details' && (
                <>
                    {/* Submitted more-info data (read-only) */}
                    {hasInfoRequest && hasSubmittedInfo && request.details && (
                        <Card className="p-6 space-y-4 border-[rgba(34,197,94,0.25)]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-lg font-medium text-[var(--text-primary)]">
                                    <CheckCircle2 size={18} className="text-emerald-400" />
                                    Additional Information Submitted
                                </div>
                                <span className="text-[10px] px-2 py-1 rounded-full bg-[rgba(34,197,94,0.12)] text-[rgba(34,197,94,0.92)] border border-[rgba(34,197,94,0.22)]">
                                    Submitted
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                {Object.entries(request.details).filter(([k, v]) => v && k !== 'updatedAt').map(([key, value]) => (
                                    <div key={key}>
                                        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-0.5">
                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())}
                                        </div>
                                        <div className="text-[var(--text-secondary)] whitespace-pre-line">{String(value)}</div>
                                    </div>
                                ))}
                            </div>
                            {moreInfoLink && (
                                <div className="pt-2 flex items-center gap-3">
                                    <a
                                        href={moreInfoLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs inline-flex items-center gap-1 text-[var(--color-gold)] hover:underline"
                                    >
                                        <ExternalLink size={11} />
                                        Edit / update information
                                    </a>
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Meeting Details (read-only — no action buttons) */}
                    {scheduledEvent && (
                        <Card className="p-6 space-y-4">
                            <div className="flex items-center gap-2 text-lg font-medium text-[var(--text-primary)]">
                                <Calendar size={18} className="text-[var(--color-gold)]" />
                                Meeting Details
                            </div>
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
                                        <div className="text-[var(--text-primary)]">{humanizeMeetingType(scheduledEvent.meta?.meetingType)}</div>
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
                            {Boolean(scheduledEvent.meta?.orgResponse) && (
                                <div>
                                    <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Organization Response</div>
                                    <p className="text-sm text-[var(--text-secondary)]">{humanizeMeetingResponse(scheduledEvent.meta?.orgResponse)}</p>
                                </div>
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
                            <div className="flex items-center gap-2 text-lg font-medium text-[var(--text-primary)]">
                                <Shield size={18} className="text-[var(--color-gold)]" />
                                Due Diligence Review
                            </div>
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

                    {/* Empty state */}
                    {!hasSubmittedInfo && !scheduledEvent && !meetingEvent?.meta && !diligenceEvent?.meta && !fundedEvent?.meta && (
                        <Card className="p-6 text-center">
                            <div className="text-[var(--text-tertiary)] text-sm py-8">
                                No details available yet. Information will appear here as your request progresses.
                            </div>
                        </Card>
                    )}
                </>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* ── TAB: Documents ── */}
            {/* ════════════════════════════════════════════════════════════ */}
            {activeTab === 'documents' && (
                <Card className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-lg font-medium text-[var(--text-primary)]">
                        <Paperclip size={18} className="text-[var(--color-gold)]" />
                        Documents
                    </div>

                    {request.evidence?.budget && (
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

                    {request.evidence?.files && request.evidence.files.length > 0 && (
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

                    {Array.isArray((request.details as any)?.supportingDocs) && (request.details as any).supportingDocs.length > 0 && (
                        <div>
                            <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1.5">Additional Information Documents</div>
                            <div className="space-y-1.5">
                                {((request.details as any).supportingDocs as { name: string; url: string }[]).map((f, i) => (
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

                    {dafGrants.length > 0 && (
                        <div>
                            <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1.5">Funding & Confirmations (DAF)</div>
                            <div className="space-y-2">
                                {dafGrants.map((grant) => (
                                    <div key={grant.id} className="rounded-lg border border-[var(--border-subtle)] p-3">
                                        <div className="text-xs text-[var(--text-tertiary)] mb-1">
                                            {grant.sponsorName} • ${Number(grant.amount || 0).toLocaleString()} • {grant.status.replace(/_/g, ' ')}
                                        </div>
                                        <div className="space-y-1.5">
                                            {grant.documents.map((doc) => (
                                                <a
                                                    key={doc.id}
                                                    href={doc.fileUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-2 text-sm text-[var(--color-gold)] hover:underline"
                                                >
                                                    <Paperclip size={13} />
                                                    {doc.fileName}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!hasDocuments && (
                        <div className="text-[var(--text-tertiary)] text-sm py-4">
                            No documents uploaded yet.
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
}
