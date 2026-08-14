import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { api } from '@app/lib/api';
import { socketManager } from '@app/lib/socket';
import { useGame } from '@app/context/GameContext';
import { formatNumber } from '@app/utils/format';
import type { ClanMember } from '@app/types/clan';

interface TransferModalProps {
    recipient: ClanMember;
    onClose: () => void;
    onDone: () => void;
}

const QUICK_SHARES = [0.1, 0.25, 0.5, 1];

export default function TransferModal({ recipient, onClose, onDone }: TransferModalProps) {
    const { gameState } = useGame();
    const [amount, setAmount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const invalid = amount <= 0 || amount > gameState.bananas;

    const submit = async () => {
        if (invalid) return;
        setBusy(true);
        setError(null);
        try {
            await api.post('/clan/transfer', { recipient_id: recipient.user_id, amount });
            socketManager.send('sync', { pendingClicks: 0 });
            onDone();
            onClose();
        } catch (e: unknown) {
            const err = e as { response?: { data?: { detail?: string } } };
            setError(err.response?.data?.detail || 'Erreur lors du transfert.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#0B0B0B] border border-banan-primary/60 rounded-2xl p-6 max-w-md w-full space-y-6"
            >
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <h3 className="text-base font-black text-banan-primary uppercase tracking-tighter flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        Transfert vers {recipient.username}
                    </h3>
                    <button onClick={onClose} className="text-white/50 hover:text-white">
                        ✕
                    </button>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest block">
                        Montant à transférer
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={amount || ''}
                            onChange={e => setAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pr-10 text-sm font-mono text-white focus:border-banan-primary outline-none"
                            placeholder="Montant..."
                        />
                        <span className="absolute right-3 top-3.5 text-xs font-mono text-banan-primary">🍌</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                        {QUICK_SHARES.map(share => (
                            <button
                                key={share}
                                onClick={() => setAmount(Math.floor(gameState.bananas * share))}
                                className="py-1.5 rounded-lg border border-white/10 bg-black/30 text-[10px] font-mono uppercase text-white/60 hover:text-white hover:border-white/40 transition-colors"
                            >
                                {share === 1 ? 'Max' : `${share * 100}%`}
                            </button>
                        ))}
                    </div>
                    <div className="text-[10px] font-mono text-white/30 uppercase">
                        Votre solde : {formatNumber(gameState.bananas)} 🍌
                    </div>
                    {error && <p className="text-[10px] font-mono text-red-400 uppercase">{error}</p>}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={submit}
                        disabled={invalid || busy}
                        className="flex-1 bg-banan-primary text-black py-3 rounded-lg font-black uppercase text-xs tracking-widest hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {busy ? 'Transfert...' : 'Sécuriser le transfert'}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 rounded-lg border border-white/10 text-white/50 uppercase text-xs hover:text-white hover:border-white transition-colors"
                    >
                        Annuler
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
