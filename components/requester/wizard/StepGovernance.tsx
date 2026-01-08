'use client';

import { ProjectSubmission } from '@/lib/types/requester';

interface StepProps {
    data: ProjectSubmission;
    updateData: (updates: Partial<ProjectSubmission>) => void;
}

export function StepGovernance({ data, updateData }: StepProps) {
    const { governance } = data;

    const updateGov = (updates: Partial<typeof governance>) => {
        updateData({ governance: { ...governance, ...updates } });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-2xl font-serif text-[var(--text-primary)]">Governance & Compliance</h2>
                <p className="text-[var(--text-secondary)]">Verify your organization's legal standing and reporting commitments.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-[var(--text-secondary)]">Legal Entity</label>
                    <input
                        type="text"
                        placeholder="Official Organization Name"
                        value={governance.orgName}
                        onChange={(e) => updateGov({ orgName: e.target.value })}
                        className="w-full p-3 bg-[var(--bg-paper)] border border-[var(--border-subtle)] rounded shadow-sm focus:border-[var(--color-gold)] outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Registration / Tax ID Number"
                        value={governance.registrationNumber}
                        onChange={(e) => updateGov({ registrationNumber: e.target.value })}
                        className="w-full p-3 bg-[var(--bg-paper)] border border-[var(--border-subtle)] rounded shadow-sm focus:border-[var(--color-gold)] outline-none"
                    />
                </div>

                <div className="bg-[var(--bg-surface)] p-6 rounded border border-[var(--border-subtle)]">
                    <h4 className="font-serif text-lg mb-4">Reporting Commitment</h4>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                        By submitting this proposal, you agree to provide verified evidence of outcomes (receipts, logs, third-party audits) on the schedule defined in your KPIs.
                    </p>
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="reporting-agree"
                            checked={governance.reportingCommitment}
                            onChange={(e) => updateGov({ reportingCommitment: e.target.checked })}
                            className="mt-1 w-4 h-4 text-[var(--color-sage)] border-[var(--border-subtle)]"
                        />
                        <label htmlFor="reporting-agree" className="text-sm font-medium text-[var(--text-primary)]">
                            I understand that failure to report will pause disbursements.
                        </label>
                    </div>
                </div>
            </div>

            {/* MOCK POLICY UPLOADS */}
            <div>
                <h4 className="font-serif text-lg mb-4">Required Policies</h4>
                <div className="grid md:grid-cols-2 gap-4">
                    {['Anti-Fraud Policy', 'Safeguarding Policy', 'Procurement Policy', 'Data Privacy Policy'].map((policy) => (
                        <div key={policy} className="flex items-center justify-between p-4 bg-white border border-[var(--border-subtle)] rounded border-dashed h-20">
                            <span className="text-sm font-medium text-[var(--text-secondary)]">{policy}</span>
                            <button className="text-xs text-[var(--color-gold)] font-bold uppercase tracking-wide hover:underline">Upload</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
