import type { MarketStock } from '@app/types/game';

export interface Stock {
    symbol: string;
    name: string;
    volatility: number;
    color: string;
    current_price: number;
}

/** A stock as the trading desk lists it, with the last live candle for the ticker. */
export type ListedStock = Stock & { lastCandle: MarketStock['lastCandle'] };

export type ChartType = 'candle' | 'area';

export const TIMEFRAMES = ['1H', '1D', '1W', '1M', 'ALL'];

export const STOCK_META: Record<string, { id: number, colorVar: string }> = {
    'BNDAQ': { id: 1, colorVar: '--banan-primary' },
    'BG':    { id: 2, colorVar: '--banan-red' },
    'OGM':   { id: 3, colorVar: '--banan-green' },
    'CYBR':  { id: 4, colorVar: '--banan-cyber' },
    'FED':   { id: 5, colorVar: '--banan-algo' },
    'QNTM':  { id: 6, colorVar: '--banan-teal' }
};

export const getCssVar = (name: string, fallback: string) => {
    if (typeof window === 'undefined') return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
};

/** Market data in desk order, with each symbol's accent colour. */
export function listStocks(marketData: MarketStock[]): ListedStock[] {
    if (!marketData || marketData.length === 0) return [];

    return marketData.map((s) => ({
        symbol: s.symbol,
        name: s.name,
        volatility: s.volatility,
        color: STOCK_META[s.symbol] ? `var(${STOCK_META[s.symbol].colorVar})` : 'var(--color-banan-white)',
        current_price: s.current_price,
        lastCandle: s.lastCandle
    })).sort((a: Stock, b: Stock) => {
        const idA = STOCK_META[a.symbol]?.id ?? Infinity;
        const idB = STOCK_META[b.symbol]?.id ?? Infinity;
        return idA - idB;
    });
}
