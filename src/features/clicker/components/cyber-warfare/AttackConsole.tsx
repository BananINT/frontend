import { Crosshair, Zap } from 'lucide-react';
import { formatNumber } from '@app/utils/format';
import type { CyberWarfare } from './useCyberWarfare';

type AttackConsoleProps = Pick<CyberWarfare, 'attackTab' | 'setAttackTab' | 'setSelectedTargetId' | 'rivalPlayers' | 'corpNodes' | 'state' | 'selectedTargetId' | 'attacks' | 'selectedAttack' | 'setSelectedAttack' | 'bananas' | 'handleLaunchAttack' | 'isAttacking' | 'selectedAttackConfig' | 'terminalRef' | 'terminalLogs'>;

/** Column 1: target and payload selectors, launch button and hacking terminal. */
export default function AttackConsole({ attackTab, setAttackTab, setSelectedTargetId, rivalPlayers, corpNodes, state, selectedTargetId, attacks, selectedAttack, setSelectedAttack, bananas, handleLaunchAttack, isAttacking, selectedAttackConfig, terminalRef, terminalLogs }: AttackConsoleProps) {
    return (
        <div className="p-4 md:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                    <Crosshair className="h-4 w-4 text-banan-primary" />
                    <h3 className="font-mono text-xs font-black uppercase tracking-wider text-white">
                        Vecteurs de Frappe Tactique
                    </h3>
                </div>
                <div className="flex border border-white/10">
                    <button
                        onClick={() => { setAttackTab('pve'); setSelectedTargetId('banque_potassium'); }}
                        className={`px-3 py-1 text-[11px] font-mono font-bold uppercase transition-colors ${
                            attackTab === 'pve' ? 'bg-banan-primary text-black' : 'text-white/60 hover:text-white'
                        }`}
                    >
                        Nœuds Corporatifs
                    </button>
                    <button
                        onClick={() => { setAttackTab('pvp'); if (rivalPlayers[0]) setSelectedTargetId(rivalPlayers[0].name); }}
                        className={`px-3 py-1 text-[11px] font-mono font-bold uppercase transition-colors ${
                            attackTab === 'pvp' ? 'bg-banan-primary text-black' : 'text-white/60 hover:text-white'
                        }`}
                    >
                        Joueurs Rivaux
                    </button>
                </div>
            </div>

            {/* Target Selector */}
            <div>
                <div className="text-[11px] font-mono text-white/60 uppercase mb-2">Sélectionner la Cible</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {attackTab === 'pve' ? (
                        corpNodes.map(node => {
                            const nodeCd = state?.corp_cooldowns?.[node.id] || 0;
                            const isLocked = nodeCd > 0;
                            return (
                                <button
                                    key={node.id}
                                    onClick={() => setSelectedTargetId(node.id)}
                                    className={`p-3 border text-left flex flex-col justify-between transition-all ${
                                        selectedTargetId === node.id 
                                            ? 'bg-banan-primary/10 border-banan-primary text-white shadow-[0_0_12px_rgba(var(--banan-primary-rgb),0.15)]' 
                                            : isLocked
                                            ? 'bg-red-950/20 border-red-500/30 text-white/60'
                                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                                    }`}
                                >
                                    <div className="font-mono text-[11px] font-bold truncate flex items-center justify-between">
                                        <span>{node.name}</span>
                                        {isLocked && <span className="text-[11px] text-red-400 font-bold">LOCK {nodeCd}s</span>}
                                    </div>
                                    <div className="flex justify-between items-center mt-2 text-[11px] font-mono">
                                        <span className="flex items-center text-red-400">
                                            {'★'.repeat(node.difficulty)}
                                        </span>
                                        <span className="text-banan-primary font-bold">~{formatNumber(node.base_reward)}🍌</span>
                                    </div>
                                </button>
                            );
                        })
                    ) : rivalPlayers.length > 0 ? (
                        rivalPlayers.map((player, idx) => (
                            <button
                                key={`${player.name}-${idx}`}
                                onClick={() => setSelectedTargetId(player.name)}
                                className={`p-3 border text-left flex flex-col justify-between transition-all ${
                                    selectedTargetId === player.name 
                                        ? 'bg-banan-primary/10 border-banan-primary text-white shadow-[0_0_12px_rgba(var(--banan-primary-rgb),0.15)]' 
                                        : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                                }`}
                            >
                                <div className="font-mono text-[11px] font-bold truncate">{player.name}</div>
                                <div className="flex justify-between items-center mt-2 text-[11px] font-mono">
                                    <span className="text-white/60">Solde :</span>
                                    <span className="text-banan-primary font-bold">{formatNumber(player.score)}🍌</span>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-4 text-xs font-mono text-white/60">
                            Aucun rival détecté dans le secteur.
                        </div>
                    )}
                </div>
            </div>

            {/* Payload Selector */}
            <div>
                <div className="text-[11px] font-mono text-white/60 uppercase mb-2">Sélectionner la Charge Offensive</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {Object.entries(attacks).map(([key, cfg]) => {
                        const isSelected = selectedAttack === key;
                        const canAfford = bananas >= cfg.cost;
                        return (
                            <button
                                key={key}
                                onClick={() => setSelectedAttack(key)}
                                className={`p-3 border text-left transition-all ${
                                    isSelected 
                                        ? 'bg-red-500/10 border-red-500 text-white' 
                                        : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                                }`}
                            >
                                <div className="font-mono text-[11px] font-black uppercase text-red-400 truncate">
                                    {cfg.name}
                                </div>
                                <div className="text-[11px] font-mono text-white/60 mt-1">
                                    Percée : {Math.round(cfg.success_rate * 100)}% • Siphon : {Math.round(cfg.steal_pct * 100)}%
                                </div>
                                <div className={`mt-2 text-[11px] font-mono font-bold ${canAfford ? 'text-banan-primary' : 'text-red-400'}`}>
                                    {formatNumber(cfg.cost)} 🍌
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Launch Attack Action Button */}
            <button
                onClick={handleLaunchAttack}
                disabled={
                    isAttacking || 
                    bananas < selectedAttackConfig.cost || 
                    ((state?.attack_cooldown_remaining || 0) > 0) ||
                    (attackTab === 'pve' && ((state?.corp_cooldowns?.[selectedTargetId] || 0) > 0))
                }
                className={`w-full py-3.5 border font-mono text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    isAttacking 
                        ? 'bg-red-900/40 border-red-500 text-red-400 animate-pulse'
                        : (state?.attack_cooldown_remaining || 0) > 0
                        ? 'bg-white/5 border-white/10 text-white/60 cursor-not-allowed'
                        : attackTab === 'pve' && ((state?.corp_cooldowns?.[selectedTargetId] || 0) > 0)
                        ? 'bg-red-950/20 border-red-500/30 text-red-400/50 cursor-not-allowed'
                        : bananas < selectedAttackConfig.cost
                        ? 'bg-white/5 border-white/10 text-white/60 cursor-not-allowed'
                        : 'bg-red-600/20 border-red-500 hover:bg-red-600 hover:text-black text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                }`}
            >
                <Zap className={`h-4 w-4 ${isAttacking ? 'animate-spin' : ''}`} />
                {isAttacking 
                    ? 'INJECTION DU PAYLOAD EN COURS...' 
                    : (state?.attack_cooldown_remaining || 0) > 0
                    ? `RECHARGE TACTIQUE (${state?.attack_cooldown_remaining}s)`
                    : attackTab === 'pve' && ((state?.corp_cooldowns?.[selectedTargetId] || 0) > 0)
                    ? `NŒUD VERROUILLÉ (${state?.corp_cooldowns?.[selectedTargetId]}s)`
                    : bananas < selectedAttackConfig.cost
                    ? `FONDS INSUFFISANTS (${formatNumber(selectedAttackConfig.cost)} 🍌)`
                    : `LANCER LA CYBER-FRAPPE (${formatNumber(selectedAttackConfig.cost)} 🍌)`}
            </button>

            {/* Visual Hacking Terminal Output */}
            <div className="bg-black/90 border border-green-500/30 p-3 font-mono text-xs overflow-hidden flex flex-col flex-1 min-h-[180px] relative shadow-[inset_0_0_20px_rgba(0,255,0,0.05)]">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-green-500/30 animate-pulse" />
                <div ref={terminalRef} className="flex-1 overflow-y-auto space-y-1 text-green-400/80 pr-1 text-[11px]">
                    {terminalLogs.map((line, i) => (
                        <div key={i} className="break-all">{line}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}
