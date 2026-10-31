import { useEffect, useState } from 'react';
import { Trophy, Medal, Hexagon } from 'lucide-react';
import { motion } from 'framer-motion';
import ShowcaseSection from './ShowcaseSection';
import { formatNumber } from '@app/utils/format';

interface Bananier {
    rank: number;
    name: string;
    bananas: number;
    prestige: number;
}

const TOP_BANANIERS: Bananier[] = [
    { rank: 1, name: "À pourvoir", bananas: 0, prestige: 0 },
    { rank: 2, name: "À pourvoir", bananas: 0, prestige: 0 },
    { rank: 3, name: "À pourvoir", bananas: 0, prestige: 0 },
];

const PodiumCard = ({ op }: { op: Bananier }) => {
    const isFirst = op.rank === 1;
    const isSecond = op.rank === 2;
    const isThird = op.rank === 3;
    
    const rankColor = isFirst 
        ? 'text-banan-primary border-banan-primary shadow-[0_0_30px_rgba(250,255,0,0.3)]' 
        : isSecond
        ? 'text-white/80 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
        : 'text-[#CD7F32] border-[#CD7F32]/50 shadow-[0_0_20px_rgba(205,127,50,0.1)]';

    const heightClass = isFirst ? 'h-40 sm:h-52 md:h-64' : (isSecond ? 'h-32 sm:h-40 md:h-48' : 'h-28 sm:h-32 md:h-40');
    const delay = isFirst ? 0.2 : (isSecond ? 0.4 : 0.6);

    return (
        <motion.div
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            className={`flex flex-col items-center justify-end min-w-0 flex-1 basis-0 ${isFirst ? 'sm:scale-110 z-10 mx-1 sm:mx-4' : 'z-0'} relative`}
        >
            {/* Bananier Info */}
            <div className="text-center mb-3 sm:mb-6 w-full px-1">
                <h3 className={`font-black uppercase tracking-widest text-xs sm:text-lg md:text-xl mb-1 truncate ${isFirst ? 'text-white' : 'text-white/80'}`}>
                    {op.name}
                </h3>
                <p className="font-mono text-[11px] sm:text-xs text-white/50 mb-2 truncate">
                    {formatNumber(op.bananas)} BANANES
                </p>
                {op.prestige > 0 && (
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-banan-teal bg-banan-teal/10 border border-banan-teal/20 rounded px-2 py-0.5 w-fit mx-auto">
                        <Hexagon className="w-3 h-3 shrink-0" />
                        PRESTIGE {op.prestige}
                    </div>
                )}
            </div>

            {/* Pedestal Component */}
            <div className={`w-full max-w-[90px] sm:max-w-[110px] md:max-w-[140px] relative`}>
                {/* Glow behind */}
                {isFirst && <div className="absolute inset-0 bg-banan-primary/20 blur-2xl -z-10 rounded-t-full"></div>}

                {/* The Block */}
                <div className={`w-full ${heightClass} bg-gradient-to-t from-black to-white/5 border-t-2 border-x border-b-0 ${rankColor} rounded-t-2xl flex flex-col items-center pt-4 sm:pt-8 relative overflow-hidden backdrop-blur-md`}>

                    {/* Glass reflection */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-4"></div>

                    <div className={`text-2xl sm:text-3xl md:text-4xl font-black ${isFirst ? 'text-banan-primary' : 'text-white/40'}`}>
                        {op.rank}
                    </div>
                    {isFirst && <Trophy className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-banan-primary mt-2 sm:mt-4 drop-shadow-[0_0_10px_rgba(250,255,0,0.8)]" />}
                    {isSecond && <Medal className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white/50 mt-2 sm:mt-4" />}
                    {isThird && <Medal className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#CD7F32]/50 mt-2 sm:mt-4" />}
                </div>
            </div>
        </motion.div>
    );
};

export default function HallOfFame() {
    const [topOps, setTopOps] = useState<Bananier[]>(TOP_BANANIERS);

    useEffect(() => {
        const fetchTop = async () => {
            try {
                const res = await fetch('/api/stats/leaderboard');
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        const newOps: Bananier[] = [];
                        for (let i = 0; i < 3; i++) {
                            if (data[i]) {
                                newOps.push({
                                    rank: i + 1,
                                    name: data[i].name,
                                    bananas: data[i].score,
                                    prestige: data[i].prestigeCount || 0
                                });
                            } else {
                                newOps.push({
                                    rank: i + 1,
                                    name: "À pourvoir",
                                    bananas: 0,
                                    prestige: 0
                                });
                            }
                        }
                        setTopOps(newOps);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch Hall of Fame", err);
            }
        };
        fetchTop();
        const interval = setInterval(fetchTop, 15000); // 15s poll for home page is fine
        return () => clearInterval(interval);
    }, []);

    return (
        <ShowcaseSection title="Podium des Bananiers" icon={Trophy} centered>
            <div className="flex items-end justify-center perspective-1000 pt-10">
                <div className="flex items-end justify-center w-full max-w-3xl transform">
                    <PodiumCard op={topOps[1]} /> {/* 2nd */}
                    <PodiumCard op={topOps[0]} /> {/* 1st */}
                    <PodiumCard op={topOps[2]} /> {/* 3rd */}
                </div>
            </div>
        </ShowcaseSection>
    );
}
