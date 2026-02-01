import { AdminNav } from '@/components/layout/AdminNav';
import { AdminTopBar } from '@/components/layout/AdminTopBar';
import { AdminUiProvider } from '@/components/providers/AdminUiContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminUiProvider>
      <div className="app-shell admin-shell">
        <div className="hidden md:block">
          <AdminNav />
        </div>
        <main className="main-content">
          <AdminTopBar />
          <div className="admin-content-wrap">{children}</div>
        </main>
      </div>
    </AdminUiProvider>
  );
}

