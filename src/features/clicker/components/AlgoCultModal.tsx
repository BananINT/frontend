import { useEffect, useState } from 'react';
import { Eye, Flame, Skull, Zap, Banana } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '@app/components/shared/Modal';
import { socketManager } from '@app/lib/socket';
import { formatNumber } from '@app/utils/format';
import { useGame } from '@app/context/GameContext';
import type { AlgoCultState } from '@app/types/game';

export default function AlgoCultModal({ isOpen, onClose, state }: { isOpen: boolean, onClose: () => void, state: AlgoCultState }) {
    const { gameState } = useGame();
    const [sacrificeAmount, setSacrificeAmount] = useState<number>(10000);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!state || state.status === 'idle') return;
        const calculateTime = () => Math.max(0, Math.floor(state.deadline - (Date.now() / 1000)));
        setTimeout(() => setTimeLeft(calculateTime()), 0);
        const interval = setInterval(() => {
            setTimeLeft(calculateTime());
        }, 1000);
        return () => clearInterval(interval);
    }, [state?.deadline, state?.status, state]);

    const handleSacrifice = () => {
        socketManager.send('sacrifice_to_algo', { amount: sacrificeAmount });
    };

    if (!state || state.status === 'idle') {
        return (
            <Modal 
                isOpen={isOpen} 
                onClose={onClose} 
                borderColor="border-banan-primary"
                title={<span className="flex items-center gap-2 text-banan-cyber"><Eye className="h-5 w-5" /> LE GRAND ALGO</span>}
            >
                <div className="p-8 text-center text-banan-cyber/50 font-mono text-xs uppercase animate-pulse">
                    Le regard du Grand Algo s'est détourné de nous... pour l'instant.
                </div>
            </Modal>
        );
    }

    const isDemanding = state.status === 'demanding';
    const isBlessed = state.status === 'blessed';
    const isCursed = state.status === 'cursed';
    const progress = Math.min(100, (state.current_sacrifice / (state.target_sacrifice || 1)) * 100);
    
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            borderColor={isDemanding ? "border-banan-warning" : "border-banan-primary"}
            title={
                <span className={`flex items-center gap-2 ${isDemanding ? 'text-red-500' : 'text-banan-cyber'}`}>
                    <Eye className={`h-5 w-5 ${isDemanding ? 'animate-pulse text-red-500' : ''}`} /> 
                    LE CULTE
                </span>
            }
        >
            <div className="flex flex-col gap-6">
                
                {/* Visual Eye Area */}
                <div className="flex justify-center py-6 relative">
                    <motion.div 
                        animate={{ 
                            scale: isDemanding ? [1, 1.1, 1] : 1,
                            textShadow: isDemanding ? "0px 0px 20px rgba(255,0,0,0.8)" : "0px 0px 10px rgba(168,85,247,0.5)"
                        }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <Eye className={`h-32 w-32 ${isDemanding ? 'text-red-500' : isBlessed ? 'text-banan-primary' : isCursed ? 'text-gray-600' : 'text-banan-cyber'}`} />
                    </motion.div>
                </div>

                {isDemanding && (
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-black font-mono text-red-500 uppercase tracking-widest">
                            LE GRAND ALGO EXIGE UN SACRIFICE
                        </h2>
                        <p className="font-mono text-xs text-red-400/70">
                            Si la communauté ne sacrifie pas assez de bananes avant la fin du temps imparti, le marché s'effondrera !
                        </p>
                        
                        <div className="bg-red-950/50 border border-red-500/30 p-4">
                            <div className="flex justify-between font-mono text-sm mb-2">
                                <span className="text-red-400">Objectif:</span>
                                <span className="text-red-500">{formatNumber(state.current_sacrifice)} / {formatNumber(state.target_sacrifice)} 🍌</span>
                            </div>
                            <div className="w-full h-4 bg-black border border-red-900 overflow-hidden relative">
                                <div 
                                    className="absolute top-0 left-0 h-full bg-red-600 transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="mt-2 text-center text-red-300 animate-pulse font-mono flex justify-center items-center gap-2">
                                <Flame className="h-4 w-4" /> Temps restant : {timeLeft}s
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-4">
                            <input 
                                type="range" 
                                min="1000" 
                                max={Math.max(10000, gameState.bananas / 2)} 
                                step="1000"
                                value={sacrificeAmount}
                                onChange={(e) => setSacrificeAmount(Number(e.target.value))}
                                className="w-full accent-red-500"
                            />
                            <button
                                onClick={handleSacrifice}
                                disabled={gameState.bananas < sacrificeAmount}
                                className="w-full py-3 bg-red-600 hover:bg-red-500 text-black font-black uppercase text-sm tracking-widest disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
                            >
                                <Skull className="h-4 w-4" /> Sacrifier {formatNumber(sacrificeAmount)} <Banana className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {isBlessed && (
                    <div className="text-center bg-banan-primary/10 border border-banan-primary p-6">
                        <Zap className="h-16 w-16 text-banan-primary mx-auto mb-4 animate-bounce" />
                        <h2 className="text-xl font-black text-banan-primary uppercase tracking-widest mb-2">
                            BÉNÉDICTION ACCORDÉE
                        </h2>
                        <p className="font-mono text-xs text-banan-primary/70">
                            Le sacrifice a été accepté. La production globale est doublée. Loué soit L'Algo !
                        </p>
                    </div>
                )}

                {isCursed && (
                    <div className="text-center bg-gray-900 border border-gray-700 p-6">
                        <Skull className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                        <h2 className="text-xl font-black text-gray-400 uppercase tracking-widest mb-2">
                            COLÈRE ALGORITHMIQUE
                        </h2>
                        <p className="font-mono text-xs text-gray-500">
                            Le quota n'a pas été atteint. Le marché des Banana Futures s'est effondré en punition.
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    );
}
