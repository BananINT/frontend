import { BookOpen, ExternalLink, GraduationCap, Users, GitPullRequest, Heart, Newspaper, Handshake, Unlock, Accessibility, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import ShowcaseSection from '@app/features/home/components/ShowcaseSection';

export default function WikINTAd() {
    return (
        <ShowcaseSection title={"Parte\u00ADnariats"} icon={Handshake} centered>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                {/* Intellect Card */}
                <motion.div
                    initial={false}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2 }}
                    viewport={{ once: true }}
                    className="relative group h-full"
                >
                    <div className="relative h-full flex flex-col bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-10 overflow-hidden rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.6)]">
                        {/* Grain & Subtle Glow */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/20 blur-[100px] rounded-full pointer-events-none"></div>

                        {/* Header */}
                        <div className="flex items-center gap-4 sm:gap-6 text-left mb-8 relative z-10">
                            <div className="p-3 sm:p-5 shrink-0 bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl shadow-inner">
                                <GraduationCap className="w-7 h-7 sm:w-10 sm:h-10 text-orange-400" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none text-orange-400">
                                    Intellect
                                </h3>
                                <span className="text-[11px] font-mono text-white/50 uppercase tracking-[0.3em] mt-2 block">
                                    Knowledge Base // TSP & IMT-BS
                                </span>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="space-y-10 relative z-10 text-left flex-1">
                            <p className="text-xl md:text-2xl font-bold text-white/90 leading-tight">
                                La plateforme collaborative de ressources académiques gérée par les étudiants. <br />
                                <span className="text-white/60 font-light">Votre nouveau meilleur ami pour réviser.</span>
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-white/10">
                                <div className="space-y-3 text-left">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-orange-400 opacity-80" />
                                        <span className="text-[11px] font-mono text-white/70 uppercase tracking-widest font-bold">Collaboratif</span>
                                    </div>
                                    <p className="text-xs text-white/50 leading-relaxed font-light">
                                        Une intelligence collective où chaque étudiant contribue à l'essor du savoir commun.
                                    </p>
                                </div>

                                <div className="space-y-3 text-left">
                                    <div className="flex items-center gap-3">
                                        <GitPullRequest className="w-5 h-5 text-orange-400 opacity-80" />
                                        <span className="text-[11px] font-mono text-white/70 uppercase tracking-widest font-bold">Qualité</span>
                                    </div>
                                    <p className="text-xs text-white/50 leading-relaxed font-light">
                                        Chaque ajout passe par une revue rigoureuse avant publication. Chacun peut voter.
                                    </p>
                                </div>

                                <div className="space-y-3 text-left">
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="w-5 h-5 text-orange-400 opacity-80" />
                                        <span className="text-[11px] font-mono text-white/70 uppercase tracking-widest font-bold">Ressources</span>
                                    </div>
                                    <p className="text-xs text-white/50 leading-relaxed font-light">
                                        PDFs, Office, Images, Vidéos, Audio et Code. Tout ce dont vous avez besoin pour réussir.
                                    </p>
                                </div>
                            </div>

                            {/* Club Code Shoutout */}
                            <div className="pt-8 border-t border-white/10 text-center flex flex-col items-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-4">
                                    <Heart className="w-4 h-4 text-red-500" />
                                    <span className="text-xs font-mono text-white/70 uppercase">Powered by</span>
                                    <span className="text-xs font-black text-white uppercase tracking-widest">Club Code</span>
                                </div>
                                <p className="text-xs font-light text-white/50 max-w-xl italic">
                                    Un immense merci au Club Code pour le design, le développement et la maintenance de cette infrastructure technique. Sans eux, les CFs deviennent un enfer.
                                </p>
                            </div>
                        </div>

                        <a
                            href="https://intellect.clubcode.fr/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative z-10 mt-10 flex items-center justify-center gap-3 px-6 py-4 bg-orange-500 text-black font-black uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-all active:scale-95 shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                        >
                            Explorer <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>

                    {/* Decorative Sharp Accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-orange-500/30 -translate-x-4 -translate-y-4 rounded-tl-2xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-orange-500/30 translate-x-4 translate-y-4 rounded-br-2xl" />
                </motion.div>

                {/* INTPortal Card */}
                <motion.div
                    initial={false}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 0.15 }}
                    viewport={{ once: true }}
                    className="relative group h-full"
                >
                    <div className="relative h-full flex flex-col bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-10 overflow-hidden rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.6)]">
                        {/* Grain & Subtle Glow */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>

                        {/* Header */}
                        <div className="flex items-center gap-4 sm:gap-6 text-left mb-8 relative z-10">
                            <div className="p-3 sm:p-5 shrink-0 bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl shadow-inner">
                                <Newspaper className="w-7 h-7 sm:w-10 sm:h-10 text-blue-400" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none text-blue-400">
                                    INTPortal
                                </h3>
                                <span className="text-[11px] font-mono text-white/50 uppercase tracking-[0.3em] mt-2 block">
                                    Info Hub // TSP & IMT-BS
                                </span>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="space-y-10 relative z-10 text-left flex-1">
                            <p className="text-xl md:text-2xl font-bold text-white/90 leading-tight">
                                Le nouveau hub d'information du campus. <br />
                                <span className="text-white/60 font-light">Tout ce qu'il se passe à l'INT, au même endroit.</span>
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-white/10">
                                <div className="space-y-3 text-left">
                                    <div className="flex items-center gap-3">
                                        <Unlock className="w-5 h-5 text-blue-400 opacity-80" />
                                        <span className="text-[11px] font-mono text-white/70 uppercase tracking-widest font-bold">Ouverture</span>
                                    </div>
                                    <p className="text-xs text-white/50 leading-relaxed font-light">
                                        Une information libre et transparente, ouverte à tous les étudiants du campus.
                                    </p>
                                </div>

                                <div className="space-y-3 text-left">
                                    <div className="flex items-center gap-3">
                                        <Accessibility className="w-5 h-5 text-blue-400 opacity-80" />
                                        <span className="text-[11px] font-mono text-white/70 uppercase tracking-widest font-bold">Accessibilité</span>
                                    </div>
                                    <p className="text-xs text-white/50 leading-relaxed font-light">
                                        Tout ce qui compte, centralisé et facile à trouver, où que vous soyez.
                                    </p>
                                </div>

                                <div className="space-y-3 text-left">
                                    <div className="flex items-center gap-3">
                                        <Layers className="w-5 h-5 text-blue-400 opacity-80" />
                                        <span className="text-[11px] font-mono text-white/70 uppercase tracking-widest font-bold">Polyvalent</span>
                                    </div>
                                    <p className="text-xs text-white/50 leading-relaxed font-light">
                                        Actus, vie associative, opportunités : un seul hub pour tout le campus.
                                    </p>
                                </div>
                            </div>

                            {/* BananINT Shoutout */}
                            <div className="pt-8 border-t border-white/10 text-center flex flex-col items-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-4">
                                    <Heart className="w-4 h-4 text-red-500" />
                                    <span className="text-xs font-mono text-white/70 uppercase">Powered by</span>
                                    <span className="text-xs font-black text-white uppercase tracking-widest">BananINT</span>
                                </div>
                                <p className="text-xs font-light text-white/50 max-w-xl italic">
                                    INTPortal est développé et maintenu par l'équipe BananINT, au service de tout le campus.
                                </p>
                            </div>
                        </div>

                        <a
                            href="https://portal.bananint.fr/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative z-10 mt-10 flex items-center justify-center gap-3 px-6 py-4 bg-blue-500 text-black font-black uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-all active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                        >
                            Explorer <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>

                    {/* Decorative Sharp Accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-500/30 -translate-x-4 -translate-y-4 rounded-tl-2xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-500/30 translate-x-4 translate-y-4 rounded-br-2xl" />
                </motion.div>
            </div>
        </ShowcaseSection>
    );
}
