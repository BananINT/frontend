import { useState, useEffect, useCallback } from 'react';
import { Ticket, Trophy, Hash, Clock, Sparkles, Banana, Dices } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@app/components/shared/Modal';
import { socketManager } from '@app/lib/socket';
import { formatNumber } from '@app/utils/format';
import { useGame } from '@app/context/GameContext';

interface LotteryTicketData {
    id: string;
    number: number;
    cost: number;
}

interface DrawHistory {
    draw_number: number;
    winning_number: number | null;
    jackpot: number;
    winner: string | null;
    drawn_at: string | null;
}

interface DrawResult {
    draw_number: number;
    winning_number: number;
    winner: { name: string; prize: number } | null;
}

interface LotteryState {
    current_draw: {
        draw_number: number;
        jackpot: number;
        total_tickets: number;
        created_at: string;
    };
    user_tickets: LotteryTicketData[];
    ticket_cost: number;
    max_tickets: number;
    number_range: [number, number];
    history: DrawHistory[];
}

interface LotteryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LotteryModal({ isOpen, onClose }: LotteryModalProps) {
    const { gameState } = useGame();
    const [lotteryState, setLotteryState] = useState<LotteryState | null>(null);
    const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
    const [showResult, setShowResult] = useState<DrawResult | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [countdown, setCountdown] = useState<number>(0);

    // Request lottery state when modal opens
    useEffect(() => {
        if (isOpen) {
            socketManager.send('get_lottery_state', {});
        }
    }, [isOpen]);

    // Listen for lottery messages
    useEffect(() => {
        const handleMessage = (message: { type: string; data: unknown }) => {
            if (message.type === 'lottery_state') {
                setLotteryState(message.data as LotteryState);
            } else if (message.type === 'lottery_ticket_success') {
                // Refresh state after ticket purchase
                socketManager.send('get_lottery_state', {});
                setSelectedNumber(null);
            } else if (message.type === 'lottery_draw_result') {
                setIsSpinning(true);
                setTimeout(() => {
                    setShowResult(message.data as DrawResult);
                    setIsSpinning(false);
                    // Refresh state
                    socketManager.send('get_lottery_state', {});
                }, 2000); // 2s suspense animation
            }
        };

        socketManager.subscribe(handleMessage);
        return () => socketManager.unsubscribe(handleMessage);
    }, []);

    // Countdown timer (5min = 300s)
    useEffect(() => {
        if (!lotteryState) return;

        const updateCountdown = () => {
            const created = new Date(lotteryState.current_draw.created_at).getTime();
            const drawTime = created + 300_000; // 5 minutes
            const remaining = Math.max(0, Math.floor((drawTime - Date.now()) / 1000));
            setCountdown(remaining);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [lotteryState]);

    const buyTicket = useCallback(() => {
        if (selectedNumber === null) return;
        socketManager.send('buy_lottery_ticket', { number: selectedNumber });
    }, [selectedNumber]);

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={<span className="flex items-center gap-2"><Dices className="h-5 w-5" /> BANANA LOTTERY</span>}
        >
            {!lotteryState ? (
                <div className="text-center text-white/30 text-xs font-mono uppercase py-8">
                    Chargement de la loterie...
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Jackpot Display */}
                    <div className="text-center border border-banan-primary/30 bg-banan-primary/5 p-6">
                        <div className="text-[10px] font-mono text-white/50 uppercase tracking-[0.3em] mb-2">
                            Jackpot Actuel
                        </div>
                        <motion.div 
                            className="text-5xl font-black font-sans text-banan-primary tracking-tighter"
                            key={lotteryState.current_draw.jackpot}
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            {formatNumber(lotteryState.current_draw.jackpot)}
                        </motion.div>
                        <div className="text-[10px] font-mono text-white/30 uppercase mt-2 flex items-center justify-center gap-1">
                            <Banana className="h-3 w-3 text-banan-primary" /> Bananes
                        </div>

                        {/* Countdown */}
                        <div className="mt-4 flex items-center justify-center gap-2">
                            <Clock className="h-3 w-3 text-banan-primary" />
                            <span className="text-sm font-mono text-banan-primary font-bold">
                                {formatTime(countdown)}
                            </span>
                            <span className="text-[10px] font-mono text-white/30 uppercase">
                                avant le tirage
                            </span>
                        </div>

                        <div className="text-[10px] font-mono text-white/30 mt-1">
                            Tirage #{lotteryState.current_draw.draw_number} — {lotteryState.current_draw.total_tickets} ticket(s) vendus
                        </div>
                    </div>

                    {/* Draw Result Overlay */}
                    <AnimatePresence>
                        {(isSpinning || showResult) && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="border border-banan-primary bg-black/90 p-6 text-center"
                            >
                                {isSpinning ? (
                                    <div className="space-y-3">
                                        <Sparkles className="h-8 w-8 text-banan-primary mx-auto animate-spin" />
                                        <div className="text-lg font-bold text-banan-primary font-mono uppercase animate-pulse">
                                            Tirage en cours...
                                        </div>
                                    </div>
                                ) : showResult ? (
                                    <div className="space-y-3">
                                        <div className="text-[10px] font-mono text-white/50 uppercase">
                                            Numéro gagnant
                                        </div>
                                        <div className="text-6xl font-black text-banan-primary font-sans">
                                            {showResult.winning_number}
                                        </div>
                                        {showResult.winner ? (
                                            <div className="text-sm font-mono text-banan-green flex items-center justify-center gap-1">
                                                <Sparkles className="h-4 w-4" /> {showResult.winner.name} remporte {formatNumber(showResult.winner.prize)} <Banana className="h-3 w-3" />
                                            </div>
                                        ) : (
                                            <div className="text-sm font-mono text-banan-red">
                                                Pas de gagnant — Jackpot rollover !
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setShowResult(null)}
                                            className="text-[10px] font-mono text-white/30 hover:text-banan-primary uppercase mt-2"
                                        >
                                            Fermer
                                        </button>
                                    </div>
                                ) : null}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Number Picker */}
                    <div>
                        <div className="text-[10px] font-mono text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Hash className="h-3 w-3" />
                            Choisissez votre numéro (1-50)
                        </div>
                        <div className="grid grid-cols-10 gap-1">
                            {Array.from({ length: 50 }, (_, i) => i + 1).map(num => {
                                const isOwned = lotteryState.user_tickets.some(t => t.number === num);
                                return (
                                    <button
                                        key={num}
                                        onClick={() => !isOwned && setSelectedNumber(num)}
                                        disabled={isOwned}
                                        className={`
                                            aspect-square flex items-center justify-center text-xs font-mono font-bold transition-all
                                            ${isOwned
                                                ? 'bg-banan-primary text-black cursor-not-allowed'
                                                : selectedNumber === num
                                                    ? 'bg-banan-primary text-black scale-110 shadow-[0_0_12px_rgba(var(--banan-primary-rgb),0.5)]'
                                                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                                            }
                                        `}
                                    >
                                        {num}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Buy Ticket Button */}
                    <button
                        onClick={buyTicket}
                        disabled={selectedNumber === null || gameState.bananas < lotteryState.ticket_cost || lotteryState.user_tickets.length >= lotteryState.max_tickets}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-banan-primary/10 border border-banan-primary/30 text-banan-primary font-black uppercase tracking-wider text-sm
                            hover:bg-banan-primary hover:text-black transition-all
                            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-banan-primary/10 disabled:hover:text-banan-primary"
                    >
                        <Ticket className="h-5 w-5" />
                        <span className="flex items-center gap-1">
                            {selectedNumber
                                ? <>Acheter Ticket #{selectedNumber} — {formatNumber(lotteryState.ticket_cost)} <Banana className="h-3 w-3" /></>
                                : 'Sélectionnez un numéro'
                            }
                        </span>
                    </button>

                    {/* User's Tickets */}
                    {lotteryState.user_tickets.length > 0 && (
                        <div>
                            <div className="text-[10px] font-mono text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Ticket className="h-3 w-3" />
                                Vos tickets ({lotteryState.user_tickets.length}/{lotteryState.max_tickets})
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {lotteryState.user_tickets.map(t => (
                                    <div
                                        key={t.id}
                                        className="px-3 py-1 bg-banan-primary/10 border border-banan-primary/30 text-banan-primary text-xs font-mono font-bold"
                                    >
                                        #{t.number}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* History */}
                    {lotteryState.history.length > 0 && (
                        <div>
                            <div className="text-[10px] font-mono text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Trophy className="h-3 w-3" />
                                Historique des tirages
                            </div>
                            <div className="space-y-1">
                                {lotteryState.history.map(h => (
                                    <div
                                        key={h.draw_number}
                                        className="flex items-center justify-between p-2 bg-white/5 text-xs font-mono"
                                    >
                                        <span className="text-white/30">#{h.draw_number}</span>
                                        <span className="text-banan-primary font-bold">{h.winning_number}</span>
                                        <span className={h.winner ? 'text-banan-green' : 'text-banan-red'}>
                                            {h.winner || 'Rollover'}
                                        </span>
                                        <span className="text-white/30 flex items-center gap-1">{formatNumber(h.jackpot)} <Banana className="h-2 w-2" /></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}
