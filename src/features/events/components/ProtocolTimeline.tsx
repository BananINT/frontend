
import { History } from 'lucide-react';
import { motion } from 'framer-motion';
import ShowcaseSection from '../../home/components/ShowcaseSection';

interface TimelineEvent {
    year: string;
    title: string;
    description: string;
}

const EVENTS: TimelineEvent[] = [
    { year: "SEP 2025", title: "L'Étincelle Originelle", description: "Un groupe secret d'étudiants de Télécom SudParis découvre le potentiel caché des bananes pour optimiser la compilation de code en C." },
    { year: "OCT 2025", title: "La Réserve Fédérale Bananière", description: "Mise en place du premier serveur clandestin dans le cours Beyond Notting Hill. Début du minage des premières unités de Potassium." },
    { year: "NOV 2025", title: "L'Incident MiNET", description: "Le réseau BananINT sature la bande passante du campus en moins de 10 secondes. Le SI-Etudiant crash en boucle." },
    { year: "DEC 2025", title: "L'Incident du BDE", description: "Hypnos perd la liste, BananINT est demote et ses serveurs sont détruits lors de RagINT. Fuck le BDE. BananINT se morfond dans l'ombre." },
    { year: "JAN 2026", title: "La Secte", description: "Le groupe de militants bananiers s'organise pour contrer l'influence du BDE en secret. BananINT se rebelle contre l'oppression et renaît de ses cendres." },
    { year: "MAR 2026", title: "La Renaissance", description: "Lancement public du protocole boursier et de l'Ascension. La domination globale est désormais inévitable." },
    { year: "... 2026", title: "Le WEB et le Banana Monday", description: "A venir..." },
];

export default function ProtocolTimeline() {
    return (
        <ShowcaseSection title="Timeline BananINT" icon={History} centered maxWidth="max-w-4xl">
            <div className="relative mt-16 pr-4 pl-0 md:pr-0">
                
                <div className="space-y-12 relative z-10">
                    {EVENTS.map((event, index) => {
                        const isEven = index % 2 === 0;
                        const isLast = index === EVENTS.length - 1;
                        return (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className={`flex flex-col md:flex-row items-start md:items-center justify-between w-full relative ${
                                    isEven ? 'md:flex-row-reverse' : ''
                                }`}
                            >
                                {/* Glowing Dot */}
                                <div className="absolute left-[15px] md:left-1/2 top-[30px] md:top-[38px] w-4 h-4 bg-black border-[3px] border-banan-primary rounded-full z-20 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_var(--color-banan-primary)]"></div>
                                
                                {/* Vertical Line Segment */}
                                {!isLast && (
                                    <div className={`absolute left-[15px] md:left-1/2 top-[30px] md:top-[38px] w-1 ${index === 0 ? 'bg-gradient-to-b from-banan-primary/50 to-white/10' : 'bg-white/10'} -translate-x-1/2 z-0`} style={{ height: 'calc(100% + 48px)' }}></div>
                                )}
                                
                                {/* Date Marker for Mobile */}
                                <div className="pl-[40px] md:hidden font-mono text-banan-primary text-xl font-bold mb-2 pt-4">
                                    [{event.year}]
                                </div>

                                {/* Content Box */}
                                <div className={`w-full md:w-[45%] pl-[40px] md:pl-0 ${isEven ? 'md:pl-10' : 'md:pr-10'}`}>
                                    <div className={`p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-banan-primary/30 transition-colors group relative ${
                                        isEven ? 'md:text-left' : 'md:text-right'
                                    }`}>
                                        
                                        <div className="flex items-center gap-3 mb-2 justify-start md:hidden">
                                            <h3 className="text-xl font-bold text-white uppercase">{event.title}</h3>
                                        </div>
                                        <div className={`hidden md:flex items-center gap-3 mb-2 ${isEven ? 'justify-start' : 'justify-end'}`}>
                                            {!isEven && <h3 className="text-xl font-bold text-white uppercase">{event.title}</h3>}
                                            {isEven && <h3 className="text-xl font-bold text-white uppercase">{event.title}</h3>}
                                        </div>

                                        <p className="text-white/60 text-sm leading-relaxed mb-4">
                                            {event.description}
                                        </p>
                                        
                                        <div className={`hidden md:block absolute top-[38px] w-10 h-px bg-banan-primary/30 group-hover:bg-banan-primary/80 transition-colors -z-10 ${
                                            isEven ? '-left-10' : '-right-10'
                                        }`} style={{ transform: 'translateY(-50%)' }}></div>
                                    </div>
                                </div>

                                {/* Date Marker for Desktop */}
                                <div className={`hidden md:flex w-full md:w-[45%] ${isEven ? 'justify-end pr-10' : 'justify-start pl-10'}`}>
                                    <span className="font-mono text-banan-primary/30 text-4xl lg:text-5xl font-black tracking-tighter hover:text-banan-primary transition-colors cursor-default whitespace-nowrap">
                                        {event.year}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

            </div>
        </ShowcaseSection>
    );
}
