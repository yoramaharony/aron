'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    PlusCircle,
    FolderOpen,
    FileText,
    BarChart2,
    MessageSquare,
    Settings,
    LogOut
} from 'lucide-react';

const NAV_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/requester' },
    { label: 'Submit Project', icon: PlusCircle, href: '/requester/projects/new' },
    { label: 'My Projects', icon: FolderOpen, href: '/requester/projects' },
    { label: 'Documents', icon: FileText, href: '/requester/documents' },
    { label: 'Reporting', icon: BarChart2, href: '/requester/reporting' },
    { label: 'Messages', icon: MessageSquare, href: '/requester/messages' },
    { label: 'Org Settings', icon: Settings, href: '/requester/settings' },
];

export function RequesterNav() {
    const pathname = usePathname();

    return (
        <nav className="w-64 bg-[var(--bg-paper)] text-[var(--text-primary)] flex flex-col h-screen border-r border-[var(--border-subtle)]">
            {/* Brand */}
            <div className="p-6 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-3 text-[var(--text-primary)]">
                    <div className="w-[35px] h-[35px] md:w-[44px] md:h-[44px]">
                        <img src="/assets/aron-logo-angle.svg" alt="Aron" className="aron-logo w-full h-full object-contain" />
                    </div>
                    <span className="font-serif tracking-widest text-sm uppercase mt-1">Portal</span>
                </div>
                <div className="mt-3 text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Grantee Workspace</div>
            </div>

            {/* Links */}
            <div className="flex-1 py-6 px-3 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-all ${isActive
                                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            <item.icon size={18} className={isActive ? "text-[var(--color-gold)]" : "text-[var(--text-tertiary)]"} />
                            {item.label}
                        </Link>
                    );
                })}
            </div>

            {/* User / Logout */}
            <div className="p-4 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-xs font-serif font-bold text-[var(--text-primary)]">
                        h.
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[var(--text-primary)] truncate">Hope Foundation</div>
                        <div className="text-xs text-[var(--text-tertiary)] truncate">Jane Director</div>
                    </div>
                </div>
                <button className="flex items-center gap-2 text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors w-full px-2 uppercase tracking-wide">
                    <LogOut size={14} />
                    Sign Out
                </button>
            </div>
        </nav>
    );
}
