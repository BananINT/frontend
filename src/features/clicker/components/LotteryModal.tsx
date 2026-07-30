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
    global_jackpot: number;
    user_tickets: LotteryTicketData[];
    clan_tickets: LotteryTicketData[];
    ticket_cost: number;
    clan_ticket_cost: number;
    clan_treasury_balance: number;
    max_tickets: number;
    max_clan_tickets: number;
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
    const [isClanMode, setIsClanMode] = useState(false);

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
        socketManager.send('buy_lottery_ticket', { number: selectedNumber, is_clan: isClanMode });
    }, [selectedNumber, isClanMode]);

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
                    {/* Jackpot Displays */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Lottery Jackpot */}
                        <div className="text-center border border-banan-primary/30 bg-banan-primary/5 p-4 rounded-sm">
                            <div className="text-[9px] font-mono text-white/50 uppercase tracking-[0.2em] mb-1">
                                Jackpot Tirage
                            </div>
                            <motion.div 
                                className="text-3xl font-black font-sans text-banan-primary tracking-tighter"
                                key={lotteryState.current_draw.jackpot}
                                initial={{ scale: 1.1, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                            >
                                {formatNumber(lotteryState.current_draw.jackpot)}
                            </motion.div>
                            <div className="text-[8px] font-mono text-white/30 uppercase mt-1 flex items-center justify-center gap-1">
                                <Banana className="h-2.5 w-2.5 text-banan-primary" /> Bananes
                            </div>
                        </div>

                        {/* Global Potassium Jackpot */}
                        <div className="text-center border border-cyan-500/30 bg-cyan-500/5 p-4 rounded-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-1">
                                <Sparkles className="h-3 w-3 text-cyan-400 animate-pulse" />
                            </div>
                            <div className="text-[9px] font-mono text-white/50 uppercase tracking-[0.2em] mb-1">
                                Jackpot Global Potassium
                            </div>
                            <motion.div 
                                className="text-3xl font-black font-sans text-cyan-400 tracking-tighter drop-shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                                key={lotteryState.global_jackpot}
                                initial={{ scale: 1.1, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                            >
                                {formatNumber(lotteryState.global_jackpot)}
                            </motion.div>
                            <div className="text-[8px] font-mono text-cyan-400/50 uppercase mt-1 flex items-center justify-center gap-1">
                                <Sparkles className="h-2.5 w-2.5" /> Casino & Tirages
                            </div>
                        </div>
                    </div>

                    {/* Timer & Meta Info */}
                    <div className="text-center border-t border-b border-white/5 py-3">
                        <div className="flex items-center justify-center gap-2">
                            <Clock className="h-3 w-3 text-banan-primary" />
                            <span className="text-sm font-mono text-banan-primary font-bold">
                                {formatTime(countdown)}
                            </span>
                            <span className="text-[10px] font-mono text-white/30 uppercase">
                                avant le tirage
                            </span>
                        </div>
                        <div className="text-[9px] font-mono text-white/30 mt-1 uppercase">
                            Tirage #{lotteryState.current_draw.draw_number} — {lotteryState.current_draw.total_tickets} ticket(s) vendus
                        </div>
                    </div>

                    {/* Mode Selector (if in clan) */}
                    {gameState.clan_id && (
                        <div className="flex border border-white/15 p-1 bg-black/60 rounded-sm gap-1">
                            <button
                                onClick={() => { setIsClanMode(false); setSelectedNumber(null); }}
                                className={`flex-1 py-2 text-center text-[10px] font-mono uppercase font-bold transition-all border ${
                                    !isClanMode 
                                        ? 'bg-banan-primary text-black border-banan-primary' 
                                        : 'border-transparent text-white/40 hover:text-white'
                                }`}
                            >
                                Ticket Personnel
                            </button>
                            <button
                                onClick={() => { setIsClanMode(true); setSelectedNumber(null); }}
                                className={`flex-1 py-2 text-center text-[10px] font-mono uppercase font-bold transition-all border ${
                                    isClanMode 
                                        ? 'bg-purple-600 text-white border-purple-500 shadow-[0_0_10px_rgba(147,51,234,0.3)]' 
                                        : 'border-transparent text-white/40 hover:text-purple-400'
                                }`}
                            >
                                Pool de Clan ({formatNumber(lotteryState.clan_treasury_balance)} 🍌)
                            </button>
                        </div>
                    )}

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
                                            <div className="text-sm font-mono text-green-400 flex items-center justify-center gap-1">
                                                <Sparkles className="h-4 w-4" /> {showResult.winner.name} remporte {formatNumber(showResult.winner.prize)} <Banana className="h-3 w-3" />
                                            </div>
                                        ) : (
                                            <div className="text-sm font-mono text-red-500">
                                                Pas de gagnant — Jackpot rollover !
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setShowResult(null)}
                                            className="text-[10px] font-mono text-white/30 hover:text-banan-primary uppercase mt-2 border border-white/10 px-3 py-1 hover:bg-white/5"
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
                        <div className="text-[10px] font-mono text-white/50 uppercase tracking-wider mb-3 flex items-center justify-between">
                            <span className="flex items-center gap-2"><Hash className="h-3 w-3" /> Choisissez votre numéro (1-50)</span>
                            {isClanMode && <span className="text-purple-400 font-bold">MODE CLAN ACTIF</span>}
                        </div>
                        <div className="grid grid-cols-10 gap-1">
                            {Array.from({ length: 50 }, (_, i) => i + 1).map(num => {
                                const isOwned = isClanMode
                                    ? lotteryState.clan_tickets.some(t => t.number === num)
                                    : lotteryState.user_tickets.some(t => t.number === num);
                                
                                const isOwnedByOther = isClanMode
                                    ? lotteryState.user_tickets.some(t => t.number === num)
                                    : lotteryState.clan_tickets.some(t => t.number === num);

                                return (
                                    <button
                                        key={num}
                                        onClick={() => !isOwned && setSelectedNumber(num)}
                                        disabled={isOwned}
                                        className={`
                                            aspect-square flex items-center justify-center text-[10px] font-mono font-bold transition-all border
                                            ${isOwned
                                                ? isClanMode
                                                    ? 'bg-purple-900/60 text-purple-200 border-purple-500 cursor-not-allowed'
                                                    : 'bg-banan-primary text-black border-banan-primary cursor-not-allowed'
                                                : selectedNumber === num
                                                    ? isClanMode
                                                        ? 'bg-purple-600 text-white border-purple-400 scale-110 shadow-[0_0_12px_rgba(147,51,234,0.5)]'
                                                        : 'bg-banan-primary text-black border-banan-primary scale-110 shadow-[0_0_12px_rgba(250,255,0,0.5)]'
                                                    : isOwnedByOther
                                                        ? isClanMode
                                                            ? 'bg-white/5 text-white/30 border-banan-primary/30'
                                                            : 'bg-white/5 text-white/30 border-purple-500/30'
                                                        : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10 hover:text-white'
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
                        disabled={
                            selectedNumber === null || 
                            (isClanMode 
                                ? (lotteryState.clan_treasury_balance < lotteryState.clan_ticket_cost || lotteryState.clan_tickets.length >= lotteryState.max_clan_tickets)
                                : (gameState.bananas < lotteryState.ticket_cost || lotteryState.user_tickets.length >= lotteryState.max_tickets))
                        }
                        className={`w-full flex items-center justify-center gap-3 py-4 border font-black uppercase tracking-wider text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                            isClanMode
                                ? 'bg-purple-600/15 border-purple-600/30 text-purple-400 hover:bg-purple-600 hover:text-white'
                                : 'bg-banan-primary/10 border-banan-primary/30 text-banan-primary hover:bg-banan-primary hover:text-black'
                        }`}
                    >
                        <Ticket className="h-5 w-5" />
                        <span className="flex items-center gap-1">
                            {selectedNumber
                                ? isClanMode
                                    ? <>Acheter Ticket Clan #{selectedNumber} — {formatNumber(lotteryState.clan_ticket_cost)} 🍌 (Trésor)</>
                                    : <>Acheter Ticket #{selectedNumber} — {formatNumber(lotteryState.ticket_cost)} 🍌</>
                                : 'Sélectionnez un numéro'
                            }
                        </span>
                    </button>

                    {/* Ticket Lists */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Personal Tickets */}
                        <div>
                            <div className="text-[9px] font-mono text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Ticket className="h-3 w-3 text-banan-primary" />
                                Vos tickets ({lotteryState.user_tickets.length}/{lotteryState.max_tickets})
                            </div>
                            {lotteryState.user_tickets.length === 0 ? (
                                <div className="p-3 bg-white/5 border border-white/5 rounded-sm text-[9px] font-mono text-white/30 uppercase text-center">
                                    Aucun ticket personnel
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-1.5 p-2 bg-white/5 border border-white/5 rounded-sm">
                                    {lotteryState.user_tickets.map(t => (
                                        <div
                                            key={t.id}
                                            className="px-2.5 py-1 bg-banan-primary/10 border border-banan-primary/30 text-banan-primary text-[10px] font-mono font-bold"
                                        >
                                            #{t.number}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Clan Tickets */}
                        {gameState.clan_id && (
                            <div>
                                <div className="text-[9px] font-mono text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Trophy className="h-3 w-3 text-purple-400" />
                                    Pool du Clan ({lotteryState.clan_tickets.length}/{lotteryState.max_clan_tickets})
                                </div>
                                {lotteryState.clan_tickets.length === 0 ? (
                                    <div className="p-3 bg-white/5 border border-white/5 rounded-sm text-[9px] font-mono text-white/30 uppercase text-center">
                                        Aucun ticket de clan
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-1.5 p-2 bg-purple-900/10 border border-purple-500/15 rounded-sm">
                                        {lotteryState.clan_tickets.map(t => (
                                            <div
                                                key={t.id}
                                                className="px-2.5 py-1 bg-purple-600/15 border border-purple-500/30 text-purple-400 text-[10px] font-mono font-bold flex flex-col items-center justify-center gap-0.5"
                                                title={`Acheté par ${t.buyer}`}
                                            >
                                                <span>#{t.number}</span>
                                                <span className="text-[6px] text-white/40 uppercase truncate max-w-[50px]">{t.buyer}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* History */}
                    {lotteryState.history.length > 0 && (
                        <div>
                            <div className="text-[9px] font-mono text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Trophy className="h-3 w-3 text-banan-primary" />
                                Historique des tirages
                            </div>
                            <div className="space-y-1">
                                {lotteryState.history.map(h => (
                                    <div
                                        key={h.draw_number}
                                        className="flex items-center justify-between p-2 bg-white/5 text-[10px] font-mono border border-white/5"
                                    >
                                        <span className="text-white/30 font-bold">#{h.draw_number}</span>
                                        <span className="text-banan-primary font-bold text-xs bg-black/40 px-2 py-0.5 border border-banan-primary/20">{h.winning_number}</span>
                                        <span className={`font-semibold ${
                                            h.winner 
                                                ? h.winner.startsWith('Clan') 
                                                    ? 'text-purple-400' 
                                                    : 'text-green-400' 
                                                : 'text-red-500'
                                        }`}>
                                            {h.winner || 'Rollover'}
                                        </span>
                                        <span className="text-white/40 flex items-center gap-1">{formatNumber(h.jackpot)} <Banana className="h-2.5 w-2.5" /></span>
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
