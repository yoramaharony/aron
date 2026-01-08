'use client';

import { ProjectSubmission } from '@/lib/types/requester';
import { Button } from '@/components/ui/Button';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface StepProps {
    data: ProjectSubmission;
    updateData: (updates: Partial<ProjectSubmission>) => void;
}

export function StepReview({ data }: StepProps) {
    const completeness = 85;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2 text-center pb-6 border-b border-[var(--border-subtle)]">
                <h2 className="text-3xl font-serif text-[var(--text-primary)]">Ready to Submit?</h2>
                <p className="text-[var(--text-secondary)]">Review your proposal before sending it to the Concierge team.</p>
            </div>

            {/* Scorecard */}
            <div className="flex justify-center my-8">
                <div className="flex items-center gap-4 bg-[var(--bg-surface)] p-4 rounded-lg border border-[var(--border-subtle)]">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="var(--border-subtle)" strokeWidth="4" fill="none" />
                            <circle cx="32" cy="32" r="28" stroke="var(--color-sage)" strokeWidth="4" fill="none" strokeDasharray="175" strokeDashoffset={175 - (175 * completeness) / 100} />
                        </svg>
                        <span className="absolute text-sm font-bold">{completeness}%</span>
                    </div>
                    <div>
                        <div className="font-bold text-[var(--text-primary)]">Submission Score</div>
                        <div className="text-xs text-[var(--text-secondary)]">High quality. Looks good.</div>
                    </div>
                </div>
            </div>

            {/* Summary Preview */}
            <div className="grid md:grid-cols-2 gap-8 text-sm">
                <div>
                    <h4 className="font-serif text-[var(--color-gold)] mb-2 text-lg">Overview</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between border-b border-[var(--border-subtle)] pb-1">
                            <span className="text-[var(--text-secondary)]">Title</span>
                            <span className="font-medium">{data.title || 'Untitled Project'}</span>
                        </div>
                        <div className="flex justify-between border-b border-[var(--border-subtle)] pb-1">
                            <span className="text-[var(--text-secondary)]">Location</span>
                            <span className="font-medium">{data.location.country || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between border-b border-[var(--border-subtle)] pb-1">
                            <span className="text-[var(--text-secondary)]">Sector</span>
                            <span className="font-medium">{data.category || 'Not specified'}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-serif text-[var(--color-gold)] mb-2 text-lg">Funding</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between border-b border-[var(--border-subtle)] pb-1">
                            <span className="text-[var(--text-secondary)]">Total Budget</span>
                            <span className="font-medium">${data.funding.totalBudget?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex justify-between border-b border-[var(--border-subtle)] pb-1">
                            <span className="text-[var(--text-secondary)]">Requested Gap</span>
                            <span className="font-bold text-[var(--color-sage)]">${data.funding.amountRequested?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex justify-between border-b border-[var(--border-subtle)] pb-1">
                            <span className="text-[var(--text-secondary)]">Leverage Ready</span>
                            <span className="font-medium">{data.funding.campaignReadiness.canAcceptChallenge ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md flex gap-3 text-sm text-yellow-800">
                <AlertCircle size={20} className="shrink-0" />
                <p>After submission, you cannot edit this proposal directly. Changes must be requested through the Concierge.</p>
            </div>
        </div>
    );
}
