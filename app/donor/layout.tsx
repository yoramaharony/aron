import { DonorNav } from '@/components/layout/DonorNav';
import { DonorTopBar } from '@/components/layout/DonorTopBar';
import MobileNav from '@/components/layout/MobileNav';
import { LegacyProvider } from '@/components/providers/LegacyContext';
import { LeverageProvider } from '@/components/providers/LeverageContext';
import { LeverageDrawer } from '@/components/donor/LeverageDrawer';

export default function DonorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <LegacyProvider>
            <LeverageProvider>
                <div className="app-shell donor-shell">
                    <div className="hidden md:block">
                        <DonorNav />
                    </div>
                    <main className="main-content">
                        <DonorTopBar />
                        <div className="donor-content-wrap">
                            {children}
                        </div>
                        <LeverageDrawer />
                    </main>
                    <MobileNav role="donor" />
                </div>
            </LeverageProvider>
        </LegacyProvider>
    );
}
