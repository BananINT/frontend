
import Globe from '@/components/ui/Globe';
import ShinyText from '@/components/ui/ShinyText';
import Aurora from '@/components/ui/Aurora';
import LavaLamp from '@/components/ui/LavaLamp';
import { Banana, Users, Calendar, Gamepad, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
    return (
        <div className="min-h-[calc(100vh-6rem)] bg-black text-white overflow-x-hidden relative font-sans">
            <Aurora>
                <div className="relative z-20 flex flex-col items-center pt-12 pb-12 px-4 text-center">

                    {/* Header Text */}
                    <div className="mb-8 relative z-30 px-4">
                        <span className="text-xs sm:text-sm font-mono text-banan-primary uppercase tracking-[0.3em] mb-4 block">Club Télécom SudParis</span>
                        <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter uppercase leading-none">
                            <ShinyText text="BananINT" speed={6} />
                        </h1>
                        <p className="mt-6 text-sm sm:text-xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
                            Fournisseur de potassium numérique.
                        </p>
                    </div>

                    {/* HERO GRID: Stats Left - Globe Center - Stats Right */}
                    <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-8 items-center relative min-h-[600px]">

                        {/* Left Stat */}
                        <div className="hidden lg:flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl h-[200px] hover:bg-white/10 transition-colors group">
                            <Users className="w-12 h-12 text-banan-primary mb-4 transition-transform group-hover:scale-110" />
                            <div className="text-5xl font-black text-white mb-2">42</div>
                            <div className="text-xs font-mono uppercase tracking-widest text-white/50">Membres Actifs</div>
                        </div>

                        {/* Globe Center - Full Width on Mobile */}
                        <div className="w-[calc(100%+2rem)] -mx-4 lg:w-full lg:mx-0 h-[500px] lg:h-[600px] flex items-center justify-center relative">
                            <div className="absolute inset-0 z-10">
                                <Globe />
                            </div>
                        </div>

                        {/* Right Stat */}
                        <div className="hidden lg:flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl h-[200px] hover:bg-white/10 transition-colors group">
                            <Banana className="w-12 h-12 text-banan-primary mb-4 transition-transform group-hover:scale-110" />
                            <div className="text-5xl font-black text-white mb-2">1.2M</div>
                            <div className="text-xs font-mono uppercase tracking-widest text-white/50">Bananes Farmées</div>
                        </div>

                        {/* Mobile Stats (Shows below globe on mobile) */}
                        <div className="lg:hidden grid grid-cols-2 gap-4 w-full">
                            <div className="flex flex-col items-center justify-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl">
                                <Users className="w-8 h-8 text-banan-primary mb-2" />
                                <div className="text-3xl font-black text-white">42</div>
                                <div className="text-[10px] font-mono uppercase tracking-widest text-white/50">Membres</div>
                            </div>
                            <div className="flex flex-col items-center justify-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl">
                                <Banana className="w-8 h-8 text-banan-primary mb-2" />
                                <div className="text-3xl font-black text-white">1.2M</div>
                                <div className="text-[10px] font-mono uppercase tracking-widest text-white/50">Bananes</div>
                            </div>
                        </div>

                    </div>

                    {/* Nos Events Section */}
                    <div className="w-full max-w-6xl mx-auto text-left relative z-30 mb-20 mt-12">
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-4xl font-black uppercase text-white">Nos Events</h2>
                            <div className="h-1 flex-1 bg-gradient-to-r from-banan-primary to-transparent rounded-full" />
                        </div>

                        <div className="m-10 flex justify-center">
                            <Link 
                                to="/clicker" 
                                className="inline-flex items-center gap-3 bg-banan-primary text-black font-black uppercase tracking-tighter text-lg px-10 py-4 rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(250,255,0,0.4)]"
                            >
                                <Banana className="w-6 h-6" />
                                Jouer Maintenant
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Lava Lamp Implementation */}
                            <div className="flex items-center justify-center bg-white/5 rounded-3xl border border-white/10 h-[500px] relative overflow-hidden group">
                                <LavaLamp />
                                {/* Tooltip removed as requested */}
                            </div>

                            {/* Event List */}
                            <div className="flex flex-col gap-6 justify-center">
                                <div className="flex items-start gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-banan-primary transition-colors group">
                                    <div className="p-3 bg-white/10 rounded-xl text-banan-primary group-hover:bg-banan-primary group-hover:text-black transition-colors">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-1 group-hover:text-banan-primary transition-colors">WEB Week-end Banane</h4>
                                        <p className="text-white/60 text-sm leading-relaxed">Un week-end délirant où on mange des bananes entre amis!</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-green-400 transition-colors group">
                                    <div className="p-3 bg-white/10 rounded-xl text-green-400 group-hover:bg-green-400 group-hover:text-black transition-colors">
                                        <Gamepad className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-1 group-hover:text-green-400 transition-colors">Tournois Jeux</h4>
                                        <p className="text-white/60 text-sm leading-relaxed">Mario Kart, Donkey Kong et plein d'autres jeux ! Viens affronter tes potes dans une ambiance banane.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-yellow-200 transition-colors group">
                                    <div className="p-3 bg-white/10 rounded-xl text-yellow-200 group-hover:bg-yellow-200 group-hover:text-black transition-colors">
                                        <ArrowDown className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-1 group-hover:text-yellow-200 transition-colors">Import de Bananes</h4>
                                        <p className="text-white/60 text-sm leading-relaxed">On importe des bananes pour toute l'école ! Recettes à base de banane et bonheur garanti.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Le Protocole Potassium (About Us) Section */}
                    <div className="w-full max-w-4xl mx-auto text-center relative z-30 mb-20">
                        <h2 className="text-4xl md:text-5xl font-black uppercase text-white mb-6">Le Protocole Potassium</h2>
                        <div className="p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-banan-primary to-transparent opacity-50"></div>
                            <p className="text-xl md:text-2xl text-white/80 font-light leading-relaxed">
                                "Nous ne faisons pas qu'écrire du code ; nous cultivons une vraie adoration du <span className="text-banan-primary font-bold">potassium numérique</span>. Notre mission est d'injecter une dose létale de fun dans l'écosystème du campus. Que ce soit via des jeux en lignes révolutionnaires, des expériences web ou juste en distribuant de vraies bananes, une seule règle : <span className="italic text-white">que ça glisse.</span>"
                            </p>
                        </div>
                    </div>

                    {/* L'équipe (The Team) Section */}
                    <div className="w-full max-w-6xl mx-auto text-left relative z-30 mb-24">
                        <div className="flex items-center gap-4 mb-12">
                            <h2 className="text-4xl font-black uppercase text-white">L'équipe (les addicts)</h2>
                            <div className="h-1 flex-1 bg-gradient-to-r from-banan-primary to-transparent rounded-full" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Tech Lead Card (Left) */}
                            <div className="group relative p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all hover:-translate-y-2">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(0,166,62,0.3)] overflow-hidden">
                                    <img src="/img/team/dim.webp" alt="Dimitri Fajal" className="w-full h-full object-cover" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-2xl font-black text-white uppercase mb-1">Dimitri Fajal</h3>
                                    <p className="text-[#4ADE80] font-mono text-sm tracking-widest uppercase mb-4">Tech Lead / Singe du code</p>
                                    <div className="w-full h-px bg-white/10 mb-4"></div>
                                    <p className="text-white/60 text-sm">"Transforme la caféine en algorithmes enrichis en potassium."</p>
                                </div>
                            </div>

                            {/* President Card (Center) */}
                            <div className="group relative p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all hover:-translate-y-2 transform md:scale-105 border-banan-primary/30">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black shadow-[0_0_30px_rgba(250,255,0,0.5)] overflow-hidden">
                                    <img src="/img/team/luc.webp" alt="Lucas Thuries" className="w-full h-full object-cover" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-2xl font-black text-white uppercase mb-1">Lucas Thuries</h3>
                                    <p className="text-banan-primary font-mono text-sm tracking-widest uppercase mb-4">Président / M. Grosse Banane</p>
                                    <div className="w-full h-px bg-white/10 mb-4"></div>
                                    <p className="text-white/60 text-sm">"Mène la révolution banane, une réunion à la fois."</p>
                                </div>
                            </div>

                            {/* Community Manager Card (Right) */}
                            <div className="group relative p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all hover:-translate-y-2">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(168,85,247,0.3)] overflow-hidden">
                                    <img src="/img/team/flo.webp" alt="Florian Rivière" className="w-full h-full object-cover" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-2xl font-black text-white uppercase mb-1">Florian Rivière</h3>
                                    <p className="text-purple-400 font-mono text-sm tracking-widest uppercase mb-4">CM / Hype Man</p>
                                    <div className="w-full h-px bg-white/10 mb-4"></div>
                                    <p className="text-white/60 text-sm">"Répand la bonne parole plus vite qu'on ne glisse."</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Aurora>
        </div>
    );
}
