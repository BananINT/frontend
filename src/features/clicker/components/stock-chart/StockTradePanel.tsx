import type { Dispatch, SetStateAction } from 'react';
import { Banana } from 'lucide-react';
import { formatNumber } from '@app/utils/format';

interface StockTradePanelProps {
    buyQty: number;
    setBuyQty: Dispatch<SetStateAction<number>>;
    currentPrice: number;
    ownedAmount: number;
    bananas: number;
    onMaxBuy: () => void;
    onMaxSell: () => void;
    onBuy: () => void;
    onSell: () => void;
}

/** Controls & Actions: quantity pad, MAX shortcuts, buy and sell. */
export default function StockTradePanel({
    buyQty, setBuyQty, currentPrice, ownedAmount, bananas, onMaxBuy, onMaxSell, onBuy, onSell,
}: StockTradePanelProps) {
    return (
        <div className="p-4 flex flex-col gap-4">
            
            {/* Input, Quick-Add & Max Panel */}
            <div className="flex flex-col lg:flex-row gap-1 items-stretch">
                <div className="flex-1 flex flex-col gap-1">
                    {/* Row 1: + Values */}
                    <div className="flex gap-1 flex-1">
                        <div className="flex w-16 sm:w-24 lg:w-32 items-center justify-center bg-white/5 border border-white/10 text-[11px] font-mono text-white/60 uppercase">
                            Quantité
                        </div>
                        {[1, 10, 100, 1000].map(n => (
                            <button 
                                key={`add-${n}`}
                                onClick={() => setBuyQty(prev => prev + n)}
                                className="flex-1 py-3 lg:py-2 text-[11px] font-mono font-bold border bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:text-white transition-colors"
                            >
                                +{n}
                            </button>
                        ))}
                    </div>
                    {/* Row 2: - Values */}
                    <div className="flex gap-1 flex-1">
                        <input 
                            type="number" 
                            min="1"
                            value={buyQty}
                            onChange={(e) => setBuyQty(Math.max(1, parseInt(e.target.value) || 1))}
                            className="bg-white/5 border border-white/10 text-white font-mono text-sm px-3 py-1.5 w-16 sm:w-24 lg:w-32 focus:outline-none focus:border-banan-primary transition-colors text-center"
                        />
                        {[1, 10, 100, 1000].map(n => (
                            <button 
                                key={`sub-${n}`}
                                onClick={() => setBuyQty(prev => Math.max(1, prev - n))}
                                className="flex-1 py-3 lg:py-2 text-[11px] font-mono font-bold border bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:text-white transition-colors"
                            >
                                -{n}
                            </button>
                        ))}
                    </div>
                </div>

                {/* MAX Buttons */}
                <div className="flex flex-row gap-1 w-full lg:w-48">
                    <button 
                        onClick={onMaxBuy}
                        className="flex-1 py-3 lg:py-1 text-[11px] font-mono font-bold border bg-banan-green/10 text-banan-green border-banan-green/20 hover:bg-banan-green hover:text-black transition-colors text-center"
                    >
                        MAX ACHAT
                    </button>
                    <button 
                        onClick={onMaxSell}
                        className="flex-1 py-3 lg:py-1 text-[11px] font-mono font-bold border bg-banan-red/10 text-banan-red border-banan-red/20 hover:bg-banan-red hover:text-black transition-colors text-center"
                    >
                        MAX VENTE
                    </button>
                </div>
            </div>
            
            <div className="flex gap-2">
                <button
                    onClick={onBuy}
                    disabled={bananas < (currentPrice * buyQty)}
                    className="flex-1 bg-banan-green/10 text-banan-green border border-banan-green/30 hover:bg-banan-green hover:text-black transition-colors text-xs font-bold uppercase tracking-widest py-4 flex flex-col items-center gap-1 disabled:opacity-20"
                >
                    <span>ACHETER {buyQty}</span>
                    <div className="flex items-center gap-1 text-[11px] opacity-70 font-normal">
                        -{formatNumber(currentPrice * buyQty)} <Banana className="h-3 w-3" />
                    </div>
                </button>
                
                <button
                    onClick={onSell}
                    disabled={ownedAmount < buyQty}
                    className="flex-1 bg-banan-red/10 text-banan-red border border-banan-red/30 hover:bg-banan-red hover:text-black transition-colors text-xs font-bold uppercase tracking-widest py-4 flex flex-col items-center gap-1 disabled:opacity-20"
                >
                    <span>VENDRE {buyQty}</span>
                    <div className="flex items-center gap-1 text-[11px] opacity-70 font-normal">
                        +{formatNumber(currentPrice * buyQty)} <Banana className="h-3 w-3" />
                    </div>
                </button>
            </div>
        </div>
    );
}
