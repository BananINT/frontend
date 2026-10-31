import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Percent } from 'lucide-react';
import { useGame } from '@app/context/GameContext';
import { formatNumber } from '@app/utils/format';

const PRESETS = [0, 5, 10, 20, 50];
const MAX_TAX_PERCENT = 50;

/**
 * Automatic clan tax. The applied rate is whatever the server last confirmed
 * (it rides on every sync payload); `draft` is only what the player is currently
 * dialling in, so the two are never confused on screen.
 */
export default function TaxControl() {
    const { gameState, setClanTaxRate } = useGame();
    const applied = Math.round((gameState.taxRate ?? 0) * 100);

    const [draft, setDraft] = useState(applied);
    const [appliedSeen, setAppliedSeen] = useState(applied);
    const [pending, setPending] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [justSaved, setJustSaved] = useState(false);

    // Follow the server whenever it confirms a new rate (adjust-during-render).
    if (appliedSeen !== applied) {
        setAppliedSeen(applied);
        setDraft(applied);
    }

    useEffect(() => {
        if (!justSaved) return;
        const id = setTimeout(() => setJustSaved(false), 2200);
        return () => clearTimeout(id);
    }, [justSaved]);

    const apply = async (percent: number) => {
        setError(null);
        setPending(percent);
        setDraft(percent);
        try {
            await setClanTaxRate(percent / 100);
            setJustSaved(true);
        } catch (e: unknown) {
            const err = e as { response?: { data?: { detail?: string } } };
            setError(err.response?.data?.detail || "Impossible d'appliquer ce taux.");
            setDraft(applied);
        } finally {
            setPending(null);
        }
    };

    const perSecond = Math.floor(gameState.autoClickers * (draft / 100));
    const perClick = Math.floor(gameState.clickValue * (draft / 100));
    const dirty = draft !== applied && pending === null;

    return (
        <div className="space-y-4">
            <div className="flex items-end justify-between gap-3">
                <div>
                    <div className="text-[11px] font-mono text-white/60 uppercase tracking-widest">
                        Taux appliqué
                    </div>
                    <div className="text-3xl font-black text-banan-primary tabular-nums flex items-center">
                        {applied}
                        <Percent className="h-5 w-5" />
                    </div>
                </div>
                <AnimatePresence>
                    {justSaved && (
                        <motion.span
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase text-green-400"
                        >
                            <Check className="h-3 w-3" /> Enregistré
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            <p className="text-[11px] font-mono text-white/60 uppercase leading-relaxed">
                Prélève automatiquement une part de vos gains (clics et BPS) et la verse au trésor
                de l'unité. Elle compte comme un don.
            </p>

            <div className="grid grid-cols-5 gap-1.5">
                {PRESETS.map(preset => {
                    const isApplied = applied === preset;
                    const isPending = pending === preset;
                    return (
                        <button
                            key={preset}
                            onClick={() => apply(preset)}
                            disabled={pending !== null}
                            className={`py-2 rounded-lg text-[11px] font-mono font-bold uppercase border transition-all disabled:opacity-60 ${
                                isApplied
                                    ? 'border-banan-primary bg-banan-primary text-black'
                                    : 'border-white/10 bg-black/30 text-white/60 hover:border-white/40 hover:text-white'
                            }`}
                        >
                            {isPending ? '…' : `${preset}%`}
                        </button>
                    );
                })}
            </div>

            <div className="space-y-2">
                <input
                    type="range"
                    min={0}
                    max={MAX_TAX_PERCENT}
                    step={1}
                    value={draft}
                    onChange={e => setDraft(parseInt(e.target.value, 10))}
                    disabled={pending !== null}
                    className="w-full accent-banan-primary cursor-pointer"
                    aria-label="Taux de taxe personnalisé"
                />
                <div className="flex items-center justify-between text-[11px] font-mono text-white/60 uppercase">
                    <span>0%</span>
                    <span>Réglage fin : {draft}%</span>
                    <span>{MAX_TAX_PERCENT}%</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="rounded-lg border border-white/10 bg-black/30 p-2.5">
                    <div className="text-white/60 uppercase">Par seconde</div>
                    <div className="text-banan-primary font-bold tabular-nums">
                        {formatNumber(perSecond)} 🍌
                    </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/30 p-2.5">
                    <div className="text-white/60 uppercase">Par clic</div>
                    <div className="text-banan-primary font-bold tabular-nums">
                        {formatNumber(perClick)} 🍌
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {dirty && (
                    <motion.button
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onClick={() => apply(draft)}
                        className="w-full py-2.5 rounded-lg bg-banan-primary text-black font-black uppercase text-[11px] tracking-widest hover:bg-white transition-colors"
                    >
                        Appliquer {draft}%
                    </motion.button>
                )}
            </AnimatePresence>

            {error && (
                <p className="text-[11px] font-mono text-red-400 uppercase leading-relaxed">{error}</p>
            )}
        </div>
    );
}
