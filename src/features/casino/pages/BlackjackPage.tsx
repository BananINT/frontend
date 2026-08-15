import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Club, Plus, Hand, CopyPlus, Banana } from 'lucide-react';
import { formatNumber } from '@app/utils/format';
import GameLayout from '../components/GameLayout';
import BetControls from '../components/BetControls';
import DoubleOrNothing from '../components/DoubleOrNothing';
import FairnessPanel from '../components/FairnessPanel';
import PlayingCard from '../components/PlayingCard';
import { Felt } from '../components/Surfaces';
import { useCasinoGame, useCasinoTopic } from '../lib/useCasinoGame';
import type { BlackjackResult } from '../lib/types';

const OUTCOME_COPY: Record<string, { text: string; color: string }> = {
    blackjack: { text: 'Blackjack !', color: 'text-[#f5d76e]' },
    win: { text: 'Gagné', color: 'text-green-400' },
    push: { text: 'Égalité — mise rendue', color: 'text-white/70' },
    lose: { text: 'Perdu', color: 'text-red-400' },
    bust: { text: 'Dépassé', color: 'text-red-400' },
};

/** Fans a hand along a shallow arc, the way cards sit on a real table. */
function Fan({ cards, faceDown = 0 }: { cards: string[]; faceDown?: number }) {
    const all = [...cards, ...Array.from({ length: faceDown }, () => null)];
    const mid = (all.length - 1) / 2;

    return (
        <div className="flex justify-center items-end min-h-[7rem]" style={{ perspective: 900 }}>
            {all.map((card, i) => {
                const offset = i - mid;
                return (
                    <div
                        key={`${card ?? 'back'}-${i}`}
                        className="-mx-3 md:-mx-2"
                        style={{
                            transform: `rotate(${offset * 6}deg) translateY(${Math.abs(offset) * 6}px)`,
                            zIndex: i,
                        }}
                    >
                        <PlayingCard card={card} index={i} />
                    </div>
                );
            })}
        </div>
    );
}

const CHIP_SIZE = 44;
const CHIP_OFFSET = 11;

/** A stack of round poker chips whose height tracks the wager. */
function ChipStack({ amount, doubled }: { amount: number; doubled?: boolean }) {
    const chips = Math.min(6, Math.max(1, Math.ceil(Math.log10(Math.max(10, amount)))));
    const stackHeight = CHIP_SIZE + (chips - 1) * CHIP_OFFSET;

    return (
        <div className="flex flex-col items-center gap-1.5 w-full">
            <div className="relative" style={{ width: CHIP_SIZE, height: stackHeight }}>
                {Array.from({ length: chips }, (_, i) => {
                    const top = i === chips - 1;
                    return (
                        <motion.div
                            key={i}
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: -i * CHIP_OFFSET, opacity: 1 }}
                            transition={{ delay: i * 0.05, type: 'spring', damping: 14 }}
                            className="absolute bottom-0 left-0 rounded-full border-2 border-dashed flex items-center justify-center"
                            style={{
                                width: CHIP_SIZE,
                                height: CHIP_SIZE,
                                background: i % 2 ? '#c9a227' : '#8b1d1d',
                                borderColor: 'rgba(255,255,255,0.45)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.6)',
                            }}
                        >
                            {top && (
                                <span
                                    className="rounded-full flex items-center justify-center"
                                    style={{
                                        width: CHIP_SIZE * 0.6,
                                        height: CHIP_SIZE * 0.6,
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                    }}
                                >
                                    <Banana className="w-4 h-4 text-[#f5d76e]" />
                                </span>
                            )}
                        </motion.div>
                    );
                })}
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#f5d76e]/70 tabular-nums truncate max-w-full">
                {formatNumber(amount)}
                {doubled && ' ×2'}
            </span>
        </div>
    );
}

export default function BlackjackPage() {
    const { result, error, busy, gamble, dismissGamble, flashKey, play, act, setResult } =
        useCasinoGame<BlackjackResult>('blackjack');

    const [bet, setBet] = useState(1000);

    // A page refresh mid-hand used to leave the player stuck: the board only
    // ever populated from a `casino_play`/`casino_action` reply, so a hand
    // left running server-side never rendered and a fresh deal was refused.
    // On mount, ask the server whether a hand is already in flight and, if
    // so, hydrate the board with it before the player can act.
    const { state: resumed } = useCasinoTopic<BlackjackResult & { topic: string; status: string }>('blackjack');
    useEffect(() => {
        if (resumed?.status === 'playing' && !result) setResult(resumed);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resumed]);

    const playing = result?.status === 'playing';
    const finished = result?.status === 'finished';
    const outcome = finished ? OUTCOME_COPY[result.outcome ?? 'lose'] : null;

    return (
        <GameLayout
            icon={Club}
            title="Blackjack Simien"
            subtitle="Le croupier reste à 17 · Blackjack payé 3:2 · Doublement autorisé"
            accent="text-[#f5d76e]"
            accentGlow="bg-[#c9a227]/20"
            floating={[Club]}
            floatingClass="text-[#c9a227]/[0.05]"
            flashKey={flashKey}
            flashColor="rgba(245,215,110,0.28)"
            error={error}
            banner={<DoubleOrNothing gamble={gamble} onGamble={() => act('play', {}, 'gamble')} onDecline={dismissGamble} busy={busy} />}
        >
            <Felt>
                <div className="px-3 py-5 sm:px-5 sm:py-7 md:px-10 md:py-9 flex flex-col gap-4 md:gap-5">
                    {/* Dealer */}
                    <div>
                        <div className="flex items-baseline justify-center gap-3 mb-2">
                            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">
                                Croupier
                            </span>
                            <span className="text-xl font-black tabular-nums text-white/80">
                                {result ? result.dealer_total : '—'}
                                {playing && <span className="text-white/30 text-sm ml-1">+?</span>}
                            </span>
                        </div>
                        <Fan cards={result?.dealer ?? []} faceDown={playing ? 1 : result ? 0 : 2} />
                    </div>

                    {/* Printed table rule, curved across the felt */}
                    <div className="relative py-1">
                        <div className="h-px bg-gradient-to-r from-transparent via-[#c9a227]/35 to-transparent" />
                        <p className="text-center text-[9px] md:text-[10px] font-mono uppercase tracking-[0.35em] text-[#f5d76e]/40 mt-2">
                            Le blackjack paie 3 pour 2 · L'assurance n'est pas proposée
                        </p>
                    </div>

                    {/* Player + chips */}
                    <div className="flex items-end justify-center gap-2 md:gap-10">
                        <div className="flex-1 max-w-md">
                            <div className="flex items-baseline justify-center gap-3 mb-2">
                                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">
                                    Vous
                                </span>
                                <span
                                    className={`text-xl font-black tabular-nums ${
                                        (result?.player_total ?? 0) > 21 ? 'text-red-400' : 'text-[#f5d76e]'
                                    }`}
                                >
                                    {result ? result.player_total : '—'}
                                </span>
                            </div>
                            <Fan cards={result?.player ?? []} faceDown={result ? 0 : 2} />
                        </div>

                        {/* The chip column keeps its lane whether or not a hand
                            is in play, so dealing does not slide the fan. */}
                        <div className="w-14 md:w-20 shrink-0">
                            {result && (
                                <ChipStack amount={result.wager ?? result.bet ?? bet} doubled={result.doubled} />
                            )}
                        </div>
                    </div>

                    {/* The verdict has a permanent seat on the felt, so the hand
                        above it and the controls below it never move. */}
                    <div className="relative h-14 shrink-0">
                        <AnimatePresence>
                            {outcome && (
                                <motion.div
                                    initial={{ scale: 0.7, opacity: 0, y: 10 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ type: 'spring', damping: 13 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center text-center"
                                >
                                    <p
                                        className={`text-2xl md:text-3xl font-black uppercase tracking-[0.15em] ${outcome.color}`}
                                    >
                                        {outcome.text}
                                    </p>
                                    {(result?.payout ?? 0) > 0 && (
                                        <p className="text-sm font-mono text-white/60 mt-1">
                                            +{formatNumber(result?.payout ?? 0)} 🍌
                                        </p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </Felt>

            <BetControls
                bet={bet}
                onBet={setBet}
                onPlay={() => play(bet)}
                busy={busy && !playing}
                disabled={playing}
                label="Distribuer"
                icon={<Club className="w-5 h-5" />}
                hint="La maison prélève une commission de 14,6% sur les gains nets — c'est ce qui aligne cette table sur les 92% du reste du casino."
                actions={
                    playing ? (
                        <div className="grid grid-cols-3 gap-2 h-full">
                            <motion.button
                                whileTap={{ scale: 0.94 }}
                                onClick={() => act('act', { action: 'hit' })}
                                className="h-full px-1 bg-[#f5d76e] text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-1.5"
                            >
                                <Plus className="w-4 h-4" /> Tirer
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.94 }}
                                onClick={() => act('act', { action: 'stand' })}
                                className="h-full px-1 bg-white/10 border border-white/20 text-white font-black uppercase tracking-widest text-sm rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-1.5"
                            >
                                <Hand className="w-4 h-4" /> Rester
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.94 }}
                                onClick={() => act('act', { action: 'double' })}
                                disabled={!result?.can_double}
                                className="h-full px-1 bg-[#8b1d1d]/40 border border-[#c9a227]/50 text-[#f5d76e] font-black uppercase tracking-widest text-sm rounded-xl hover:bg-[#8b1d1d]/60 transition-colors disabled:opacity-30 flex items-center justify-center gap-1.5"
                            >
                                <CopyPlus className="w-4 h-4" /> Doubler
                            </motion.button>
                        </div>
                    ) : undefined
                }
            />

            <FairnessPanel proof={result?.proof} />
        </GameLayout>
    );
}
