'use client';

import { ProjectSubmission, UseOfFundsItem } from '@/lib/types/requester';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';

interface StepProps {
    data: ProjectSubmission;
    updateData: (updates: Partial<ProjectSubmission>) => void;
}

export function StepFunding({ data, updateData }: StepProps) {
    const { funding } = data;

    const updateFunding = (updates: Partial<typeof funding>) => {
        updateData({ funding: { ...funding, ...updates } });
    };

    const addLineItem = () => {
        const newItem: UseOfFundsItem = {
            id: nanoid(),
            category: 'other',
            description: '',
            amount: 0
        };
        updateFunding({ useOfFunds: [...funding.useOfFunds, newItem] });
    };

    const removeLineItem = (id: string) => {
        updateFunding({ useOfFunds: funding.useOfFunds.filter(item => item.id !== id) });
    };

    const updateLineItem = (id: string, field: keyof UseOfFundsItem, value: any) => {
        updateFunding({
            useOfFunds: funding.useOfFunds.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        });
    };

    const totalAllocated = funding.useOfFunds.reduce((sum, item) => sum + Number(item.amount), 0);
    const remainingBudget = funding.totalBudget - totalAllocated;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-2xl font-serif text-[var(--text-primary)]">Funding Request</h2>
                <p className="text-[var(--text-secondary)]">Define the gap and how you will use the capital.</p>
            </div>

            {/* Budget Top Level */}
            <div className="grid md:grid-cols-2 gap-6 p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg">
                <div>
                    <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">Total Project Budget ($)</label>
                    <input
                        type="number"
                        value={funding.totalBudget || ''}
                        onChange={(e) => updateFunding({ totalBudget: Number(e.target.value) })}
                        className="w-full p-2 bg-[var(--bg-paper)] border border-[var(--border-subtle)] rounded shadow-sm focus:border-[var(--color-gold)] outline-none font-serif text-lg"
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">Funding Gap (Requested)</label>
                    <input
                        type="number"
                        value={funding.amountRequested || ''}
                        onChange={(e) => updateFunding({ amountRequested: Number(e.target.value) })}
                        className="w-full p-2 bg-[var(--bg-paper)] border border-[var(--border-subtle)] rounded shadow-sm focus:border-[var(--color-gold)] outline-none font-serif text-lg text-[var(--color-gold)]"
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">Start Date</label>
                    <input
                        type="date"
                        value={funding.window.start}
                        onChange={(e) => updateFunding({ window: { ...funding.window, start: e.target.value } })}
                        className="w-full p-2 bg-[var(--bg-paper)] border border-[var(--border-subtle)] rounded shadow-sm focus:border-[var(--color-gold)] outline-none text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">Funding Deadline</label>
                    <input
                        type="date"
                        value={funding.window.end}
                        onChange={(e) => updateFunding({ window: { ...funding.window, end: e.target.value } })}
                        className="w-full p-2 bg-[var(--bg-paper)] border border-[var(--border-subtle)] rounded shadow-sm focus:border-[var(--color-gold)] outline-none text-sm"
                    />
                </div>
            </div>

            {/* Use of Funds Table */}
            <div>
                <div className="flex justify-between items-end mb-4">
                    <h3 className="text-lg font-serif">Use of Funds Breakdown</h3>
                    <div className={`text-sm ${remainingBudget < 0 ? 'text-red-500' : 'text-[var(--text-secondary)]'}`}>
                        Remaining to allocate: <strong>${remainingBudget.toLocaleString()}</strong>
                    </div>
                </div>

                <div className="space-y-3">
                    {funding.useOfFunds.map((item) => (
                        <div key={item.id} className="flex gap-3 items-start">
                            <select
                                value={item.category}
                                onChange={(e) => updateLineItem(item.id, 'category', e.target.value)}
                                className="w-32 p-2 bg-white border border-[var(--border-subtle)] rounded text-sm outline-none focus:border-[var(--color-gold)]"
                            >
                                <option value="staff">Staff</option>
                                <option value="equipment">Equipment</option>
                                <option value="facilities">Facilities</option>
                                <option value="services">Services</option>
                                <option value="marketing">Marketing</option>
                                <option value="other">Other</option>
                            </select>
                            <input
                                type="text"
                                value={item.description}
                                onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                placeholder="Description"
                                className="flex-1 p-2 bg-white border border-[var(--border-subtle)] rounded text-sm outline-none focus:border-[var(--color-gold)]"
                            />
                            <input
                                type="number"
                                value={item.amount || ''}
                                onChange={(e) => updateLineItem(item.id, 'amount', Number(e.target.value))}
                                placeholder="Amount"
                                className="w-32 p-2 bg-white border border-[var(--border-subtle)] rounded text-sm outline-none focus:border-[var(--color-gold)] text-right"
                            />
                            <button
                                onClick={() => removeLineItem(item.id)}
                                className="p-2 text-[var(--text-tertiary)] hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>

                <Button variant="outline" size="sm" onClick={addLineItem} className="mt-4">
                    <Plus size={16} className="mr-2" /> Add Line Item
                </Button>
            </div>

            {/* Leverage Readiness */}
            <div className="border-t border-[var(--border-subtle)] pt-6 mt-6">
                <h3 className="text-lg font-serif mb-4">Campaign & Leverage Settings</h3>
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="challenge-grant"
                        checked={funding.campaignReadiness.canAcceptChallenge}
                        onChange={(e) => updateFunding({ campaignReadiness: { ...funding.campaignReadiness, canAcceptChallenge: e.target.checked } })}
                        className="w-4 h-4 text-[var(--color-gold)] border-[var(--border-subtle)] rounded focus:ring-[var(--color-gold)]"
                    />
                    <label htmlFor="challenge-grant" className="text-sm text-[var(--text-secondary)]">
                        This project is ready to accept <strong>Challenge Grants</strong> (conditional matching funds).
                    </label>
                </div>
            </div>
        </div>
    );
}
