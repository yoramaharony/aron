'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Heart, CreditCard, PieChart, Lock, Mail, Compass, KeyRound, Link2 } from 'lucide-react';
import { AronLogo } from '@/components/layout/AronLogo';
import { useDonorUi } from '@/components/providers/DonorUiContext';

const NAV_ITEMS = [
    { label: 'Impact Vision', icon: Compass, href: '/donor/legacy' },
    { label: 'Opportunities', icon: Heart, href: '/donor' },
    { label: 'Pledges', icon: CreditCard, href: '/donor/pledges' },
    { label: 'Impact', icon: PieChart, href: '/donor/impact' },
    { label: 'Vault', icon: Lock, href: '/donor/vault' },
    { label: 'Inbox', icon: Mail, href: '/donor/inbox' },
    { label: 'Invites', icon: KeyRound, href: '/donor/invites' },
    { label: 'Submission Links', icon: Link2, href: '/donor/submission-links' },
];

export function DonorNav() {
    const pathname = usePathname();
    const { sidebarCollapsed } = useDonorUi();

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={clsx('sidebar p-6 pt-4', sidebarCollapsed && 'sidebar-collapsed')}>
                {/* Top: logo */}
                <div className="pb-4 border-b border-[rgba(var(--silver-rgb),0.15)]">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex items-center justify-center gap-3 mb-1 w-full">
                            <AronLogo
                                variant={sidebarCollapsed ? 'mark' : 'full'}
                                imgClassName={clsx(
                                    'aron-logo w-auto object-contain',
                                    sidebarCollapsed ? 'h-[34px]' : 'h-[35px]'
                                )}
                            />
                        </div>
                        <p
                            className={clsx(
                                'sidebar-tagline text-[10px] tracking-[0.3em] text-[rgba(var(--silver-rgb),0.95)] font-light uppercase text-center w-full',
                                sidebarCollapsed && 'sidebar-tagline-collapsed'
                            )}
                        >
                            Channel Your Impact
                        </p>
                    </div>
                </div>

                <nav className="flex flex-col gap-2 flex-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const linkEl = (
                            <Link
                                href={item.href}
                                title={sidebarCollapsed ? item.label : undefined}
                                className={clsx(
                                    'nav-item flex items-center p-3 rounded-lg transition-all duration-200 flex-1',
                                    sidebarCollapsed ? 'justify-center gap-0' : 'gap-3',
                                    isActive
                                        ? 'nav-item-active text-[rgba(var(--silver-rgb),0.95)] font-light'
                                        : 'text-[var(--text-secondary)] font-light'
                                )}
                            >
                                <item.icon
                                    size={20}
                                    className={clsx(
                                        'shrink-0',
                                        isActive ? 'text-[var(--color-gold)]' : 'text-[var(--text-tertiary)]'
                                    )}
                                />
                                <span
                                    className={clsx(
                                        'sidebar-label min-w-0 tracking-wide',
                                        sidebarCollapsed && 'sidebar-label-collapsed'
                                    )}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );

                        return (
                            <div
                                key={item.href}
                                className={clsx('flex items-center', sidebarCollapsed ? 'justify-center' : '')}
                            >
                                {linkEl}
                            </div>
                        );
                    })}
                </nav>

                {/* Bottom badge (Figma) */}
                <div className="pt-4 border-t border-[rgba(var(--accent-rgb),0.30)]">
                    <div className={clsx('flex items-center gap-2 px-3 py-2 rounded-lg', sidebarCollapsed && 'justify-center px-2')}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg w-full"
                            style={{
                                background: 'linear-gradient(135deg, #2A2A2A 0%, #1A1A1A 100%)',
                                border: '1px solid rgba(212,175,55,0.30)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.30), inset 0 1px 0 rgba(212,175,55,0.20)',
                            }}
                        >
                            {sidebarCollapsed ? (
                                <div className="w-7 h-7 rounded-lg border border-[rgba(var(--accent-rgb),0.35)] bg-[rgba(var(--accent-rgb),0.10)] text-[var(--color-gold)] flex items-center justify-center text-xs font-semibold">
                                    D
                                </div>
                            ) : (
                                <div className="min-w-0">
                                    <div className="text-xs font-light tracking-wide text-[var(--color-gold)]">Donor</div>
                                    <div className="text-xs font-light text-[rgba(var(--silver-rgb),0.95)]">Dashboard</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
