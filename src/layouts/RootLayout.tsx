
import { Outlet, useLocation } from 'react-router';
import { Suspense } from 'react';
import Header from '@app/components/shared/Header';
import Footer from '@app/components/shared/Footer';
import RadioOverlay from '@app/components/shared/RadioOverlay';
import BananLoader from '@app/components/shared/BananLoader';

export default function RootLayout() {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <div className="min-h-screen bg-banan-background text-white font-mono flex flex-col relative">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="flex-1 container max-w-[1920px] mx-auto p-0 border-x border-white/10 banan-grid">
                {isHome ? (
                    <Outlet />
                ) : (
                    <Suspense fallback={<BananLoader />}>
                        <Outlet />
                    </Suspense>
                )}
            </main>

            {/* Footer */}
            <Footer />

            <RadioOverlay />
        </div>
    );
}
