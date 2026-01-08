import { RequestorNav } from '@/components/layout/RequestorNav';
import MobileNav from '@/components/layout/MobileNav';

export default function RequestorLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="app-shell">
            <div className="hidden md:block">
                <RequestorNav />
            </div>
            <main className="main-content">
                {children}
            </main>
            <MobileNav role="requestor" />
        </div>
    );
}
