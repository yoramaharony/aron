'use client';

import { ProjectSubmission } from '@/lib/types/requester';

interface StepProps {
    data: ProjectSubmission;
    updateData: (updates: Partial<ProjectSubmission>) => void;
}

export function StepOverview({ data, updateData }: StepProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-2xl font-serif text-slate-900">Project Overview</h2>
                <p className="text-slate-500">The essentials of your initiative. This is what donors see first.</p>
            </div>

            {/* Title & Summary */}
            <div className="grid gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Project Title <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={data.title}
                        onChange={(e) => updateData({ title: e.target.value })}
                        className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g. Sustainable Water Access for Rural Communities"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">One-line Summary <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={data.oneLineSummary}
                        onChange={(e) => updateData({ oneLineSummary: e.target.value })}
                        className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Capture the essence in 140 characters or less."
                        maxLength={140}
                    />
                    <p className="text-right text-xs text-slate-400 mt-1">{data.oneLineSummary.length}/140</p>
                </div>
            </div>

            {/* Category & Location */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Sector <span className="text-red-500">*</span></label>
                    <select
                        value={data.category}
                        onChange={(e) => updateData({ category: e.target.value })}
                        className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                        <option value="">Select a sector...</option>
                        <option value="Education">Education</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Environment">Environment</option>
                        <option value="Humanitarian">Humanitarian</option>
                        <option value="Community">Community</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Country <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={data.location.country}
                        onChange={(e) => updateData({ location: { ...data.location, country: e.target.value } })}
                        className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g. Kenya"
                    />
                </div>
            </div>

            {/* Problem & Solution */}
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Problem Statement <span className="text-red-500">*</span></label>
                    <textarea
                        value={data.problemStatement}
                        onChange={(e) => updateData({ problemStatement: e.target.value })}
                        rows={4}
                        className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="What specific issue are you addressing? Use data where possible."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Solution / Approach <span className="text-red-500">*</span></label>
                    <textarea
                        value={data.solutionApproach}
                        onChange={(e) => updateData({ solutionApproach: e.target.value })}
                        rows={4}
                        className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="How will your intervention solve this problem? Be specific."
                    />
                </div>
            </div>

            {/* Key Contacts */}
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Key Contacts</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Program Lead Name</label>
                        <input
                            type="text"
                            value={data.contacts.programLead.name}
                            onChange={(e) => updateData({ contacts: { ...data.contacts, programLead: { ...data.contacts.programLead, name: e.target.value } } })}
                            className="w-full p-2 border border-slate-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Program Lead Email</label>
                        <input
                            type="email"
                            value={data.contacts.programLead.email}
                            onChange={(e) => updateData({ contacts: { ...data.contacts, programLead: { ...data.contacts.programLead, email: e.target.value } } })}
                            className="w-full p-2 border border-slate-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
