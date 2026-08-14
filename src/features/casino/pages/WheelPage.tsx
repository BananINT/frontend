import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Disc3, Droplet } from 'lucide-react';
import GameLayout from '../components/GameLayout';
import BetControls from '../components/BetControls';
import ResultBanner from '../components/ResultBanner';
import DoubleOrNothing from '../components/DoubleOrNothing';
import FairnessPanel from '../components/FairnessPanel';
import { useCasinoGame } from '../lib/useCasinoGame';
import { useBeat } from '../lib/animation';
import type { CasinoResult, WheelDetail } from '../lib/types';

const SPIN_MS = 3400;
const R = 150;
const CX = 160;
const CY = 160;

function segmentFill(kind: string, value: number) {
    if (kind === 'soot') return '#3b1d5e';
    if (value >= 5) return '#b91c1c';
    if (value >= 2) return '#c2410c';
    if (value >= 1) return '#a16207';
    if (value > 0) return '#3f6212';
    return '#1c1c22';
}

/** SVG wedge path for segment `i` of `n`, starting at 12 o'clock. */
function wedge(i: number, n: number) {
    const a0 = (i / n) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
    const x0 = CX + R * Math.cos(a0);
    const y0 = CY + R * Math.sin(a0);
    const x1 = CX + R * Math.cos(a1);
    const y1 = CY + R * Math.sin(a1);
    return `M ${CX} ${CY} L ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1} Z`;
}

/** Mid-angle of a segment, in degrees, for placing its label. */
function midAngle(i: number, n: number) {
    return ((i + 0.5) / n) * 360 - 90;
}

export default function WheelPage() {
    const { result, error, busy, gamble, dismissGamble, flashKey, play, act } =
        useCasinoGame<CasinoResult<WheelDetail>>('wheel');

    const [bet, setBet] = useState(1000);

    const detail = result?.detail;
    const segments = detail?.segments ?? [];
    const count = segments.length || 24;

    const spinning = useBeat(result?.proof?.nonce, SPIN_MS);

    // The nonce climbs by one per roll, so this always turns forwards and lands
    // the server's segment under the pointer at 12 o'clock.
    const perSegment = 360 / count;
    const angle = detail
        ? (result?.proof?.nonce ?? 0) * 6 * 360 + (360 - detail.index * perSegment - perSegment / 2)
        : 0;

    const hitSoot = !spinning && detail?.kind === 'soot';

    return (
        <GameLayout
            icon={Disc3}
            title="Roue de la Fortune Pourrie"
            subtitle="Vingt-quatre quartiers. L'un d'eux ne paie rien et vous couvre de suie."
            accent="text-purple-400"
            accentGlow="bg-purple-500/20"
            floating={[Droplet]}
            floatingClass="text-purple-400/[0.07]"
            flashKey={flashKey}
            flashColor={hitSoot ? 'rgba(147,51,234,0.35)' : 'rgba(74,222,128,0.3)'}
            error={error}
            banner={<DoubleOrNothing gamble={gamble} onGamble={() => act('play', {}, 'gamble')} onDecline={dismissGamble} busy={busy} />}
        >
            <div
                className="relative rounded-2xl border border-white/10 overflow-hidden py-6 shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
                style={{ background: 'radial-gradient(ellipse at 50% 20%, #241634 0%, #0c0810 70%)' }}
            >
                {/* Fairground bulbs around the rim */}
                <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 16 }, (_, i) => {
                        const a = (i / 16) * Math.PI * 2;
                        return (
                            <motion.span
                                key={i}
                                animate={
                                    spinning
                                        ? { opacity: [0.25, 1, 0.25] }
                                        : { opacity: 0.3 }
                                }
                                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.05 }}
                                className="absolute w-1.5 h-1.5 rounded-full bg-banan-primary"
                                style={{
                                    left: `calc(50% + ${Math.cos(a) * 46}% )`,
                                    top: `calc(50% + ${Math.sin(a) * 46}% )`,
                                }}
                            />
                        );
                    })}
                </div>

                <div className="relative flex justify-center">
                    <div className="relative w-full max-w-[19rem] md:max-w-[22rem] aspect-square">
                        {/* Pointer — flicks as wedges pass under it */}
                        <motion.div
                            animate={spinning ? { rotate: [0, -16, 0] } : { rotate: 0 }}
                            transition={
                                spinning
                                    ? { repeat: Infinity, duration: 0.09, ease: 'easeInOut' }
                                    : { type: 'spring', damping: 8 }
                            }
                            style={{ transformOrigin: '50% 0%' }}
                            className="absolute -top-1 left-1/2 -translate-x-1/2 z-30"
                        >
                            <div className="w-0 h-0 border-l-[11px] border-r-[11px] border-t-[26px] border-l-transparent border-r-transparent border-t-banan-primary drop-shadow-[0_0_10px_rgba(250,222,0,0.9)]" />
                        </motion.div>

                        <motion.svg
                            viewBox="0 0 320 320"
                            className="w-full h-full drop-shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                            animate={{ rotate: angle }}
                            transition={{ duration: SPIN_MS / 1000, ease: [0.12, 0.72, 0.1, 1] }}
                        >
                            <circle cx={CX} cy={CY} r={R + 6} fill="#0a0710" stroke="#3f3f46" strokeWidth="3" />

                            {(segments.length
                                ? segments
                                : Array.from({ length: 24 }, () => ({ kind: 'miss', value: 0 }))
                            ).map((segment, i) => (
                                <g key={i}>
                                    <path
                                        d={wedge(i, count)}
                                        fill={segmentFill(segment.kind, segment.value)}
                                        stroke="rgba(0,0,0,0.55)"
                                        strokeWidth="1"
                                    />
                                    <text
                                        x={CX}
                                        y={CY - R * 0.62}
                                        transform={`rotate(${midAngle(i, count) + 90} ${CX} ${CY})`}
                                        textAnchor="middle"
                                        fontSize="13"
                                        fontWeight="900"
                                        fontFamily="Space Mono, monospace"
                                        fill={segment.kind === 'soot' ? '#c084fc' : 'rgba(255,255,255,0.85)'}
                                    >
                                        {segment.kind === 'soot'
                                            ? '☠'
                                            : segment.value > 0
                                              ? `${segment.value}×`
                                              : '—'}
                                    </text>
                                </g>
                            ))}

                            {/* Hub */}
                            <circle cx={CX} cy={CY} r={38} fill="#0a0710" stroke="#52525b" strokeWidth="2" />
                        </motion.svg>

                        {/* Hub readout stays upright while the wheel turns */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-[4.6rem] h-[4.6rem] md:w-[5.2rem] md:h-[5.2rem] rounded-full bg-black/90 border border-white/15 flex items-center justify-center">
                                {spinning ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 0.5, ease: 'linear' }}
                                    >
                                        <Disc3 className="w-7 h-7 text-white/25" />
                                    </motion.div>
                                ) : (
                                    <span
                                        className={`text-lg md:text-xl font-black tabular-nums ${
                                            hitSoot ? 'text-purple-400' : 'text-banan-primary'
                                        }`}
                                    >
                                        {detail ? (hitSoot ? '☠' : `${detail.multiplier}×`) : '—'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Soot ooze creeps down the wheel on the rotten wedge */}
                        <AnimatePresence>
                            {hitSoot && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 pointer-events-none overflow-hidden rounded-full"
                                >
                                    {Array.from({ length: 7 }, (_, i) => (
                                        <motion.span
                                            key={i}
                                            initial={{ y: -20, opacity: 0 }}
                                            animate={{ y: 340, opacity: [0, 0.85, 0] }}
                                            transition={{
                                                duration: 1.8 + i * 0.22,
                                                delay: i * 0.12,
                                                repeat: Infinity,
                                                repeatDelay: 0.5,
                                            }}
                                            className="absolute w-1.5 rounded-full bg-purple-900"
                                            style={{ left: `${14 + i * 12}%`, height: `${20 + i * 6}px` }}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <ResultBanner
                show={!!result && !spinning}
                payout={result?.payout ?? 0}
                bet={result?.bet ?? 0}
                multiplier={detail?.multiplier}
                jackpot={result?.global_jackpot_won ?? 0}
                cursed={hitSoot}
                curseLabel="Quartier Pourri"
                caption={
                    hitSoot
                        ? `Couvert de suie pour ${detail?.soot_seconds ?? 0}s — plus aucune table accessible.`
                        : undefined
                }
            />

            <BetControls
                bet={bet}
                onBet={setBet}
                onPlay={() => play(bet)}
                busy={busy || spinning}
                label="Lancer la roue"
                icon={<Disc3 className="w-5 h-5" />}
                hint="1 quartier sur 24 est pourri : zéro gain et 5 minutes de suie, qui vous ferment tout le casino."
            />

            <FairnessPanel proof={result?.proof} />
        </GameLayout>
    );
}
