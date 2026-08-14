import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ChevronDown, RefreshCw, Copy } from 'lucide-react';
import { socketManager } from '@app/lib/socket';
import { useCasinoTopic } from '../lib/useCasinoGame';
import type { FairnessProof, FairnessState } from '../lib/types';

interface FairnessPanelProps {
    /** Proof stub returned with the last result, shown inline when present. */
    proof?: FairnessProof;
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start gap-3 py-1.5 border-b border-white/5 last:border-0">
            <span className="text-[10px] font-mono text-white/40 uppercase w-32 shrink-0 pt-0.5">{label}</span>
            <span className="text-[11px] font-mono text-white/70 break-all flex-1">{value}</span>
            <button
                onClick={() => navigator.clipboard?.writeText(value)}
                className="text-white/20 hover:text-banan-primary transition-colors shrink-0"
                title="Copier"
            >
                <Copy className="w-3 h-3" />
            </button>
        </div>
    );
}

/**
 * Le RNG Vérifiable — the commit-reveal panel that sits under every table.
 *
 * The server publishes sha256(server_seed) before the bet; the player can set
 * their own client seed and rotate the pair to reveal the old server seed and
 * replay every roll made under it.
 */
export default function FairnessPanel({ proof }: FairnessPanelProps) {
    const [open, setOpen] = useState(false);
    const [draftSeed, setDraftSeed] = useState('');
    const { state } = useCasinoTopic<FairnessState>('fairness');

    const rotate = () => socketManager.send('casino_fairness', { action: 'rotate', params: {} });
    const applySeed = () => {
        if (draftSeed.trim().length < 3) return;
        socketManager.send('casino_fairness', {
            action: 'set_client_seed',
            params: { client_seed: draftSeed.trim() },
        });
        setDraftSeed('');
    };

    return (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full px-5 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors"
            >
                <ShieldCheck className="w-4 h-4 text-banan-osint" />
                <span className="text-xs font-mono uppercase tracking-widest text-white/60 flex-1 text-left">
                    RNG Vérifiable
                </span>
                {proof && (
                    <span className="text-[10px] font-mono text-white/30 hidden sm:inline">
                        nonce {proof.nonce}
                    </span>
                )}
                <motion.span animate={{ rotate: open ? 180 : 0 }}>
                    <ChevronDown className="w-4 h-4 text-white/40" />
                </motion.span>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 pt-1">
                            <p className="text-[11px] font-mono text-white/40 leading-relaxed mb-3">
                                Chaque tirage vient de HMAC-SHA256(graine serveur, « graine client:nonce »).
                                L'empreinte de la graine serveur est publiée <em>avant</em> votre mise. Faites
                                tourner la paire pour révéler la graine et rejouer tous vos tirages.
                            </p>

                            <div className="bg-black/40 rounded-xl px-4 py-2 mb-4">
                                <Row label="Empreinte serveur" value={state?.server_seed_hash ?? '…'} />
                                <Row label="Graine client" value={state?.client_seed ?? '…'} />
                                <Row label="Tirages effectués" value={String(state?.nonce ?? 0)} />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    value={draftSeed}
                                    onChange={(e) => setDraftSeed(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applySeed()}
                                    placeholder="Votre graine client…"
                                    maxLength={64}
                                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white/80 focus:border-banan-primary outline-none"
                                />
                                <button
                                    onClick={applySeed}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono uppercase transition-colors"
                                >
                                    Appliquer
                                </button>
                                <button
                                    onClick={rotate}
                                    className="px-4 py-2 bg-banan-osint/10 hover:bg-banan-osint/20 border border-banan-osint/40 text-banan-osint rounded-lg text-xs font-mono uppercase transition-colors flex items-center gap-2 justify-center"
                                >
                                    <RefreshCw className="w-3 h-3" /> Révéler
                                </button>
                            </div>

                            {state?.history && state.history.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2">
                                        Graines révélées ({state.history.length})
                                    </p>
                                    <div className="bg-black/40 rounded-xl px-4 py-2 max-h-48 overflow-y-auto">
                                        {state.history.map((entry) => (
                                            <div key={entry.server_seed} className="py-2 border-b border-white/5 last:border-0">
                                                <Row label="Graine serveur" value={entry.server_seed} />
                                                <Row label="Son empreinte" value={entry.server_seed_hash} />
                                                <p className="text-[10px] font-mono text-white/25 mt-1">
                                                    {entry.rolls} tirage(s) sous la graine client « {entry.client_seed} »
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
