import { DonorNav } from '@/components/layout/DonorNav';
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
                <div className="app-shell">
                    <div className="hidden md:block">
                        <DonorNav />
                    </div>
                    <main className="main-content">
                        {children}
                        <LeverageDrawer />
                    </main>
                    <MobileNav role="donor" />
                </div>
            </LeverageProvider>
        </LegacyProvider>
    );
}
