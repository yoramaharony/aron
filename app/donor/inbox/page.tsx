'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, Filter, Star, MoreHorizontal, User, Paperclip } from 'lucide-react';
import { useLeverage, InboxMessage } from '@/components/providers/LeverageContext';

const STATIC_MESSAGES = [
    {
        id: '1',
        from: 'Concierge',
        subject: 'Signature required: Q1 Impact Report',
        preview: 'The quarterly impact report for the Medical Center needs your review and signature...',
        time: '2h ago',
        unread: true,
        type: 'general'
    },
    {
        id: '2',
        from: 'System',
        subject: 'Tax Receipt - Donation #49221',
        preview: 'Your donation to Food Bank IL has been processed. Attached is your 46a receipt.',
        time: 'Yesterday',
        unread: false,
        type: 'general'
    },
];

export default function DonorInbox() {
    const { inbox } = useLeverage();

    // Merge real-time leverage messages with static ones
    const allMessages = [...inbox, ...STATIC_MESSAGES];

    return (
        <div style={{ paddingTop: '2rem' }}>
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Inbox</h1>
                    <p className="text-secondary">Updates from your concierge and grantees</p>
                </div>
            </div>

            <Card noPadding className="overflow-hidden min-h-[600px] flex flex-col">
                <div className="p-4 border-b border-[var(--border-subtle)] flex gap-4 bg-[rgba(255,255,255,0.02)]">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={18} />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="w-full pl-10 pr-4 py-2 bg-[rgba(255,255,255,0.03)] border border-[var(--border-strong)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]"
                        />
                    </div>
                    <button className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.06)] rounded-lg border border-[var(--border-subtle)]">
                        <Filter size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {allMessages.map((msg: any) => (
                        <div
                            key={msg.id}
                            className={`p-4 border-b border-[var(--border-subtle)] cursor-pointer flex gap-4 transition-colors hover:bg-[rgba(255,255,255,0.04)] active:bg-[rgba(255,255,255,0.06)] ${msg.type === 'leverage' ? 'bg-[rgba(255,43,214,0.06)]' : ''}`}
                        >
                            <div className="mt-1">
                                {msg.unread || (msg as any).isRead === false ? (
                                    <div className="w-2 h-2 rounded-full bg-[var(--color-gold)]" />
                                ) : (
                                    <div className="w-2 h-2" />
                                )}
                            </div>

                            <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                                {msg.from === 'Concierge' ? (
                                    <div className="bg-[rgba(255,43,214,0.18)] text-[var(--text-primary)] border border-[rgba(255,43,214,0.25)] w-full h-full rounded-full flex items-center justify-center text-xs font-semibold">AI</div>
                                ) : (
                                    <User size={16} className="text-[var(--text-tertiary)]" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between mb-1">
                                    <span className={`text-sm ${msg.unread || (msg as any).isRead === false ? 'font-bold text-[var(--text-primary)]' : 'font-medium text-[var(--text-secondary)]'}`}>
                                        {msg.from}
                                    </span>
                                    <span className="text-xs text-[var(--text-tertiary)]">
                                        {msg.type === 'leverage' ? 'Just now' : (msg as any).time}
                                    </span>
                                </div>
                                <h4 className={`text-sm mb-1 truncate ${msg.unread || (msg as any).isRead === false ? 'font-bold text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}`}>{msg.subject}</h4>
                                <p className="text-sm text-[var(--text-tertiary)] truncate mt-1">
                                    {msg.type === 'leverage' ? msg.body : (msg as any).preview}
                                </p>
                            </div>

                            <div className="flex flex-col items-end gap-2 text-[var(--text-tertiary)]">
                                <Star size={16} className="hover:text-[var(--color-gold)] transition-colors" />
                                {/* Show attachment icon if leverage */}
                                {msg.type === 'leverage' && <Paperclip size={16} />}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
