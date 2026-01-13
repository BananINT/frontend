import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import { useGame } from '@/context/GameContext';

import { socketManager } from '@/lib/socket';
import { CircleDollarSign, ChartCandlestick } from 'lucide-react';
import GameSection from '@/components/shared/GameSection';

interface Stock {
    symbol: string;
    name: string;
    basePrice: number;
    volatility: number;
    color: string;
    current_price?: number;
}

// Metadata for styling, since API doesn't provide colors
const STOCK_META: Record<string, { color: string }> = {
    'BNDAQ': { color: '#FAFF00' },
    'BG': { color: '#00FFA3' }, // Changed to green for distinction
    'STONK': { color: '#FF0055' } // Fallback
};

export default function StockChart() {
    const { gameState, buyStock, sellStock } = useGame();
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

    const [stocks, setStocks] = useState<Stock[]>([]);
    const [activeStock, setActiveStock] = useState<Stock | null>(null);
    const [currentPrice, setCurrentPrice] = useState(0);
    const lastCloseRef = useRef<number>(0);

    // Initial Fetch & Market Data
    useEffect(() => {
        const handleMarketData = (data: any) => {
            const apiStocks = data.stocks.map((s: any) => ({
                symbol: s.symbol,
                name: s.name,
                basePrice: s.base_price,
                volatility: s.volatility,
                color: STOCK_META[s.symbol]?.color || '#FFFFFF',
                current_price: s.current_price
            }));
            setStocks(apiStocks);
            if (apiStocks.length > 0 && !activeStock) {
                // Only set active stock if not already set or we want to force default
                // But better to check if we have one. 
                // Since this runs on mount, activeStock is null initially.
                setActiveStock(apiStocks[0]);
                const initialPrice = apiStocks[0].current_price || apiStocks[0].basePrice;
                setCurrentPrice(initialPrice);
                lastCloseRef.current = initialPrice;
            }
        };

        socketManager.on('market_data_response', handleMarketData);

        // Request data
        // Check if ready, if not, wait? 
        // socketManager.send handles check, but connection might not be ready on initial load immediately if GameContext is connecting.
        // However, GameContext renders children after isLoading is false (which implies connection).
        // So we should be safe to send.
        socketManager.send('get_market_data', {});

        return () => {
            socketManager.off('market_data_response', handleMarketData);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount

    // Chart Setup & Listeners
    useEffect(() => {
        if (!chartContainerRef.current || !activeStock) return;

        // Cleanup old chart
        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
        }

        chartContainerRef.current.innerHTML = '';

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#000000' },
                textColor: '#ffffff',
                attributionLogo: false,
            },
            width: chartContainerRef.current.clientWidth,
            height: 300,
            grid: {
                vertLines: { color: '#333' },
                horzLines: { color: '#333' },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: true,
            },
            handleScroll: false,
            handleScale: false,
        });

        const newSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });

        chartRef.current = chart;
        seriesRef.current = newSeries;

        chart.timeScale().fitContent();

        // Resize handler
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        // Candle History Listener
        const handleCandlesResponse = (data: any) => {
            if (data.symbol !== activeStock.symbol) return;

            const candles = data.candles.map((c: any) => ({
                time: c.time,
                open: c.open,
                high: c.high,
                low: c.low,
                close: c.close,
            }));

            if (candles.length > 0) {
                newSeries.setData(candles);
                lastCloseRef.current = candles[candles.length - 1].close;
                curTimeRef.current = candles[candles.length - 1].time;
            } else {
                newSeries.setData([]);
                lastCloseRef.current = activeStock.basePrice;
                curTimeRef.current = Math.floor(Date.now() / 1000);
            }
        };

        socketManager.on('candles_response', handleCandlesResponse);

        // Request history

        // Initial Data Load
        if (gameState.marketHistory && gameState.marketHistory[activeStock.symbol]) {
            const history = gameState.marketHistory[activeStock.symbol];
            const candles = history.map((c: any) => ({
                time: c.time,
                open: c.open,
                high: c.high,
                low: c.low,
                close: c.close,
            }));
            if (candles.length > 0) {
                newSeries.setData(candles);
                lastCloseRef.current = candles[candles.length - 1].close;
                curTimeRef.current = candles[candles.length - 1].time;
            }
        } else {
            // Request history if not in context
            socketManager.send('get_candles', { symbol: activeStock.symbol });
        }

        // Socket Listener for Updates
        const handleMarketUpdate = (data: any) => {
            if (!data || !data.stocks) return;

            const stockData = data.stocks.find((s: any) => s.symbol === activeStock.symbol);
            if (stockData) {
                const price = stockData.price;
                setCurrentPrice(price);

                // Update candle
                if (stockData.candle) {
                    // Use backend provided candle
                    newSeries.update(stockData.candle);
                    lastCloseRef.current = stockData.candle.close;
                    curTimeRef.current = stockData.candle.time;
                } else {
                    // Fallback to simulated candle if backend logic fails
                    curTimeRef.current += 10;
                    const open = lastCloseRef.current;
                    const close = price;
                    const candle = {
                        time: curTimeRef.current as any,
                        open,
                        high: Math.max(open, close),
                        low: Math.min(open, close),
                        close
                    };
                    newSeries.update(candle);
                    lastCloseRef.current = close;
                }
            }
        };

        socketManager.on('market_update', handleMarketUpdate);

        return () => {
            window.removeEventListener('resize', handleResize);
            socketManager.off('market_update', handleMarketUpdate);
            socketManager.off('candles_response', handleCandlesResponse);
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };


    }, [activeStock, gameState.marketHistory]);

    const curTimeRef = { current: Math.floor(Date.now() / 1000) };

    const handleBuy = (qty: number) => {
        if (!activeStock) return;
        buyStock(activeStock.symbol, qty); // No price arg needed
    };

    const handleSell = (qty: number) => {
        if (!activeStock) return;
        sellStock(activeStock.symbol, qty); // No price arg needed
    };

    if (!activeStock) {
        return <GameSection title="BANANA_EXCHANGE" icon={ChartCandlestick}><div>Loading market...</div></GameSection>;
    }

    return (
        <GameSection
            title="BANANA_EXCHANGE"
            icon={ChartCandlestick}
            rightElement={
                <div className="flex items-center gap-4">
                    {/* Stock Selector */}
                    <div className="flex gap-2">
                        {stocks.map(stock => (
                            <button
                                key={stock.symbol}
                                onClick={() => setActiveStock(stock)}
                                className={`px-3 py-1 text-xs font-bold uppercase border transition-colors ${activeStock.symbol === stock.symbol
                                    ? `bg-[${stock.color}] text-black border-[${stock.color}]`
                                    : 'bg-transparent text-white/50 border-white/10 hover:border-white/30'
                                    }`}
                                style={{
                                    backgroundColor: activeStock.symbol === stock.symbol ? stock.color : 'transparent',
                                    borderColor: activeStock.symbol === stock.symbol ? stock.color : undefined,
                                    color: activeStock.symbol === stock.symbol ? '#000' : undefined
                                }}
                            >
                                {stock.symbol}
                            </button>
                        ))}
                    </div>
                    <span className="text-xs font-mono text-white/50 bg-white/10 px-2 py-1 rounded">LIVE</span>
                </div>
            }
        >
            <div ref={chartContainerRef} className="w-full h-[300px] border border-white/5" />

            {/* Trading Interface */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 border border-white/10 flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-mono text-white/50 uppercase">Prix Actuel</div>
                        <div className="text-2xl font-mono font-bold text-white flex items-center gap-2">
                            {currentPrice.toFixed(2)} <CircleDollarSign className="h-6 w-6 text-banan-primary" />
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] font-mono text-white/50 uppercase text-right">Portefeuille</div>
                        <div className="text-xl font-mono font-bold text-banan-primary text-right">
                            {gameState.stocks[activeStock.symbol] || 0} <span className="text-xs text-white/50">ACT</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => handleBuy(1)}
                        disabled={gameState.bananas < currentPrice}
                        className="flex-1 bg-green-500/20 text-green-500 border border-green-500/50 hover:bg-green-500 hover:text-black font-bold font-mono uppercase text-sm py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center"
                    >
                        <span>ACHETER 1</span>
                        <div className="flex items-center gap-1 text-[10px] opacity-70">
                            -{currentPrice.toFixed(0)} <CircleDollarSign className="h-3 w-3" />
                        </div>
                    </button>
                    <button
                        onClick={() => handleSell(1)}
                        disabled={!gameState.stocks[activeStock.symbol] || gameState.stocks[activeStock.symbol] <= 0}
                        className="flex-1 bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-black font-bold font-mono uppercase text-sm py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center"
                    >
                        <span>VENDRE 1</span>
                        <div className="flex items-center gap-1 text-[10px] opacity-70">
                            +{currentPrice.toFixed(0)} <CircleDollarSign className="h-3 w-3" />
                        </div>
                    </button>
                </div>
            </div>
        </GameSection>
    );
}
