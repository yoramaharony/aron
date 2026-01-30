'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Heart, CreditCard, PieChart, Lock, Mail, Compass, KeyRound } from 'lucide-react';
import { AronLogo } from '@/components/layout/AronLogo';

const NAV_ITEMS = [
    { label: 'Legacy Studio', icon: Compass, href: '/donor/legacy' },
    { label: 'Opportunities', icon: Heart, href: '/donor' },
    { label: 'Pledges', icon: CreditCard, href: '/donor/pledges' },
    { label: 'Impact', icon: PieChart, href: '/donor/impact' },
    { label: 'Vault', icon: Lock, href: '/donor/vault' },
    { label: 'Inbox', icon: Mail, href: '/donor/inbox' },
    { label: 'Invites', icon: KeyRound, href: '/donor/invites' },
];

export function DonorNav() {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!menuOpen) return;
        const onDown = (e: MouseEvent) => {
            const el = menuRef.current;
            if (!el) return;
            if (e.target instanceof Node && !el.contains(e.target)) setMenuOpen(false);
        };
        window.addEventListener('mousedown', onDown);
        return () => window.removeEventListener('mousedown', onDown);
    }, [menuOpen]);

    const signOut = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } finally {
            window.location.href = '/auth/login';
        }
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="sidebar p-6 pt-4">
                {/* Top bar: logo left, user menu right */}
                <div className="pb-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col items-start">
                            <div className="flex items-center gap-3 mb-1">
                                <AronLogo imgClassName="aron-logo aron-logo-animated-soft h-[35px] w-auto object-contain" />
                            </div>
                            <p className="text-[10px] tracking-[0.2em] text-[var(--color-gold)] font-medium uppercase">
                                Channel Your Legacy
                            </p>
                        </div>

                        <div className="relative" ref={menuRef}>
                            <button
                                type="button"
                                onClick={() => setMenuOpen((v) => !v)}
                                className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.06)] text-[var(--text-primary)] flex items-center justify-center text-xs font-medium border border-[var(--border-subtle)] hover:bg-[rgba(255,255,255,0.10)] transition-colors"
                                aria-haspopup="menu"
                                aria-expanded={menuOpen}
                                aria-label="Account menu"
                            >
                                JD
                            </button>

                            {menuOpen ? (
                                <div
                                    role="menu"
                                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-[rgba(255,43,214,0.22)] bg-[linear-gradient(180deg,rgba(255,43,214,0.10),rgba(10,10,14,0.92))] shadow-[0_24px_90px_-55px_rgba(0,0,0,0.9)] backdrop-blur"
                                >
                                    <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.08)]">
                                        <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-tertiary)]">
                                            Signed in
                                        </div>
                                        <div className="text-sm font-semibold text-[var(--text-primary)] mt-1">
                                            John Doe
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={signOut}
                                        className="w-full text-left px-4 py-3 text-sm font-semibold text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>

                <nav className="flex flex-col gap-2 flex-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    'flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
                                    isActive
                                        ? 'bg-[rgba(255,43,214,0.10)] text-[var(--color-gold)] font-medium shadow-[0_0_0_1px_rgba(255,43,214,0.25)]'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)]'
                                )}
                            >
                                <item.icon size={20} className={isActive ? 'text-[var(--color-gold)]' : 'text-[var(--text-tertiary)]'} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
