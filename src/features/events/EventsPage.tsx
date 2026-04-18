import ProtocolTimeline from '@app/features/events/components/ProtocolTimeline';
import FallenBananiers from '@app/features/events/components/FallenBananiers';
import ShinyText from '@app/components/ui/ShinyText';

export default function EventsPage() {
    return (
        <div className="flex flex-col min-h-screen pt-20">
            <div className="flex-grow flex flex-col items-center justify-start text-center px-4 w-full relative z-10">
                <div className="mb-12 mt-12 w-full max-w-4xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black font-sans uppercase tracking-tighter mb-6 relative leading-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white/80 to-black/50 drop-shadow-[0_2px_15px_rgba(255,255,255,0.3)] select-none pointer-events-none">
                            Événements & Timeline
                        </span>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[150%] bg-banan-primary/5 blur-3xl -z-10 rounded-full" />
                    </h1>
                    <div className="text-xl md:text-2xl text-white/70 font-mono tracking-wide max-w-2xl mx-auto mb-8 font-light leading-relaxed">
                        Le point de ralliement de tous les <ShinyText text="Bananiers" />.
                        <br />
                        <span className="text-sm text-white/40 block mt-2">Suivez l'évolution du Protocole Potassium.</span>
                    </div>
                </div>

                <div className="w-full max-w-7xl mx-auto px-4 pb-10">
                    <ProtocolTimeline />
                </div>

                <div className="w-full max-w-7xl mx-auto px-4 pb-20">
                    <FallenBananiers />
                </div>
            </div>
        </div>
    );
}
