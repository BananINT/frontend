import { useRef, useState } from 'react';
import { Banana, MousePointer2 } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import ShowcaseSection from './ShowcaseSection';

export default function InteractiveBanana() {
    const containerRef = useRef<HTMLDivElement>(null);
    const controls = useAnimation();
    const [clickCount, setClickCount] = useState(0);

    const handleTap = () => {
        setClickCount((prev: number) => prev + 1);
        controls.start({
            scale: [1, 0.9, 1.1, 1],
            rotate: [0, -15, 15, 0],
            transition: { duration: 0.4 }
        });
    };

    return (
        <ShowcaseSection title="Banana Sandbox" icon={MousePointer2} centered>
            <div 
                ref={containerRef}
                className="w-full max-w-3xl mx-auto h-[400px] bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center cursor-crosshair"
                style={{ 
                    backgroundImage: 'radial-gradient(circle at center, rgba(250,255,0,0.05) 0%, transparent 70%)' 
                }}
            >
                <div className="absolute inset-0 pointer-events-none grid grid-cols-6 grid-rows-4 opacity-[0.02]">
                    {[...Array(24)].map((_, i) => (
                        <div key={i} className="border border-white/10"></div>
                    ))}
                </div>

                <motion.div
                    drag
                    dragConstraints={containerRef}
                    dragElastic={0.2}
                    whileDrag={{ scale: 1.2, cursor: "grabbing" }}
                    onTap={handleTap}
                    animate={controls}
                    className="relative z-10 w-32 h-32 bg-banan-primary/10 border-2 border-banan-primary rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(250,255,0,0.3)] cursor-grab touch-none"
                >
                    <Banana className="w-16 h-16 text-banan-primary drop-shadow-[0_0_10px_rgba(250,255,0,0.8)]" />
                </motion.div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black border border-white/20 rounded-full px-6 py-2 shadow-2xl">
                    <span className="font-mono text-xs text-white/50 uppercase tracking-widest">Interactions :</span>
                    <span className="font-mono text-lg font-bold text-banan-primary">{clickCount}</span>
                </div>
                
                <p className="absolute top-6 font-mono text-[10px] text-white/20 uppercase tracking-[0.3em]">
                    [ DRAG & DROP ENABLED // TAP FOR KINETIC RESPONSE ]
                </p>
            </div>
        </ShowcaseSection>
    );
}
