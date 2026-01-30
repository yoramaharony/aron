import Link from 'next/link';
import { AronLogo } from '@/components/layout/AronLogo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,14,0.62)] backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <Link href="/admin" className="flex items-center gap-3">
            <AronLogo imgClassName="aron-logo aron-logo-animated-soft h-[28px] w-auto object-contain" />
          </Link>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}

