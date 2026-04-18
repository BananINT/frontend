import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, AreaSeries, HistogramSeries, CrosshairMode, createSeriesMarkers } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, SeriesMarker } from 'lightweight-charts';
import { useGame } from '@app/context/GameContext';
import { useTheme } from '@app/hooks/useTheme';

import { socketManager } from '@app/lib/socket';
import { api } from '@app/lib/api';
import { Banana, ChartCandlestick, AlertCircle, Wallet, Activity } from 'lucide-react';
import GameSection from '@app/components/shared/GameSection';
import { formatNumber } from '@app/utils/format';
import FuturesModal from './FuturesModal';

interface Stock {
    symbol: string;
    name: string;
    volatility: number;
    color: string;
    current_price: number;
}

const STOCK_META: Record<string, { id: number, colorVar: string }> = {
    'BNDAQ': { id: 1, colorVar: '--banan-primary' },
    'BG': { id: 2, colorVar: '--banan-red' }
};

const getCssVar = (name: string, fallback: string) => {
    if (typeof window === 'undefined') return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
};

export default function StockChart() {
    const { gameState, buyStock, sellStock } = useGame();
    const { theme } = useTheme();
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const areaSeriesRef = useRef<ISeriesApi<"Area"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
    const candleMarkersRef = useRef<any>(null);
    const areaMarkersRef = useRef<any>(null);
    const priceLineRef = useRef<any>(null);

    const [chartType, setChartType] = useState<'candle' | 'area'>('candle');
    const [trades, setTrades] = useState<{ time: number, type: 'buy'|'sell' }[]>([]);

    const [stocks, setStocks] = useState<Stock[]>([]);
    const [activeStock, setActiveStock] = useState<Stock | null>(null);
    const activeStockRef = useRef<Stock | null>(null);
    const [currentPrice, setCurrentPrice] = useState(0);
    const lastCloseRef = useRef<number>(0);
    const curTimeRef = useRef<number>(Math.floor(Date.now() / 1000));
    const [buyQty, setBuyQty] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [isFuturesOpen, setIsFuturesOpen] = useState(false);

    // Sync Ref for Socket Listeners
    useEffect(() => {
        activeStockRef.current = activeStock;
    }, [activeStock]);

    const fetchHistory = async (tf: string = '1M') => {
        if (!activeStock || !seriesRef.current) return;
        
        try {
            const upColor = getCssVar('--color-stock-up', '#26a69a');
            const downColor = getCssVar('--color-stock-down', '#ef5350');
            
            const response = await api.get(`/market/history/${activeStock.symbol}`, {
                params: { timeframe: tf }
            });
            const data = response.data;
            const stockHistory = data.candles;
            const candles = stockHistory.map((c: any) => ({
                time: c.time, open: c.open, high: c.high, low: c.low, close: c.close,
            }));
            const lineData = stockHistory.map((c: any) => ({
                time: c.time, value: c.close,
            }));
            const volData = stockHistory.map((c: any) => ({
                time: c.time, value: c.volume || 0, color: c.close >= c.open ? `${upColor}80` : `${downColor}80`
            }));
            
            if (candles.length > 0 && seriesRef.current && areaSeriesRef.current && volumeSeriesRef.current) {
                seriesRef.current.setData(candles);
                areaSeriesRef.current.setData(lineData);
                volumeSeriesRef.current.setData(volData);
                lastCloseRef.current = candles[candles.length - 1].close;
                curTimeRef.current = candles[candles.length - 1].time;
                chartRef.current?.timeScale().fitContent();
                setError(null);
            }
        } catch (e: any) {
            console.error("Failed to fetch market history:", e);
            setError("Market Offline");
        }
    };

    useEffect(() => {
        if (!gameState.marketData || gameState.marketData.length === 0) return;
        
        const apiStocks = gameState.marketData.map((s: any) => ({
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
        
        setStocks(apiStocks);
        
        if (apiStocks.length > 0 && !activeStock) {
            setActiveStock(apiStocks[0]);
            const initialPrice = apiStocks[0].current_price;
            setCurrentPrice(initialPrice);
            lastCloseRef.current = initialPrice;
        }

        // Real-time chart update from Context
        const currentActive = activeStock;
        if (currentActive && seriesRef.current) {
            const update = gameState.marketData.find(s => s.symbol === currentActive.symbol);
            if (update && update.lastCandle) {
                const candle = update.lastCandle;
                setCurrentPrice(update.current_price);
                
                if (priceLineRef.current) {
                    priceLineRef.current.applyOptions({ price: update.current_price });
                }

                seriesRef.current.update(candle);
                if (areaSeriesRef.current) areaSeriesRef.current.update({ time: candle.time, value: candle.close });
                if (volumeSeriesRef.current) {
                    const upColor = getCssVar('--color-stock-up', '#26a69a');
                    const downColor = getCssVar('--color-stock-down', '#ef5350');
                    const volColor = candle.close >= candle.open ? `${upColor}80` : `${downColor}80`;
                    volumeSeriesRef.current.update({ time: candle.time, value: candle.volume || 0, color: volColor });
                }

                lastCloseRef.current = candle.close;
                curTimeRef.current = candle.time;
            } else if (update) {
                // Just price update if no candle
                setCurrentPrice(update.current_price);
            }
        }
    }, [gameState.marketData, activeStock]);

    // 1. Chart Creation & Lifecycle
    useEffect(() => {
        if (!chartContainerRef.current || !activeStock) return;

        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
            seriesRef.current = null;
        }
        chartContainerRef.current.innerHTML = '';

        const textColor = getCssVar('--color-banan-white', '#ffffff');
        const gridColor = 'rgba(255, 255, 255, 0.1)';
        const upColor = getCssVar('--color-stock-up', '#26a69a');
        const downColor = getCssVar('--color-stock-down', '#ef5350');

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor,
                attributionLogo: false,
            },
            width: chartContainerRef.current.clientWidth || 300,
            height: 300,
            grid: {
                vertLines: { color: gridColor },
                horzLines: { color: gridColor },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: true,
                rightOffset: 5,
            },
            crosshair: {
                mode: CrosshairMode.Normal,
            }
        });

        const series = chart.addSeries(CandlestickSeries, {
            upColor, downColor,
            borderVisible: false,
            wickUpColor: upColor, wickDownColor: downColor,
            visible: chartType === 'candle',
        });

        const areaSeries = chart.addSeries(AreaSeries, {
            lineColor: upColor,
            topColor: `${upColor}80`,
            bottomColor: `${upColor}00`,
            lineWidth: 2,
            visible: chartType === 'area',
        });

        const volumeSeries = chart.addSeries(HistogramSeries, {
            color: '#26a69a',
            priceFormat: { type: 'volume' },
            priceScaleId: '',
        });
        chart.priceScale('').applyOptions({
            scaleMargins: { top: 0.8, bottom: 0 },
        });

        const currentLine = series.createPriceLine({
            price: currentPrice,
            color: upColor,
            lineWidth: 2,
            lineStyle: 3, // Dashed
            axisLabelVisible: true,
            title: 'ACTUEL',
        });
        priceLineRef.current = currentLine;

        chartRef.current = chart;
        seriesRef.current = series;
        areaSeriesRef.current = areaSeries;
        volumeSeriesRef.current = volumeSeries;
        
        candleMarkersRef.current = createSeriesMarkers(series, []);
        areaMarkersRef.current = createSeriesMarkers(areaSeries, []);

        fetchHistory();


        const handleTradeSuccess = (response: any) => {
            if (response.success && response.stock_symbol === activeStockRef.current?.symbol) {
                setTrades(prev => {
                    const newTrades = [...prev, {
                        time: curTimeRef.current,
                        type: response.trade_type as 'buy' | 'sell',
                        price: response.price_per_share
                    }];
                    return newTrades;
                });
            }
        };

        const handleMessage = (message: any) => {
            if (!message || message.type !== 'trade_success') return;
            handleTradeSuccess(message.data || message);
        };

        socketManager.subscribe(handleMessage);

        // Responsive chart handling via ResizeObserver
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries.length === 0 || entries[0].target !== chartContainerRef.current) {
                return;
            }
            const newRect = entries[0].contentRect;
            chart.applyOptions({ width: newRect.width });
        });

        if (chartContainerRef.current) {
            resizeObserver.observe(chartContainerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
            socketManager.unsubscribe(handleMessage);
            chart.remove();
            chartRef.current = null;
            seriesRef.current = null;
            areaSeriesRef.current = null;
            volumeSeriesRef.current = null;
            priceLineRef.current = null;
            candleMarkersRef.current = null;
            areaMarkersRef.current = null;
        };
    }, [activeStock]);

    useEffect(() => {
        // This secondary sync is now handled by the main effect's initial fetch
    }, []);

    // 3. Theme Reactivity
    useEffect(() => {
        if (!chartRef.current || !seriesRef.current) return;

        const updateColors = () => {
            const textColor = getCssVar('--color-banan-white', '#ffffff');
            const gridColor = 'rgba(255, 255, 255, 0.1)';
            const upColor = getCssVar('--color-stock-up', '#26a69a');
            const downColor = getCssVar('--color-stock-down', '#ef5350');

            chartRef.current?.applyOptions({
                layout: { textColor },
                grid: {
                    vertLines: { color: gridColor },
                    horzLines: { color: gridColor },
                },
            });

            seriesRef.current?.applyOptions({
                upColor, downColor,
                wickUpColor: upColor, wickDownColor: downColor,
            });
        };

        updateColors();
        const timeout = setTimeout(updateColors, 100);
        return () => clearTimeout(timeout);
    }, [theme]);

    // 4. Chart Type Reactivity
    useEffect(() => {
        if (seriesRef.current && areaSeriesRef.current) {
            seriesRef.current.applyOptions({ visible: chartType === 'candle' });
            areaSeriesRef.current.applyOptions({ visible: chartType === 'area' });
        }
    }, [chartType]);

    // 5. Markers Reactivity
    useEffect(() => {
        if (!seriesRef.current || !areaSeriesRef.current) return;
        
        const markers: SeriesMarker<any>[] = trades.map(t => ({
            time: t.time as any,
            position: t.type === 'buy' ? 'belowBar' : 'aboveBar',
            color: t.type === 'buy' ? getCssVar('--color-stock-up', '#26a69a') : getCssVar('--color-stock-down', '#ef5350'),
            shape: t.type === 'buy' ? 'arrowUp' : 'arrowDown',
            text: t.type === 'buy' ? 'B' : 'S',
            size: 1,
        }));
        
        if (candleMarkersRef.current) candleMarkersRef.current.setMarkers(markers);
        if (areaMarkersRef.current) areaMarkersRef.current.setMarkers(markers);
    }, [trades]);

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

    const handleTimeframe = (tf: string) => {
        if (!activeStock) return;
        fetchHistory(tf);
    };

    return (
        <GameSection
            title="STONKS"
            icon={ChartCandlestick}
            rightElement={
                <div className="flex items-center">
                    <div className="flex border-l border-white/10">
                        {stocks.map(stock => (
                            <button
                                key={stock.symbol}
                                onClick={() => {
                                    setActiveStock(stock);
                                    setBuyQty(1);
                                    // Instantly update the UI price when switching tabs
                                    setCurrentPrice(stock.current_price);
                                }}
                                className={`px-4 py-3 text-xs font-bold uppercase transition-colors border-l first:border-l-0 border-white/10 ${activeStock?.symbol === stock.symbol
                                    ? 'bg-white/10 text-banan-primary'
                                    : 'text-white/30 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                {stock.symbol}
                            </button>
                        ))}
                    </div>
                </div>
            }
        >
            {/* Chart Area */}
            <div className="relative border border-white/10">
                {/* Timeframes Overlay */}
                <div className="absolute top-2 left-2 z-10 flex gap-2">
                    <div className="flex bg-black/50 border border-white/10 rounded backdrop-blur-sm overflow-hidden">
                        {['1M', '1H', '1D', '1W', 'ALL'].map(tf => (
                            <button
                                key={tf}
                                onClick={() => handleTimeframe(tf)}
                                className="px-3 py-1 text-[10px] font-mono font-bold text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chart Toggles Overlay */}
                <div className="absolute top-2 right-12 z-10 flex gap-2">
                    <div className="flex bg-black/50 border border-white/10 rounded backdrop-blur-sm overflow-hidden">
                         <button
                             onClick={() => setChartType('candle')}
                             className={`px-3 py-1 text-[10px] font-mono font-bold transition-colors ${chartType === 'candle' ? 'text-banan-primary bg-white/10' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                         >
                             CANDLES
                         </button>
                         <button
                             onClick={() => setChartType('area')}
                             className={`px-3 py-1 text-[10px] font-mono font-bold transition-colors ${chartType === 'area' ? 'text-banan-primary bg-white/10' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                         >
                             LINE
                         </button>
                    </div>
                </div>

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
                
                {/* 1. Dashboard Strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10 border-b border-white/10">
                    <div className="p-4 flex flex-col justify-center">
                        <div className="text-[10px] font-mono text-white/40 uppercase mb-1">Prix Actuel</div>
                        <div className="text-lg font-bold font-sans text-white flex items-center gap-2">
                            {formatNumber(currentPrice)} <Banana className="h-4 w-4 text-banan-primary" />
                        </div>
                    </div>
                    <div className="p-4 flex flex-col justify-center">
                        <div className="text-[10px] font-mono text-white/40 uppercase mb-1">Portefeuille</div>
                        <div className="text-lg font-bold font-sans text-banan-primary">
                            {ownedAmount} <span className="text-[10px] text-white/30 font-mono">ACT</span>
                        </div>
                    </div>
                    <div className="p-4 flex flex-col justify-center">
                        <div className="text-[10px] font-mono text-white/40 uppercase mb-1">Valeur Portefeuille</div>
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
                        <div className="text-[10px] font-mono text-white/40 uppercase mb-1">Vos Bananes</div>
                        <div className="text-lg font-bold font-sans text-white flex items-center gap-2">
                            {formatNumber(gameState.bananas)} <Banana className="h-4 w-4 text-banan-primary" />
                        </div>
                    </div>
                </div>

                {/* 2. Controls & Actions */}
                <div className="p-4 flex flex-col gap-4">
                    
                    {/* Input, Quick-Add & Max Panel */}
                    <div className="flex flex-col lg:flex-row gap-1 items-stretch">
                        <div className="flex-1 flex flex-col gap-1">
                            {/* Row 1: + Values */}
                            <div className="flex gap-1 flex-1">
                                <div className="flex w-16 sm:w-24 lg:w-32 items-center justify-center bg-white/5 border border-white/10 text-[10px] font-mono text-white/40 uppercase">
                                    Quantité
                                </div>
                                {[1, 10, 100, 1000].map(n => (
                                    <button 
                                        key={`add-${n}`}
                                        onClick={() => setBuyQty(prev => prev + n)}
                                        className="flex-1 py-3 lg:py-2 text-[10px] font-mono font-bold border bg-white/5 text-white/40 border-white/10 hover:border-white/30 hover:text-white transition-colors"
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
                                        className="flex-1 py-3 lg:py-2 text-[10px] font-mono font-bold border bg-white/5 text-white/40 border-white/10 hover:border-white/30 hover:text-white transition-colors"
                                    >
                                        -{n}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* MAX Buttons */}
                        <div className="flex flex-row gap-1 w-full lg:w-48">
                            <button 
                                onClick={handleMaxBuy}
                                className="flex-1 py-3 lg:py-1 text-[10px] font-mono font-bold border bg-banan-green/10 text-banan-green border-banan-green/20 hover:bg-banan-green hover:text-black transition-colors text-center"
                            >
                                MAX ACHAT
                            </button>
                            <button 
                                onClick={handleMaxSell}
                                className="flex-1 py-3 lg:py-1 text-[10px] font-mono font-bold border bg-banan-red/10 text-banan-red border-banan-red/20 hover:bg-banan-red hover:text-black transition-colors text-center"
                            >
                                MAX VENTE
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <button
                            onClick={handleBuy}
                            disabled={gameState.bananas < (currentPrice * buyQty)}
                            className="flex-1 bg-banan-green/10 text-banan-green border border-banan-green/30 hover:bg-banan-green hover:text-black transition-colors text-xs font-bold uppercase tracking-widest py-4 flex flex-col items-center gap-1 disabled:opacity-20"
                        >
                            <span>ACHETER {buyQty}</span>
                            <div className="flex items-center gap-1 text-[10px] opacity-70 font-normal">
                                -{formatNumber(currentPrice * buyQty)} <Banana className="h-3 w-3" />
                            </div>
                        </button>
                        
                        <button
                            onClick={handleSell}
                            disabled={ownedAmount < buyQty}
                            className="flex-1 bg-banan-red/10 text-banan-red border border-banan-red/30 hover:bg-banan-red hover:text-black transition-colors text-xs font-bold uppercase tracking-widest py-4 flex flex-col items-center gap-1 disabled:opacity-20"
                        >
                            <span>VENDRE {buyQty}</span>
                            <div className="flex items-center gap-1 text-[10px] opacity-70 font-normal">
                                +{formatNumber(currentPrice * buyQty)} <Banana className="h-3 w-3" />
                            </div>
                        </button>
                    </div>
                </div>
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