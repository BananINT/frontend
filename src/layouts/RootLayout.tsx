
import { Outlet } from 'react-router-dom';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import RadioOverlay from '@/components/shared/RadioOverlay';

export default function RootLayout() {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-mono flex flex-col relative">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="flex-1 container max-w-[1920px] mx-auto p-0 border-x border-white/10 banan-grid">
                <Outlet />
            </main>

            {/* Footer */}
            <Footer />

            <RadioOverlay />
        </div>
    );
}
