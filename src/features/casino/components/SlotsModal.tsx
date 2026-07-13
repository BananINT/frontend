import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banana, Dices, Skull, Bell, Cherry, Gem, Bug, type LucideIcon } from 'lucide-react';
import Modal from '@app/components/shared/Modal';
import { socketManager } from '@app/lib/socket';
import { useGame } from '@app/context/GameContext';
import { formatNumber } from '@app/utils/format';

type SymbolType = 'diamond' | 'banana' | 'cherry' | 'bell' | 'skull' | 'bug' | 'empty';

const SYMBOL_MAP: Record<SymbolType, { icon: LucideIcon, color: string }> = {
    'diamond': { icon: Gem, color: 'text-cyan-400' },
    'banana': { icon: Banana, color: 'text-banan-primary' },
    'cherry': { icon: Cherry, color: 'text-red-500' },
    'bell': { icon: Bell, color: 'text-yellow-600' },
    'skull': { icon: Skull, color: 'text-purple-600' },
    'bug': { icon: Bug, color: 'text-green-500' },
    'empty': { icon: Dices, color: 'text-white/10' } // for initial state
};

export default function SlotsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { gameState } = useGame();
    
    const [bet, setBet] = useState(100);
    const [isSpinning, setIsSpinning] = useState(false);
    const [grid, setGrid] = useState<SymbolType[][]>([
        ['empty', 'empty', 'empty', 'empty', 'empty'],
        ['empty', 'empty', 'empty', 'empty', 'empty'],
        ['empty', 'empty', 'empty', 'empty', 'empty']
    ]);
    const [resultData, setResultData] = useState<{
        grid: SymbolType[][];
        payout: number;
        win_lines: string[];
        skulls_hit: number;
    } | null>(null);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        const handleSlotsResult = (msg: { type: string; data: unknown }) => {
            if (msg.type === 'slots_machine_result') {
                const data = msg.data as {
                    grid: SymbolType[][];
                    payout: number;
                    win_lines: string[];
                    skulls_hit: number;
                };
                setGrid(data.grid);
                setResultData(data);
                
                // Keep spinning animation for a bit before showing result
                setTimeout(() => {
                    setIsSpinning(false);
                    setShowResult(true);
                }, 1500);
            } else if (msg.type === 'slots_machine_error') {
                setIsSpinning(false);
                // The global error modal will catch the error, so we just reset state
            }
        };

        socketManager.subscribe(handleSlotsResult);
        return () => socketManager.unsubscribe(handleSlotsResult);
    }, []);

    const handleSpin = () => {
        if (gameState.bananas < bet) return;
        setIsSpinning(true);
        setShowResult(false);
        socketManager.send('play_slots', { bet });
    };

    const hasWon = resultData && resultData.payout > 0;
    const hitSkull = resultData && resultData.skulls_hit > 0;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={() => { if (!isSpinning) onClose(); }} 
            title={<span className="flex items-center gap-2"><Dices className="h-5 w-5" /> MACHINE À SOUS</span>}
            borderColor={hitSkull ? "border-purple-600" : hasWon ? "border-green-500" : "border-banan-primary"}
        >
            <div className="flex flex-col gap-6">
                
                {/* 3x5 Grid */}
                <div className="bg-black/50 border border-white/10 p-4 shrink-0 mx-auto w-full max-w-2xl">
                    <div className="grid grid-cols-5 gap-2">
                        {grid.map((row, rowIndex) => (
                            row.map((symbol, colIndex) => {
                                const SymbolIcon = SYMBOL_MAP[symbol].icon;
                                const isWinLine = showResult && resultData?.win_lines?.includes(`row_${rowIndex}`);
                                const isDiag1 = showResult && resultData?.win_lines?.includes('diag_1') && ((rowIndex === 0 && (colIndex === 0 || colIndex === 4)) || (rowIndex === 1 && (colIndex === 1 || colIndex === 3)) || (rowIndex === 2 && colIndex === 2));
                                const isDiag2 = showResult && resultData?.win_lines?.includes('diag_2') && ((rowIndex === 2 && (colIndex === 0 || colIndex === 4)) || (rowIndex === 1 && (colIndex === 1 || colIndex === 3)) || (rowIndex === 0 && colIndex === 2));
                                const isHighlight = isWinLine || isDiag1 || isDiag2;

                                return (
                                    <div 
                                        key={`${rowIndex}-${colIndex}`} 
                                        className={`aspect-square flex items-center justify-center border transition-all duration-300 relative overflow-hidden ${
                                            isHighlight ? 'border-banan-primary bg-banan-primary/20' : 'border-white/5 bg-white/5'
                                        }`}
                                    >
                                        <AnimatePresence mode="wait">
                                            {isSpinning ? (
                                                <motion.div
                                                    key="spin"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute inset-0 flex items-center justify-center"
                                                >
                                                    <motion.div
                                                       animate={{ y: [-20, 20] }}
                                                       transition={{ repeat: Infinity, duration: 0.1, repeatType: "reverse" }}
                                                    >
                                                        <Dices className="w-8 h-8 text-white/20 blur-[1px]" />
                                                    </motion.div>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="symbol"
                                                    className="relative z-10 flex items-center justify-center w-full h-full"
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ type: 'spring', damping: 12, stiffness: 100 }}
                                                >
                                                    <SymbolIcon className={`w-8 h-8 md:w-12 md:h-12 ${SYMBOL_MAP[symbol].color} ${isHighlight ? 'animate-bounce drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : ''}`} />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })
                        ))}
                    </div>
                </div>

                {/* Overkill Animation Result Area */}
                <div className="h-24 flex items-center justify-center">
                    <AnimatePresence>
                        {showResult && hasWon && !hitSkull && (
                            <motion.div
                                initial={{ scale: 0, rotate: -10, y: 50 }}
                                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0], y: 0 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                className="bg-green-500/20 border-2 border-green-500 p-4 w-full text-center shadow-[0_0_30px_rgba(34,197,94,0.6)]"
                            >
                                <motion.h3 
                                    animate={{ scale: [1, 1.1, 1] }} 
                                    transition={{ repeat: Infinity, duration: 0.5 }}
                                    className="text-2xl font-black text-green-400 uppercase tracking-widest whitespace-nowrap"
                                >
                                    + {formatNumber(resultData.payout)} 🍌
                                </motion.h3>
                                <p className="text-xs font-mono text-green-300/70 mt-1">Lignes gagnantes: {resultData.win_lines.join(', ')}</p>
                            </motion.div>
                        )}

                        {showResult && hitSkull && (
                            <motion.div
                                initial={{ scale: 0, rotate: 180, opacity: 0 }}
                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                className="bg-purple-900/40 border-2 border-purple-600 p-4 w-full text-center shadow-[0_0_30px_rgba(147,51,234,0.6)]"
                            >
                                <h3 className="text-xl font-black text-purple-400 uppercase tracking-widest flex items-center justify-center gap-2">
                                    <Skull className="animate-pulse" /> MALÉDICTION <Skull className="animate-pulse" />
                                </h3>
                                <p className="text-xs font-mono text-purple-300/70 mt-1">Vous perdez la moitié de vos bananes!</p>
                            </motion.div>
                        )}

                        {showResult && !hasWon && !hitSkull && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center w-full"
                            >
                                <p className="text-sm font-mono text-white/40 uppercase">Rien cette fois...</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="bg-white/5 border border-white/10 p-4 flex flex-col gap-4">
                    <div className="flex justify-between items-center text-xs font-mono uppercase text-white/50">
                        <span>Mise (Min 100)</span>
                        <span className="text-banan-primary">{formatNumber(bet)} 🍌</span>
                    </div>
                    
                    <input 
                        type="range"
                        min="100"
                        max={Math.max(100, Math.floor(gameState.bananas * 0.1))}
                        step="100"
                        value={bet}
                        onChange={(e) => setBet(Number(e.target.value))}
                        disabled={isSpinning || gameState.bananas < 100}
                        className="w-full accent-banan-primary"
                    />

                    <div className="flex gap-2">
                        <button
                            onClick={() => setBet(100)}
                            disabled={isSpinning}
                            className="px-3 py-1 bg-white/5 hover:bg-white/10 text-xs font-mono uppercase"
                        >
                            Min
                        </button>
                        <button
                            onClick={() => setBet(Math.max(100, Math.floor(gameState.bananas * 0.1)))}
                            disabled={isSpinning}
                            className="px-3 py-1 bg-white/5 hover:bg-white/10 text-xs font-mono uppercase"
                        >
                            Max (10%)
                        </button>
                    </div>

                    <button
                        onClick={handleSpin}
                        disabled={isSpinning || gameState.bananas < bet || bet < 100}
                        className="w-full py-4 bg-banan-primary text-black font-black uppercase tracking-widest text-lg hover:bg-white transition-colors disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                    >
                        {isSpinning ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                <Dices />
                            </motion.div>
                        ) : (
                            <>LANCER <Dices /></>
                        )}
                    </button>
                </div>

            </div>
        </Modal>
    );
}
