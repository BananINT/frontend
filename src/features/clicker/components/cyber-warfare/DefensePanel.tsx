import { Shield, Zap } from 'lucide-react';
import { socketManager } from '@app/lib/socket';
import { formatNumber } from '@app/utils/format';
import type { CyberWarfare } from './useCyberWarfare';

type DefensePanelProps = Pick<CyberWarfare, 'hasHoneypot' | 'state' | 'bananas' | 'fwCost' | 'mercCost'>;

/** Firewall and mercenaries. */
export default function DefensePanel({ hasHoneypot, state, bananas, fwCost, mercCost }: DefensePanelProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <h3 className="font-mono text-xs font-black uppercase tracking-wider text-white">
                        Défense Système & Mercenaires
                    </h3>
                </div>
                {hasHoneypot && (
                    <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/40 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                        <Zap className="h-2.5 w-2.5" /> PIÈGE HONEYPOT ICE ACTIF
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Firewall Card */}
                <div className="p-3 border border-blue-500/30 bg-blue-950/10 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center">
                            <span className="font-mono text-xs font-bold text-blue-400 uppercase">Pare-feu Bananier</span>
                            <span className="font-mono text-xs font-black text-white">Niveau {state?.firewall_level || 0}</span>
                        </div>
                        <div className="text-[11px] font-mono text-white/50 mt-1">
                            Mitigation des attaques ennemies : <span className="text-blue-300 font-bold">{Math.min(90, (state?.firewall_level || 0) * 10)}%</span>
                        </div>
                    </div>
                    <button
                        onClick={() => socketManager.send('upgrade_firewall', {})}
                        disabled={bananas < fwCost}
                        className="mt-3 w-full py-2 bg-blue-600/20 border border-blue-500 hover:bg-blue-600 hover:text-black text-blue-100 font-mono text-[11px] font-bold uppercase transition-colors disabled:opacity-30"
                    >
                        Améliorer ({formatNumber(fwCost)} 🍌)
                    </button>
                </div>

                {/* Mercenaries Card */}
                <div className="p-3 border border-red-500/30 bg-red-950/10 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center">
                            <span className="font-mono text-xs font-bold text-red-400 uppercase">Cyber-Mercenaires</span>
                            <span className="font-mono text-xs font-black text-white">{state?.mercenaries || 0} Unités</span>
                        </div>
                        <div className="text-[11px] font-mono text-white/50 mt-1">
                            Siphon automatique sur le Leaderboard toutes les 60s.
                        </div>
                    </div>
                    <button
                        onClick={() => socketManager.send('hire_mercenary', {})}
                        disabled={bananas < mercCost}
                        className="mt-3 w-full py-2 bg-red-600/20 border border-red-500 hover:bg-red-600 hover:text-black text-red-100 font-mono text-[11px] font-bold uppercase transition-colors disabled:opacity-30"
                    >
                        Recruter ({formatNumber(mercCost)} 🍌)
                    </button>
                </div>
            </div>
        </div>
    );
}
