import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, Banana, HandCoins, Cpu, TriangleAlert } from 'lucide-react';
import { formatNumber } from '@app/utils/format';
import GameLayout from '../components/GameLayout';
import BetControls from '../components/BetControls';
import DoubleOrNothing from '../components/DoubleOrNothing';
import FairnessPanel from '../components/FairnessPanel';
import { CircuitBoard, ScanLines } from '../components/Surfaces';
import { useCasinoGame } from '../lib/useCasinoGame';
import type { MinesResult } from '../lib/types';

const TILES = 25;
const GRID = 5;
const BUG_PRESETS = [1, 3, 5, 10, 24];

const cell = (index: number) => ({ row: Math.floor(index / GRID), col: index % GRID });

export default function MinesPage() {
    const { result, error, busy, gamble, dismissGamble, flashKey, play, act } = useCasinoGame<MinesResult>('mines');

    const [bet, setBet] = useState(1000);
    const [bugs, setBugs] = useState(3);

    const running = result?.status === 'running';
    const busted = result?.status === 'busted';
    const cashed = result?.status === 'cashed';
    const finished = busted || cashed;

    const revealed = result?.revealed ?? [];
    const bugTiles = result?.bug_tiles ?? [];
    const multiplier = result?.multiplier ?? 1;

    const tileState = (index: number) => {
        if (revealed.includes(index)) return 'safe';
        if (finished && bugTiles.includes(index)) return 'bug';
        return 'hidden';
    };

    // Copper traces drawn between consecutively cleared pads.
    const traces = revealed.slice(1).map((tile, i) => {
        const from = cell(revealed[i]);
        const to = cell(tile);
        return {
            key: `${revealed[i]}-${tile}`,
            x1: from.col * 20 + 10,
            y1: from.row * 20 + 10,
            x2: to.col * 20 + 10,
            y2: to.row * 20 + 10,
        };
    });

    const risk = Math.round((bugs / TILES) * 100);

    return (
        <GameLayout
            icon={Bug}
            title="Champ de Bugs"
            subtitle="Sondez la carte. Chaque pastille saine étend le circuit — un seul bug et tout grille."
            accent="text-emerald-400"
            accentGlow="bg-emerald-500/20"
            floating={[Bug, Cpu]}
            floatingClass="text-emerald-500/[0.06]"
            flashKey={flashKey}
            flashColor="rgba(16,185,129,0.3)"
            error={error}
            banner={<DoubleOrNothing gamble={gamble} onGamble={() => act('play', {}, 'gamble')} onDecline={dismissGamble} busy={busy} />}
        >
            {/* Instrument strip */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Multiplicateur', value: `${multiplier.toFixed(2)}×`, tone: 'text-emerald-400' },
                    {
                        label: running ? 'Gain potentiel' : 'Palier suivant',
                        value: running
                            ? `${formatNumber(result?.potential ?? 0)}`
                            : `${(result?.next_multiplier ?? 0).toFixed(2)}×`,
                        tone: 'text-white/80',
                    },
                    { label: 'Densité de bugs', value: `${risk}%`, tone: 'text-orange-400' },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-xl border border-emerald-900/60 bg-black/50 px-3 py-2.5 text-center"
                    >
                        <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-white/35">
                            {stat.label}
                        </p>
                        <p className={`text-lg font-black tabular-nums ${stat.tone}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <CircuitBoard>
                <ScanLines opacity={0.25} />

                <div className="relative p-5 md:p-7">
                    {/* Copper traces sit under the pads */}
                    <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="absolute inset-5 md:inset-7 pointer-events-none"
                        style={{ width: 'calc(100% - 2.5rem)', height: 'calc(100% - 2.5rem)' }}
                    >
                        {traces.map((t) => (
                            <motion.line
                                key={t.key}
                                x1={t.x1}
                                y1={t.y1}
                                x2={t.x2}
                                y2={t.y2}
                                stroke={busted ? '#ef4444' : '#34d399'}
                                strokeWidth={0.7}
                                strokeLinecap="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.55 }}
                                transition={{ duration: 0.35 }}
                                vectorEffect="non-scaling-stroke"
                            />
                        ))}
                    </svg>

                    <div className="relative grid grid-cols-5 gap-2 md:gap-2.5">
                        {Array.from({ length: TILES }, (_, index) => {
                            const state = tileState(index);
                            const clickable = running && state === 'hidden';
                            const order = revealed.indexOf(index);

                            return (
                                <motion.button
                                    key={index}
                                    whileHover={clickable ? { scale: 1.07, y: -2 } : {}}
                                    whileTap={clickable ? { scale: 0.9 } : {}}
                                    onClick={() => clickable && act('reveal', { tile: index })}
                                    disabled={!clickable}
                                    animate={
                                        state === 'bug'
                                            ? { x: [0, -4, 4, -3, 3, 0], transition: { duration: 0.4 } }
                                            : {}
                                    }
                                    className={`relative aspect-square rounded-lg border flex items-center justify-center transition-colors duration-200 ${
                                        state === 'safe'
                                            ? 'border-emerald-400 bg-emerald-400/15 shadow-[0_0_20px_rgba(52,211,153,0.35),inset_0_0_12px_rgba(52,211,153,0.2)]'
                                            : state === 'bug'
                                              ? 'border-red-500 bg-red-500/25 shadow-[0_0_25px_rgba(239,68,68,0.5)]'
                                              : clickable
                                                ? 'border-emerald-800/70 bg-emerald-950/50 hover:border-emerald-400/70 hover:bg-emerald-900/40 cursor-pointer'
                                                : 'border-emerald-900/40 bg-black/40'
                                    }`}
                                >
                                    {/* Unrevealed pads look like solder points */}
                                    {state === 'hidden' && (
                                        <span className="w-2 h-2 rounded-full bg-emerald-500/25 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                                    )}

                                    {state === 'safe' && (
                                        <motion.span
                                            initial={{ scale: 0, rotate: -90 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: 'spring', damping: 11 }}
                                        >
                                            <Banana className="w-5 h-5 md:w-7 md:h-7 text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                        </motion.span>
                                    )}

                                    {state === 'bug' && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="relative"
                                        >
                                            <Bug className="w-5 h-5 md:w-7 md:h-7 text-red-400" />
                                            <motion.span
                                                aria-hidden
                                                animate={{ opacity: [0, 0.9, 0], x: [-2, 2, -2] }}
                                                transition={{ repeat: Infinity, duration: 0.25 }}
                                                className="absolute inset-0 flex items-center justify-center text-red-300 mix-blend-screen"
                                            >
                                                <Bug className="w-5 h-5 md:w-7 md:h-7" />
                                            </motion.span>
                                        </motion.span>
                                    )}

                                    {/* Probe order, like a logic-analyser channel number */}
                                    {order >= 0 && (
                                        <span className="absolute top-0.5 right-1 text-[8px] font-mono text-emerald-300/50">
                                            {order + 1}
                                        </span>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Board footer: silkscreen legend */}
                <div className="relative flex items-center justify-between px-5 py-2 border-t border-emerald-900/60 bg-black/50">
                    <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-emerald-400/40">
                        BANAN-PCB · REV.2
                    </span>
                    <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-emerald-400/40">
                        {revealed.length}/{TILES - bugs} pastilles
                    </span>
                </div>
            </CircuitBoard>

            {/* Constant-height verdict line: the board must not slide when a
                round ends. */}
            <div className="relative h-6 shrink-0">
                <AnimatePresence mode="wait">
                    {busted && (
                        <motion.p
                            key="bust"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 text-center text-xs md:text-sm font-mono text-red-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                        >
                            <TriangleAlert className="w-4 h-4" /> Carte grillée — mise perdue
                        </motion.p>
                    )}
                    {cashed && (
                        <motion.p
                            key="cash"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 text-center text-xs md:text-sm font-mono text-emerald-400 uppercase tracking-[0.2em] flex items-center justify-center"
                        >
                            Circuit extrait · +{formatNumber(result?.payout ?? 0)} 🍌 ({multiplier.toFixed(2)}×)
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>

            <BetControls
                bet={bet}
                onBet={setBet}
                onPlay={() => play(bet, { bugs })}
                busy={busy && !running}
                disabled={running}
                label="Sonder la carte"
                icon={<Bug className="w-5 h-5" />}
                actions={
                    running ? (
                        <motion.button
                            whileHover={{ scale: revealed.length ? 1.03 : 1 }}
                            whileTap={{ scale: revealed.length ? 0.95 : 1 }}
                            onClick={() => act('cashout')}
                            disabled={revealed.length === 0}
                            className="w-full h-full bg-emerald-400 text-black font-black uppercase tracking-widest text-base md:text-lg rounded-xl hover:bg-white transition-colors disabled:opacity-40 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(52,211,153,0.4)]"
                        >
                            <HandCoins className="w-5 h-5" />
                            Extraire {formatNumber(result?.potential ?? 0)} 🍌
                        </motion.button>
                    ) : undefined
                }
            >
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-mono uppercase text-white/50">Bugs implantés</span>
                    <div className="flex gap-2 flex-wrap">
                        {BUG_PRESETS.map((count) => (
                            <button
                                key={count}
                                onClick={() => setBugs(count)}
                                disabled={running}
                                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-mono uppercase border transition-colors disabled:opacity-40 ${
                                    bugs === count
                                        ? 'bg-emerald-400 text-black border-emerald-400 font-bold'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                            >
                                {count}
                            </button>
                        ))}
                    </div>
                </div>
            </BetControls>

            <FairnessPanel proof={result?.proof} />
        </GameLayout>
    );
}
