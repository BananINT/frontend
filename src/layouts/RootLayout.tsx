
import { Outlet, useLocation } from 'react-router';
import { Suspense } from 'react';
import Header from '@app/components/shared/Header';
import Footer from '@app/components/shared/Footer';
import RadioOverlay from '@app/components/shared/RadioOverlay';
import BananLoader from '@app/components/shared/BananLoader';

export default function RootLayout() {
    const location = useLocation();
    const isBlog = location.pathname === '/blog' || location.pathname.startsWith('/blog/');

    return (
        <div className="min-h-[100dvh] bg-banan-background text-white font-mono flex flex-col relative">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main id="main" tabIndex={-1} className={isBlog ? 'flex-1 w-full p-0 banan-grid focus:outline-none' : 'flex-1 container max-w-[1920px] mx-auto p-0 border-x border-white/10 banan-grid focus:outline-none'}>
                <Suspense fallback={<BananLoader />}>
                    <Outlet />
                </Suspense>
            </main>

            {/* Footer */}
            <Footer />

            <RadioOverlay />
        </div>
    );
}
