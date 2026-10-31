import { Banana, Wallet } from 'lucide-react';
import { formatNumber } from '@app/utils/format';

interface StockDashboardProps {
    currentPrice: number;
    ownedAmount: number;
    portfolioValue: number;
    pnlAmount: number;
    pnlPercent: number;
    bananas: number;
}

/** Dashboard Strip: price, holdings, their value and the player's balance. */
export default function StockDashboard({ currentPrice, ownedAmount, portfolioValue, pnlAmount, pnlPercent, bananas }: StockDashboardProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10 border-b border-white/10">
            <div className="p-4 flex flex-col justify-center">
                <div className="text-[11px] font-mono text-white/60 uppercase mb-1">Prix Actuel</div>
                <div className="text-lg font-bold font-sans text-white flex items-center gap-2">
                    {formatNumber(currentPrice)} <Banana className="h-4 w-4 text-banan-primary" />
                </div>
            </div>
            <div className="p-4 flex flex-col justify-center">
                <div className="text-[11px] font-mono text-white/60 uppercase mb-1">Portefeuille</div>
                <div className="text-lg font-bold font-sans text-banan-primary">
                    {ownedAmount} <span className="text-[11px] text-white/60 font-mono">ACT</span>
                </div>
            </div>
            <div className="p-4 flex flex-col justify-center">
                <div className="text-[11px] font-mono text-white/60 uppercase mb-1">Valeur Portefeuille</div>
                <div className="text-lg font-bold font-sans text-white flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        {formatNumber(portfolioValue)} <Wallet className="h-4 w-4" />
                    </div>
                    {ownedAmount > 0 && (
                        <div className={`text-xs font-mono px-2 py-0.5 rounded ${pnlAmount >= 0 ? 'bg-stock-up/20 text-stock-up' : 'bg-stock-down/20 text-stock-down'}`}>
                            {pnlAmount >= 0 ? '+' : ''}{formatNumber(pnlAmount)} ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                        </div>
                    )}
                </div>
            </div>
            <div className="p-4 flex flex-col justify-center">
                <div className="text-[11px] font-mono text-white/60 uppercase mb-1">Vos Bananes</div>
                <div className="text-lg font-bold font-sans text-white flex items-center gap-2">
                    {formatNumber(bananas)} <Banana className="h-4 w-4 text-banan-primary" />
                </div>
            </div>
        </div>
    );
}
