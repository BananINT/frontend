import { Fingerprint, Flame, Zap } from 'lucide-react';
import GameSection from '@app/components/shared/GameSection';
import { useCyberWarfare } from './cyber-warfare/useCyberWarfare';
import RaidAlertBanner from './cyber-warfare/RaidAlertBanner';
import AttackConsole from './cyber-warfare/AttackConsole';
import DefensePanel from './cyber-warfare/DefensePanel';
import BlackMarketPanel from './cyber-warfare/BlackMarketPanel';

interface Props {
    retaliationTarget?: { id: string; name: string } | null;
    onClearRetaliation?: () => void;
}

export default function CyberWarfareSection({ retaliationTarget, onClearRetaliation }: Props) {
    const cyber = useCyberWarfare({ retaliationTarget, onClearRetaliation });
    const { state, raidAlert } = cyber;

    return (
        <GameSection 
            title="CENTRE DE CYBER-GUERRE & MARCHÉ NOIR" 
            icon={Fingerprint} 
            className="w-full border-t border-white/10 p-0"
            headerClassName="p-4 mb-0"
            rightElement={
                <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="flex items-center gap-1.5 text-white/50">
                        <Flame className={`h-3 w-3 ${state && state.police_heat > 0.4 ? 'text-red-500 animate-pulse' : 'text-banan-primary'}`} />
                        HEAT POLICE : <span className="font-bold text-white">{Math.round((state?.police_heat || 0) * 100)}%</span>
                    </span>
                    {state?.overclock_active && (
                        <span className="flex items-center gap-1 text-banan-primary bg-banan-primary/10 border border-banan-primary/30 px-2 py-0.5 rounded animate-pulse font-bold">
                            <Zap className="h-3 w-3" /> FRÉNÉSIE ({state.overclock_remaining}s)
                        </span>
                    )}
                </div>
            }
        >
            {/* Raid Alert Banner */}
            <RaidAlertBanner raidAlert={raidAlert} />

            {/* 2-Column Responsive Grid Deck */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10 w-full">
                
                {/* COLUMN 1: CONSOLE DE FRAPPES CYBER */}
                <AttackConsole {...cyber} />

                {/* COLUMN 2: DÉFENSE ACTIVE & MARCHÉ NOIR (TORBANANA V2) */}
                <div className="p-4 md:p-6 flex flex-col gap-6">
                    
                    {/* Défense & Mercenaires */}
                    <DefensePanel {...cyber} />

                    {/* TorBanana V2 Marché Noir */}
                    <BlackMarketPanel {...cyber} />
                </div>
            </div>
        </GameSection>
    );
}
