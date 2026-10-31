import { Banana, Cpu, Key, ShieldAlert, Skull, Zap } from 'lucide-react';
import { socketManager } from '@app/lib/socket';
import { formatNumber } from '@app/utils/format';
import type { CyberWarfare } from './useCyberWarfare';

type BlackMarketPanelProps = Pick<CyberWarfare, 'state' | 'ownedItems' | 'bananas' | 'hasOverclock' | 'handleActivateOverclock'>;

/** TorBanana V2 black market, police heat and the overclock trigger. */
export default function BlackMarketPanel({ state, ownedItems, bananas, hasOverclock, handleActivateOverclock }: BlackMarketPanelProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                    <Skull className="h-4 w-4 text-purple-400" />
                    <h3 className="font-mono text-xs font-black uppercase tracking-wider text-white">
                        Marché Noir TorBanana V2
                    </h3>
                </div>
                <div className="text-[11px] font-mono text-white/60">
                    Risque de descente : <span className={state && state.police_heat > 0.4 ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>{Math.round((0.12 + (state?.police_heat || 0) * 0.35) * 100)}%</span>
                </div>
            </div>

            {/* Police Heat Gauge Bar */}
            <div>
                <div className="flex justify-between text-[11px] font-mono text-white/60 mb-1">
                    <span>INDICE DE RECHERCHE CYBER-POLICE</span>
                    <span>{Math.round((state?.police_heat || 0) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-black border border-white/10 overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${
                            (state?.police_heat || 0) > 0.6 ? 'bg-red-500' : (state?.police_heat || 0) > 0.3 ? 'bg-amber-400' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, (state?.police_heat || 0) * 100)}%` }}
                    />
                </div>
            </div>

            {/* Contraband Catalog */}
            <div className="space-y-2">
                {state?.catalog && Object.entries(state.catalog).map(([itemId, item]) => {
                    const isOwned = ownedItems.includes(itemId) || (itemId === 'ogm_banana' && state.ogm_active);
                    const canAfford = bananas >= item.cost;
                    return (
                        <div
                            key={itemId}
                            className="p-3 bg-white/5 border border-white/10 hover:border-purple-500/40 transition-colors flex items-center justify-between gap-3"
                        >
                            <div className="flex-1">
                                <div className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                                    {itemId === 'ogm_banana' && <Banana className="h-3.5 w-3.5 text-banan-primary" />}
                                    {itemId === 'ip_scrambler' && <ShieldAlert className="h-3.5 w-3.5 text-cyan-400" />}
                                    {itemId === 'honeypot' && <Zap className="h-3.5 w-3.5 text-yellow-400" />}
                                    {itemId === 'overclock_kernel' && <Cpu className="h-3.5 w-3.5 text-red-400" />}
                                    {itemId === 'tsp_usb_key' && <Key className="h-3.5 w-3.5 text-purple-400" />}
                                    {item.name}
                                </div>
                                <div className="text-[11px] font-mono text-white/50 mt-0.5 leading-snug">
                                    {item.desc}
                                </div>
                            </div>

                            <div className="shrink-0">
                                {isOwned ? (
                                    <span className="text-[11px] font-mono font-bold text-purple-400 border border-purple-500/40 bg-purple-950/20 px-3 py-1 uppercase tracking-wider">
                                        ACQUIS
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => socketManager.send('buy_darknet_item', { item_id: itemId })}
                                        disabled={!canAfford}
                                        className="font-mono text-xs font-bold text-black bg-purple-400 hover:bg-purple-300 px-3 py-1.5 uppercase transition-colors disabled:opacity-20 shadow-[0_0_10px_rgba(192,132,252,0.2)]"
                                    >
                                        {formatNumber(item.cost)} 🍌
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Overclock Kernel Trigger Action */}
            {hasOverclock && (
                <button
                    onClick={handleActivateOverclock}
                    disabled={state?.overclock_active || ((state?.overclock_cooldown_remaining || 0) > 0)}
                    className={`w-full py-3 border font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        state?.overclock_active
                            ? 'bg-banan-primary/20 border-banan-primary text-banan-primary animate-pulse'
                            : (state?.overclock_cooldown_remaining || 0) > 0
                            ? 'bg-white/5 border-white/10 text-white/60 cursor-not-allowed'
                            : 'bg-banan-primary text-black border-banan-primary hover:bg-white shadow-[0_0_20px_rgba(250,222,0,0.4)]'
                    }`}
                >
                    <Cpu className="h-4 w-4" />
                    {state?.overclock_active
                        ? `FRÉNÉSIE KERNEL ACTIVE : +100% PRODUCTIONS (${state.overclock_remaining}s)`
                        : (state?.overclock_cooldown_remaining || 0) > 0
                        ? `REFROIDISSEMENT CPU (${Math.floor((state?.overclock_cooldown_remaining || 0) / 60)}m ${(state?.overclock_cooldown_remaining || 0) % 60}s)`
                        : 'ENCLENCHER LA FRÉNÉSIE KERNEL (BOOST ×2 PENDANT 45s)'}
                </button>
            )}
        </div>
    );
}
