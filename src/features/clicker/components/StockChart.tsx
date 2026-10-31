import { useMemo, useState } from 'react';
import { useGame } from '@app/context/GameContext';
import { useTheme } from '@app/hooks/useTheme';

import { AlertCircle, ChartCandlestick, Activity } from 'lucide-react';
import GameSection from '@app/components/shared/GameSection';
import FuturesModal from './FuturesModal';
import { listStocks, type ChartType, type Stock } from './stock-chart/stockMeta';
import { useStockChart } from './stock-chart/useStockChart';
import StockTickerStrip from './stock-chart/StockTickerStrip';
import ChartOverlayControls from './stock-chart/ChartOverlayControls';
import StockDashboard from './stock-chart/StockDashboard';
import StockTradePanel from './stock-chart/StockTradePanel';

export default function StockChart() {
    const { gameState, buyStock, sellStock } = useGame();
    const { theme } = useTheme();

    const [chartType, setChartType] = useState<ChartType>('candle');
    const stocks = useMemo(() => listStocks(gameState.marketData), [gameState.marketData]);

    const [activeStock, setActiveStock] = useState<Stock | null>(null);
    const [buyQty, setBuyQty] = useState(1);
    const [isFuturesOpen, setIsFuturesOpen] = useState(false);

    // Pick the first listed stock as soon as the market arrives — adjusted
    // during render, so the desk never paints an empty first frame for it.
    if (stocks.length > 0 && !activeStock) {
        setActiveStock(stocks[0]);
    }

    // The live price comes straight from the market feed; the snapshot taken
    // when the stock was picked covers a symbol that drops out of the feed.
    const liveStock = activeStock ? gameState.marketData.find(s => s.symbol === activeStock.symbol) : undefined;
    const currentPrice = liveStock?.current_price ?? activeStock?.current_price ?? 0;

    const { chartContainerRef, error, timeframe, selectTimeframe } = useStockChart({
        activeStock,
        chartType,
        marketData: gameState.marketData,
        currentPrice,
        theme,
    });

    const handleBuy = () => {
        if (activeStock) {
            const slippage = 0.05; // 5% slippage
            const maxPrice = Math.floor(currentPrice * (1 + slippage));
            buyStock(activeStock.symbol, buyQty, maxPrice);
        }
    };

    const handleSell = () => {
        if (activeStock) {
            const slippage = 0.05; // 5% slippage
            const minPrice = Math.floor(currentPrice * (1 - slippage));
            sellStock(activeStock.symbol, buyQty, minPrice);
        }
    };    

    // UX Helper Variables
    const isLoading = !activeStock;
    const portfolio = gameState.stocks[activeStock?.symbol ?? ''] || { shares: 0, averageBuyPrice: 0 };
    const ownedAmount = portfolio.shares;
    const avgBuyPrice = portfolio.averageBuyPrice;
    const portfolioValue = ownedAmount * currentPrice;
    const maxAffordable = currentPrice > 0 ? Math.floor(gameState.bananas / currentPrice) : 0;

    const pnlAmount = portfolioValue - (ownedAmount * avgBuyPrice);
    const pnlPercent = (ownedAmount * avgBuyPrice) > 0 ? (pnlAmount / (ownedAmount * avgBuyPrice)) * 100 : 0;

    const handleMaxBuy = () => setBuyQty(Math.max(1, maxAffordable));
    const handleMaxSell = () => setBuyQty(Math.max(1, ownedAmount));

    return (
        <GameSection
            title="BOURSE & TRADING (STONKS)"
            icon={ChartCandlestick}
            className="w-full border-t border-white/10 p-0"
            headerClassName="p-4 mb-0 border-b border-white/10"
            rightElement={
                <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="flex items-center gap-1.5 text-green-400 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        TICK EN DIRECT
                    </span>
                    <span className="text-white/60 border-l border-white/10 pl-3">
                        ACTIF : <span className="text-banan-primary font-bold">{activeStock?.symbol || 'BNDAQ'}</span>
                    </span>
                </div>
            }
        >
            <StockTickerStrip stocks={stocks} activeSymbol={activeStock?.symbol} onSelect={setActiveStock} />

            {/* Chart Area */}
            <div className="relative border-b border-white/10">
                <ChartOverlayControls
                    timeframe={timeframe}
                    onTimeframe={selectTimeframe}
                    chartType={chartType}
                    onChartType={setChartType}
                />

                <div ref={chartContainerRef} className="w-full transition-colors duration-300" />
                {(error || isLoading) && (
                    <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm pointer-events-none">
                        <div className="flex items-center gap-2 text-white/50 font-mono text-sm">
                            {isLoading ? 'Loading market...' : (
                                <>
                                    <AlertCircle className="h-5 w-5 text-banan-red" />
                                    <span className="text-banan-red">{error}</span>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 flex flex-col gap-4">
                
                <StockDashboard
                    currentPrice={currentPrice}
                    ownedAmount={ownedAmount}
                    portfolioValue={portfolioValue}
                    pnlAmount={pnlAmount}
                    pnlPercent={pnlPercent}
                    bananas={gameState.bananas}
                />

                <StockTradePanel
                    buyQty={buyQty}
                    setBuyQty={setBuyQty}
                    currentPrice={currentPrice}
                    ownedAmount={ownedAmount}
                    bananas={gameState.bananas}
                    onMaxBuy={handleMaxBuy}
                    onMaxSell={handleMaxSell}
                    onBuy={handleBuy}
                    onSell={handleSell}
                />
            </div>

            {/* Futures Button */}
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={() => setIsFuturesOpen(true)}
                    className="w-full py-3 bg-banan-primary/10 border border-banan-primary/20 text-banan-primary font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2
                        hover:bg-banan-primary hover:text-black transition-all
                        shadow-[0_0_20px_rgba(var(--banan-primary-rgb),0.15)]"
                >
                    <Activity className="h-4 w-4" />
                    BANANA FUTURES — Trading à Effet de Levier
                </button>
            </div>

            <FuturesModal
                isOpen={isFuturesOpen}
                onClose={() => setIsFuturesOpen(false)}
                stocks={stocks}
            />
        </GameSection>
    );
}
