import { useCallback, useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, AreaSeries, HistogramSeries, CrosshairMode, createSeriesMarkers } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, ISeriesMarkersPluginApi, SeriesMarker, Time } from 'lightweight-charts';
import { api } from '@app/lib/api';
import { useSocketMessage } from '@app/hooks/useSocketMessage';
import type { MarketStock } from '@app/types/game';
import { getCssVar, type ChartType, type Stock } from './stockMeta';

interface UseStockChartOptions {
    activeStock: Stock | null;
    chartType: ChartType;
    marketData: MarketStock[];
    /** Price the dashed ACTUEL line starts at when the chart is (re)built. */
    currentPrice: number;
    theme: string;
}

/**
 * Owns the lightweight-charts instance: creation and teardown per stock and
 * chart type, history loading per timeframe, live candles, theme colours and
 * trade markers. The trading UI only gets the container ref and the controls.
 */
export function useStockChart({ activeStock, chartType, marketData, currentPrice, theme }: UseStockChartOptions) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const areaSeriesRef = useRef<ISeriesApi<"Area"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
    const priceLineRef = useRef<ReturnType<ISeriesApi<"Candlestick">["createPriceLine"]> | null>(null);
    const candleMarkersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
    const areaMarkersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);

    const [trades, setTrades] = useState<{ time: number, type: 'buy'|'sell' }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [timeframe, setTimeframe] = useState('1H');

    const activeStockRef = useRef<Stock | null>(null);
    const curTimeRef = useRef<number>(0);
    const timeframeRef = useRef(timeframe);
    const currentPriceRef = useRef(currentPrice);

    useEffect(() => {
        timeframeRef.current = timeframe;
    }, [timeframe]);

    // Sync Ref for Socket Listeners
    useEffect(() => {
        activeStockRef.current = activeStock;
    }, [activeStock]);

    useEffect(() => {
        currentPriceRef.current = currentPrice;
    }, [currentPrice]);

    useEffect(() => {
        curTimeRef.current = Math.floor(Date.now() / 1000);
    }, []);

    const fetchHistory = useCallback(async (tf: string = '1H') => {
        if (!activeStock || !seriesRef.current) return;

        try {
            const upColor = getCssVar('--color-stock-up', '#26a69a');
            const downColor = getCssVar('--color-stock-down', '#ef5350');

            const symbol = activeStock.symbol;
            const response = await api.get(`/market/history/${symbol}`, {
                params: { timeframe: tf }
            });
            // The player may have switched stocks while this was in flight.
            if (activeStockRef.current?.symbol !== symbol) return;
            const data = response.data;
            const stockHistory = data.candles;
            const candles = stockHistory.map((c: { time: number, open: number, high: number, low: number, close: number, volume?: number }) => ({
                time: c.time, open: c.open, high: c.high, low: c.low, close: c.close,
            }));
            const lineData = stockHistory.map((c: { time: number, close: number }) => ({
                time: c.time, value: c.close,
            }));
            const volData = stockHistory.map((c: { time: number, close: number, open: number, volume?: number }) => ({
                time: c.time, value: c.volume || 0, color: c.close >= c.open ? `${upColor}80` : `${downColor}80`
            }));

            if (candles.length > 0 && seriesRef.current && areaSeriesRef.current && volumeSeriesRef.current) {
                seriesRef.current.setData(candles);
                areaSeriesRef.current.setData(lineData);
                volumeSeriesRef.current.setData(volData);
                curTimeRef.current = candles[candles.length - 1].time;
                chartRef.current?.timeScale().fitContent();
                setError(null);
            }
        } catch (e: unknown) {
            if (activeStockRef.current?.symbol !== activeStock.symbol) return;
            console.error("Failed to fetch market history:", e);
            setError("Market Offline");
        }
    }, [activeStock]);

    // Real-time chart update from Context
    useEffect(() => {
        const currentActive = activeStock;
        if (!currentActive || !seriesRef.current) return;
        const update = marketData.find(s => s.symbol === currentActive.symbol);
        if (!update || !update.lastCandle) return;
        const candle = update.lastCandle;

        if (priceLineRef.current) {
            priceLineRef.current.applyOptions({ price: update.current_price });
        }

        // The backend only ever broadcasts a 1-minute-resolution candle in real time,
        // so it can only be pushed into the series when viewing the 1H (1m-candle) timeframe.
        // Feeding it into a coarser series (1D/1W/1M/ALL) would corrupt that series' spacing/scale.
        if (timeframeRef.current === '1H') {
            if (seriesRef.current) seriesRef.current.update(candle as Parameters<Exclude<typeof seriesRef.current, null>['update']>[0]);
            if (areaSeriesRef.current) areaSeriesRef.current.update({ time: candle.time as Time, value: candle.close });
            if (volumeSeriesRef.current) {
                const upColor = getCssVar('--color-stock-up', '#26a69a');
                const downColor = getCssVar('--color-stock-down', '#ef5350');
                const volColor = candle.close >= candle.open ? `${upColor}80` : `${downColor}80`;
                volumeSeriesRef.current.update({ time: candle.time as Time, value: candle.volume || 0, color: volColor });
            }
        }

        curTimeRef.current = candle.time;
    }, [marketData, activeStock]);

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
            height: 400,
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
            price: currentPriceRef.current,
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

        // Markers will be handled by the trades effect

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
            chart.remove();
            chartRef.current = null;
            seriesRef.current = null;
            areaSeriesRef.current = null;
            volumeSeriesRef.current = null;
            priceLineRef.current = null;
            candleMarkersRef.current = null;
            areaMarkersRef.current = null;
        };
    }, [activeStock, chartType]);

    // Trades on the stock being watched become chart markers.
    useSocketMessage<{ success: boolean; stock_symbol: string; trade_type: string; price_per_share: number } | undefined>(
        'trade_success',
        (response) => {
            if (!response || !chartRef.current) return;
            if (response.success && response.stock_symbol === activeStockRef.current?.symbol) {
                setTrades(prev => [...prev, {
                    time: curTimeRef.current,
                    type: response.trade_type as 'buy' | 'sell'
                }]);
            }
        }
    );

    // 2. History for the current stock and timeframe
    useEffect(() => {
        fetchHistory(timeframeRef.current);
    }, [fetchHistory]);

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
            // Reload market to prevent empty graphs
            fetchHistory(timeframeRef.current);
        }
    }, [chartType, fetchHistory]);

    // 5. Markers Reactivity
    useEffect(() => {
        if (!candleMarkersRef.current || !areaMarkersRef.current) return;

        const markers: SeriesMarker<Time>[] = trades.map(t => ({
            time: t.time as Time,
            position: t.type === 'buy' ? 'belowBar' : 'aboveBar',
            color: t.type === 'buy' ? getCssVar('--color-stock-up', '#26a69a') : getCssVar('--color-stock-down', '#ef5350'),
            shape: t.type === 'buy' ? 'arrowUp' : 'arrowDown',
            text: t.type === 'buy' ? 'B' : 'S',
            size: 1,
        }));

        candleMarkersRef.current.setMarkers(markers);
        areaMarkersRef.current.setMarkers(markers);
    }, [trades]);

    const selectTimeframe = (tf: string) => {
        if (!activeStock) return;
        setTimeframe(tf);
        fetchHistory(tf);
    };

    return { chartContainerRef, error, timeframe, selectTimeframe };
}
