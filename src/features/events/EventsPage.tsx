import ProtocolTimeline from '@app/features/events/components/ProtocolTimeline';
import FallenBananiers from '@app/features/events/components/FallenBananiers';

export default function EventsPage() {
    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden pt-20">
            <div aria-hidden="true" className="banan-grid pointer-events-none absolute inset-x-0 top-0 h-[44rem] opacity-55 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-24 h-72 w-[min(80vw,50rem)] -translate-x-1/2 rounded-full bg-banan-primary/10 blur-[100px]" />
            <div className="relative z-10 flex w-full flex-grow flex-col items-center justify-start px-4 text-center">
                <div className="mx-auto mb-16 mt-12 w-full sm:mt-20 md:mb-24">
                    <h1 className="relative mb-8 font-sans text-[clamp(1.65rem,8vw,9rem)] font-black uppercase leading-[0.85] tracking-[-0.075em]">
                        <span className="block bg-gradient-to-b from-white via-white/85 to-white/35 bg-clip-text text-transparent drop-shadow-[0_2px_22px_rgba(255,255,255,0.22)]">Événements</span>
                        <span className="block text-banan-primary drop-shadow-[0_0_35px_rgba(250,255,0,0.3)]">& Timeline</span>
                    </h1>
                    <p className="mx-auto max-w-2xl font-mono text-sm leading-relaxed text-white/65 sm:text-base">Archives fictives du Protocole Potassium.</p>
                </div>

                <div className="mx-auto w-full max-w-7xl pb-10 sm:px-4">
                    <ProtocolTimeline />
                </div>

                <div className="mx-auto w-full max-w-7xl pb-20 sm:px-4">
                    <FallenBananiers />
                </div>

                <div className="w-full pb-8 select-none">
                    <p className="text-center font-mono text-[10px] text-white/10 hover:text-white/30 transition-colors duration-700 tracking-widest cursor-default">
                        palantint sait déjà que vous lisez ceci.
                    </p>
                </div>
            </div>
        </div>
    );
}
