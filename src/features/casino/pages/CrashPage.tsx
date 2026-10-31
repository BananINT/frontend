import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Banana, Radio } from 'lucide-react';
import { formatNumber } from '@app/utils/format';
import GameLayout from '../components/GameLayout';
import BetControls from '../components/BetControls';
import DoubleOrNothing from '../components/DoubleOrNothing';
import FairnessPanel from '../components/FairnessPanel';
import { GraphPaper, ScanLines, Readout } from '../components/Surfaces';
import { useCasinoGame } from '../lib/useCasinoGame';
import type { CrashResult } from '../lib/types';

/** Mirrors the server's m(t) = e^(rate * seconds) curve for local animation. */
const CURVE_RATE = 0.09;
const VIEW_W = 1000;
const VIEW_H = 420;
/** Seconds of history visible before the plot starts scrolling. */
const WINDOW_S = 12;

/** One line in the flight recorder. */
interface Round {
    /** The multiplier that ended it: cashed at, or crashed at. */
    at: number;
    cashed: boolean;
    key: string;
}

/** Map elapsed seconds + multiplier into the SVG viewbox. */
function project(t: number, m: number, spanT: number, spanM: number) {
    const x = (t / spanT) * VIEW_W;
    // Log scale on Y so a 1.2x and a 50x round both read well.
    const y = VIEW_H - (Math.log(m) / Math.log(spanM)) * VIEW_H;
    return [x, Math.max(4, Math.min(VIEW_H - 2, y))] as const;
}

export default function CrashPage() {
    const { result, error, busy, gamble, dismissGamble, flashKey, play, act, poke } = useCasinoGame<CrashResult>('crash');

    const [bet, setBet] = useState(1000);
    const [autoCashout, setAutoCashout] = useState(2);
    const [elapsed, setElapsed] = useState(0);
    const [history, setHistory] = useState<Round[]>([]);
    const [stickyStake, setStickyStake] = useState(0);
    const lastSettled = useRef<CrashResult | null>(null);

    const running = result?.status === 'running';
    const busted = result?.status === 'busted';
    const cashed = result?.status === 'cashed';

    // `poll_crash` answers a live round with only {status, multiplier,
    // started_at} — no `bet` — so trusting the latest reply blanks the stake a
    // few hundred ms into every round and the cash-out button reads 0. The
    // opening reply's stake is kept until a new one arrives, resolved during
    // render the same way lib/animation.ts resets its sequences.
    if (typeof result?.bet === 'number' && result.bet > 0 && result.bet !== stickyStake) {
        setStickyStake(result.bet);
    }
    const stake = typeof result?.bet === 'number' ? result.bet : stickyStake;

    // The client draws the curve locally, but the server owns the outcome: it is
    // polled for the truth and never told when the round ended.
    useEffect(() => {
        if (!running || !result?.started_at) return;

        let frame = 0;
        const tick = () => {
            setElapsed(Math.max(0, Date.now() / 1000 - (result.started_at as number)));
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        const pollTimer = setInterval(() => poke('poll'), 400);

        return () => {
            cancelAnimationFrame(frame);
            clearInterval(pollTimer);
        };
    }, [running, result?.started_at, poke]);

    // The recorder logs what the player actually walked away with. A cashed
    // round carries both `multiplier` (where they got out) and `crash_point`
    // (where it would have died) — logging the latter reported a number the
    // player never saw, and always beat their own result.
    useEffect(() => {
        if (!(busted || cashed) || !result || lastSettled.current === result) return;
        lastSettled.current = result;
        const at = cashed ? (result.multiplier ?? 0) : (result.crash_point ?? result.multiplier ?? 0);
        setHistory((h) => [{ at, cashed, key: `${Date.now()}` }, ...h].slice(0, 14));
    }, [busted, cashed, result]);

    const live = Math.floor(Math.exp(CURVE_RATE * elapsed) * 100) / 100;
    const shown = running ? live : (result?.multiplier ?? 1);
    const settledAt = !running && result ? Math.log(Math.max(1, shown)) / CURVE_RATE : 0;
    const drawT = running ? elapsed : settledAt;

    // The plot grows to fit whatever the round has reached.
    const spanT = Math.max(WINDOW_S, drawT * 1.08);
    const spanM = Math.max(3, Math.exp(CURVE_RATE * spanT));

    const points: string[] = [];
    const STEPS = 72;
    for (let i = 0; i <= STEPS; i++) {
        const t = (drawT * i) / STEPS;
        const [x, y] = project(t, Math.exp(CURVE_RATE * t), spanT, spanM);
        points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    const path = points.length > 1 ? `M ${points.join(' L ')}` : '';
    const [headX, headY] = project(drawT, Math.max(1, shown), spanT, spanM);

    const stroke = busted ? '#ef4444' : cashed ? '#4ade80' : '#FADE00';

    const start = () => {
        setElapsed(0);
        play(bet, { auto_cashout: autoCashout > 1 ? autoCashout : 0 });
    };

    return (
        <GameLayout
            icon={Rocket}
            title="Bananorama"
            subtitle="Télémétrie en direct. Le multiplicateur grimpe jusqu'à ce que la banane pourrisse."
            floating={[Rocket]}
            flashKey={flashKey}
            flashColor={busted ? 'rgba(239,68,68,0.3)' : 'rgba(74,222,128,0.3)'}
            error={error}
            wide
            banner={<DoubleOrNothing gamble={gamble} onGamble={() => act('play', {}, 'gamble')} onDecline={dismissGamble} busy={busy} />}
        >
            {/* Telemetry scope */}
            <div
                className={`relative rounded-2xl border-2 overflow-hidden transition-colors duration-300 ${
                    busted ? 'border-red-500/70' : cashed ? 'border-green-500/70' : 'border-white/10'
                }`}
                style={{ background: 'linear-gradient(180deg, #07070a 0%, #0b0d10 100%)' }}
            >
                <GraphPaper color="rgba(250,222,0,0.06)" cell={18} />
                <ScanLines opacity={0.35} />

                {/* Instrument header */}
                <div className="relative flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/40">
                    <span className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.25em] text-white/60">
                        <motion.span
                            animate={running ? { opacity: [1, 0.2, 1] } : { opacity: 0.3 }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className={`w-1.5 h-1.5 rounded-full ${running ? 'bg-red-500' : 'bg-white/30'}`}
                        />
                        {running ? 'Acquisition' : 'Veille'}
                    </span>
                    <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-white/60">
                        T+{drawT.toFixed(1)}s
                    </span>
                </div>

                <div className="relative">
                    <svg
                        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                        preserveAspectRatio="none"
                        className="w-full h-56 md:h-72 block"
                    >
                        <defs>
                            <linearGradient id="crashFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
                                <stop offset="100%" stopColor={stroke} stopOpacity="0" />
                            </linearGradient>
                            <filter id="crashGlow">
                                <feGaussianBlur stdDeviation="6" result="b" />
                                <feMerge>
                                    <feMergeNode in="b" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Multiplier gridlines, log-spaced */}
                        {[1.5, 2, 3, 5, 10, 25, 100].map((m) =>
                            m < spanM ? (
                                <g key={m}>
                                    <line
                                        x1={0}
                                        x2={VIEW_W}
                                        y1={project(0, m, spanT, spanM)[1]}
                                        y2={project(0, m, spanT, spanM)[1]}
                                        stroke="rgba(255,255,255,0.09)"
                                        strokeDasharray="4 8"
                                    />
                                    <text
                                        x={8}
                                        y={project(0, m, spanT, spanM)[1] - 6}
                                        fill="rgba(255,255,255,0.28)"
                                        fontSize="13"
                                        fontFamily="Space Mono, monospace"
                                    >
                                        {m}×
                                    </text>
                                </g>
                            ) : null
                        )}

                        {path && (
                            <>
                                <path d={`${path} L ${headX},${VIEW_H} L 0,${VIEW_H} Z`} fill="url(#crashFill)" />
                                <path
                                    d={path}
                                    fill="none"
                                    stroke={stroke}
                                    strokeWidth={3}
                                    strokeLinecap="round"
                                    filter="url(#crashGlow)"
                                    vectorEffect="non-scaling-stroke"
                                />
                                <circle cx={headX} cy={headY} r={7} fill={stroke} filter="url(#crashGlow)" />
                            </>
                        )}
                    </svg>

                    {/* Readout floats over the plot */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <motion.div
                            animate={running ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                            transition={{ repeat: Infinity, duration: 0.9 }}
                            className="text-center"
                        >
                            <div
                                className="text-5xl md:text-7xl font-black tabular-nums tracking-tighter drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]"
                                style={{ color: stroke }}
                            >
                                {shown.toFixed(2)}×
                            </div>
                            <AnimatePresence>
                                {busted && (
                                    <motion.p
                                        initial={{ scale: 0, rotate: -8 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        className="text-xs font-mono text-red-400 uppercase tracking-[0.3em] mt-1"
                                    >
                                        Perte de signal
                                    </motion.p>
                                )}
                                {cashed && (
                                    <motion.p
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="text-xs font-mono text-green-400 uppercase tracking-[0.3em] mt-1"
                                    >
                                        +{formatNumber(result?.payout ?? 0)} 🍌
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* The banana rides the curve head */}
                    {running && (
                        <motion.div
                            className="absolute pointer-events-none"
                            style={{
                                left: `${(headX / VIEW_W) * 100}%`,
                                top: `${(headY / VIEW_H) * 100}%`,
                            }}
                            animate={{ rotate: [-8, 6, -8] }}
                            transition={{ repeat: Infinity, duration: 0.7 }}
                        >
                            <Banana className="w-7 h-7 -translate-x-1/2 -translate-y-1/2 text-banan-primary drop-shadow-[0_0_10px_rgba(250,222,0,0.9)]" />
                        </motion.div>
                    )}

                    {/* Bust flash */}
                    <AnimatePresence>
                        {busted && (
                            <motion.div
                                initial={{ opacity: 0.85 }}
                                animate={{ opacity: 0 }}
                                transition={{ duration: 0.8 }}
                                className="absolute inset-0 bg-red-600 pointer-events-none mix-blend-screen"
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* Instrument footer */}
                <div className="relative flex items-center justify-around px-4 py-3 border-t border-white/10 bg-black/40">
                    <Readout label="Mise" value={formatNumber(stake || bet)} tone="text-white/70" size="text-lg" />
                    <Readout
                        label="Gain courant"
                        value={running ? formatNumber(Math.floor(stake * live)) : '—'}
                        tone="text-banan-primary"
                        size="text-lg"
                    />
                    <Readout
                        label="Cible auto"
                        value={autoCashout > 1 ? `${autoCashout.toFixed(2)}×` : 'off'}
                        tone="text-cyan-400"
                        size="text-lg"
                    />
                </div>
            </div>

            {/* Flight recorder — its lane is reserved from the first render so
                the first landed round does not push the controls down. */}
            <div className="flex items-center gap-2 overflow-x-auto h-8 shrink-0">
                <Radio className="w-3.5 h-3.5 text-white/25 shrink-0" />
                {history.length === 0 ? (
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/15">
                        Aucun vol enregistré
                    </span>
                ) : (
                    history.map((round) => (
                        <motion.span
                            key={round.key}
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            title={round.cashed ? 'Encaissé' : 'Perte de signal'}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-mono tabular-nums border shrink-0 ${
                                !round.cashed
                                    ? 'text-red-400 border-red-500/30 bg-red-500/10'
                                    : round.at >= 10
                                      ? 'text-banan-primary border-banan-primary/40 bg-banan-primary/10'
                                      : 'text-green-400 border-green-500/30 bg-green-500/10'
                            }`}
                        >
                            {round.at.toFixed(2)}×
                        </motion.span>
                    ))
                )}
            </div>

            <BetControls
                bet={bet}
                onBet={setBet}
                onPlay={start}
                busy={busy && !running}
                disabled={running}
                label="Décoller"
                icon={<Rocket className="w-5 h-5" />}
                hint="Le retrait auto est résolu par le serveur à votre cible exacte, même si votre connexion rame."
                actions={
                    running ? (
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => act('cashout')}
                            className="w-full h-full bg-green-500 text-black font-black uppercase tracking-widest text-base md:text-lg rounded-xl hover:bg-white transition-colors marquee-border shadow-[0_0_30px_rgba(34,197,94,0.4)]"
                        >
                            Encaisser {formatNumber(Math.floor(stake * live))} 🍌
                        </motion.button>
                    ) : undefined
                }
            >
                <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-mono uppercase text-white/50">Retrait auto</span>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min={1.01}
                            step={0.1}
                            value={autoCashout}
                            onChange={(e) => setAutoCashout(Number(e.target.value))}
                            disabled={running}
                            className="w-24 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-mono text-banan-primary text-right focus:border-banan-primary outline-none disabled:opacity-40"
                        />
                        <span className="text-sm font-mono text-white/60">×</span>
                    </div>
                </div>
            </BetControls>

            <FairnessPanel proof={result?.proof} />
        </GameLayout>
    );
}
