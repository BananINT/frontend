import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { api } from '@app/lib/api';
import { formatNumber } from '@app/utils/format';
import type { Clan, ClanMember } from '@app/types/clan';
import type { ClanTransaction } from '../lib/useClanData';

interface DividendsModalProps {
    clan: Clan | null;
    members: ClanMember[];
    userId: string;
    onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
    DEPOSIT: 'Dépôt',
    DIVIDEND: 'Dividendes',
    UPGRADE: 'Perk acheté',
    OSINT_REWARD: 'Opération OSINT',
    CONTRACT_REWARD: "Contrat d'élite",
    MASS_HACK_REWARD: 'Hacking de masse',
    LOTTERY_BUY: 'Tickets loterie',
    LOTTERY_WIN: 'Gain loterie',
    TAX: 'Taxe',
    CHARITY: 'Charité',
    STARTER_PACK: 'Pack nouveau',
};

const CREDIT_TYPES = [
    'DEPOSIT',
    'OSINT_REWARD',
    'DIVIDEND',
    'TAX',
    'CONTRACT_REWARD',
    'MASS_HACK_REWARD',
    'LOTTERY_WIN',
];

export default function DividendsModal({ clan, members, userId, onClose }: DividendsModalProps) {
    const [transactions, setTransactions] = useState<ClanTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        api.get<ClanTransaction[]>('/clan/transactions')
            .then(res => {
                if (alive) setTransactions(res.data ?? []);
            })
            .catch(() => undefined)
            .finally(() => {
                if (alive) setLoading(false);
            });
        return () => {
            alive = false;
        };
    }, []);

    const treasury = clan?.treasury_balance ?? 0;
    const dailyInterest = Math.floor(treasury * 0.01);
    const totalDonated = members.reduce((acc, m) => acc + m.total_donated, 0);
    const me = members.find(m => m.user_id === userId);
    const share = totalDonated > 0 ? (me?.total_donated ?? 0) / totalDonated : 0;
    const myDividend =
        totalDonated > 0
            ? Math.floor(dailyInterest * share)
            : members.length > 0
              ? Math.floor(dailyInterest / members.length)
              : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#0B0B0B] border border-banan-primary/60 rounded-2xl p-6 max-w-lg w-full space-y-5 max-h-[85vh] flex flex-col"
            >
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <h3 className="text-base font-black text-banan-primary uppercase tracking-tighter flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Dividendes & mouvements
                    </h3>
                    <button onClick={onClose} className="text-white/50 hover:text-white">
                        ✕
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
                    <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-1">
                        <p className="text-white/40 uppercase">Trésor total</p>
                        <p className="text-sm font-bold text-white tabular-nums">{formatNumber(treasury)} 🍌</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-1">
                        <p className="text-white/40 uppercase">Intérêt quotidien (1%)</p>
                        <p className="text-sm font-bold text-banan-primary tabular-nums">
                            +{formatNumber(dailyInterest)} 🍌
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-1">
                        <p className="text-white/40 uppercase">Votre part de dons</p>
                        <p className="text-sm font-bold text-white tabular-nums">
                            {(share * 100).toFixed(2)}%
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-1">
                        <p className="text-white/40 uppercase">Dividende estimé / jour</p>
                        <p className="text-sm font-bold text-green-400 tabular-nums">
                            +{formatNumber(myDividend)} 🍌
                        </p>
                    </div>
                </div>

                <div className="text-[9px] font-mono text-white/50 bg-white/5 p-2.5 border border-white/10 rounded-lg leading-relaxed">
                    💡 <span className="text-banan-primary font-bold">FONCTIONNEMENT :</span> 1% d'intérêt
                    est calculé et distribué toutes les 24 heures à minuit, au prorata de votre
                    contribution au trésor.
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[140px]">
                    <h4 className="text-[10px] font-mono font-bold uppercase text-white/40 tracking-wider">
                        Historique de l'unité
                    </h4>
                    {loading ? (
                        <p className="text-[10px] font-mono text-white/30 text-center py-6 animate-pulse">
                            Chargement...
                        </p>
                    ) : transactions.length === 0 ? (
                        <p className="text-[10px] font-mono text-white/30 text-center py-6">
                            Aucune transaction enregistrée.
                        </p>
                    ) : (
                        transactions.map(tx => {
                            // Some rows (lottery tickets) already carry a negative amount.
                            const isCredit = tx.amount >= 0 && CREDIT_TYPES.includes(tx.type);
                            const label = TYPE_LABELS[tx.type] ?? tx.type;
                            return (
                                <div
                                    key={tx.id}
                                    className="flex justify-between items-center bg-black/30 border border-white/5 p-2 rounded-lg font-mono text-[9px]"
                                >
                                    <div className="space-y-0.5 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span
                                                className={`font-bold px-1 rounded text-[8px] uppercase ${
                                                    isCredit
                                                        ? 'text-green-400 bg-green-500/10'
                                                        : 'text-red-400 bg-red-500/10'
                                                }`}
                                            >
                                                {label}
                                            </span>
                                            {tx.username && (
                                                <span className="text-white/60 truncate">par {tx.username}</span>
                                            )}
                                        </div>
                                        <p className="text-white/30 text-[8px]">
                                            {new Date(tx.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-[10px] font-bold tabular-nums shrink-0 ${
                                            isCredit ? 'text-green-400' : 'text-red-400'
                                        }`}
                                    >
                                        {isCredit ? '+' : '-'}
                                        {formatNumber(Math.abs(tx.amount))} 🍌
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="w-full border border-white/10 rounded-lg text-white/50 py-3 uppercase text-xs hover:text-white hover:border-white transition-colors"
                >
                    Fermer
                </button>
            </motion.div>
        </div>
    );
}
