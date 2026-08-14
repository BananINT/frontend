import { motion } from 'framer-motion';
import { AlertTriangle, Banana } from 'lucide-react';
import { formatNumber } from '@app/utils/format';

export interface ConfirmRequest {
    title: string;
    /** What the player is about to do, in one sentence. */
    message: string;
    /** Amount leaving a purse; rendered with its before/after balance. */
    cost?: number;
    /** Where the money comes from — shown so treasury spends are unmistakable. */
    purse?: 'personal' | 'treasury';
    /** Balance of that purse right now, for the after-figure. */
    balance?: number;
    confirmLabel?: string;
    tone?: 'spend' | 'danger';
    onConfirm: () => void | Promise<void>;
}

interface ConfirmDialogProps {
    request: ConfirmRequest;
    busy?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

const PURSE_LABELS: Record<'personal' | 'treasury', string> = {
    personal: 'Votre solde',
    treasury: "Trésor de l'unité",
};

/**
 * Irreversible spends deserve a beat of friction. Shows the price, the purse it
 * comes out of, and what is left afterwards, so nobody drains a treasury with a
 * stray click.
 */
export default function ConfirmDialog({ request, busy = false, onCancel, onConfirm }: ConfirmDialogProps) {
    const danger = request.tone === 'danger';
    const purse = request.purse ?? 'personal';
    const showLedger = request.cost !== undefined && request.balance !== undefined;
    const after = showLedger ? Math.max(0, (request.balance ?? 0) - (request.cost ?? 0)) : 0;
    const short = showLedger && (request.balance ?? 0) < (request.cost ?? 0);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                role="alertdialog"
                aria-modal="true"
                className={`bg-[#0B0B0B] border rounded-2xl p-6 max-w-sm w-full space-y-5 ${
                    danger ? 'border-red-500/60' : 'border-banan-primary/60'
                }`}
            >
                <div className="flex items-start gap-3">
                    <AlertTriangle
                        className={`h-5 w-5 shrink-0 mt-0.5 ${danger ? 'text-red-400' : 'text-banan-primary'}`}
                    />
                    <div className="min-w-0">
                        <h3
                            className={`text-sm font-black uppercase tracking-tighter ${
                                danger ? 'text-red-400' : 'text-banan-primary'
                            }`}
                        >
                            {request.title}
                        </h3>
                        <p className="mt-1.5 text-[11px] font-mono text-white/60 uppercase leading-relaxed">
                            {request.message}
                        </p>
                    </div>
                </div>

                {showLedger && (
                    <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-1.5 font-mono text-[10px]">
                        <div className="flex justify-between">
                            <span className="text-white/40 uppercase">Coût</span>
                            <span className="text-white font-bold tabular-nums flex items-center gap-1">
                                {formatNumber(request.cost ?? 0)} <Banana className="h-3 w-3" />
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/40 uppercase">{PURSE_LABELS[purse]}</span>
                            <span className="text-white/60 tabular-nums">
                                {formatNumber(request.balance ?? 0)} 🍌
                            </span>
                        </div>
                        <div className="flex justify-between pt-1.5 border-t border-white/10">
                            <span className="text-white/40 uppercase">Après</span>
                            <span
                                className={`font-bold tabular-nums ${short ? 'text-red-400' : 'text-banan-primary'}`}
                            >
                                {short ? 'Fonds insuffisants' : `${formatNumber(after)} 🍌`}
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onConfirm}
                        disabled={busy || short}
                        className={`flex-1 py-3 rounded-lg font-black uppercase text-[11px] tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                            danger
                                ? 'bg-red-500 text-black hover:bg-red-400'
                                : 'bg-banan-primary text-black hover:bg-white'
                        }`}
                    >
                        {busy ? '...' : (request.confirmLabel ?? 'Confirmer')}
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={busy}
                        className="px-4 rounded-lg border border-white/10 text-white/50 uppercase text-[11px] hover:text-white hover:border-white transition-colors disabled:opacity-40"
                    >
                        Annuler
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
