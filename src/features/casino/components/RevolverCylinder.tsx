import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RevolverCylinderProps {
    /** Live chambers left in the clan's shared cylinder, 0–6. */
    remaining: number;
    /** True while the cylinder is being spun, before the outcome is known. */
    spinning: boolean;
    /** Server verdict once the spin has settled. */
    outcome: 'SAFE' | 'DUD' | null;
}

const CX = 120;
const CY = 120;
/** Distance from the axis to each chamber's bore. */
const ORBIT = 58;
const BORE = 17;
const CHAMBERS = 6;
const SPIN_MS = 1500;

/** Centre of chamber `i`, measured from 12 o'clock, clockwise. */
function borePos(i: number) {
    const a = ((i * 360) / CHAMBERS - 90) * (Math.PI / 180);
    return { x: CX + ORBIT * Math.cos(a), y: CY + ORBIT * Math.sin(a) };
}

/**
 * The Ape Roulette cylinder.
 *
 * The whole cylinder turns as one rigid body — chambers orbit the axis instead
 * of each spinning in place — and always advances forwards, coming to rest with
 * a bore aligned under the hammer. The hammer stays out of the rotating group so
 * it can cock during the spin and drop when the server's verdict lands.
 */
export default function RevolverCylinder({ remaining, spinning, outcome }: RevolverCylinderProps) {
    // One pull = three full turns plus one chamber, so the cylinder never
    // rewinds and always comes to rest with a bore under the hammer.
    const [angle, setAngle] = useState(0);
    const wasSpinning = useRef(false);

    useEffect(() => {
        if (spinning && !wasSpinning.current) setAngle((a) => a + 360 * 3 + 360 / CHAMBERS);
        wasSpinning.current = spinning;
    }, [spinning]);

    const settled = !spinning && outcome !== null;
    const dud = settled && outcome === 'DUD';

    // Flash and smoke are one-shot per pull; the angle is a natural pull id.
    const bangKey = `${angle}-${outcome ?? ''}`;

    return (
        <div className="relative mx-auto w-full max-w-[15rem] aspect-square">
            {/* Ambient bloom behind the steel */}
            <motion.div
                animate={
                    dud
                        ? { opacity: [0.9, 0.25], scale: [1.25, 1] }
                        : spinning
                          ? { opacity: [0.35, 0.7, 0.35] }
                          : { opacity: 0.35 }
                }
                transition={
                    spinning && !dud
                        ? { repeat: Infinity, duration: 1.1 }
                        : { duration: 0.6 }
                }
                className={`absolute inset-4 rounded-full blur-[45px] pointer-events-none ${
                    dud ? 'bg-red-600/50' : settled ? 'bg-emerald-500/25' : 'bg-purple-500/25'
                }`}
            />

            <motion.svg
                viewBox="0 0 240 240"
                className="relative w-full h-full drop-shadow-[0_18px_40px_rgba(0,0,0,0.85)]"
                animate={dud ? { x: [0, -7, 6, -4, 3, 0], y: [0, 4, -3, 2, 0] } : {}}
                transition={{ duration: 0.45 }}
            >
                <defs>
                    <radialGradient id="apeSteel" cx="38%" cy="28%">
                        <stop offset="0%" stopColor="#5b5b66" />
                        <stop offset="55%" stopColor="#2c2c34" />
                        <stop offset="100%" stopColor="#121216" />
                    </radialGradient>
                    <radialGradient id="apeBore" cx="42%" cy="32%">
                        <stop offset="0%" stopColor="#000000" />
                        <stop offset="70%" stopColor="#05050a" />
                        <stop offset="100%" stopColor="#1b1b22" />
                    </radialGradient>
                    <radialGradient id="apeLoaded" cx="38%" cy="30%">
                        <stop offset="0%" stopColor="#FFF8A8" />
                        <stop offset="55%" stopColor="#FADE00" />
                        <stop offset="100%" stopColor="#8a7a00" />
                    </radialGradient>
                    <filter id="apeGlow">
                        <feGaussianBlur stdDeviation="3.5" result="b" />
                        <feMerge>
                            <feMergeNode in="b" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Recoil shield behind the cylinder */}
                <circle cx={CX} cy={CY} r={104} fill="#0b0b10" stroke="#2a2a33" strokeWidth="2" />

                <motion.g
                    animate={{ rotate: angle }}
                    transition={
                        spinning
                            ? { duration: SPIN_MS / 1000, ease: [0.12, 0.72, 0.08, 1] }
                            : { type: 'spring', stiffness: 120, damping: 14 }
                    }
                    style={{ transformOrigin: `${CX}px ${CY}px` }}
                >
                    {/* Cylinder body */}
                    <circle cx={CX} cy={CY} r={96} fill="url(#apeSteel)" stroke="#4a4a55" strokeWidth="2" />

                    {/* Machined flutes between the bores */}
                    {Array.from({ length: CHAMBERS }, (_, i) => (
                        <rect
                            key={`flute-${i}`}
                            x={CX - 7}
                            y={CY - 92}
                            width={14}
                            height={30}
                            rx={7}
                            fill="#0d0d12"
                            opacity={0.85}
                            transform={`rotate(${((i + 0.5) * 360) / CHAMBERS} ${CX} ${CY})`}
                        />
                    ))}

                    {/* Chambers: loaded ones carry a banana round, spent ones are holes */}
                    {Array.from({ length: CHAMBERS }, (_, i) => {
                        const { x, y } = borePos(i);
                        const loaded = i < remaining;
                        return (
                            <g key={`bore-${i}`}>
                                <circle cx={x} cy={y} r={BORE + 3} fill="#0a0a0e" opacity={0.9} />
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={BORE}
                                    fill={loaded ? 'url(#apeLoaded)' : 'url(#apeBore)'}
                                    stroke={loaded ? '#FADE00' : '#2c2c36'}
                                    strokeWidth={loaded ? 1.6 : 1.2}
                                    filter={loaded ? 'url(#apeGlow)' : undefined}
                                />
                                {loaded && (
                                    <circle cx={x - 4} cy={y - 5} r={4.5} fill="#FFFDE0" opacity={0.65} />
                                )}
                            </g>
                        );
                    })}

                    {/* Ratchet star on the axis */}
                    <circle cx={CX} cy={CY} r={22} fill="#17171d" stroke="#3d3d47" strokeWidth="2" />
                    {Array.from({ length: CHAMBERS }, (_, i) => (
                        <rect
                            key={`tooth-${i}`}
                            x={CX - 2}
                            y={CY - 22}
                            width={4}
                            height={9}
                            fill="#3d3d47"
                            transform={`rotate(${(i * 360) / CHAMBERS} ${CX} ${CY})`}
                        />
                    ))}
                    <circle cx={CX} cy={CY} r={6} fill="#0a0a0e" stroke="#4a4a55" strokeWidth="1.5" />
                </motion.g>

                {/* Motion smear: a faint ring that only shows while turning */}
                <motion.circle
                    cx={CX}
                    cy={CY}
                    r={ORBIT}
                    fill="none"
                    stroke="#FADE00"
                    strokeWidth={BORE * 1.6}
                    strokeLinecap="round"
                    style={{ filter: 'blur(7px)' }}
                    animate={{ opacity: spinning ? 0.28 : 0 }}
                    transition={{ duration: spinning ? 0.15 : 0.5 }}
                />

                {/* Hammer — cocks while the cylinder turns, drops on the verdict */}
                <motion.g
                    animate={{ rotate: spinning ? -34 : 0 }}
                    transition={
                        spinning
                            ? { duration: 0.25 }
                            : { type: 'spring', stiffness: 900, damping: 18 }
                    }
                    style={{ transformOrigin: `${CX}px 34px` }}
                >
                    <rect x={CX - 9} y={2} width={18} height={30} rx={4} fill="#3a3a44" stroke="#5c5c68" strokeWidth="1.5" />
                    <path d={`M ${CX - 6} 30 L ${CX + 6} 30 L ${CX} 44 Z`} fill="#6b6b78" />
                </motion.g>

                {/* Alignment notch on the frame */}
                <circle cx={CX} cy={CY - ORBIT} r={BORE + 6} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" strokeDasharray="3 4" />

                {/* Muzzle flash on a dud */}
                <AnimatePresence>
                    {dud && (
                        <motion.g
                            key={bangKey}
                            initial={{ opacity: 1, scale: 0.2 }}
                            animate={{ opacity: 0, scale: 2 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            style={{ transformOrigin: `${CX}px ${CY - ORBIT}px` }}
                        >
                            <circle cx={CX} cy={CY - ORBIT} r={BORE * 0.8} fill="#fff7d6" />
                            <circle cx={CX} cy={CY - ORBIT} r={BORE * 1.5} fill="#ff8a3d" opacity={0.4} />
                        </motion.g>
                    )}
                </AnimatePresence>

                {/* Clean click on a safe pull */}
                <AnimatePresence>
                    {settled && !dud && (
                        <motion.circle
                            key={bangKey}
                            cx={CX}
                            cy={CY}
                            r={100}
                            fill="none"
                            stroke="#4ade80"
                            strokeWidth={3}
                            initial={{ opacity: 0.9, scale: 0.85 }}
                            animate={{ opacity: 0, scale: 1.18 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{ transformOrigin: `${CX}px ${CY}px` }}
                        />
                    )}
                </AnimatePresence>
            </motion.svg>

            {/* Smoke drifting off the fired chamber */}
            <AnimatePresence>
                {dud &&
                    Array.from({ length: 5 }, (_, i) => (
                        <motion.span
                            key={`${bangKey}-smoke-${i}`}
                            initial={{ opacity: 0.5, y: 0, x: 0, scale: 0.4 }}
                            animate={{ opacity: 0, y: -70 - i * 12, x: (i - 2) * 14, scale: 1.6 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.6 + i * 0.2, delay: i * 0.08, ease: 'easeOut' }}
                            className="absolute left-1/2 top-[24%] w-7 h-7 -translate-x-1/2 rounded-full bg-zinc-400/35 blur-md pointer-events-none"
                        />
                    ))}
            </AnimatePresence>

        </div>
    );
}
