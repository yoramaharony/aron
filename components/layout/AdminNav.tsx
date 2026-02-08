'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { KeyRound, Users, Building2, Sparkles, Mail } from 'lucide-react';
import { AronLogo } from '@/components/layout/AronLogo';
import { useAdminUi } from '@/components/providers/AdminUiContext';

export const ADMIN_NAV_ITEMS = [
  { label: 'Invites', icon: KeyRound, href: '/admin/invites' },
  { label: 'Donors', icon: Users, href: '/admin/donors' },
  { label: 'Organizations', icon: Building2, href: '/admin/organizations' },
  { label: 'Email', icon: Mail, href: '/admin/email-templates' },
  { label: 'Happy Path', icon: Sparkles, href: '/admin/happy-path' },
];

export function AdminNav() {
  const pathname = usePathname();
  const { sidebarCollapsed } = useAdminUi();

  return (
    <aside className={clsx('sidebar p-6 pt-4', sidebarCollapsed && 'sidebar-collapsed')}>
      <div className="pb-4">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center gap-3 mb-1 w-full">
            <AronLogo
              variant={sidebarCollapsed ? 'mark' : 'full'}
              imgClassName={clsx('aron-logo w-auto object-contain', sidebarCollapsed ? 'h-[34px]' : 'h-[35px]')}
            />
          </div>
          <p
            className={clsx(
              'sidebar-tagline text-[10px] tracking-[0.2em] text-[var(--color-gold)] font-medium uppercase',
              sidebarCollapsed && 'sidebar-tagline-collapsed'
            )}
          >
            Concierge Console
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={sidebarCollapsed ? item.label : undefined}
              className={clsx(
                'nav-item flex items-center p-3 rounded-lg transition-all duration-200',
                sidebarCollapsed ? 'justify-center gap-0' : 'gap-3',
                isActive
                  ? 'nav-item-active bg-[rgba(var(--accent-rgb), 0.08)] text-[var(--color-gold)] font-medium'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)]'
              )}
            >
              <item.icon
                size={20}
                className={clsx('shrink-0', isActive ? 'text-[var(--color-gold)]' : 'text-[var(--text-tertiary)]')}
              />
              <span className={clsx('sidebar-label min-w-0', sidebarCollapsed && 'sidebar-label-collapsed')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom badge (portal identifier) */}
      <div className="pt-4 border-t border-[rgba(var(--accent-rgb),0.30)]">
        <div className={clsx('flex items-center gap-2 px-3 py-2 rounded-lg', sidebarCollapsed && 'justify-center px-2')}>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg w-full"
            style={{
              background: 'linear-gradient(135deg, #2A2A2A 0%, #1A1A1A 100%)',
              border: '1px solid rgba(212,175,55,0.30)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.30), inset 0 1px 0 rgba(212,175,55,0.20)',
            }}
          >
            {sidebarCollapsed ? (
              <div className="w-7 h-7 rounded-lg border border-[rgba(var(--accent-rgb),0.35)] bg-[rgba(var(--accent-rgb),0.10)] text-[var(--color-gold)] flex items-center justify-center text-xs font-semibold">
                A
              </div>
            ) : (
              <div className="min-w-0">
                <div className="text-xs font-light tracking-wide text-[var(--color-gold)]">Admin</div>
                <div className="text-xs font-light text-[rgba(var(--silver-rgb),0.95)]">Console</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

