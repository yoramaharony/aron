'use client';

import { Check, X as XIcon } from 'lucide-react';
import { type WorkflowStage, WORKFLOW_STAGES, STAGE_LABELS_ORG } from '@/lib/workflow';

export function OpportunityStepper(props: {
    stage: WorkflowStage;
    isPassed: boolean;
    isCommitted: boolean;
    compact?: boolean;
    orgLabels?: boolean;
    onStepClick?: (stage: WorkflowStage) => void;
}) {
    const { stage, isPassed, isCommitted, compact = false, orgLabels = false, onStepClick } = props;
    const currentIndex = WORKFLOW_STAGES.indexOf(stage);
    const nodeSize = compact ? 'h-6 w-6' : 'h-10 w-10';
    const lineTop = compact ? 12 : 20;
    const labelClass = compact
        ? 'mt-4 text-[11px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]'
        : 'mt-3 text-[13px] text-[var(--text-tertiary)]';

    const stepCount = WORKFLOW_STAGES.length;
    const progressRatio = Math.max(0, Math.min(1, currentIndex / (stepCount - 1)));
    const railInsetPercent = 10;
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
                        const displayLabel = orgLabels ? STAGE_LABELS_ORG[label] : label.replace('_', ' ');
                        return (
                            <div key={label} className="text-center">
                                {(() => {
                                    const Wrapper = onStepClick ? 'button' : 'div';
                                    return (
                                        <Wrapper
                                            {...(onStepClick ? { type: 'button' as const, onClick: () => onStepClick(label), title: compact ? undefined : `Stage: ${displayLabel}` } : {})}
                                            className="w-full"
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
                                            <div className={labelClass}>{displayLabel}</div>
                                        </Wrapper>
                                    );
                                })()}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
