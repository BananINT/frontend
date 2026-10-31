import { Activity } from 'lucide-react';
import { formatNumber } from '@app/utils/format';
import type { ListedStock } from './stockMeta';

interface StockTickerStripProps {
    stocks: ListedStock[];
    activeSymbol: string | undefined;
    onSelect: (stock: ListedStock) => void;
}

/** Market Ticker Strip: one button per listed stock. */
export default function StockTickerStrip({ stocks, activeSymbol, onSelect }: StockTickerStripProps) {
    return (
        <div className="flex items-center gap-3 py-2.5 px-4 border-b border-white/10 bg-white/5 overflow-x-auto text-[11px] font-mono">
            <span className="text-[11px] uppercase font-bold text-white/60 shrink-0 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-banan-primary" /> FLUX MARCHÉ :
            </span>
            {stocks.map(s => {
                const change = s.lastCandle && s.lastCandle.open > 0 
                    ? ((s.current_price - s.lastCandle.open) / s.lastCandle.open) * 100 
                    : 0;
                const isPositive = change >= 0;
                return (
                    <button
                        type="button"
                        key={`ticker-${s.symbol}`}
                        onClick={() => onSelect(s)}
                        aria-pressed={activeSymbol === s.symbol}
                        className={`flex items-center gap-2 px-2.5 py-1 bg-black/60 border cursor-pointer transition-colors shrink-0 text-left font-[inherit] focus:outline-none focus-visible:ring-1 focus-visible:ring-banan-primary ${
                            activeSymbol === s.symbol ? 'border-banan-primary' : 'border-white/10 hover:border-white/30'
                        }`}
                    >
                        <span className="font-bold text-white">{s.symbol}</span>
                        <span className="text-banan-primary font-bold">{formatNumber(s.current_price)} 🍌</span>
                        <span className={`text-[11px] font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{change.toFixed(2)}%
                        </span>
                        <span className="text-[11px] text-white/60">Vol:{s.volatility}</span>
                    </button>
                );
            })}
        </div>
    );
}
