import { Skull, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import ShowcaseSection from '@app/features/home/components/ShowcaseSection';

const FALLEN = [
    { name: "π", record: "INFINI BANANES", reason: "Brisé par un reset de BDD" },
    { name: "Flop", record: "INFINI BANANES", reason: "Banni pour usage de macros illégales" },
    { name: "BananDev", record: "INFINI BANANES", reason: "Perdu dans le code legacy" },
    { name: "Hypnos", record: "INFINI BANANES", reason: "Fuck le BDE" },
];

export default function FallenBananiers() {
    return (
        <ShowcaseSection title="Mémorial des Bananiers Déchus" icon={Skull} centered maxWidth="max-w-4xl">
            <div className="mt-10 relative p-6 bg-banan-black border border-white/10 overflow-hidden font-mono">
                {/* Grid Background Mesh */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('/grid.svg')] bg-repeat"></div>

                {/* CRT Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(250,255,0,0.06),rgba(250,255,0,0.02),rgba(250,255,0,0.06))] bg-[length:100%_4px,3px_100%] z-10 opacity-30"></div>
                <div className="absolute inset-0 bg-banan-primary/5 pointer-events-none mix-blend-screen"></div>

                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4 relative z-20">
                    <Terminal className="w-5 h-5 text-banan-primary" />
                    <h3 className="text-banan-primary text-sm md:text-base uppercase tracking-widest font-bold font-sans">
                        ARCHIVES SYSTÈME : LEADERBOARD V1
                    </h3>
                </div>

                <div className="space-y-4 relative z-20">
                    {FALLEN.map((user, idx) => (
                        <motion.div 
                            key={idx}
                            initial={false}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-white/5 bg-white/5 duration-1000 transition-all"
                        >
                            <div className="mb-2 md:mb-0">
                                <span className="text-left text-banan-primary font-bold block transition-colors">{user.name}</span>
                                <span className="text-left text-white/50 text-[10px] md:text-xs font-mono transition-colors">RECORD: {user.record}</span>
                            </div>
                            <div className="text-left">
                                <span className="text-red-500/80 text-[10px] md:text-xs block uppercase font-mono memorial-pulse">FATAL 0xERROR: {user.reason}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <style>
                {`
                @keyframes pulseOpacity {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
                .memorial-pulse {
                    animation: pulseOpacity 4s ease-in-out infinite;
                }
                @media (prefers-reduced-motion: reduce) {
                    .memorial-pulse { animation: none; }
                }
                `}
            </style>

        </ShowcaseSection>
    );
}
