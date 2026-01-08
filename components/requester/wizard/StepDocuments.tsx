'use client';

import { ProjectSubmission } from '@/lib/types/requester';
import { UploadCloud, FileText, Lock, Eye } from 'lucide-react';

interface StepProps {
    data: ProjectSubmission;
    updateData: (updates: Partial<ProjectSubmission>) => void;
}

export function StepDocuments({ data, updateData }: StepProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-2xl font-serif text-[var(--text-primary)]">Document Vault</h2>
                <p className="text-[var(--text-secondary)]">Securely upload the evidence required for due diligence.</p>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-lg p-10 text-center hover:bg-[var(--bg-surface)] transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-[var(--bg-surface)] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white transition-colors">
                    <UploadCloud size={32} className="text-[var(--text-tertiary)] group-hover:text-[var(--color-sage)]" />
                </div>
                <h3 className="font-medium text-[var(--text-primary)]">Drag and drop files here</h3>
                <p className="text-sm text-[var(--text-tertiary)] mt-1">PDF, DOCX, XLSX up to 20MB</p>
                <button className="mt-4 px-4 py-2 bg-white border border-[var(--border-subtle)] rounded text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] hover:border-[var(--text-secondary)]">Browse Files</button>
            </div>

            {/* Mocked File List */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Required Documents</h4>
                {[
                    { name: '2024_Annual_Budget.xlsx', type: 'Financials', status: 'uploaded' },
                    { name: 'Registration_Certificate.pdf', type: 'Legal', status: 'uploaded' },
                    { name: 'Program_Logic_Model.pdf', type: 'Project Plan', status: 'uploaded' },
                ].map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white border border-[var(--border-subtle)] rounded-sm">
                        <div className="flex items-center gap-3">
                            <div className="text-[var(--color-sage)]"><FileText size={20} /></div>
                            <div>
                                <div className="text-sm font-medium text-[var(--text-primary)]">{file.name}</div>
                                <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wide">{file.type} • 2.4 MB</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-[var(--text-tertiary)]">
                                <Lock size={12} /> Confidential
                            </span>
                            <button className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                                <Eye size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
