import Link from 'next/link';
import { AronLogo } from '@/components/layout/AronLogo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,14,0.62)] backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <Link href="/admin" className="flex items-center gap-3">
            <AronLogo imgClassName="aron-logo aron-logo-animated-soft h-[28px] w-auto object-contain" />
            <div className="leading-tight">
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-tertiary)]">
                Concierge Console
              </div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Admin</div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/admin/invites"
              className="text-sm font-semibold px-3 py-2 rounded-lg border border-[rgba(255,43,214,0.25)] bg-[rgba(255,43,214,0.10)] hover:bg-[rgba(255,43,214,0.16)] transition-colors"
            >
              Invites
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}

