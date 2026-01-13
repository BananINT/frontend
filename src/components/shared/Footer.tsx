
import { Banana, Github, Instagram, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="w-full bg-black border-t border-white/10 text-white pt-16 pb-8 font-mono relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-banan-primary blur-[50px] opacity-20" />

            <div className="container max-w-[1920px] mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <Link to="/" className="text-3xl font-black uppercase text-white hover:text-banan-primary transition-colors font-sans tracking-tighter">
                            BananINT
                        </Link>
                        <p className="text-white/50 text-sm max-w-sm leading-relaxed">
                            Fournisseur officiel de potassium numérique.
                            Le club qui cultive la technologie et la bonne humeur
                            sur le campus de Télécom SudParis.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-banan-primary font-bold uppercase tracking-widest mt-4">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            System Operational
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase text-white/40 tracking-widest">Navigation</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/" className="text-white/70 hover:text-banan-primary transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 bg-white/20 group-hover:bg-banan-primary rounded-full transition-colors" />
                                    Accueil
                                </Link>
                            </li>
                            <li>
                                <Link to="/clicker" className="text-white/70 hover:text-banan-primary transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 bg-white/20 group-hover:bg-banan-primary rounded-full transition-colors" />
                                    Banana Clicker
                                </Link>
                            </li>
                            <li>
                                <Link to="https://bananee.bananint.fr" className="text-white/70 hover:text-banan-primary transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 bg-white/20 group-hover:bg-banan-primary rounded-full transition-colors" />
                                    Bananée
                                </Link>
                            </li>
                            <li>
                                <a href="/archives" className="text-white/70 hover:text-banan-primary transition-colors flex items-center gap-2 group cursor-not-allowed opacity-50">
                                    <span className="w-1 h-1 bg-white/20 group-hover:bg-banan-primary rounded-full transition-colors" />
                                    Archives (WIP)
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Reseaux */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase text-white/40 tracking-widest">Réseaux</h4>
                        <div className="flex gap-4">
                            <a href="https://www.instagram.com/bananint" target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-banan-primary hover:text-black hover:border-banan-primary transition-all group">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="https://github.com/bananint" target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white hover:text-black hover:border-white transition-all group">
                                <Github className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] uppercase font-bold tracking-widest text-white/40">
                    <div className="flex items-center gap-4">
                        <span>© 2026 BananINT</span>
                        <span className="hidden md:inline text-white/20">|</span>
                        <span>Fait avec <Heart className="w-3 h-3 inline text-red-500 mx-1 align-sub" /> et des <Banana className="w-3 h-3 inline align-sub text-banan-primary" /> à Evry(-Courcouronnes)</span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-banan-primary transition-colors cursor-help group">
                        <span>"Vous voulez un trisou?"</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">👀</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
