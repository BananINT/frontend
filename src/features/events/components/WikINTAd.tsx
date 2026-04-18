import { BookOpen, ExternalLink, GraduationCap, Users, GitPullRequest, Heart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import ShowcaseSection from '@app/features/home/components/ShowcaseSection';
import ShinyText from '@app/components/ui/ShinyText';

export default function WikINTAd() {
    return (
        <>
        <ShowcaseSection title="Partenariat WikINT" icon={BookOpen} centered maxWidth="max-w-4xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
                viewport={{ once: true }}
                className="mt-12 relative group"
            >
                {/* Knowledge Container */}
                <div className="relative bg-white/5 backdrop-blur-md border border-white/10 p-10 md:p-16 overflow-hidden rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.6)]">
                    
                    {/* Grain & Subtle Glow */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-banan-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6 relative z-10">
                        <div className="flex items-center gap-6 text-left">
                            <div className="p-5 bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl shadow-inner">
                                <GraduationCap className="w-10 h-10 text-banan-primary" />
                            </div>
                            <div>
                                <h3 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                                    <ShinyText text="WikINT" />
                                </h3>
                                <span className="text-[12px] font-mono text-white/50 uppercase tracking-[0.4em] mt-2 block">
                                    Knowledge Base // TSP & IMT-BS
                                </span>
                            </div>
                        </div>
                        <a 
                            href="https://wikint.clubcode.fr" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-6 py-4 bg-banan-primary text-black font-black uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-all active:scale-95 shadow-[0_0_20px_rgba(var(--banan-primary-rgb),0.4)]"
                        >
                            Explorer <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>

                    {/* Content Body */}
                    <div className="space-y-12 relative z-10 text-left">
                        <p className="text-2xl md:text-3xl font-bold text-white/90 leading-tight max-w-3xl">
                            La plateforme collaborative de ressources académiques gérée par les étudiants. <br/>
                            <span className="text-white/60 font-light">Votre nouveau meilleur ami pour réviser.</span>
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-12 border-t border-white/10">
                            <div className="space-y-4 group/item text-left">
                                <div className="flex items-center gap-3">
                                    <Users className="w-6 h-6 text-banan-primary opacity-80" />
                                    <span className="text-xs font-mono text-white/70 uppercase tracking-widest font-bold">Collaboratif</span>
                                </div>
                                <p className="text-sm text-white/50 leading-relaxed font-light">
                                    Une intelligence collective où chaque étudiant contribue à l'essor du savoir commun.
                                </p>
                            </div>
                            
                            <div className="space-y-4 group/item text-left">
                                <div className="flex items-center gap-3">
                                    <GitPullRequest className="w-6 h-6 text-banan-primary opacity-80" />
                                    <span className="text-xs font-mono text-white/70 uppercase tracking-widest font-bold">Qualité</span>
                                </div>
                                <p className="text-sm text-white/50 leading-relaxed font-light">
                                    Chaque ajout passe par une revue rigoureuse avant publication. Chacun peut voter.
                                </p>
                            </div>

                            <div className="space-y-4 group/item text-left">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="w-6 h-6 text-banan-primary opacity-80" />
                                    <span className="text-xs font-mono text-white/70 uppercase tracking-widest font-bold">Ressources</span>
                                </div>
                                <p className="text-sm text-white/50 leading-relaxed font-light">
                                    PDFs, Office, Images, Vidéos, Audio et Code. Tout ce dont vous avez besoin pour réussir.
                                </p>
                            </div>
                        </div>

                        {/* Club Code Shoutout */}
                        <div className="mt-12 pt-8 border-t border-white/10 text-center flex flex-col items-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-4">
                                <Heart className="w-4 h-4 text-red-500" />
                                <span className="text-xs font-mono text-white/70 uppercase">Powered by</span>
                                <span className="text-xs font-black text-white uppercase tracking-widest">Club Code</span>
                            </div>
                            <p className="text-sm font-light text-white/50 max-w-xl italic">
                                Un immense merci au Club Code pour le design, le développement et la maintenance de cette infrastructure technique. Sans eux, les CFs deviennent un enfer.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Decorative Sharp Accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-banan-primary/30 -translate-x-4 -translate-y-4 rounded-tl-2xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-banan-primary/30 translate-x-4 translate-y-4 rounded-br-2xl" />
            </motion.div>
        </ShowcaseSection>

        {/* PalantINT Teaser */}
        <div className="w-full max-w-4xl mx-auto mt-4 px-4 hidden md:block">
            <div className="p-6 bg-black border border-white/10 rounded-2xl flex items-center justify-between overflow-hidden relative shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                <div className="absolute inset-0 bg-[url('/img/noise.svg')] opacity-[0.05] pointer-events-none mix-blend-screen"></div>
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-purple-500/20 blur-[50px] rounded-full pointer-events-none"></div>
                
                <div className="flex-1 relative z-10 text-left">
                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-[0.3em] font-bold">Projet Classifié // En Dev</span>
                    <h4 className="text-2xl font-black text-white uppercase tracking-widest mt-1 flex items-center gap-2">
                        PalantINT <Eye className="w-5 h-5 text-purple-400" />
                    </h4>
                    <p className="text-sm text-white/50 mt-1 font-mono">
                        Bientôt. L'œil qui voit tout s'ouvrira sur le campus.
                    </p>
                </div>
                <div className="relative z-10 shrink-0 ml-6">
                    <div className="w-12 h-12 rounded-full border border-purple-500/30 border-t-purple-500 animate-[spin_3s_linear_infinite] flex items-center justify-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
