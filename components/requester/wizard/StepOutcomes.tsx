'use client';

import { ProjectSubmission } from '@/lib/types/requester';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';

interface StepProps {
    data: ProjectSubmission;
    updateData: (updates: Partial<ProjectSubmission>) => void;
}

export function StepOutcomes({ data, updateData }: StepProps) {
    const { outcomes } = data;

    const updateOutcomes = (updates: Partial<typeof outcomes>) => {
        updateData({ outcomes: { ...outcomes, ...updates } });
    };

    const addOutcome = () => {
        updateOutcomes({
            primary: [...outcomes.primary, {
                id: nanoid(),
                title: '',
                metricDefinition: '',
                targetValue: '',
                measurementMethod: '',
                evidenceType: ''
            }]
        });
    };

    const addKPI = () => {
        updateOutcomes({
            kpis: [...outcomes.kpis, {
                id: nanoid(),
                name: '',
                unit: '',
                target: '',
                frequency: 'monthly'
            }]
        });
    };

    const addRisk = () => {
        updateOutcomes({
            risks: [...outcomes.risks, {
                id: nanoid(),
                type: 'operational',
                severity: 'medium',
                mitigation: ''
            }]
        });
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-2xl font-serif text-[var(--text-primary)]">Outcomes & Risks</h2>
                <p className="text-[var(--text-secondary)]">Define what success looks like and how you'll prove it.</p>
            </div>

            {/* Primary Outcomes */}
            <div>
                <h3 className="text-lg font-serif mb-4 flex items-center justify-between">
                    <span>Primary Outcomes</span>
                    <Button variant="ghost" size="sm" onClick={addOutcome} className="text-[var(--color-sage)]">
                        <Plus size={14} className="mr-1" /> Add Outcome
                    </Button>
                </h3>

                <div className="space-y-6">
                    {outcomes.primary.map((item, index) => (
                        <div key={item.id} className="p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg relative group">
                            <button
                                onClick={() => updateOutcomes({ primary: outcomes.primary.filter(i => i.id !== item.id) })}
                                className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={16} />
                            </button>
                            <div className="grid gap-4">
                                <input
                                    type="text"
                                    placeholder="Outcome Title (e.g. Increased literacy rates)"
                                    value={item.title}
                                    onChange={(e) => {
                                        const newItems = [...outcomes.primary];
                                        newItems[index].title = e.target.value;
                                        updateOutcomes({ primary: newItems });
                                    }}
                                    className="font-medium text-lg bg-transparent border-b border-[var(--border-subtle)] focus:border-[var(--color-gold)] outline-none pb-1 w-full"
                                />
                                <div className="grid md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Target Value (e.g. 5,000 students)"
                                        value={item.targetValue}
                                        onChange={(e) => {
                                            const newItems = [...outcomes.primary];
                                            newItems[index].targetValue = e.target.value;
                                            updateOutcomes({ primary: newItems });
                                        }}
                                        className="p-2 bg-[var(--bg-paper)] border border-[var(--border-subtle)] rounded text-sm outline-none focus:border-[var(--color-gold)]"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Evidence Type (e.g. Exam results)"
                                        value={item.evidenceType}
                                        onChange={(e) => {
                                            const newItems = [...outcomes.primary];
                                            newItems[index].evidenceType = e.target.value;
                                            updateOutcomes({ primary: newItems });
                                        }}
                                        className="p-2 bg-[var(--bg-paper)] border border-[var(--border-subtle)] rounded text-sm outline-none focus:border-[var(--color-gold)]"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    {outcomes.primary.length === 0 && (
                        <div className="text-center p-8 border border-dashed border-[var(--border-subtle)] rounded-lg text-[var(--text-tertiary)] italic">
                            No outcomes defined yet.
                        </div>
                    )}
                </div>
            </div>

            {/* KPIs */}
            <div>
                <h3 className="text-lg font-serif mb-4 flex items-center justify-between">
                    <span>Key Performance Indicators (KPIs)</span>
                    <Button variant="ghost" size="sm" onClick={addKPI} className="text-[var(--color-sage)]">
                        <Plus size={14} className="mr-1" /> Add KPI
                    </Button>
                </h3>
                <div className="border border-[var(--border-subtle)] rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[var(--bg-surface)] text-[var(--text-secondary)] font-medium">
                            <tr>
                                <th className="p-3 pl-4">Metric Name</th>
                                <th className="p-3">Unit</th>
                                <th className="p-3">Target</th>
                                <th className="p-3">Frequency</th>
                                <th className="p-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                            {outcomes.kpis.map((kpi, index) => (
                                <tr key={kpi.id} className="bg-[var(--bg-paper)]">
                                    <td className="p-2 pl-4">
                                        <input
                                            value={kpi.name}
                                            onChange={(e) => {
                                                const newItems = [...outcomes.kpis];
                                                newItems[index].name = e.target.value;
                                                updateOutcomes({ kpis: newItems });
                                            }}
                                            className="w-full bg-transparent outline-none"
                                            placeholder="Metric name"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            value={kpi.unit}
                                            onChange={(e) => {
                                                const newItems = [...outcomes.kpis];
                                                newItems[index].unit = e.target.value;
                                                updateOutcomes({ kpis: newItems });
                                            }}
                                            className="w-20 bg-transparent outline-none"
                                            placeholder="%"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            value={kpi.target}
                                            onChange={(e) => {
                                                const newItems = [...outcomes.kpis];
                                                newItems[index].target = e.target.value;
                                                updateOutcomes({ kpis: newItems });
                                            }}
                                            className="w-20 bg-transparent outline-none"
                                            placeholder="100"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <select
                                            value={kpi.frequency}
                                            onChange={(e) => {
                                                const newItems = [...outcomes.kpis];
                                                newItems[index].frequency = e.target.value as any;
                                                updateOutcomes({ kpis: newItems });
                                            }}
                                            className="bg-transparent outline-none"
                                        >
                                            <option value="monthly">Monthly</option>
                                            <option value="quarterly">Quarterly</option>
                                            <option value="annual">Annual</option>
                                        </select>
                                    </td>
                                    <td className="p-2 text-center">
                                        <button
                                            onClick={() => updateOutcomes({ kpis: outcomes.kpis.filter(i => i.id !== kpi.id) })}
                                            className="text-[var(--text-tertiary)] hover:text-red-500"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {outcomes.kpis.length === 0 && (
                        <div className="p-4 text-center text-[var(--text-tertiary)] italic">No KPIs added.</div>
                    )}
                </div>
            </div>

            {/* Risks */}
            <div>
                <h3 className="text-lg font-serif mb-4 flex items-center justify-between">
                    <span>Risk Registry</span>
                    <Button variant="ghost" size="sm" onClick={addRisk} className="text-[var(--color-sage)]">
                        <Plus size={14} className="mr-1" /> Add Risk
                    </Button>
                </h3>
                <div className="space-y-4">
                    {outcomes.risks.map((risk, index) => (
                        <div key={risk.id} className="flex gap-4 items-start p-4 bg-[var(--bg-surface)] rounded border border-[var(--border-subtle)]">
                            <select
                                value={risk.type}
                                onChange={(e) => {
                                    const newItems = [...outcomes.risks];
                                    newItems[index].type = e.target.value as any;
                                    updateOutcomes({ risks: newItems });
                                }}
                                className="w-32 bg-[var(--bg-paper)] p-2 rounded border border-[var(--border-subtle)] text-xs"
                            >
                                <option value="operational">Operational</option>
                                <option value="regulatory">Regulatory</option>
                                <option value="staffing">Staffing</option>
                                <option value="finance">Finance</option>
                            </select>
                            <select
                                value={risk.severity}
                                onChange={(e) => {
                                    const newItems = [...outcomes.risks];
                                    newItems[index].severity = e.target.value as any;
                                    updateOutcomes({ risks: newItems });
                                }}
                                className={`w-28 p-2 rounded border border-[var(--border-subtle)] text-xs font-bold uppercase tracking-wider ${risk.severity === 'high' ? 'text-red-600 bg-red-50' :
                                        risk.severity === 'medium' ? 'text-orange-600 bg-orange-50' :
                                            'text-green-600 bg-green-50'
                                    }`}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Mitigation Strategy"
                                value={risk.mitigation}
                                onChange={(e) => {
                                    const newItems = [...outcomes.risks];
                                    newItems[index].mitigation = e.target.value;
                                    updateOutcomes({ risks: newItems });
                                }}
                                className="flex-1 bg-[var(--bg-paper)] p-2 rounded border border-[var(--border-subtle)] text-sm outline-none focus:border-[var(--color-gold)]"
                            />
                            <button
                                onClick={() => updateOutcomes({ risks: outcomes.risks.filter(i => i.id !== risk.id) })}
                                className="p-2 text-[var(--text-tertiary)] hover:text-red-500"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
