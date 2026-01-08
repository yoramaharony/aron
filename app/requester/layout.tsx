import { RequesterNav } from '@/components/requester/RequesterNav';

export default function RequesterLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[var(--bg-ivory)] text-[var(--text-primary)] font-sans">
            {/* Sidebar - fixed width */}
            <div className="w-64 flex-shrink-0 fixed inset-y-0 left-0 z-50">
                <RequesterNav />
            </div>

            {/* Main Content - offset by sidebar width */}
            <main className="flex-1 ml-64 min-w-0 overflow-y-auto h-screen">
                {children}
            </main>
        </div>
    );
}
