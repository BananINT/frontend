
import { AlertOctagon, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import ShowcaseSection from './ShowcaseSection';

export default function RecruitmentHub() {
    return (
        <ShowcaseSection title="" centered>
            <div className="w-full max-w-5xl mx-auto relative overflow-hidden rounded-3xl border-2 border-banan-primary shadow-[0_0_50px_rgba(250,255,0,0.2)]">
                
                {/* Hazard striping background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, #FAFF00, #FAFF00 20px, #000 20px, #000 40px)`
                }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>

                <div className="w-full relative p-10 overflow-hidden text-center flex flex-col items-center">
                    <AlertOctagon className="w-16 h-16 text-banan-primary mb-6 drop-shadow-[0_0_15px_rgba(250,255,0,0.8)]" />
                    
                    <h2 className="text-4xl md:text-6xl font-black uppercase text-white tracking-tighter mb-4">
                        Rejoins le réseau. <br/> <span className="text-banan-primary">Deviens un Bananier.</span>
                    </h2>
                    
                    <p className="max-w-2xl text-white/80 font-mono text-sm md:text-base leading-relaxed mb-10">
                        ATTENTION : L'exposition prolongée au clicker banane peut entraîner une addiction sévère au potassium virtuel et une dépendance aux jeux de gambling.
                    </p>
                    
                    <Link 
                        to="/clicker"
                        className="relative group inline-flex items-center justify-center gap-4 bg-banan-primary text-black font-black uppercase tracking-widest text-xl px-12 py-5 rounded-full overflow-hidden transition-transform hover:scale-105"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                        <span className="relative z-10">DEVENIR UN BANANIER</span>
                        <ArrowRight className="w-6 h-6 shrink-0 relative z-10 transition-transform group-hover:translate-x-2" />
                    </Link>
                </div>
            </div>
        </ShowcaseSection>
    );
}
