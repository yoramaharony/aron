import { RequestorNav } from '@/components/layout/RequestorNav';
import { RequestorTopBar } from '@/components/layout/RequestorTopBar';
import MobileNav from '@/components/layout/MobileNav';
import { RequestorUiProvider } from '@/components/providers/RequestorUiContext';

export default function RequestorLayout({ children }: { children: React.ReactNode }) {
    return (
        <RequestorUiProvider>
            <div className="app-shell requestor-shell">
                <div className="hidden md:block">
                    <RequestorNav />
                </div>
                <main className="main-content">
                    <RequestorTopBar />
                    <div className="requestor-content-wrap">
                        {children}
                    </div>
                </main>
                <MobileNav role="requestor" />
            </div>
        </RequestorUiProvider>
    );
}
