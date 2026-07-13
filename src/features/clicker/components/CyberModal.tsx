import { useState, useEffect } from 'react';
import { Shield, Crosshair, Skull, Banana, AlertTriangle, Fingerprint, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@app/components/shared/Modal';
import { socketManager } from '@app/lib/socket';
import { formatNumber } from '@app/utils/format';
import { useGame } from '@app/context/GameContext';

interface CyberState {
    mercenaries: number;
    firewall_level: number;
    ogm_active: boolean;
}

interface CyberModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CyberModal({ isOpen, onClose }: CyberModalProps) {
    const { gameState } = useGame();
    const [state, setState] = useState<CyberState | null>(null);
    const [tab, setTab] = useState<'warfare' | 'darknet'>('warfare');
    const [raidAlert, setRaidAlert] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            socketManager.send('get_cyber_state', {});
        }
    }, [isOpen]);

    useEffect(() => {
        const handleMessage = (msg: { type: string, data: unknown }) => {
            if (msg.type === 'cyber_state') {
                setState(msg.data as CyberState);
            } else if (msg.type === 'darknet_result') {
                const data = msg.data as { raid: boolean, loss: number };
                if (data.raid) {
                    setRaidAlert(data.loss);
                    setTimeout(() => setRaidAlert(null), 8000);
                }
            } else if (msg.type === 'cyber_attacked') {
                // Not ideal to handle toast here, but good for local alert
            }
        };
        socketManager.subscribe(handleMessage);
        return () => socketManager.unsubscribe(handleMessage);
    }, []);

    const mercCost = state ? 100000 * Math.pow(2, state.mercenaries) : 0;
    const fwCost = state ? 50000 * Math.pow(2, state.firewall_level) : 0;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            borderColor="border-banan-cyber"
            title={<span className="flex items-center gap-2"><Fingerprint className="h-5 w-5" /> CYBER-SÉCURITÉ</span>}
        >
            {/* Raid Alert */}
            <AnimatePresence>
                {raidAlert !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-4 p-4 bg-red-900/80 border-2 border-red-500 text-center relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwbDhfOHptOCAwTDBfOHoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-20"></div>
                        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2 animate-pulse" />
                        <div className="flex items-center gap-2 text-white font-black text-2xl mb-2 justify-center uppercase tracking-widest">
                            🚨 SAISIE DOUANIÈRE 🚨
                        </div>
                        <div className="text-sm font-mono text-red-100 mb-2 font-bold">
                            La Cyber-Police du Potassium vous a intercepté !
                        </div>
                        <div className="text-lg font-mono text-red-400 mt-2 flex items-center justify-center gap-2 bg-black/50 p-2">
                            AMENDE: -{formatNumber(raidAlert)} <Banana className="h-5 w-5" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tab Bar */}
            <div className="flex border-b border-white/10 mb-4">
                {(['warfare', 'darknet'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`flex-1 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors
                            ${tab === t ? 'text-banan-primary border-b-2 border-banan-primary bg-banan-primary/5' : 'text-white/30 hover:text-white/50'}`}
                    >
                        {t === 'warfare' ? 'Guerre de Réseau' : 'Marché Noir'}
                    </button>
                ))}
            </div>

            {/* Warfare Tab */}
            {tab === 'warfare' && (
                <div className="space-y-4">
                    <div className="text-center font-mono text-xs text-white/50 pb-2">
                        Automatisez le piratage des comptes des joueurs du Top 10. Les attaques sont mitigées par leur pare-feu.
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Mercenaries */}
                        <div className="border border-red-500/30 bg-red-900/10 p-4 flex flex-col items-center text-center">
                            <Crosshair className="h-8 w-8 text-red-500 mb-2" />
                            <h3 className="font-bold font-mono text-red-400 uppercase text-sm mb-1">Cyber-Mercenaires</h3>
                            <div className="text-[10px] font-mono text-red-400/50 mb-4 h-12">
                                Vole 0.1% des bananes d'un joueur du Leaderboard toutes les 60s (par mercenaire).
                            </div>
                            <div className="text-xl font-black font-mono text-white mb-4">
                                Niveau {state?.mercenaries || 0}
                            </div>
                            <button
                                onClick={() => socketManager.send('hire_mercenary', {})}
                                disabled={gameState.bananas < mercCost}
                                className="w-full py-2 bg-red-600/20 border border-red-500 hover:bg-red-600 text-red-100 font-bold text-xs uppercase transition-colors disabled:opacity-30 flex items-center justify-center gap-1"
                            >
                                Recruter ({formatNumber(mercCost)} <Banana className="h-3 w-3"/>)
                            </button>
                        </div>

                        {/* Firewall */}
                        <div className="border border-blue-500/30 bg-blue-900/10 p-4 flex flex-col items-center text-center">
                            <Shield className="h-8 w-8 text-blue-500 mb-2" />
                            <h3 className="font-bold font-mono text-blue-400 uppercase text-sm mb-1">Pare-feu Bananier</h3>
                            <div className="text-[10px] font-mono text-blue-400/50 mb-4 h-12">
                                Réduit de 10% par niveau les bananes volées par les cyber-attaques ennemies (Max 90%).
                            </div>
                            <div className="text-xl font-black font-mono text-white mb-4">
                                Niveau {state?.firewall_level || 0}
                            </div>
                            <button
                                onClick={() => socketManager.send('upgrade_firewall', {})}
                                disabled={gameState.bananas < fwCost}
                                className="w-full py-2 bg-blue-600/20 border border-blue-500 hover:bg-blue-600 text-blue-100 font-bold text-xs uppercase transition-colors disabled:opacity-30 flex items-center justify-center gap-1"
                            >
                                Améliorer ({formatNumber(fwCost)} <Banana className="h-3 w-3"/>)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Darknet Tab */}
            {tab === 'darknet' && (
                <div className="space-y-4">
                    <div className="border border-purple-500/30 bg-purple-900/10 p-4">
                        <div className="flex items-center justify-center mb-4">
                            <div className="relative">
                                    <Skull className="h-12 w-12 text-banan-cyber" />
                                    <Activity className="h-4 w-4 text-banan-primary absolute bottom-0 right-0 animate-pulse" />
                                </div>
                            </div>
                            <h3 className="font-bold text-center font-mono text-banan-cyber uppercase text-lg tracking-widest mb-2">
                                Darknet Potassium
                            </h3>
                            <p className="text-center font-mono text-xs text-banan-cyber/60 mb-6">
                                Bienvenue sur TorBanana. Achetez des artefacts de contrebande. Attention aux descentes de la Cyber-Police (20% de risque).
                            </p>

                            <div className="border border-white/10 bg-black p-4 flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-banan-primary flex items-center gap-2">
                                        <Banana className="h-4 w-4" /> Bananes OGM
                                    </div>
                                    <div className="text-[10px] font-mono text-white/50 mt-1">
                                        Une souche génétiquement modifiée ultra-illégale.<br/>
                                        <span className="text-green-400 font-bold">+10,000 BPC (Bananes Par Clic) de manière permanente.</span>
                                    </div>
                                </div>
                                
                                {state?.ogm_active ? (
                                    <div className="text-xs font-mono font-bold text-banan-cyber uppercase px-4 py-2 border border-banan-cyber bg-banan-cyber/20">
                                        Possédé
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => socketManager.send('buy_darknet_item', { item_id: 'ogm_banana' })}
                                        disabled={gameState.bananas < 1000000}
                                        className="text-xs font-mono font-bold text-black bg-banan-cyber hover:bg-banan-cyber/80 uppercase px-4 py-2 transition-colors disabled:opacity-30 flex items-center gap-1"
                                    >
                                        Acheter (1M <Banana className="h-3 w-3"/>)
                                    </button>
                                )}
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
}
