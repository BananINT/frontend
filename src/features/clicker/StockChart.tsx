import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import { useGame } from '@/context/GameContext';
import { TrendingUp, TrendingDown, DollarSign, Activity, CircleDollarSign, ChartCandlestick } from 'lucide-react';
import GameSection from '@/components/shared/GameSection';

const STOCKS = [
    { symbol: 'BNDAQ', name: 'BanaNASDAQ', basePrice: 100, volatility: 0.02, color: '#FAFF00' },
    { symbol: 'BG', name: 'BanaGone', basePrice: 1000, volatility: 0.15, color: '#FAFF00' }
];

export default function StockChart() {
    const { gameState, buyStock, sellStock } = useGame();
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

    const [activeStock, setActiveStock] = useState(STOCKS[0]);
    const [currentPrice, setCurrentPrice] = useState(activeStock.basePrice);

    // Keep track of prices to prevent jumps when switching (basic persistence)
    const pricesRef = useRef<Record<string, number>>({
        'BNDAQ': 100,
        'BG': 1000
    });

    useEffect(() => {
        if (!chartContainerRef.current) return;

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
                secondsVisible: false,
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

        // Initial Data Generation for the selected stock
        const data = [];
        let time = Math.floor(Date.now() / 1000) - 100; // 100 seconds history
        let value = pricesRef.current[activeStock.symbol];

        for (let i = 0; i < 100; i++) {
            time += 1;
            const open = value;
            const close = value * (1 + (Math.random() - 0.5) * activeStock.volatility);
            const high = Math.max(open, close) * (1 + Math.random() * 0.01);
            const low = Math.min(open, close) * (1 - Math.random() * 0.01);

            value = close;
            data.push({ time: time as any, open, high, low, close });
        }

        // Ensure strictly positive price
        if (value < 0.1) value = 0.1;

        newSeries.setData(data);
        chart.timeScale().fitContent();

        chartRef.current = chart;
        seriesRef.current = newSeries;
        pricesRef.current[activeStock.symbol] = value;
        setCurrentPrice(value);

        const handleResize = () => {
            if (chartContainerRef.current && chart) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        const interval = setInterval(() => {
            time += 1;
            // Update ALL stock prices internally, but only render the active one
            STOCKS.forEach(stock => {
                let p = pricesRef.current[stock.symbol];
                const open = p;
                const close = p * (1 + (Math.random() - 0.5) * stock.volatility);
                // Ensure price doesn't go negative
                const finalClose = close < 0.1 ? 0.1 : close;
                pricesRef.current[stock.symbol] = finalClose;

                // If this is the active stock, simulate candle params
                if (stock.symbol === activeStock.symbol) {
                    const high = Math.max(open, finalClose) * (1 + Math.random() * 0.01);
                    const low = Math.min(open, finalClose) * (1 - Math.random() * 0.01);
                    newSeries.update({
                        time: time as any,
                        open,
                        high,
                        low,
                        close: finalClose
                    });
                    setCurrentPrice(finalClose);
                }
            });

        }, 1000);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearInterval(interval);
            chart.remove();
        };
    }, [activeStock]);

    const handleBuy = (qty: number) => {
        buyStock(activeStock.symbol, qty, currentPrice);
    };

    const handleSell = (qty: number) => {
        sellStock(activeStock.symbol, qty, currentPrice);
    };

    return (
        <GameSection
            title="BANANA_EXCHANGE"
            icon={ChartCandlestick}
            rightElement={
                <div className="flex items-center gap-4">
                    {/* Stock Selector */}
                    <div className="flex gap-2">
                        {STOCKS.map(stock => (
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
