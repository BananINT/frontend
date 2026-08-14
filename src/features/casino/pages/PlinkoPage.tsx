import { useEffect, useReducer, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Banana, CircleDot } from 'lucide-react';
import { socketManager } from '@app/lib/socket';
import { formatNumber } from '@app/utils/format';
import GameLayout from '../components/GameLayout';
import BetControls from '../components/BetControls';
import DoubleOrNothing from '../components/DoubleOrNothing';
import FairnessPanel from '../components/FairnessPanel';
import { useCasinoGame } from '../lib/useCasinoGame';
import type { CasinoResult, PlinkoDetail } from '../lib/types';

const ROWS = 16;
const STEP_MS = 62;
/** How long a landing popup stays up. */
const POP_MS = 1500;
/** Board coordinate space; the SVG scales to fit. */
const BOARD_W = 340;
const PEG_GAP = 18;
const ROW_GAP = 20;
const TOP = 16;
const BUCKETS = 17;
/** Cap on simultaneous balls, so a stuck finger cannot flood the board. */
const MAX_BALLS = 24;

const RISKS = [
    { key: 'low', label: 'Prudent' },
    { key: 'medium', label: 'Normal' },
    { key: 'high', label: 'Dingue' },
] as const;

interface Ball {
    id: string;
    path: number[];
    bucket: number;
    startedAt: number;
}

interface Pop {
    id: string;
    bucket: number;
    payout: number;
    bet: number;
    multiplier: number;
    landedAt: number;
}

/** Heat ramp: the further from centre, the hotter the bucket. */
function bucketTone(multiplier: number) {
    if (multiplier >= 50) return { bg: '#dc2626', fg: '#fff' };
    if (multiplier >= 10) return { bg: '#ea580c', fg: '#fff' };
    if (multiplier >= 2) return { bg: '#f59e0b', fg: '#000' };
    if (multiplier >= 1) return { bg: '#FADE00', fg: '#000' };
    if (multiplier >= 0.4) return { bg: '#4d4d33', fg: '#e5e5c0' };
    return { bg: '#27272a', fg: '#71717a' };
}

/** Peg centre for row r (0-indexed), peg p. */
function pegPos(r: number, p: number) {
    const count = r + 2;
    const x = BOARD_W / 2 + (p - (count - 1) / 2) * PEG_GAP;
    return { x, y: TOP + r * ROW_GAP };
}

export default function PlinkoPage() {
    const { result, error, gamble, dismissGamble, flashKey, play, act } = useCasinoGame<
        CasinoResult<PlinkoDetail>
    >('plinko', { concurrent: true });

    const [bet, setBet] = useState(1000);
    const [risk, setRisk] = useState<(typeof RISKS)[number]['key']>('medium');
    const [balls, setBalls] = useState<Ball[]>([]);
    const [pops, setPops] = useState<Pop[]>([]);
    /** Last payout table seen, so the buckets keep their labels between drops. */
    const [table, setTable] = useState<number[]>([]);

    // Everything on the board is drawn from one clock: a ball's row and a
    // popup's fade both come from how long they have existed. Deriving the
    // visuals rather than handing them to an animation library keeps a popup's
    // appearance and its lifetime from drifting apart.
    const [, tick] = useReducer((n: number) => n + 1, 0);
    const boardBusy = balls.length > 0 || pops.length > 0;
    useEffect(() => {
        if (!boardBusy) return;
        let frame = requestAnimationFrame(function loop() {
            tick();
            frame = requestAnimationFrame(loop);
        });
        return () => cancelAnimationFrame(frame);
    }, [boardBusy]);

    // Spent popups are pruned on their own timer. Doing it in the frame loop
    // would tie cleanup to frame delivery, which stalls in a background tab.
    useEffect(() => {
        if (pops.length === 0) return;
        const timer = setInterval(() => {
            setPops((p) => {
                const live = p.filter((x) => performance.now() - x.landedAt < POP_MS);
                return live.length === p.length ? p : live;
            });
        }, 150);
        return () => clearInterval(timer);
    }, [pops.length]);

    /**
     * Every drop is its own ball, so the page listens to the socket directly:
     * `useCasinoGame` only ever holds the *latest* result, which cannot describe
     * four balls in the air at once.
     */
    const timers = useRef<number[]>([]);
    useEffect(() => {
        const handle = (msg: { type: string; data?: unknown }) => {
            if (msg.type !== 'casino_result') return;
            const data = msg.data as CasinoResult<PlinkoDetail>;
            if (data?.game !== 'plinko' || !data.detail) return;

            const detail = data.detail;
            const id = `${detail.bucket}-${data.proof?.nonce ?? 0}-${Math.random().toString(36).slice(2, 7)}`;

            setTable(detail.table ?? []);
            setBalls((b) => [...b, { id, path: detail.path, bucket: detail.bucket, startedAt: performance.now() }].slice(-MAX_BALLS));

            // The ball is swapped for its popup the moment it hits the bucket;
            // the popup then expires on the board clock.
            timers.current.push(
                window.setTimeout(() => {
                    setBalls((b) => b.filter((x) => x.id !== id));
                    setPops((p) => [
                        ...p,
                        {
                            id,
                            bucket: detail.bucket,
                            payout: Number(data.payout ?? 0),
                            bet: Number(data.bet ?? 0),
                            multiplier: detail.multiplier,
                            landedAt: performance.now(),
                        },
                    ]);
                }, ROWS * STEP_MS)
            );
        };

        socketManager.subscribe(handle);
        return () => {
            socketManager.unsubscribe(handle);
            timers.current.forEach(clearTimeout);
            timers.current = [];
        };
    }, []);

    const boardH = TOP + ROWS * ROW_GAP + 10;
    const now = performance.now();
    const dropping = balls.length > 0;

    return (
        <GameLayout
            icon={CircleDot}
            title="Chute à Bananes"
            subtitle="Seize rangées de clous, dix-sept godets. Lâchez-en autant que vous voulez à la fois."
            floating={[CircleDot]}
            flashKey={flashKey}
            error={error}
            banner={<DoubleOrNothing gamble={gamble} onGamble={() => act('play', {}, 'gamble')} onDecline={dismissGamble} busy={false} />}
        >
            <div
                className="relative rounded-2xl border border-white/10 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
                style={{ background: 'radial-gradient(ellipse at 50% -10%, #1c1c22 0%, #0b0b0e 70%)' }}
            >
                {/* Cabinet lamps */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                    {[0, 1, 2].map((i) => (
                        <motion.span
                            key={i}
                            animate={dropping ? { opacity: [0.25, 1, 0.25] } : { opacity: 0.2 }}
                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.15 }}
                            className="w-2 h-2 rounded-full bg-banan-primary"
                        />
                    ))}
                    <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/25">
                        Profil {risk}
                        {balls.length > 1 && ` · ${balls.length} billes`}
                    </span>
                    {[0, 1, 2].map((i) => (
                        <motion.span
                            key={`r${i}`}
                            animate={dropping ? { opacity: [0.25, 1, 0.25] } : { opacity: 0.2 }}
                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.15 + 0.25 }}
                            className="w-2 h-2 rounded-full bg-banan-primary"
                        />
                    ))}
                </div>

                <div className="relative p-3 md:p-5">
                    <svg viewBox={`0 0 ${BOARD_W} ${boardH}`} className="w-full block">
                        <defs>
                            <radialGradient id="pegLit">
                                <stop offset="0%" stopColor="#FADE00" />
                                <stop offset="100%" stopColor="#FADE00" stopOpacity="0" />
                            </radialGradient>
                        </defs>

                        {/* Pegs light up when any ball is on their row */}
                        {Array.from({ length: ROWS }, (_, r) =>
                            Array.from({ length: r + 2 }, (_, p) => {
                                const { x, y } = pegPos(r, p);
                                const struck = balls.some((ball) => {
                                    const rows = Math.floor((now - ball.startedAt) / STEP_MS);
                                    if (rows !== r + 1) return false;
                                    const drift = ball.path.slice(0, rows).reduce((a, b) => a + b, 0);
                                    return Math.abs(BOARD_W / 2 + (drift - rows / 2) * PEG_GAP - x) < PEG_GAP;
                                });

                                return (
                                    <g key={`${r}-${p}`}>
                                        {struck && (
                                            <motion.circle
                                                cx={x}
                                                cy={y}
                                                r={7}
                                                fill="url(#pegLit)"
                                                initial={{ opacity: 0.9, scale: 0.4 }}
                                                animate={{ opacity: 0, scale: 1.8 }}
                                                transition={{ duration: 0.35 }}
                                            />
                                        )}
                                        <circle cx={x} cy={y} r={1.9} fill={struck ? '#FADE00' : 'rgba(255,255,255,0.28)'} />
                                    </g>
                                );
                            })
                        )}

                        {/* Every ball in the air, each on its own server-dealt path */}
                        {balls.map((ball) => {
                            const rows = Math.max(0, Math.min(ROWS, (now - ball.startedAt) / STEP_MS));
                            const cleared = Math.floor(rows);
                            const drift = ball.path.slice(0, cleared).reduce((a, b) => a + b, 0);
                            const x = BOARD_W / 2 + (drift - cleared / 2) * PEG_GAP;
                            const y = TOP + (rows - 0.5) * ROW_GAP;
                            return (
                                <circle
                                    key={ball.id}
                                    cx={x}
                                    cy={Math.max(TOP - 8, y)}
                                    r={5}
                                    fill="#FADE00"
                                    style={{ filter: 'drop-shadow(0 0 8px rgba(250,222,0,0.9))' }}
                                />
                            );
                        })}
                    </svg>

                    {/* Godets */}
                    <div className="relative flex gap-[2px] mt-1">
                        {(table.length ? table : Array.from({ length: BUCKETS }, () => 0)).map((multiplier, index) => {
                            const tone = bucketTone(multiplier);
                            const hit = pops.some((p) => p.bucket === index);
                            return (
                                <motion.div
                                    key={index}
                                    animate={hit ? { y: [0, 7, -2, 0], scale: [1, 1.16, 1] } : { y: 0, scale: 1 }}
                                    transition={{ duration: 0.45 }}
                                    className="flex-1 rounded-b-md text-center py-1.5 text-[8px] md:text-[10px] font-mono font-bold tabular-nums"
                                    style={{
                                        background: tone.bg,
                                        color: tone.fg,
                                        boxShadow: hit
                                            ? '0 0 22px rgba(255,255,255,0.8), inset 0 -3px 0 rgba(0,0,0,0.35)'
                                            : 'inset 0 -3px 0 rgba(0,0,0,0.35)',
                                    }}
                                >
                                    {table.length
                                        ? multiplier >= 10
                                            ? multiplier.toFixed(0)
                                            : multiplier.toFixed(1)
                                        : '·'}
                                    {table.length ? '×' : ''}
                                </motion.div>
                            );
                        })}

                        {/* Landings float up out of the godet they hit, so the
                            board never has to make room for a result card. The
                            whole life is one keyframe run — no exit animation to
                            depend on, and the clock above prunes them. */}
                        {pops.map((pop) => {
                                const won = pop.payout > 0;
                                const profited = pop.payout > pop.bet;
                                const life = Math.min(1, Math.max(0, (now - pop.landedAt) / POP_MS));
                                // Pop in over the first sixth, hold, fade out.
                                const opacity = life < 0.16 ? life / 0.16 : life > 0.72 ? (1 - life) / 0.28 : 1;
                                const rise = -8 - 62 * (1 - Math.pow(1 - life, 3));
                                const scale = life < 0.16 ? 0.7 + 0.3 * (life / 0.16) : 1 - 0.08 * life;
                                // Popups over the outer godets are anchored by
                                // their near edge; centring them there would put
                                // half the chip outside the cabinet.
                                const anchor = pop.bucket <= 1 ? 0 : pop.bucket >= BUCKETS - 2 ? -100 : -50;
                                return (
                                    <div
                                        key={pop.id}
                                        className="absolute bottom-full whitespace-nowrap pointer-events-none z-10"
                                        style={{
                                            left: `${((pop.bucket + 0.5) / BUCKETS) * 100}%`,
                                            opacity,
                                            transform: `translate(${anchor}%, ${rise}px) scale(${scale})`,
                                        }}
                                    >
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-black tabular-nums backdrop-blur-sm ${
                                                profited
                                                    ? 'border-green-400/60 bg-green-500/20 text-green-300 shadow-[0_0_18px_rgba(74,222,128,0.45)]'
                                                    : won
                                                      ? 'border-white/20 bg-black/70 text-white/70'
                                                      : 'border-red-500/40 bg-red-950/70 text-red-300/80'
                                            }`}
                                        >
                                            {pop.multiplier.toFixed(2)}×
                                            {won && ` · +${formatNumber(pop.payout)}`}
                                        </span>
                                    </div>
                                );
                        })}
                    </div>
                </div>
            </div>

            <BetControls
                bet={bet}
                onBet={setBet}
                onPlay={() => play(bet, { risk })}
                label="Lâcher"
                icon={<Banana className="w-5 h-5" />}
                hint="Cliquez autant de fois que vous voulez : chaque bille part immédiatement et tombe pour son compte."
            >
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-mono uppercase text-white/50">Profil de risque</span>
                    <div className="flex gap-2">
                        {RISKS.map((option) => (
                            <button
                                key={option.key}
                                onClick={() => setRisk(option.key)}
                                className={`flex-1 px-3 py-2 rounded-lg text-xs font-mono uppercase border transition-colors ${
                                    risk === option.key
                                        ? 'bg-banan-primary text-black border-banan-primary font-bold'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </BetControls>

            <FairnessPanel proof={result?.proof} />
        </GameLayout>
    );
}
