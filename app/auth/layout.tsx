import Link from 'next/link';
import { AronLogo } from '@/components/layout/AronLogo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-app)]">
      <div className="pt-10 pb-6 px-4 flex justify-center">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="inline-flex items-center justify-center" aria-label="Go to Aron home">
            <AronLogo imgClassName="aron-logo aron-logo-animated-soft h-10 w-auto object-contain" />
          </Link>
          <p className="mt-2 text-[10px] tracking-[0.3em] text-[rgba(var(--silver-rgb),0.95)] font-light uppercase">
            Channel Your Impact
          </p>
        </div>
      </div>

      <div className="px-4 pb-12 flex items-center justify-center">{children}</div>
    </div>
  );
}

