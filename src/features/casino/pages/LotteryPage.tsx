import { useState, useEffect, useCallback, useRef, type CSSProperties } from 'react';
import { Ticket, Trophy, Hash, Clock, Sparkles, Banana } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { socketManager } from '@app/lib/socket';
import { formatNumber } from '@app/utils/format';
import { useGame } from '@app/context/GameContext';
import { fireWinConfetti } from '@app/utils/confetti';
import CasinoPageHeader from '../components/CasinoPageHeader';
import AnimatedCounter from '@app/components/ui/AnimatedCounter';
import WinFlash from '@app/components/ui/WinFlash';
import FloatingIcons from '@app/components/ui/FloatingIcons';

interface LotteryTicketData {
    id: string;
    number: number;
    cost: number;
    buyer?: string;
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

export default function LotteryPage() {
    const { gameState } = useGame();
    const [lotteryState, setLotteryState] = useState<LotteryState | null>(null);
    const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
    const [showResult, setShowResult] = useState<DrawResult | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [countdown, setCountdown] = useState<number>(0);
    const [isClanMode, setIsClanMode] = useState(false);
    const [flashKey, setFlashKey] = useState(0);
    const hasFiredConfetti = useRef(false);

    useEffect(() => {
        socketManager.send('get_lottery_state', {});
    }, []);

    useEffect(() => {
        const handleMessage = (message: { type: string; data: unknown }) => {
            if (message.type === 'lottery_state') {
                setLotteryState(message.data as LotteryState);
            } else if (message.type === 'lottery_ticket_success') {
                socketManager.send('get_lottery_state', {});
                setSelectedNumber(null);
            } else if (message.type === 'lottery_draw_result') {
                setIsSpinning(true);
                hasFiredConfetti.current = false;
                setTimeout(() => {
                    setShowResult(message.data as DrawResult);
                    setIsSpinning(false);
                    socketManager.send('get_lottery_state', {});
                }, 2000);
            }
        };

        socketManager.subscribe(handleMessage);
        return () => socketManager.unsubscribe(handleMessage);
    }, []);

    useEffect(() => {
        if (!lotteryState) return;

        const updateCountdown = () => {
            const created = new Date(lotteryState.current_draw.created_at).getTime();
            const drawTime = created + 300_000;
            const remaining = Math.max(0, Math.floor((drawTime - Date.now()) / 1000));
            setCountdown(remaining);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [lotteryState]);

    useEffect(() => {
        if (showResult?.winner && !hasFiredConfetti.current) {
            hasFiredConfetti.current = true;
            setFlashKey(k => k + 1);
            fireWinConfetti();
        }
    }, [showResult]);

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
        <div className="flex flex-col h-full bg-black/50 overflow-y-auto relative">
            <WinFlash triggerKey={flashKey} color="rgba(250,222,0,0.35)" />
            <FloatingIcons icons={[Ticket, Sparkles, Trophy]} count={11} className="text-banan-primary/[0.06]" />

            <CasinoPageHeader
                icon={Ticket}
                title="Banana Lottery"
                subtitle="Tirage toutes les 5 minutes. Plus vous achetez de tickets, plus vos chances augmentent."
                accent="text-banan-primary"
                accentGlow="bg-banan-primary/20"
            />

            <div className="flex-1 p-4 md:p-10 flex items-start justify-center relative z-10">
                <div className="w-full max-w-3xl">
                    {!lotteryState ? (
                        <div className="text-center text-white/60 text-xs font-mono uppercase py-8">
                            Chargement de la loterie...
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Jackpot Displays */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="text-center border border-banan-primary/30 bg-banan-primary/5 p-4 sm:p-6 rounded-2xl">
                                    <div className="text-[11px] font-mono text-white/50 uppercase tracking-[0.2em] mb-1">
                                        Jackpot Tirage
                                    </div>
                                    <motion.div
                                        className="text-3xl sm:text-4xl font-black font-sans text-banan-primary tracking-tighter tabular-nums"
                                        key={lotteryState.current_draw.jackpot}
                                        initial={{ scale: 1.15, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                    >
                                        {formatNumber(lotteryState.current_draw.jackpot)}
                                    </motion.div>
                                    <div className="text-[11px] font-mono text-white/60 uppercase mt-1 flex items-center justify-center gap-1">
                                        <Banana className="h-3 w-3 text-banan-primary" /> Bananes
                                    </div>
                                </div>

                                <div className="text-center border border-cyan-500/30 bg-cyan-500/5 p-4 sm:p-6 rounded-2xl relative overflow-hidden group">
                                    <div className="absolute -top-16 -right-16 w-40 h-40 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none" />
                                    <div className="absolute top-2 right-2">
                                        <Sparkles className="h-3 w-3 text-cyan-400 animate-pulse" />
                                    </div>
                                    <div className="text-[11px] font-mono text-white/50 uppercase tracking-[0.2em] mb-1 relative z-10">
                                        Jackpot Global Potassium
                                    </div>
                                    <motion.div
                                        className="text-3xl sm:text-4xl font-black font-sans text-cyan-400 tracking-tighter drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] relative z-10 tabular-nums"
                                        key={lotteryState.global_jackpot}
                                        initial={{ scale: 1.15, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                    >
                                        {formatNumber(lotteryState.global_jackpot)}
                                    </motion.div>
                                    <div className="text-[11px] font-mono text-cyan-400/80 uppercase mt-1 flex items-center justify-center gap-1 relative z-10">
                                        <Sparkles className="h-3 w-3" /> Casino & Tirages
                                    </div>
                                </div>
                            </div>

                            {/* Timer & Meta Info */}
                            <div className="text-center border-t border-b border-white/5 py-4">
                                <div className="flex items-center justify-center gap-2">
                                    <Clock className="h-3 w-3 text-banan-primary" />
                                    <motion.span
                                        key={countdown < 10 ? 'urgent' : 'normal'}
                                        animate={countdown <= 10 ? { scale: [1, 1.15, 1] } : {}}
                                        transition={{ repeat: countdown <= 10 ? Infinity : 0, duration: 0.6 }}
                                        className={`text-sm font-mono font-bold ${countdown <= 10 ? 'text-red-400' : 'text-banan-primary'}`}
                                    >
                                        {formatTime(countdown)}
                                    </motion.span>
                                    <span className="text-[11px] font-mono text-white/60 uppercase">
                                        avant le tirage
                                    </span>
                                </div>
                                <div className="text-[11px] font-mono text-white/60 mt-1 uppercase">
                                    Tirage #{lotteryState.current_draw.draw_number} — {lotteryState.current_draw.total_tickets} ticket(s) vendus
                                </div>
                            </div>

                            {/* Mode Selector (if in clan) */}
                            {gameState.clan_id && (
                                <div className="flex border border-white/15 p-1 bg-black/60 rounded-xl gap-1">
                                    <button
                                        onClick={() => { setIsClanMode(false); setSelectedNumber(null); }}
                                        className={`flex-1 py-2 text-center text-[11px] font-mono uppercase font-bold transition-all border rounded-lg ${
                                            !isClanMode
                                                ? 'bg-banan-primary text-black border-banan-primary'
                                                : 'border-transparent text-white/60 hover:text-white'
                                        }`}
                                    >
                                        Ticket Personnel
                                    </button>
                                    <button
                                        onClick={() => { setIsClanMode(true); setSelectedNumber(null); }}
                                        className={`flex-1 py-2 text-center text-[11px] font-mono uppercase font-bold transition-all border rounded-lg ${
                                            isClanMode
                                                ? 'bg-purple-600 text-white border-purple-500 shadow-[0_0_10px_rgba(147,51,234,0.3)]'
                                                : 'border-transparent text-white/60 hover:text-purple-400'
                                        }`}
                                    >
                                        Pool de Clan ({formatNumber(lotteryState.clan_treasury_balance)} 🍌)
                                    </button>
                                </div>
                            )}

                            {/* Draw Result — floated over the page rather than
                                inserted into it: the draw lands every five
                                minutes, often while a number is being picked,
                                and must not move the grid under the finger. */}
                            <AnimatePresence>
                                {(isSpinning || showResult) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 24 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                                        className={`fixed z-50 left-1/2 -translate-x-1/2 bottom-[max(1rem,env(safe-area-inset-bottom))] w-[min(24rem,calc(100vw-2rem))] overflow-hidden border border-banan-primary bg-black/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(250,222,0,0.15)] ${showResult?.winner ? 'marquee-border' : ''}`}
                                    >
                                        {isSpinning ? (
                                            <div className="space-y-3">
                                                <Sparkles className="h-8 w-8 text-banan-primary mx-auto animate-spin" />
                                                <div className="text-lg font-bold text-banan-primary font-mono uppercase animate-pulse">
                                                    Tirage en cours...
                                                </div>
                                            </div>
                                        ) : showResult ? (
                                            <div className="relative z-10 space-y-3">
                                                <div className="text-[11px] font-mono text-white/50 uppercase">
                                                    Numéro gagnant
                                                </div>
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: [1, 1.3, 1] }}
                                                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                                                    className="text-6xl sm:text-7xl font-black text-banan-primary font-sans tabular-nums"
                                                >
                                                    {showResult.winning_number}
                                                </motion.div>
                                                {showResult.winner ? (
                                                    <motion.div
                                                        animate={{ scale: [1, 1.08, 1] }}
                                                        transition={{ repeat: Infinity, duration: 0.6 }}
                                                        className="text-sm font-mono text-green-400 flex items-center justify-center gap-1"
                                                    >
                                                        <Sparkles className="h-4 w-4" /> {showResult.winner.name} remporte <AnimatedCounter value={showResult.winner.prize} /> <Banana className="h-3 w-3" />
                                                    </motion.div>
                                                ) : (
                                                    <div className="text-sm font-mono text-red-500">
                                                        Pas de gagnant — Jackpot rollover !
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => setShowResult(null)}
                                                    className="text-[11px] font-mono text-white/60 hover:text-banan-primary uppercase mt-2 border border-white/10 rounded-lg px-3 py-1 hover:bg-white/5 transition-colors"
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
                                <div className="text-[11px] font-mono text-white/50 uppercase tracking-wider mb-3 flex items-center justify-between">
                                    <span className="flex items-center gap-2"><Hash className="h-3 w-3" /> Choisissez votre numéro (1-50)</span>
                                    {isClanMode && <span className="text-purple-400 font-bold">MODE CLAN ACTIF</span>}
                                </div>
                                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                                    {Array.from({ length: 50 }, (_, i) => i + 1).map(num => {
                                        const isOwned = isClanMode
                                            ? lotteryState.clan_tickets.some(t => t.number === num)
                                            : lotteryState.user_tickets.some(t => t.number === num);

                                        const isOwnedByOther = isClanMode
                                            ? lotteryState.user_tickets.some(t => t.number === num)
                                            : lotteryState.clan_tickets.some(t => t.number === num);

                                        return (
                                            <motion.button
                                                key={num}
                                                whileHover={{ scale: isOwned ? 1 : 1.1 }}
                                                whileTap={{ scale: isOwned ? 1 : 0.95 }}
                                                onClick={() => !isOwned && setSelectedNumber(num)}
                                                disabled={isOwned}
                                                className={`
                                                    aspect-square flex items-center justify-center text-[11px] font-mono font-bold transition-all border rounded-md
                                                    ${isOwned
                                                        ? isClanMode
                                                            ? 'bg-purple-900/60 text-purple-200 border-purple-500 cursor-not-allowed'
                                                            : 'bg-banan-primary text-black border-banan-primary cursor-not-allowed'
                                                        : selectedNumber === num
                                                            ? isClanMode
                                                                ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_12px_rgba(147,51,234,0.5)]'
                                                                : 'bg-banan-primary text-black border-banan-primary shadow-[0_0_12px_rgba(250,255,0,0.5)]'
                                                            : isOwnedByOther
                                                                ? isClanMode
                                                                    ? 'bg-white/5 text-white/30 border-banan-primary/30'
                                                                    : 'bg-white/5 text-white/30 border-purple-500/30'
                                                                : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10 hover:text-white'
                                                    }
                                                `}
                                            >
                                                {num}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right above the buy button, so the player never has
                                to look away from the number grid to check their
                                balance against the ticket cost. */}
                            <div className="flex justify-between items-center text-[11px] font-mono uppercase text-white/60">
                                <span>Solde disponible</span>
                                <span
                                    className={`flex items-center gap-1 tabular-nums ${
                                        gameState.bananas <
                                        (isClanMode ? lotteryState.clan_ticket_cost : lotteryState.ticket_cost)
                                            ? 'text-red-400'
                                            : 'text-white/70'
                                    }`}
                                >
                                    {formatNumber(gameState.bananas)} <Banana className="w-3 h-3" />
                                </span>
                            </div>

                            {/* Buy Ticket Button */}
                            <motion.button
                                whileHover={{ scale: selectedNumber === null ? 1 : 1.02 }}
                                whileTap={{ scale: selectedNumber === null ? 1 : 0.96 }}
                                animate={selectedNumber !== null ? { scale: [1, 1.015, 1] } : {}}
                                transition={selectedNumber !== null ? { repeat: Infinity, duration: 1.8 } : undefined}
                                onClick={buyTicket}
                                disabled={
                                    selectedNumber === null ||
                                    (isClanMode
                                        ? (lotteryState.clan_treasury_balance < lotteryState.clan_ticket_cost || lotteryState.clan_tickets.length >= lotteryState.max_clan_tickets)
                                        : (gameState.bananas < lotteryState.ticket_cost || lotteryState.user_tickets.length >= lotteryState.max_tickets))
                                }
                                className={`w-full h-[4.25rem] px-3 flex items-center justify-center gap-3 border rounded-xl font-black uppercase tracking-wider text-[11px] sm:text-xs leading-tight transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                                    selectedNumber !== null ? 'marquee-border' : ''
                                } ${
                                    isClanMode
                                        ? 'bg-purple-600/15 border-purple-600/30 text-purple-400 hover:bg-purple-600 hover:text-white'
                                        : 'bg-banan-primary/10 border-banan-primary/30 text-banan-primary hover:bg-banan-primary hover:text-black'
                                }`}
                                style={isClanMode ? { '--marquee-color': '#a855f7' } as CSSProperties : undefined}
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
                            </motion.button>

                            {/* Ticket Lists */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[11px] font-mono text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Ticket className="h-3 w-3 text-banan-primary" />
                                        Vos tickets ({lotteryState.user_tickets.length}/{lotteryState.max_tickets})
                                    </div>
                                    {lotteryState.user_tickets.length === 0 ? (
                                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-[11px] font-mono text-white/60 uppercase text-center">
                                            Aucun ticket personnel
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5 p-2 bg-white/5 border border-white/5 rounded-xl">
                                            {lotteryState.user_tickets.map(t => (
                                                <div
                                                    key={t.id}
                                                    className="px-2.5 py-1 bg-banan-primary/10 border border-banan-primary/30 rounded text-banan-primary text-[11px] font-mono font-bold"
                                                >
                                                    #{t.number}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {gameState.clan_id && (
                                    <div>
                                        <div className="text-[11px] font-mono text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <Trophy className="h-3 w-3 text-purple-400" />
                                            Pool du Clan ({lotteryState.clan_tickets.length}/{lotteryState.max_clan_tickets})
                                        </div>
                                        {lotteryState.clan_tickets.length === 0 ? (
                                            <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-[11px] font-mono text-white/60 uppercase text-center">
                                                Aucun ticket de clan
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-1.5 p-2 bg-purple-900/10 border border-purple-500/15 rounded-xl">
                                                {lotteryState.clan_tickets.map(t => (
                                                    <div
                                                        key={t.id}
                                                        className="px-2.5 py-1 bg-purple-600/15 border border-purple-500/30 rounded text-purple-400 text-[11px] font-mono font-bold flex flex-col items-center justify-center gap-0.5"
                                                        title={`Acheté par ${t.buyer}`}
                                                    >
                                                        <span>#{t.number}</span>
                                                        <span className="text-[11px] text-white/60 uppercase truncate max-w-[50px]">{t.buyer}</span>
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
                                    <div className="text-[11px] font-mono text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Trophy className="h-3 w-3 text-banan-primary" />
                                        Historique des tirages
                                    </div>
                                    <div className="space-y-1">
                                        {lotteryState.history.map(h => (
                                            <div
                                                key={h.draw_number}
                                                className="flex items-center justify-between p-2 bg-white/5 text-[11px] font-mono border border-white/5 rounded-lg"
                                            >
                                                <span className="text-white/60 font-bold">#{h.draw_number}</span>
                                                <span className="text-banan-primary font-bold text-xs bg-black/40 px-2 py-0.5 rounded border border-banan-primary/20">{h.winning_number}</span>
                                                <span className={`font-semibold ${
                                                    h.winner
                                                        ? h.winner.startsWith('Clan')
                                                            ? 'text-purple-400'
                                                            : 'text-green-400'
                                                        : 'text-red-500'
                                                }`}>
                                                    {h.winner || 'Rollover'}
                                                </span>
                                                <span className="text-white/60 flex items-center gap-1">{formatNumber(h.jackpot)} <Banana className="h-2.5 w-2.5" /></span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
