'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { KeyRound, Users, Inbox, FileText, Settings, Shield } from 'lucide-react';
import { AronLogo } from '@/components/layout/AronLogo';
import { useAdminUi } from '@/components/providers/AdminUiContext';

const NAV_ITEMS = [
  { label: 'Invites', icon: KeyRound, href: '/admin/invites' },
  // Future placeholders (UI only)
  { label: 'Requests Queue', icon: Inbox, href: '/admin/requests' },
  { label: 'Organizations', icon: Users, href: '/admin/orgs' },
  { label: 'Documents', icon: FileText, href: '/admin/documents' },
  { label: 'Security', icon: Shield, href: '/admin/security' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
];

export function AdminNav() {
  const pathname = usePathname();
  const { sidebarCollapsed } = useAdminUi();

  return (
    <aside className={clsx('sidebar p-6 pt-4', sidebarCollapsed && 'sidebar-collapsed')}>
      <div className="pb-4">
        <div className={clsx('flex flex-col', sidebarCollapsed ? 'items-center' : 'items-start')}>
          <div className={clsx('flex items-center gap-3 mb-1', sidebarCollapsed ? 'justify-center' : 'justify-start')}>
            <AronLogo
              variant={sidebarCollapsed ? 'mark' : 'full'}
              imgClassName={clsx('aron-logo w-auto object-contain', sidebarCollapsed ? 'h-[34px]' : 'h-[35px]')}
            />
          </div>
          <p
            className={clsx(
              'sidebar-tagline text-[10px] tracking-[0.2em] text-[var(--color-gold)] font-medium uppercase',
              sidebarCollapsed ? 'text-center' : 'text-left',
              sidebarCollapsed && 'sidebar-tagline-collapsed'
            )}
          >
            Concierge Console
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const isFuture = item.href !== '/admin/invites';
          return (
            <Link
              key={item.href}
              href={item.href}
              title={sidebarCollapsed ? item.label : undefined}
              className={clsx(
                'flex items-center p-3 rounded-lg transition-all duration-200',
                sidebarCollapsed ? 'justify-center gap-0' : 'gap-3',
                isActive
                  ? 'bg-[rgba(255,43,214,0.10)] text-[var(--color-gold)] font-medium shadow-[0_0_0_1px_rgba(255,43,214,0.25)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)]',
                isFuture && 'opacity-70'
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
    </aside>
  );
}

