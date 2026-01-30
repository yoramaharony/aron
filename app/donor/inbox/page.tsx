'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Search, Filter, Star, User, Paperclip, ArrowLeft } from 'lucide-react';
import { useLeverage } from '@/components/providers/LeverageContext';

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

type InboxRow = {
    id: string;
    from: string;
    subject: string;
    preview: string;
    body: string;
    timeLabel: string;
    unread: boolean;
    type: 'leverage' | 'general';
    hasAttachment?: boolean;
};

export default function DonorInbox() {
    const { inbox } = useLeverage();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [query, setQuery] = useState('');

    const allMessages: InboxRow[] = useMemo(() => {
        const leverageRows: InboxRow[] = inbox.map((m) => ({
            id: m.id,
            from: m.from,
            subject: m.subject,
            preview: m.body,
            body: m.body,
            timeLabel: 'Just now',
            unread: m.isRead === false,
            type: 'leverage',
            hasAttachment: true,
        }));

        const staticRows: InboxRow[] = STATIC_MESSAGES.map((m) => ({
            id: m.id,
            from: m.from,
            subject: m.subject,
            preview: m.preview,
            body: m.preview,
            timeLabel: m.time,
            unread: m.unread,
            type: 'general',
        }));

        return [...leverageRows, ...staticRows];
    }, [inbox]);

    const filteredMessages = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return allMessages;
        return allMessages.filter((m) =>
            `${m.from} ${m.subject} ${m.preview}`.toLowerCase().includes(q)
        );
    }, [allMessages, query]);

    const selectedMessage = useMemo(() => {
        if (!selectedId) return null;
        return filteredMessages.find((m) => m.id === selectedId) ?? null;
    }, [filteredMessages, selectedId]);

    return (
        <div>
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
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <button className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.06)] rounded-lg border border-[var(--border-subtle)]">
                        <Filter size={18} />
                    </button>
                </div>

                <div className="flex-1 flex flex-col md:flex-row min-h-0">
                    {/* List */}
                    <div
                        className={[
                            selectedMessage ? 'md:w-[420px] md:border-r md:border-[var(--border-subtle)]' : 'md:w-full',
                            'overflow-y-auto',
                            selectedMessage ? 'hidden md:block' : '',
                        ].join(' ')}
                    >
                        {filteredMessages.length === 0 ? (
                            <div className="p-10 text-center text-[var(--text-tertiary)]">
                                No messages found.
                            </div>
                        ) : (
                            filteredMessages.map((msg) => {
                                const isSelected = selectedId === msg.id;
                                return (
                                    <div
                                        key={msg.id}
                                        onClick={() => setSelectedId(msg.id)}
                                        className={[
                                            'p-4 border-b border-[var(--border-subtle)] cursor-pointer flex gap-4 transition-colors',
                                            isSelected
                                                ? 'bg-[rgba(255,43,214,0.10)]'
                                                : 'hover:bg-[rgba(255,255,255,0.04)] active:bg-[rgba(255,255,255,0.06)]',
                                            msg.type === 'leverage' && !isSelected ? 'bg-[rgba(255,43,214,0.06)]' : '',
                                        ].join(' ')}
                                    >
                                        <div className="mt-1">
                                            {msg.unread ? (
                                                <div className="w-2 h-2 rounded-full bg-[var(--color-gold)]" />
                                            ) : (
                                                <div className="w-2 h-2" />
                                            )}
                                        </div>

                                        <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                                            {msg.from === 'Concierge' ? (
                                                <div className="bg-[rgba(255,43,214,0.18)] text-[var(--text-primary)] border border-[rgba(255,43,214,0.25)] w-full h-full rounded-full flex items-center justify-center text-xs font-semibold">
                                                    AI
                                                </div>
                                            ) : (
                                                <User size={16} className="text-[var(--text-tertiary)]" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between mb-1">
                                                <span className={`text-sm ${msg.unread ? 'font-bold text-[var(--text-primary)]' : 'font-medium text-[var(--text-secondary)]'}`}>
                                                    {msg.from}
                                                </span>
                                                <span className="text-xs text-[var(--text-tertiary)]">
                                                    {msg.timeLabel}
                                                </span>
                                            </div>
                                            <h4 className={`text-sm mb-1 truncate ${msg.unread ? 'font-bold text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}`}>{msg.subject}</h4>
                                            <p className="text-sm text-[var(--text-tertiary)] truncate mt-1">
                                                {msg.preview}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end gap-2 text-[var(--text-tertiary)]">
                                            <Star size={16} className="hover:text-[var(--color-gold)] transition-colors" />
                                            {msg.hasAttachment && <Paperclip size={16} />}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Detail */}
                    <div className={`flex-1 min-w-0 overflow-y-auto ${selectedMessage ? '' : 'hidden md:block'}`}>
                        {!selectedMessage ? (
                            <div className="p-10 text-center text-[var(--text-tertiary)]">
                                Select a message to read it.
                            </div>
                        ) : (
                            <div className="p-6 space-y-6">
                                <div className="flex items-start gap-4">
                                    <button
                                        className="md:hidden p-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.06)]"
                                        onClick={() => setSelectedId(null)}
                                        aria-label="Back to inbox list"
                                    >
                                        <ArrowLeft size={18} />
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
                                                    {selectedMessage.from}
                                                </div>
                                                <h2 className="text-2xl font-semibold text-[var(--text-primary)] leading-tight mt-2">
                                                    {selectedMessage.subject}
                                                </h2>
                                                <div className="text-sm text-[var(--text-tertiary)] mt-2">
                                                    {selectedMessage.timeLabel}
                                                    {selectedMessage.hasAttachment ? ' • Attachment' : ''}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
                                                <button className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--color-gold)] transition-colors">
                                                    <Star size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-[var(--border-subtle)]" />

                                <div className="bg-[rgba(255,255,255,0.02)] border border-[var(--border-subtle)] rounded-xl p-5 text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                                    {selectedMessage.body}
                                </div>

                                {selectedMessage.hasAttachment && (
                                    <div className="bg-[rgba(255,43,214,0.06)] border border-[rgba(255,43,214,0.18)] rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Paperclip size={18} className="text-[var(--color-gold)]" />
                                            <div>
                                                <div className="text-sm font-semibold text-[var(--text-primary)]">Attachment</div>
                                                <div className="text-xs text-[var(--text-tertiary)]">Available in Vault (demo)</div>
                                            </div>
                                        </div>
                                        <button className="px-3 py-2 rounded-lg border border-[rgba(255,43,214,0.24)] text-[var(--text-primary)] bg-[rgba(255,43,214,0.16)] hover:bg-[rgba(255,43,214,0.22)] transition-colors text-sm font-semibold">
                                            Open Vault
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
