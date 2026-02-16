'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Building2, Check, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, Clock3, DollarSign, FileCheck2, FileText, Heart, History, MapPin, MessageSquare, Paperclip, StickyNote, X as XIcon, Zap } from 'lucide-react';
import { useLeverage } from '@/components/providers/LeverageContext';
import { AnimatePresence, motion } from 'framer-motion';

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
};

type WorkflowStage = 'discover' | 'info_requested' | 'meeting' | 'due_diligence' | 'decision';
type WorkflowView = {
    stage: WorkflowStage;
    isPassed: boolean;
    isCommitted: boolean;
};

const WORKFLOW_STAGES: WorkflowStage[] = ['discover', 'info_requested', 'meeting', 'due_diligence', 'decision'];

function deriveWorkflow(detail: any): WorkflowView {
    const state = String(detail?.state || '').toLowerCase();
    const events = Array.isArray(detail?.events) ? detail.events : [];
    const hasDiligenceCompleted = events.some((e: any) => String(e?.type || '') === 'diligence_completed');
    const hasDiligenceSignal = events.some((e: any) => String(e?.type || '') === 'leverage_created');
    const hasMeetingCompleted = events.some((e: any) => String(e?.type || '') === 'meeting_completed');
    const hasMeetingScheduled = events.some((e: any) => String(e?.type || '') === 'scheduled');
    const hasInfoRequested = events.some((e: any) => String(e?.type || '') === 'request_info');

    if (state === 'passed') return { stage: 'decision', isPassed: true, isCommitted: false };
    if (state === 'funded') return { stage: 'decision', isPassed: false, isCommitted: true };
    if (hasDiligenceCompleted) return { stage: 'decision', isPassed: false, isCommitted: false };
    if (hasMeetingCompleted) return { stage: 'due_diligence', isPassed: false, isCommitted: false };
    if (hasDiligenceSignal) return { stage: 'due_diligence', isPassed: false, isCommitted: false };
    if (hasMeetingScheduled) return { stage: 'meeting', isPassed: false, isCommitted: false };
    if (hasInfoRequested) return { stage: 'info_requested', isPassed: false, isCommitted: false };
    if (state === 'scheduled') return { stage: 'meeting', isPassed: false, isCommitted: false };
    if (state === 'requested_info') return { stage: 'info_requested', isPassed: false, isCommitted: false };
    return { stage: 'discover', isPassed: false, isCommitted: false };
}

function deriveStatusMessage(flow: WorkflowView) {
    if (flow.isPassed) return 'Decision: Passed on this opportunity';
    if (flow.isCommitted) return 'Decision: Commitment confirmed';
    if (flow.stage === 'discover') return 'Next step: Request additional information or schedule a meeting';
    if (flow.stage === 'info_requested') return 'Waiting on: Organization response to information request';
    if (flow.stage === 'meeting') return 'Next step: Continue with due diligence';
    if (flow.stage === 'due_diligence') return 'Action required: Complete diligence review and decide';
    return 'Decision point: Ready to commit or pass';
}

function humanizeEventType(type: string) {
    const t = String(type || '');
    const map: Record<string, string> = {
        save: 'Shortlisted',
        shortlist: 'Shortlisted',
        pass: 'Passed',
        request_info: 'Requested more info',
        info_received: 'Organization sent requested info',
        leverage_created: 'Drafted leverage offer',
        scheduled: 'Scheduled meeting',
        meeting_completed: 'Meeting completed',
        diligence_completed: 'Due diligence completed',
        funded: 'Committed',
        reset: 'Reset',
    };
    if (map[t]) return map[t];
    return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
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

function splitIsoToDateTime(input: string | null | undefined) {
    const raw = String(input || '');
    if (!raw) return { date: '', time: '' };
    const normalized = raw.includes('T') ? raw : `${raw}T00:00:00`;
    const [datePart, timePart = ''] = normalized.split('T');
    const hhmm = timePart.slice(0, 5);
    return { date: datePart || '', time: hhmm || '' };
}

function timelineIcon(type: string) {
    const t = String(type || '');
    if (t === 'save' || t === 'shortlist') return <Check size={15} />;
    if (t === 'request_info') return <MessageSquare size={15} />;
    if (t === 'info_received') return <CheckCircle2 size={15} />;
    if (t === 'scheduled') return <Clock3 size={15} />;
    if (t === 'meeting_completed') return <CheckCircle2 size={15} />;
    if (t === 'diligence_completed') return <FileCheck2 size={15} />;
    if (t === 'leverage_created') return <FileCheck2 size={15} />;
    if (t === 'funded') return <CheckCircle2 size={15} />;
    if (t === 'pass') return <XIcon size={15} />;
    return <Clock3 size={15} />;
}

function buildBaseChecklist() {
    return {
        financials: false,
        references: false,
        siteVisit: false,
        legalReview: false,
        impactVerification: false,
        financialAudit: false,
        rabbinicEndorsement: false,
        legalStructureVerification: false,
    };
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

export default function DonorFeed() {
    const [activeTab, setActiveTab] = useState<'discover' | 'shortlist' | 'passed'>('discover');
    const [rows, setRows] = useState<OpportunityRow[]>([]);
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const [detail, setDetail] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [moreInfoOpen, setMoreInfoOpen] = useState(false);
    const [moreInfoUrl, setMoreInfoUrl] = useState<string | null>(null);
    const [moreInfoNote, setMoreInfoNote] = useState('');
    const [moreInfoSending, setMoreInfoSending] = useState(false);
    const [moreInfoSentTo, setMoreInfoSentTo] = useState<string | null>(null);
    const [moreInfoErr, setMoreInfoErr] = useState<string | null>(null);
    const [moreInfoCopied, setMoreInfoCopied] = useState(false);
    const [viewMode, setViewMode] = useState<'overview' | 'decision'>('overview');
    const [detailsExpanded, setDetailsExpanded] = useState(true);
    const [meetingCompleteByKey, setMeetingCompleteByKey] = useState<Record<string, boolean>>({});
    const [checklistByKey, setChecklistByKey] = useState<Record<string, Record<string, boolean>>>({});
    const [forcedStageByKey, setForcedStageByKey] = useState<Record<string, WorkflowStage>>({});
    const [scheduleMeetingOpen, setScheduleMeetingOpen] = useState(false);
    const [scheduleMeetingDraft, setScheduleMeetingDraft] = useState({
        date: '',
        time: '',
        meetingType: 'zoom',
        notes: '',
        isReschedule: false,
    });
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [notesText, setNotesText] = useState('');
    const [notesEditing, setNotesEditing] = useState(false);
    const [notesSaving, setNotesSaving] = useState(false);
    const notesSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const detailTopRef = useRef<HTMLDivElement>(null);
    const [postMeetingOpen, setPostMeetingOpen] = useState(false);
    const postMeetingFilesRef = useRef<File[]>([]);
    const [postMeetingDraft, setPostMeetingDraft] = useState({
        summary: '',
        tone: '',
        confirmRequestedAmount: 'yes',
        amountNegotiable: 'yes',
        expectedTimeline: '',
        documentNames: [] as string[],
        followUps: {
            siteVisit: false,
            referenceCalls: false,
            financialAudit: false,
            rabbinicEndorsement: false,
            legalStructureVerification: false,
        },
    });

    const router = useRouter();
    const { lastOpportunityUpdate, openLeverageDrawer } = useLeverage();

    const stateToTab = (s: string) => {
        if (s === 'passed') return 'passed';
        if (s === 'shortlisted' || s === 'scheduled' || s === 'funded') return 'shortlist';
        return 'discover';
    };

    const filterRows = (all: OpportunityRow[], tab: 'discover' | 'shortlist' | 'passed') =>
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
            return next;
        } catch (e: any) {
            setError(e?.message || 'Failed to load opportunities');
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh().catch(() => {});
    }, []);

    const filtered = useMemo(() => {
        return filterRows(rows, activeTab);
    }, [rows, activeTab]);

    const completenessLabel = (details: any) => {
        if (!details) return 'Basic';
        const fields = [
            details.orgWebsite,
            details.mission,
            details.program,
            details.geo,
            details.beneficiaries,
            details.budget,
            details.amountRequested,
            details.timeline,
            details.governance,
            details.leadership,
            details.proofLinks,
        ].filter((v) => typeof v === 'string' && v.trim().length > 0);
        if (fields.length >= 9) return 'Comprehensive';
        if (fields.length >= 5) return 'Detailed';
        return 'Basic';
    };

    const loadDetail = async (key: string) => {
        setSelectedKey(key);
        try {
            setDetailLoading(true);
            const res = await fetch(`/api/opportunities/${encodeURIComponent(key)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Failed to load');
            setDetail(data);
            // Fresh opportunities open in overview; progressed opportunities open directly in review mode.
            const flow = deriveWorkflow(data);
            const isProgressed = flow.isPassed || flow.isCommitted || flow.stage !== 'discover';
            setViewMode(isProgressed ? 'decision' : 'overview');
            // Always expand full details for progressed opportunities (user can manually collapse).
            setDetailsExpanded(true);

            // Restore checklist state from persisted meeting_completed event
            const events = Array.isArray(data?.events) ? data.events : [];
            const meetingEvt = events.find((e: any) => String(e?.type || '') === 'meeting_completed');
            if (meetingEvt?.meta?.followUps) {
                const fu = meetingEvt.meta.followUps;
                const checklist = buildBaseChecklist();
                checklist.siteVisit = Boolean(fu.siteVisit);
                checklist.references = Boolean(fu.referenceCalls);
                checklist.financialAudit = Boolean(fu.financialAudit);
                checklist.rabbinicEndorsement = Boolean(fu.rabbinicEndorsement);
                checklist.legalStructureVerification = Boolean(fu.legalStructureVerification);
                setChecklistByKey((prev) => ({ ...prev, [key]: prev[key] || checklist }));
                setMeetingCompleteByKey((prev) => ({ ...prev, [key]: true }));
            }

            // Seed notes from persisted data
            setNotesText(data?.notes || '');
            setNotesEditing(false);
        } catch {
            setDetail(null);
        } finally {
            setDetailLoading(false);
        }
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

    // When leverage is created via the drawer (separate endpoint), refresh the selected opportunity detail
    // so History updates immediately without requiring a manual Refresh click.
    useEffect(() => {
        if (!lastOpportunityUpdate?.key) return;
        if (!selectedKey) return;
        if (String(lastOpportunityUpdate.key) !== String(selectedKey)) return;
        loadDetail(selectedKey).catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastOpportunityUpdate?.at]);

    const act = async (key: string, action: string, meta?: any) => {
        try {
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

            const stayActions = ['request_info', 'scheduled', 'meeting_completed', 'info_received', 'diligence_completed', 'funded'];
            if (selectedKey === key && stayActions.includes(action)) {
                // Progression actions keep the donor on this opportunity in the shortlist tab.
                setActiveTab('shortlist');
                await loadDetail(key);
                return data;
            }

            // If the acted-on row was selected, advance selection to the next item in the left list.
            // This prevents the right pane from showing a row that no longer exists in the active tab.
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

    // Keep selection in sync with the active tab/list.
    useEffect(() => {
        if (loading) return;
        const list = filterRows(rows, activeTab);
        if (!list.length) {
            if (selectedKey !== null) setSelectedKey(null);
            if (detail !== null) setDetail(null);
            return;
        }
        if (!selectedKey || !list.some((r) => r.key === selectedKey)) {
            // Auto-select the first item in the tab.
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
    const currentKey = String(detail?.opportunity?.key || '');
    const orgResponded = Boolean(detail?.opportunity?.details || detail?.opportunity?.moreInfoSubmittedAt);
    const meetingComplete = Boolean(currentKey && meetingCompleteByKey[currentKey]);
    const checklistItems = checklistByKey[currentKey] || buildBaseChecklist();

    const latestScheduledAt = useMemo(() => {
        const events = Array.isArray(detail?.events) ? detail.events : [];
        const scheduled = events.filter((e: any) => String(e?.type || '') === 'scheduled');
        if (!scheduled.length) return '';
        const sorted = [...scheduled].sort((a: any, b: any) => {
            const av = String(a?.createdAt || a?.meta?.scheduledFor || '');
            const bv = String(b?.createdAt || b?.meta?.scheduledFor || '');
            return bv.localeCompare(av);
        });
        const top = sorted[0];
        return String(top?.meta?.scheduledFor || top?.scheduledFor || top?.meta?.scheduled_for || top?.createdAt || '');
    }, [detail?.events]);
    const effectiveStage: WorkflowStage =
        workflow.isPassed || workflow.isCommitted
            ? workflow.stage
            : forcedStageByKey[currentKey]
                ? forcedStageByKey[currentKey]
                : workflow.stage;
    const displayWorkflow: WorkflowView = { ...workflow, stage: effectiveStage };
    const statusMessage = useMemo(() => deriveStatusMessage(displayWorkflow), [displayWorkflow]);

    const openRequestInfoFlow = async () => {
        if (!detail?.opportunity?.key) return;
        setMoreInfoErr(null);
        setMoreInfoSentTo(null);
        setMoreInfoCopied(false);
        setMoreInfoNote('');
        const r = await act(detail.opportunity.key, 'request_info');
        if (r?.moreInfoUrl) {
            setMoreInfoUrl(String(r.moreInfoUrl));
            setMoreInfoOpen(true);
        } else {
            setError('Could not generate a request-more-info link.');
        }
    };

    // Demo-only helper for fast stepper/progression tuning.
    const runDemoInfoResponse = async () => {
        if (!currentKey || !detail?.opportunity) return;
        const opp = detail.opportunity;
        const existingDetails = opp.details || {};
        const syntheticDetails = {
            mission:
                existingDetails.mission ||
                `${opp.orgName} provides verified delivery outcomes with measurable beneficiary impact.`,
            program:
                existingDetails.program ||
                `Program execution covering ${opp.location || 'priority communities'} with monthly reporting.`,
            budget:
                existingDetails.budget ||
                (summary.amount ? `$${Number(summary.amount).toLocaleString()}` : '$250,000'),
            amountRequested:
                existingDetails.amountRequested ||
                (summary.amount ? `$${Number(summary.amount).toLocaleString()}` : '$250,000'),
            timeline: existingDetails.timeline || 'Execution window: 6-9 months',
            governance: existingDetails.governance || 'Board oversight with quarterly review',
            leadership: existingDetails.leadership || `${opp.orgName} leadership team`,
            proofLinks:
                existingDetails.proofLinks ||
                'https://example.org/impact-report.pdf; https://example.org/audit.pdf',
        };

        await act(currentKey, 'info_received', { details: syntheticDetails });
        setViewMode('decision');
        setDetailsExpanded(false);
    };

    const appendDemoEvent = (type: string, meta: Record<string, any> = {}) => {
        setDetail((prev: any) => {
            if (!prev?.opportunity) return prev;
            const nowIso = new Date().toISOString();
            const existingEvents = Array.isArray(prev.events) ? prev.events : [];
            return {
                ...prev,
                events: [{ id: `demo_${type}_${Date.now()}`, type, meta: { source: 'demo_pipeline', ...meta }, createdAt: nowIso }, ...existingEvents],
            };
        });
    };

    const submitScheduleMeeting = async () => {
        if (!currentKey) return;
        const scheduledFor =
            scheduleMeetingDraft.date && scheduleMeetingDraft.time
                ? `${scheduleMeetingDraft.date}T${scheduleMeetingDraft.time}:00`
                : null;

        await act(currentKey, 'scheduled', {
            scheduledFor,
            meetingType: scheduleMeetingDraft.meetingType,
            notes: scheduleMeetingDraft.notes || undefined,
            rescheduled: scheduleMeetingDraft.isReschedule || undefined,
        });
        setMeetingCompleteByKey((prev) => ({ ...prev, [currentKey]: false }));
        setScheduleMeetingOpen(false);
        setScheduleMeetingDraft({
            date: '',
            time: '',
            meetingType: 'zoom',
            notes: '',
            isReschedule: false,
        });
    };

    const submitPostMeetingSummary = async () => {
        if (!currentKey) return;
        const checklistSeed = buildBaseChecklist();
        const followUp = postMeetingDraft.followUps;
        checklistSeed.siteVisit = Boolean(followUp.siteVisit);
        checklistSeed.references = Boolean(followUp.referenceCalls);
        checklistSeed.financialAudit = Boolean(followUp.financialAudit);
        checklistSeed.rabbinicEndorsement = Boolean(followUp.rabbinicEndorsement);
        checklistSeed.legalStructureVerification = Boolean(followUp.legalStructureVerification);

        // Upload files via /api/uploads and collect URLs
        let uploadedDocs: Array<{ name: string; url: string }> = [];
        const files = postMeetingFilesRef.current;
        if (files.length > 0) {
            try {
                const form = new FormData();
                files.forEach((f) => form.append('files', f));
                form.append('folder', 'evidence');
                const res = await fetch('/api/uploads', { method: 'POST', body: form });
                if (res.ok) {
                    const data = await res.json();
                    uploadedDocs = (data.files || []).map((f: any) => ({ name: f.name, url: f.url }));
                }
            } catch {
                // Fallback: store names without URLs
            }
        }
        // If upload didn't return results, fall back to name-only entries
        if (uploadedDocs.length === 0 && postMeetingDraft.documentNames.length > 0) {
            uploadedDocs = postMeetingDraft.documentNames.map((name) => ({ name, url: '' }));
        }

        setChecklistByKey((prev) => ({ ...prev, [currentKey]: checklistSeed }));
        setMeetingCompleteByKey((prev) => ({ ...prev, [currentKey]: true }));

        await act(currentKey, 'meeting_completed', {
            summary: postMeetingDraft.summary,
            tone: postMeetingDraft.tone,
            funding: {
                confirmRequestedAmount: postMeetingDraft.confirmRequestedAmount,
                amountNegotiable: postMeetingDraft.amountNegotiable,
                expectedTimeline: postMeetingDraft.expectedTimeline,
            },
            documents: uploadedDocs,
            followUps: postMeetingDraft.followUps,
        });

        postMeetingFilesRef.current = [];
        setPostMeetingOpen(false);
        setPostMeetingDraft({
            summary: '',
            tone: '',
            confirmRequestedAmount: 'yes',
            amountNegotiable: 'yes',
            expectedTimeline: '',
            documentNames: [],
            followUps: {
                siteVisit: false,
                referenceCalls: false,
                financialAudit: false,
                rabbinicEndorsement: false,
                legalStructureVerification: false,
            },
        });
    };

    return (
        <div className="space-y-6">
            <MoreInfoModal
                open={moreInfoOpen}
                onClose={() => setMoreInfoOpen(false)}
                url={moreInfoUrl}
                toEmail={(detail?.opportunity?.orgEmail || detail?.opportunity?.contactEmail || null) as string | null}
                note={moreInfoNote}
                setNote={setMoreInfoNote}
                sending={moreInfoSending}
                sentTo={moreInfoSentTo}
                err={moreInfoErr}
                copied={moreInfoCopied}
                onCopy={async () => {
                    if (!moreInfoUrl) return;
                    try {
                        await navigator.clipboard.writeText(moreInfoUrl);
                        setMoreInfoCopied(true);
                        window.setTimeout(() => setMoreInfoCopied(false), 1400);
                    } catch {
                        setMoreInfoErr('Copy failed. Please copy manually.');
                    }
                }}
                onSendEmail={async () => {
                    if (!detail?.opportunity?.key || !moreInfoUrl) return;
                    setMoreInfoErr(null);
                    setMoreInfoSending(true);
                    try {
                        const r = await act(detail.opportunity.key, 'request_info', {
                            sendEmail: true,
                            note: moreInfoNote,
                        });
                        const to = r?.emailSent?.to ? String(r.emailSent.to) : null;
                        if (to) setMoreInfoSentTo(to);
                        else setMoreInfoSentTo((detail?.opportunity?.orgEmail || detail?.opportunity?.contactEmail || null) as string | null);
                    } catch (e: any) {
                        setMoreInfoErr(String(e?.message || 'Failed to send email'));
                    } finally {
                        setMoreInfoSending(false);
                    }
                }}
            />
            <ScheduleMeetingModal
                open={scheduleMeetingOpen}
                onClose={() => setScheduleMeetingOpen(false)}
                values={scheduleMeetingDraft}
                setValues={setScheduleMeetingDraft}
                onSubmit={submitScheduleMeeting}
            />
            <PostMeetingSummaryModal
                open={postMeetingOpen}
                onClose={() => setPostMeetingOpen(false)}
                values={postMeetingDraft}
                setValues={setPostMeetingDraft}
                onSubmit={submitPostMeetingSummary}
                onFilesChange={(files) => { postMeetingFilesRef.current = [...postMeetingFilesRef.current, ...files]; }}
            />
            <header className="flex justify-between items-end gap-6">
                <div>
                    <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Opportunities</h1>
                    <p className="text-secondary">Email-list-first dashboard. Actions persist.</p>
                </div>
            </header>

            {/* TABS */}
            <div className="flex gap-8 border-b border-[var(--border-subtle)]">
                <button
                    onClick={() => setActiveTab('discover')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'discover'
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                        }`}
                >
                    Discover
                    {activeTab === 'discover' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-gold)]" />}
                </button>
                <button
                    onClick={() => setActiveTab('shortlist')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'shortlist'
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                        }`}
                >
                    Shortlist
                    {activeTab === 'shortlist' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-gold)]" />}
                </button>
                <button
                    onClick={() => setActiveTab('passed')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'passed'
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                        }`}
                >
                    Passed
                    {activeTab === 'passed' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-gold)]" />}
                </button>
            </div>

            {error ? <div className="text-sm text-red-300">{error}</div> : null}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: list */}
                <Card className="p-0 lg:col-span-1 overflow-hidden">
                    <div className="px-5 py-4 border-b border-[var(--border-subtle)] text-sm font-semibold text-[var(--text-primary)]">
                        {activeTab === 'discover' ? 'Discover' : activeTab === 'shortlist' ? 'Shortlist' : 'Passed'}
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
                                        <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.04)] text-[var(--text-tertiary)]">
                                            {r.source === 'submission' ? 'submission' : 'curated'}
                                        </span>
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
                            <div ref={detailTopRef} className="space-y-5">
                                <div className="min-w-0">
                                    <h2 className="text-4xl leading-tight font-light text-[var(--text-primary)]">
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

                                {viewMode === 'overview' ? (
                                    <>
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
                                                            <div key={`overview-org-${idx}`} className="flex items-center gap-2 text-sm">
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
                                                            <div key={`overview-mdoc-${i}`} className="flex items-center gap-2 text-sm">
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
                                                    {notesText || detail.opportunity.whyNow || <span className="text-[var(--text-tertiary)] italic">Click to add notes...</span>}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex justify-center pt-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setViewMode('decision');
                                                    setDetailsExpanded(true);
                                                }}
                                                className="inline-flex h-12 min-w-[190px] items-center justify-center gap-1.5 rounded-[10px] border border-[rgba(var(--accent-rgb),0.65)] bg-[var(--color-gold)] px-6 text-[15px] font-normal text-[#151515] shadow-[0_8px_18px_rgba(212,175,55,0.22),0_0_20px_rgba(212,175,55,0.14)] transform-gpu transition-all duration-200 hover:scale-[1.08] hover:translate-y-[-1px] hover:shadow-[0_12px_24px_rgba(212,175,55,0.28),0_0_30px_rgba(212,175,55,0.2)] active:scale-[1.03]"
                                            >
                                                Continue to Review
                                                <ChevronRight size={13} />
                                            </button>
                                        </div>

                                        <div className="opacity-35 pt-2">
                                            <OpportunityStepper
                                                stage={displayWorkflow.stage}
                                                isPassed={displayWorkflow.isPassed}
                                                isCommitted={displayWorkflow.isCommitted}
                                                compact
                                                onStepClick={(clickedStage) => {
                                                    if (clickedStage === 'info_requested' && displayWorkflow.stage === 'info_requested' && !orgResponded) {
                                                        runDemoInfoResponse();
                                                    }
                                                }}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <OpportunityStepper
                                            stage={displayWorkflow.stage}
                                            isPassed={displayWorkflow.isPassed}
                                            isCommitted={displayWorkflow.isCommitted}
                                            onStepClick={(clickedStage) => {
                                                if (clickedStage === 'info_requested' && displayWorkflow.stage === 'info_requested' && !orgResponded) {
                                                    runDemoInfoResponse();
                                                }
                                            }}
                                        />
                                        <div className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] px-4 py-3 flex items-center gap-2">
                                            {displayWorkflow.isCommitted || displayWorkflow.isPassed ? <CheckCircle2 size={16} className="text-[var(--color-gold)]" /> : displayWorkflow.stage === 'info_requested' ? <Clock3 size={16} className="text-[var(--text-tertiary)]" /> : <AlertCircle size={16} className="text-[var(--color-gold)]" />}
                                            <span className="text-sm text-[var(--text-secondary)]">{statusMessage}</span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            {displayWorkflow.stage === 'discover' ? (
                                                <Button variant="gold" onClick={openRequestInfoFlow}>
                                                    Request Info
                                                </Button>
                                            ) : null}
                                            {displayWorkflow.stage === 'info_requested' ? (
                                                orgResponded ? (
                                                    <Button
                                                        variant="gold"
                                                        onClick={() => {
                                                            const prefill = splitIsoToDateTime(latestScheduledAt);
                                                            setScheduleMeetingDraft({
                                                                date: prefill.date,
                                                                time: prefill.time,
                                                                meetingType: 'zoom',
                                                                notes: '',
                                                                isReschedule: false,
                                                            });
                                                            setScheduleMeetingOpen(true);
                                                        }}
                                                    >
                                                        Schedule Meeting
                                                    </Button>
                                                ) : (
                                                    <Button variant="outline" disabled>
                                                        Waiting for response
                                                    </Button>
                                                )
                                            ) : null}
                                            {displayWorkflow.stage === 'meeting' ? (
                                                meetingComplete ? (
                                                    <Button
                                                        variant="gold"
                                                        onClick={() => {
                                                            setForcedStageByKey((prev) => ({ ...prev, [currentKey]: 'due_diligence' }));
                                                        }}
                                                    >
                                                        Begin Review
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <Button
                                                            variant="gold"
                                                            onClick={() => {
                                                                const prefill = splitIsoToDateTime(latestScheduledAt);
                                                                setScheduleMeetingDraft({
                                                                    date: prefill.date,
                                                                    time: prefill.time,
                                                                    meetingType: 'zoom',
                                                                    notes: '',
                                                                    isReschedule: true,
                                                                });
                                                                setScheduleMeetingOpen(true);
                                                            }}
                                                        >
                                                            Reschedule
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setPostMeetingDraft({
                                                                    summary: '',
                                                                    tone: '',
                                                                    confirmRequestedAmount: 'yes',
                                                                    amountNegotiable: 'yes',
                                                                    expectedTimeline: String(detail?.opportunity?.details?.timeline || ''),
                                                                    documentNames: [],
                                                                    followUps: {
                                                                        siteVisit: false,
                                                                        referenceCalls: false,
                                                                        financialAudit: false,
                                                                        rabbinicEndorsement: false,
                                                                        legalStructureVerification: false,
                                                                    },
                                                                });
                                                                setPostMeetingOpen(true);
                                                            }}
                                                        >
                                                            Mark Meeting Complete
                                                        </Button>
                                                    </>
                                                )
                                            ) : null}
                                            {displayWorkflow.stage === 'due_diligence' ? (
                                                <Button
                                                    variant="gold"
                                                    onClick={async () => {
                                                        await act(detail.opportunity.key, 'diligence_completed');
                                                    }}
                                                >
                                                    Complete Due Diligence
                                                </Button>
                                            ) : null}
                                            {displayWorkflow.stage === 'decision' && !displayWorkflow.isCommitted && !displayWorkflow.isPassed ? (
                                                <>
                                                    <Button
                                                        variant="gold"
                                                        onClick={async () => {
                                                            await act(detail.opportunity.key, 'funded');
                                                            router.push('/donor/pledges');
                                                        }}
                                                    >
                                                        Approve &amp; Pledge
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
                                                        Structure Leverage
                                                    </Button>
                                                </>
                                            ) : null}
                                            {!displayWorkflow.isCommitted && !displayWorkflow.isPassed ? (
                                                <Button variant="outline" onClick={() => act(detail.opportunity.key, 'pass')}>
                                                    {displayWorkflow.stage === 'discover'
                                                        ? 'Pass'
                                                        : displayWorkflow.stage === 'meeting'
                                                            ? 'Cancel Interest'
                                                            : 'Not this opportunity'}
                                                </Button>
                                            ) : null}
                                        </div>

                                        {/* Engagement Timeline — right after action buttons */}
                                        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-6">
                                            <div className="text-2xl font-light text-[var(--text-primary)] inline-flex items-center gap-2 mb-4"><Clock3 size={18} className="text-[var(--color-gold)]" />Engagement Timeline</div>
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

                                        {displayWorkflow.stage === 'due_diligence' ? (
                                            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-5 space-y-3">
                                                <div className="text-sm font-medium text-[var(--text-primary)]">Diligence Checklist</div>
                                                {Object.entries(checklistItems).map(([key, checked]) => (
                                                    <label key={key} className="flex items-center justify-between gap-3 text-sm text-[var(--text-secondary)]">
                                                        <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}</span>
                                                        <input
                                                            type="checkbox"
                                                            checked={Boolean(checked)}
                                                            onChange={(e) => {
                                                                const next = {
                                                                    ...checklistItems,
                                                                    [key]: e.target.checked,
                                                                };
                                                                setChecklistByKey((prev) => ({ ...prev, [currentKey]: next }));
                                                            }}
                                                        />
                                                    </label>
                                                ))}
                                            </div>
                                        ) : null}

                                        {/* Meeting Outcomes — extracted from the meeting_completed event */}
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
                                            const docs: Array<{ name: string; url: string }> = Array.isArray(m.documents)
                                                ? m.documents.filter((d: any) => d?.name)
                                                : Array.isArray(m.documentNames)
                                                    ? m.documentNames.filter(Boolean).map((n: string) => ({ name: n, url: '' }))
                                                    : [];
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

                                                    {docs.length > 0 ? (
                                                        <div>
                                                            <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Documents Received</div>
                                                            <div className="space-y-1">
                                                                {docs.map((doc, i) => (
                                                                    <div key={i} className="flex items-center gap-2 text-sm">
                                                                        <Paperclip size={13} className="text-[var(--color-gold)] shrink-0" />
                                                                        {doc.url ? (
                                                                            <a
                                                                                href={doc.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-[var(--color-gold)] underline underline-offset-2 hover:text-[var(--text-primary)] transition-colors"
                                                                            >
                                                                                {doc.name}
                                                                            </a>
                                                                        ) : (
                                                                            <span className="text-[var(--text-secondary)]">{doc.name}</span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : null}

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

                                        {/* Summary card — visible above Full Details, hidden when details expanded */}
                                        {!detailsExpanded ? (
                                            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div><div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Cause</div><div className="text-[var(--text-primary)] inline-flex items-center gap-2"><Heart size={14} className="text-[var(--color-gold)]" />{summary.cause}</div></div>
                                                <div><div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Amount</div><div className="text-[var(--color-gold)] inline-flex items-center gap-2"><DollarSign size={14} />{summary.amount ? `$${Number(summary.amount).toLocaleString()}` : '—'}</div></div>
                                                <div><div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Geography</div><div className="text-[var(--text-primary)] inline-flex items-center gap-2"><MapPin size={14} className="text-[var(--color-gold)]" />{summary.geo}</div></div>
                                                <div><div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Urgency</div><div className="text-[var(--text-primary)] inline-flex items-center gap-2"><Clock3 size={14} className="text-[var(--color-gold)]" />{summary.urgency}</div></div>
                                            </div>
                                        ) : null}

                                        <button
                                            type="button"
                                            onClick={() => setDetailsExpanded((v) => !v)}
                                            className="w-full rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] px-4 py-4 flex items-center justify-between text-lg font-light text-[var(--text-primary)]"
                                        >
                                            <span className="inline-flex items-center gap-2"><FileText size={18} className="text-[var(--color-gold)]" />Full Details</span>
                                            {detailsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                    </>
                                )}

                                {viewMode === 'decision' && detailsExpanded ? (
                                    <div
                                        className={[
                                            'transition-opacity space-y-5',
                                            'opacity-100',
                                        ].join(' ')}
                                    >
                                        {viewMode === 'decision' ? (
                                            <div className="space-y-5">
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
                                                                    <div key={`detail-org-${idx}`} className="flex items-center gap-2 text-sm">
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
                                                                    <div key={`detail-mdoc-${i}`} className="flex items-center gap-2 text-sm">
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
                                        ) : null}
                                        <div className="flex justify-center pt-2">
                                            <button
                                                type="button"
                                                onClick={() => detailTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[10px] border border-[rgba(var(--accent-rgb),0.45)] bg-[rgba(var(--accent-rgb),0.1)] px-5 text-[14px] font-normal text-[var(--color-gold)] transition-all hover:translate-y-[-1px] hover:bg-[rgba(var(--accent-rgb),0.16)] hover:shadow-[0_10px_20px_rgba(212,175,55,0.14)]"
                                            >
                                                Review from the Top
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </div>
        </div>
    );
}

function OpportunityStepper(props: {
    stage: WorkflowStage;
    isPassed: boolean;
    isCommitted: boolean;
    compact?: boolean;
    onStepClick?: (stage: WorkflowStage) => void;
}) {
    const { stage, isPassed, isCommitted, compact = false, onStepClick } = props;
    const currentIndex = WORKFLOW_STAGES.indexOf(stage);
    const nodeSize = compact ? 'h-6 w-6' : 'h-10 w-10';
    const lineTop = compact ? 12 : 20;
    const labelClass = compact
        ? 'mt-4 text-[11px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]'
        : 'mt-3 text-[13px] text-[var(--text-tertiary)]';

    const stepCount = WORKFLOW_STAGES.length;
    const progressRatio = Math.max(0, Math.min(1, currentIndex / (stepCount - 1)));
    const railInsetPercent = 10; // center of first/last column in a 5-col grid
    const railSpanPercent = 100 - railInsetPercent * 2;
    const progressWidth = `${progressRatio * railSpanPercent}%`;

    return (
        <div className={compact ? 'py-1 px-1' : 'py-2'}>
            <div className="relative px-3">
                <div
                    className="absolute h-px bg-[var(--border-subtle)]"
                    style={{ top: lineTop, left: `${railInsetPercent}%`, right: `${railInsetPercent}%` }}
                />
                {!isPassed ? (
                    <div
                        className="absolute h-px bg-[var(--color-gold)]"
                        style={{ top: lineTop, left: `${railInsetPercent}%`, width: progressWidth }}
                    />
                ) : null}
                <div className="relative z-10 grid grid-cols-5 gap-2">
                {WORKFLOW_STAGES.map((label, idx) => {
                    const isCurrent = idx === currentIndex;
                    const isDone = idx < currentIndex || (idx === WORKFLOW_STAGES.length - 1 && isCommitted);
                    const isDecision = idx === WORKFLOW_STAGES.length - 1;
                    const isPassedNode = isDecision && isPassed;
                    return (
                        <div key={label} className="text-center">
                            <button
                                type="button"
                                onClick={() => onStepClick?.(label)}
                                className="w-full"
                                title={compact ? undefined : `Set stage: ${label.replace('_', ' ')}`}
                            >
                            <div
                                className={[
                                    `mx-auto ${nodeSize} rounded-full border flex items-center justify-center`,
                                    'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
                                    isCurrent ? 'border-[var(--color-gold)] bg-[rgba(24,24,28,1)] shadow-[0_0_18px_rgba(212,175,55,0.42)]' : '',
                                    isDone ? 'border-[var(--color-gold)] bg-[var(--color-gold)] text-black shadow-[0_0_20px_rgba(212,175,55,0.35)]' : '',
                                    isPassedNode ? 'border-red-400/50 bg-[rgba(127,29,29,0.22)] text-red-300' : '',
                                    !isCurrent && !isDone && !isPassedNode ? 'border-[var(--border-subtle)] bg-[rgba(34,35,39,1)]' : '',
                                ].join(' ')}
                            >
                                {isPassedNode ? (
                                    <XIcon size={12} />
                                ) : isDone ? (
                                    <Check size={12} />
                                ) : isCurrent ? (
                                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-gold)] shadow-[0_0_10px_rgba(212,175,55,0.55)]" />
                                ) : null}
                            </div>
                            <div className={labelClass}>
                                {label.replace('_', ' ')}
                            </div>
                            </button>
                        </div>
                    );
                })}
                </div>
            </div>
        </div>
    );
}

function MoreInfoModal(props: {
    open: boolean;
    onClose: () => void;
    url: string | null;
    toEmail: string | null;
    note: string;
    setNote: (v: string) => void;
    sending: boolean;
    sentTo: string | null;
    err: string | null;
    copied: boolean;
    onCopy: () => void;
    onSendEmail: () => void;
}) {
    const {
        open,
        onClose,
        url,
        toEmail,
        note,
        setNote,
        sending,
        sentTo,
        err,
        copied,
        onCopy,
        onSendEmail,
    } = props;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.2, 0.9, 0.2, 1] }}
                className="relative w-full max-w-2xl"
            >
                <Card className="p-6 md:p-7 border border-[rgba(var(--silver-rgb),0.18)] shadow-[0_20px_80px_rgba(0,0,0,0.65)]">
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <div className="text-xs tracking-[0.22em] uppercase text-[var(--text-tertiary)]">
                                Request more info
                            </div>
                            <div className="text-xl md:text-2xl font-semibold text-[var(--text-primary)] mt-1">
                                Share a secure form link
                            </div>
                            <div className="text-sm text-[var(--text-secondary)] mt-2">
                                Send the organization a link to complete a more detailed diligence form. (MVP)
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-10 h-10 rounded-lg border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)]"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-5">
                            <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">
                                Link
                            </div>
                            <div className="text-sm text-[var(--text-secondary)] break-all">
                                {url || '—'}
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Button variant="outline" onClick={onCopy} disabled={!url}>
                                    {copied ? 'Copied' : 'Copy link'}
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[rgba(var(--accent-rgb),0.18)] bg-[rgba(var(--accent-rgb),0.06)] p-5">
                            <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">
                                Email (Mailgun)
                            </div>
                            <div className="text-sm text-[var(--text-secondary)]">
                                {toEmail ? (
                                    <>
                                        Will send to: <span className="text-[var(--text-primary)]">{toEmail}</span>
                                    </>
                                ) : (
                                    <span className="text-[var(--text-tertiary)]">
                                        No organization email on file for this submission.
                                    </span>
                                )}
                            </div>
                            <div className="mt-4">
                                <label className="block text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">
                                    Optional note
                                </label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={3}
                                    placeholder="Add a short message (optional)…"
                                    className="w-full rounded-lg px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[rgba(var(--accent-rgb),0.35)] shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)]"
                                />
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Button variant="gold" onClick={onSendEmail} disabled={!toEmail || !url || sending}>
                                    {sending ? 'Sending…' : 'Send email'}
                                </Button>
                            </div>
                            {sentTo ? (
                                <div className="mt-3 text-sm text-[var(--text-secondary)]">
                                    Sent to <span className="text-[var(--text-primary)]">{sentTo}</span>.
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {err ? <div className="mt-4 text-sm text-red-300">{err}</div> : null}
                </Card>
            </motion.div>
        </div>
    );
}

function ScheduleMeetingModal(props: {
    open: boolean;
    onClose: () => void;
    values: {
        date: string;
        time: string;
        meetingType: string;
        notes: string;
        isReschedule: boolean;
    };
    setValues: (next: {
        date: string;
        time: string;
        meetingType: string;
        notes: string;
        isReschedule: boolean;
    }) => void;
    onSubmit: () => void;
}) {
    const { open, onClose, values, setValues, onSubmit } = props;
    if (!open) return null;

    const canSubmit = Boolean(values.date && values.time);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.2, 0.9, 0.2, 1] }}
                className="relative w-full max-w-xl"
            >
                <Card className="p-6 md:p-7 border border-[rgba(var(--silver-rgb),0.18)] shadow-[0_20px_80px_rgba(0,0,0,0.65)]">
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <div className="text-xs tracking-[0.22em] uppercase text-[var(--text-tertiary)]">
                                Meeting planner
                            </div>
                            <div className="text-xl md:text-2xl font-semibold text-[var(--text-primary)] mt-1">
                                {values.isReschedule ? 'Reschedule Meeting' : 'Schedule Meeting'}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-10 h-10 rounded-lg border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)]"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Date</label>
                            <input
                                type="date"
                                value={values.date}
                                onChange={(e) => setValues({ ...values, date: e.target.value })}
                                className="schedule-picker-dark w-full rounded-lg px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:border-[rgba(var(--accent-rgb),0.35)]"
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Time</label>
                            <input
                                type="time"
                                value={values.time}
                                onChange={(e) => setValues({ ...values, time: e.target.value })}
                                className="schedule-picker-dark w-full rounded-lg px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:border-[rgba(var(--accent-rgb),0.35)]"
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Meeting type</label>
                            <select
                                value={values.meetingType}
                                onChange={(e) => setValues({ ...values, meetingType: e.target.value })}
                                className="w-full rounded-lg px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:border-[rgba(var(--accent-rgb),0.35)]"
                            >
                                <option value="zoom">Zoom</option>
                                <option value="phone">Phone</option>
                                <option value="in_person">In person</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Notes</label>
                            <textarea
                                rows={3}
                                value={values.notes}
                                onChange={(e) => setValues({ ...values, notes: e.target.value })}
                                placeholder="Optional meeting notes..."
                                className="w-full rounded-lg px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[rgba(var(--accent-rgb),0.35)]"
                            />
                        </div>
                    </div>

                    <div className="mt-5 flex items-center gap-2">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button variant="gold" onClick={onSubmit} disabled={!canSubmit}>
                            {values.isReschedule ? 'Confirm Reschedule' : 'Send Meeting Invite'}
                        </Button>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}

function PostMeetingSummaryModal(props: {
    open: boolean;
    onClose: () => void;
    values: {
        summary: string;
        tone: string;
        confirmRequestedAmount: string;
        amountNegotiable: string;
        expectedTimeline: string;
        documentNames: string[];
        followUps: {
            siteVisit: boolean;
            referenceCalls: boolean;
            financialAudit: boolean;
            rabbinicEndorsement: boolean;
            legalStructureVerification: boolean;
        };
    };
    setValues: (next: {
        summary: string;
        tone: string;
        confirmRequestedAmount: string;
        amountNegotiable: string;
        expectedTimeline: string;
        documentNames: string[];
        followUps: {
            siteVisit: boolean;
            referenceCalls: boolean;
            financialAudit: boolean;
            rabbinicEndorsement: boolean;
            legalStructureVerification: boolean;
        };
    }) => void;
    onSubmit: () => void;
    onFilesChange?: (files: File[]) => void;
}) {
    const { open, onClose, values, setValues, onSubmit, onFilesChange } = props;
    const [docDragOver, setDocDragOver] = useState(false);
    const docInputRef = useRef<HTMLInputElement>(null);
    if (!open) return null;

    const canSubmit = Boolean(values.summary.trim() && values.tone && values.expectedTimeline.trim());
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.2, 0.9, 0.2, 1] }}
                className="relative w-full max-w-3xl"
            >
                <Card className="p-6 md:p-7 border border-[rgba(var(--silver-rgb),0.18)] shadow-[0_20px_80px_rgba(0,0,0,0.65)] max-h-[85vh] overflow-y-auto">
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <div className="text-xs tracking-[0.22em] uppercase text-[var(--text-tertiary)]">Post-meeting summary</div>
                            <div className="text-xl md:text-2xl font-semibold text-[var(--text-primary)] mt-1">Capture meeting outcomes</div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-10 h-10 rounded-lg border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)]"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="mt-6 space-y-5">
                        <div className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-4 space-y-3">
                            <div className="text-sm font-medium text-[var(--text-primary)]">1) Meeting Summary *</div>
                            <textarea
                                rows={3}
                                value={values.summary}
                                onChange={(e) => setValues({ ...values, summary: e.target.value })}
                                placeholder="What did you learn?"
                                className="w-full rounded-lg px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[rgba(var(--accent-rgb),0.35)]"
                            />
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Tone *</label>
                                <select
                                    value={values.tone}
                                    onChange={(e) => setValues({ ...values, tone: e.target.value })}
                                    className="w-full rounded-lg px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:border-[rgba(var(--accent-rgb),0.35)]"
                                >
                                    <option value="">Select tone</option>
                                    <option value="very_positive">Very Positive</option>
                                    <option value="promising">Promising</option>
                                    <option value="neutral">Neutral</option>
                                    <option value="concerning">Concerning</option>
                                </select>
                            </div>
                        </div>

                        <div className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2 min-h-[2.5rem]">2) Confirm requested amount?</label>
                                <select
                                    value={values.confirmRequestedAmount}
                                    onChange={(e) => setValues({ ...values, confirmRequestedAmount: e.target.value })}
                                    className="w-full rounded-lg px-3 py-2.5 bg-[rgba(255,255,255,0.03)] border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none"
                                >
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                    <option value="partially">Partially</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2 min-h-[2.5rem]">Is amount negotiable?</label>
                                <select
                                    value={values.amountNegotiable}
                                    onChange={(e) => setValues({ ...values, amountNegotiable: e.target.value })}
                                    className="w-full rounded-lg px-3 py-2.5 bg-[rgba(255,255,255,0.03)] border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none"
                                >
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                    <option value="unknown">Unknown</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-2 min-h-[2.5rem]">Expected timeline *</label>
                                <input
                                    value={values.expectedTimeline}
                                    onChange={(e) => setValues({ ...values, expectedTimeline: e.target.value })}
                                    placeholder="e.g. 3-4 months"
                                    className="w-full rounded-lg px-3 py-2.5 bg-[rgba(255,255,255,0.03)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none"
                                />
                            </div>
                        </div>

                        <div className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-4 space-y-3">
                            <div className="text-sm font-medium text-[var(--text-primary)]">3) Documents Received</div>
                            <input
                                ref={docInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                    const fileList = Array.from(e.target.files || []);
                                    if (!fileList.length) return;
                                    const merged = [...values.documentNames, ...fileList.map((f) => f.name)];
                                    setValues({ ...values, documentNames: merged });
                                    onFilesChange?.(fileList);
                                }}
                            />
                            <div
                                className={[
                                    'p-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-all cursor-pointer',
                                    docDragOver
                                        ? 'border-[rgba(var(--accent-rgb),0.55)] bg-[rgba(var(--accent-rgb),0.10)]'
                                        : 'border-[var(--border-subtle)] hover:bg-[rgba(255,255,255,0.03)]',
                                ].join(' ')}
                                role="button"
                                tabIndex={0}
                                onClick={() => docInputRef.current?.click()}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); docInputRef.current?.click(); } }}
                                onDragOver={(e) => { e.preventDefault(); setDocDragOver(true); }}
                                onDragLeave={() => setDocDragOver(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDocDragOver(false);
                                    const files = Array.from(e.dataTransfer?.files || []);
                                    if (!files.length) return;
                                    const merged = [...values.documentNames, ...files.map((f) => f.name)];
                                    setValues({ ...values, documentNames: merged });
                                    onFilesChange?.(files);
                                }}
                            >
                                <Paperclip size={20} className="text-[var(--color-gold)]" />
                                <span className="text-sm text-[var(--text-secondary)]">
                                    {docDragOver ? 'Drop files here' : 'Drag & drop files or click to browse'}
                                </span>
                                <span className="text-xs text-[var(--text-tertiary)]">PDF, DOC, images accepted</span>
                            </div>
                            {values.documentNames.length ? (
                                <div className="space-y-1">
                                    {values.documentNames.map((name, idx) => (
                                        <div key={`doc-${idx}`} className="flex items-center justify-between gap-2 text-sm text-[var(--text-secondary)] bg-[rgba(255,255,255,0.02)] rounded-lg px-3 py-2 border border-[var(--border-subtle)]">
                                            <span className="inline-flex items-center gap-2 truncate"><Paperclip size={13} className="text-[var(--color-gold)] shrink-0" />{name}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const next = values.documentNames.filter((_, i) => i !== idx);
                                                    setValues({ ...values, documentNames: next });
                                                }}
                                                className="text-[var(--text-tertiary)] hover:text-red-400 transition-colors shrink-0"
                                                aria-label="Remove file"
                                            >
                                                <XIcon size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </div>

                        <div className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-4 space-y-2">
                            <div className="text-sm font-medium text-[var(--text-primary)]">4) Follow-Up Needed?</div>
                            {[
                                ['siteVisit', 'Site visit required'],
                                ['referenceCalls', 'Reference calls'],
                                ['financialAudit', 'Financial audit'],
                                ['rabbinicEndorsement', 'Rabbinic endorsement'],
                                ['legalStructureVerification', 'Legal structure verification'],
                            ].map(([key, label]) => (
                                <label key={key} className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
                                    <span>{label}</span>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(values.followUps[key as keyof typeof values.followUps])}
                                        onChange={(e) =>
                                            setValues({
                                                ...values,
                                                followUps: {
                                                    ...values.followUps,
                                                    [key]: e.target.checked,
                                                },
                                            })
                                        }
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 flex items-center gap-2">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button variant="gold" onClick={onSubmit} disabled={!canSubmit}>Submit Summary</Button>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
