import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dices, ArrowUp, ArrowDown, Gauge } from 'lucide-react';
import GameLayout from '../components/GameLayout';
import BetControls from '../components/BetControls';
import ResultBanner from '../components/ResultBanner';
import DoubleOrNothing from '../components/DoubleOrNothing';
import FairnessPanel from '../components/FairnessPanel';
import { BrushedPanel, Readout } from '../components/Surfaces';
import { useCasinoGame } from '../lib/useCasinoGame';
import { useBeat } from '../lib/animation';
import type { CasinoResult, DiceDetail } from '../lib/types';

const TARGET_RTP = 0.92;

export default function DicePage() {
    const { result, error, busy, gamble, dismissGamble, flashKey, play, act } =
        useCasinoGame<CasinoResult<DiceDetail>>('dice');

    const [bet, setBet] = useState(1000);
    const [target, setTarget] = useState(50);
    const [direction, setDirection] = useState<'over' | 'under'>('over');

    // Mirrors the server's odds so the payout is visible before betting.
    const winChance = direction === 'over' ? 100 - target : target;
    const payout = TARGET_RTP / (winChance / 100);

    const detail = result?.detail;
    const roll = detail?.roll ?? 0;
    const settling = useBeat(result?.proof?.nonce, 500);
    const won = !!detail?.won;

    // Needle sweeps across a 240° arc.
    const needleAngle = -120 + ((detail ? roll : 50) / 100) * 240;

    return (
        <GameLayout
            icon={Dices}
            title="Dés du Singe"
            subtitle="Calibrez vous-même vos chances. Plus le pari est serré, plus il paie."
            accent="text-cyan-400"
            accentGlow="bg-cyan-500/20"
            floating={[Gauge]}
            floatingClass="text-cyan-400/[0.06]"
            flashKey={flashKey}
            error={error}
            banner={<DoubleOrNothing gamble={gamble} onGamble={() => act('play', {}, 'gamble')} onDecline={dismissGamble} busy={busy} />}
        >
            <BrushedPanel>
                {/* Nameplate */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                    <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/30">
                        Analyseur de hasard · Mk II
                    </span>
                    <motion.span
                        animate={settling ? { opacity: [1, 0.2, 1] } : { opacity: 0.25 }}
                        transition={{ repeat: settling ? Infinity : 0, duration: 0.25 }}
                        className={`w-2 h-2 rounded-full ${
                            detail ? (won ? 'bg-green-400' : 'bg-red-500') : 'bg-white/25'
                        }`}
                    />
                </div>

                <div className="px-5 py-6 md:px-8">
                    {/* Dial */}
                    <div className="relative mx-auto w-full max-w-sm aspect-[2/1] mb-6">
                        <svg viewBox="0 0 200 108" className="w-full h-full">
                            {/* Graduated arc */}
                            {Array.from({ length: 51 }, (_, i) => {
                                const pct = i * 2;
                                const a = ((-120 + (pct / 100) * 240) * Math.PI) / 180;
                                const major = pct % 10 === 0;
                                const r0 = major ? 74 : 80;
                                const inWin = direction === 'over' ? pct >= target : pct < target;
                                return (
                                    <line
                                        key={i}
                                        x1={100 + r0 * Math.sin(a)}
                                        y1={100 - r0 * Math.cos(a)}
                                        x2={100 + 86 * Math.sin(a)}
                                        y2={100 - 86 * Math.cos(a)}
                                        stroke={inWin ? '#22d3ee' : 'rgba(255,255,255,0.22)'}
                                        strokeWidth={major ? 1.6 : 0.7}
                                    />
                                );
                            })}

                            {/* Decade labels */}
                            {[0, 25, 50, 75, 100].map((pct) => {
                                const a = ((-120 + (pct / 100) * 240) * Math.PI) / 180;
                                return (
                                    <text
                                        key={pct}
                                        x={100 + 63 * Math.sin(a)}
                                        y={100 - 63 * Math.cos(a) + 3}
                                        textAnchor="middle"
                                        fontSize="8"
                                        fontFamily="Space Mono, monospace"
                                        fill="rgba(255,255,255,0.4)"
                                    >
                                        {pct}
                                    </text>
                                );
                            })}

                            {/* Threshold marker */}
                            {(() => {
                                const a = ((-120 + (target / 100) * 240) * Math.PI) / 180;
                                return (
                                    <line
                                        x1={100 + 55 * Math.sin(a)}
                                        y1={100 - 55 * Math.cos(a)}
                                        x2={100 + 90 * Math.sin(a)}
                                        y2={100 - 90 * Math.cos(a)}
                                        stroke="#FADE00"
                                        strokeWidth="2"
                                        strokeDasharray="3 2"
                                    />
                                );
                            })()}

                            {/* Needle */}
                            <motion.g
                                animate={{ rotate: needleAngle }}
                                transition={{ type: 'spring', stiffness: 90, damping: 9, mass: 0.7 }}
                                style={{ transformOrigin: '100px 100px' }}
                            >
                                <line
                                    x1="100"
                                    y1="100"
                                    x2="100"
                                    y2="22"
                                    stroke={detail ? (won ? '#4ade80' : '#ef4444') : '#a1a1aa'}
                                    strokeWidth="2.4"
                                    strokeLinecap="round"
                                />
                                <circle cx="100" cy="30" r="2.6" fill={detail ? (won ? '#4ade80' : '#ef4444') : '#a1a1aa'} />
                            </motion.g>
                            <circle cx="100" cy="100" r="7" fill="#18181b" stroke="rgba(255,255,255,0.25)" />
                        </svg>

                        {/* Digital roll readout under the pivot */}
                        <div className="absolute inset-x-0 bottom-0 flex justify-center">
                            <div className="px-4 py-1 rounded-md bg-black/70 border border-white/10">
                                <span
                                    className={`text-2xl font-black tabular-nums ${
                                        detail ? (won ? 'text-green-400' : 'text-red-500') : 'text-white/60'
                                    }`}
                                >
                                    {detail ? roll.toFixed(2) : '--.--'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Linear win-zone bar */}
                    <div className="relative h-3 rounded-full bg-black/60 border border-white/10 overflow-hidden mb-1.5">
                        <div
                            className="absolute inset-y-0 bg-cyan-400/25"
                            style={
                                direction === 'over'
                                    ? { left: `${target}%`, right: 0 }
                                    : { left: 0, width: `${target}%` }
                            }
                        />
                        <div
                            className="absolute inset-y-0 w-0.5 bg-banan-primary shadow-[0_0_8px_rgba(250,222,0,0.9)]"
                            style={{ left: `${target}%` }}
                        />
                        {detail && (
                            <motion.div
                                initial={{ opacity: 0, scaleY: 0 }}
                                animate={{ opacity: 1, scaleY: 1 }}
                                className={`absolute -top-1 w-1 h-5 rounded-full ${won ? 'bg-green-400' : 'bg-red-500'}`}
                                style={{ left: `${roll}%` }}
                            />
                        )}
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-white/60 mb-5">
                        <span>0.00</span>
                        <span>SEUIL {target}</span>
                        <span>99.99</span>
                    </div>

                    {/* Calibration slider */}
                    <input
                        type="range"
                        min={2}
                        max={98}
                        value={target}
                        onChange={(e) => setTarget(Number(e.target.value))}
                        disabled={busy}
                        className="w-full accent-cyan-400"
                    />

                    <div className="flex justify-around mt-5 pt-4 border-t border-white/10">
                        <Readout label="Chance" value={`${winChance.toFixed(0)}%`} tone="text-white/75" />
                        <Readout label="Paiement" value={`${payout.toFixed(2)}×`} tone="text-cyan-400" />
                        <Readout label="Seuil" value={String(target)} tone="text-banan-primary" />
                    </div>
                </div>
            </BrushedPanel>

            <ResultBanner
                show={!!result && !settling}
                payout={result?.payout ?? 0}
                bet={result?.bet ?? 0}
                multiplier={detail?.multiplier}
                jackpot={result?.global_jackpot_won ?? 0}
                caption={
                    detail
                        ? `${detail.roll.toFixed(2)} ${detail.direction === 'over' ? '≥' : '<'} ${detail.target}`
                        : undefined
                }
            />

            <BetControls
                bet={bet}
                onBet={setBet}
                onPlay={() => play(bet, { target, direction })}
                busy={busy}
                label="Mesurer"
                icon={<Gauge className="w-5 h-5" />}
            >
                <div className="flex gap-2">
                    <button
                        onClick={() => setDirection('under')}
                        disabled={busy}
                        className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-mono uppercase border transition-colors flex items-center justify-center gap-2 disabled:opacity-40 ${
                            direction === 'under'
                                ? 'bg-cyan-400 text-black border-cyan-400 font-bold'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                    >
                        <ArrowDown className="w-3.5 h-3.5" /> Sous {target}
                    </button>
                    <button
                        onClick={() => setDirection('over')}
                        disabled={busy}
                        className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-mono uppercase border transition-colors flex items-center justify-center gap-2 disabled:opacity-40 ${
                            direction === 'over'
                                ? 'bg-cyan-400 text-black border-cyan-400 font-bold'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                    >
                        <ArrowUp className="w-3.5 h-3.5" /> Au-dessus de {target}
                    </button>
                </div>
            </BetControls>

            <FairnessPanel proof={result?.proof} />
        </GameLayout>
    );
}
