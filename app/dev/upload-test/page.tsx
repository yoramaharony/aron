import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import UploadTestClient from './UploadTestClient';

export default async function UploadTestPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  const session = await getSession();
  if (!session) redirect('/auth/login');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Dev / Upload Test</h1>
        <p className="text-sm text-secondary">
          Logged in as <span className="text-[var(--text-primary)]">{session.email}</span>
        </p>
      </div>
      <UploadTestClient />
    </div>
  );
}

