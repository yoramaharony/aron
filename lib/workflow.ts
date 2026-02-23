export type WorkflowStage = 'discover' | 'info_requested' | 'meeting' | 'due_diligence' | 'decision';

export type WorkflowView = {
    stage: WorkflowStage;
    isPassed: boolean;
    isCommitted: boolean;
};

export const WORKFLOW_STAGES: WorkflowStage[] = [
    'discover',
    'info_requested',
    'meeting',
    'due_diligence',
    'decision',
];

export function deriveWorkflow(detail: { state?: string; events?: { type: string }[] }): WorkflowView {
    const state = String(detail?.state || '').toLowerCase();
    const events = Array.isArray(detail?.events) ? detail.events : [];
    const has = (t: string) => events.some((e) => String(e?.type || '') === t);

    if (state === 'passed') {
        // Determine the actual stage reached based on events, then advance by one
        // so completed stages show gold checks and the next stage shows the decline marker.
        let reachedIdx = 0; // discover
        if (has('request_info')) reachedIdx = 1; // info_requested
        if (has('info_received') || has('scheduled')) reachedIdx = 2; // meeting
        if (has('meeting_completed') || has('leverage_created')) reachedIdx = 3; // due_diligence
        if (has('diligence_completed')) reachedIdx = 4; // decision
        const declineIdx = Math.min(reachedIdx + 1, WORKFLOW_STAGES.length - 1);
        return { stage: WORKFLOW_STAGES[declineIdx], isPassed: true, isCommitted: false };
    }
    if (state === 'funded') return { stage: 'decision', isPassed: false, isCommitted: true };
    if (has('diligence_completed')) return { stage: 'decision', isPassed: false, isCommitted: false };
    if (has('meeting_completed')) return { stage: 'due_diligence', isPassed: false, isCommitted: false };
    if (has('leverage_created')) return { stage: 'due_diligence', isPassed: false, isCommitted: false };
    if (has('scheduled')) return { stage: 'meeting', isPassed: false, isCommitted: false };
    if (has('info_received')) return { stage: 'meeting', isPassed: false, isCommitted: false };
    if (has('request_info')) return { stage: 'info_requested', isPassed: false, isCommitted: false };
    if (state === 'scheduled') return { stage: 'meeting', isPassed: false, isCommitted: false };
    if (state === 'requested_info') return { stage: 'info_requested', isPassed: false, isCommitted: false };

    return { stage: 'discover', isPassed: false, isCommitted: false };
}

export function humanizeEventType(type: string): string {
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
        concierge_review: 'Reviewed by concierge',
    };
    return map[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function humanizeEventTypeOrg(type: string): string {
    const map: Record<string, string> = {
        save: 'Request under review',
        shortlist: 'Request under review',
        pass: 'Request declined',
        request_info: 'Additional information requested',
        info_received: 'Your information received',
        leverage_created: 'Leverage offer drafted',
        scheduled: 'Meeting scheduled',
        meeting_completed: 'Meeting completed',
        diligence_completed: 'Due diligence completed',
        funded: 'Funding approved',
        reset: 'Status reset',
        concierge_review: 'Auto-reviewed by donor concierge',
    };
    return map[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export const STAGE_LABELS_ORG: Record<WorkflowStage, string> = {
    discover: 'Submitted',
    info_requested: 'Info Requested',
    meeting: 'Meeting',
    due_diligence: 'Review',
    decision: 'Decision',
};
