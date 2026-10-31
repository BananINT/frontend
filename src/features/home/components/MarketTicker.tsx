import { useEffect, useState } from 'react';
import { ArrowUpRight, Banana, ChartCandlestick, TrendingDown, TrendingUp } from 'lucide-react';
import { Link } from 'react-router';
import { api } from '@app/lib/api';
import { formatNumber } from '@app/utils/format';
import ShowcaseSection from './ShowcaseSection';

interface Stock {
    symbol: string;
    name: string;
    current_price: number;
    change_24h: number;
    stock_type: string;
    history?: number[];
}

function PriceChart({ prices, rising }: { prices: number[]; rising: boolean }) {
    if (prices.length < 2) {
        return <div className="flex h-44 items-center justify-center border-y border-white/10 font-mono text-xs text-white/60">Historique pas encore disponible</div>;
    }
    const low = Math.min(...prices);
    const spread = Math.max(...prices) - low || 1;
    const points = prices.map((price, index) => `${(index / (prices.length - 1)) * 400},${110 - ((price - low) / spread) * 96}`).join(' ');
    const color = rising ? '#a3e635' : '#fb7185';
    return (
        <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="h-44 w-full" role="img" aria-label={`Évolution récente du cours : ${rising ? 'hausse' : 'baisse'}`}>
            <defs>
                <linearGradient id="stock-chart-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d="M0 119H400M0 61H400M0 2H400" stroke="white" strokeOpacity="0.08" strokeDasharray="3 7" />
            <polygon points={`0,120 ${points} 400,120`} fill="url(#stock-chart-fill)" />
            <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
    );
}

export default function MarketTicker() {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [selectedSymbol, setSelectedSymbol] = useState('BNDAQ');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            try {
                const response = await api.get<Stock[]>('/market/stocks');
                const recent = response.data.slice(0, 6);
                const withHistory = await Promise.all(recent.map(async stock => {
                    try {
                        const history = await api.get<{ candles: { close: number }[] }>(`/market/history/${encodeURIComponent(stock.symbol)}?timeframe=1M`);
                        return { ...stock, history: history.data.candles.map(candle => candle.close) };
                    } catch {
                        return { ...stock, history: [] };
                    }
                }));
                if (mounted) setStocks(withHistory);
            } catch {
                if (mounted) setStocks([]);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchData();
        const interval = window.setInterval(fetchData, 60000);
        return () => { mounted = false; window.clearInterval(interval); };
    }, []);

    const selected = stocks.find(stock => stock.symbol === selectedSymbol) || stocks[0];
    const rising = (selected?.change_24h || 0) >= 0;

    return (
        <ShowcaseSection title="La bourse aux bananes" icon={ChartCandlestick}>
            <p className="-mt-5 mb-8 max-w-xl text-sm leading-relaxed text-white/60 sm:mt-0">Les cours du jeu, mis à jour toutes les minutes. Choisis une valeur pour voir sa courbe.</p>
            {loading ? (
                <div className="border-y border-white/15 py-16 font-mono text-sm text-white/50">Chargement des cours…</div>
            ) : !selected ? (
                <div className="border-y border-white/15 py-16 font-mono text-sm text-white/50">Les cours sont indisponibles pour le moment.</div>
            ) : (
                <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-12">
                    <div className="relative min-w-0 overflow-hidden border-t-2 border-banan-primary bg-white/[0.035] p-5 sm:p-8">
                        <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-banan-primary/10 blur-3xl" aria-hidden="true" />
                        <div className="relative flex flex-wrap items-start justify-between gap-5">
                            <div>
                                <p className="font-mono text-xs uppercase tracking-[0.25em] text-banan-primary">Valeur suivie</p>
                                <h3 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{selected.symbol}</h3>
                                <p className="mt-1 text-sm text-white/55">{selected.name}</p>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="font-mono text-xs uppercase tracking-widest text-white/60">Prix actuel</p>
                                <p className="mt-2 flex items-center gap-2 font-mono text-3xl font-bold tabular-nums text-white sm:justify-end sm:text-4xl">{formatNumber(selected.current_price)} <Banana className="h-5 w-5 shrink-0 text-banan-primary" aria-label="bananes" /></p>
                                <p className={`mt-2 inline-flex items-center gap-1 font-mono text-sm font-bold ${rising ? 'text-lime-400' : 'text-rose-400'}`}>
                                    {rising ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                    {rising ? '+' : ''}{selected.change_24h.toFixed(2)}% sur 24 h
                                </p>
                            </div>
                        </div>
                        <div className="mt-8"><PriceChart prices={selected.history || []} rising={rising} /></div>
                        <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-white/60">Cours récents · {selected.stock_type}</p>
                    </div>
                    <div className="min-w-0">
                        <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-white/60">Sur le marché</p>
                        <div className="border-t border-white/20">
                            {stocks.map(stock => {
                                const active = stock.symbol === selected.symbol;
                                const up = stock.change_24h >= 0;
                                return (
                                    <button key={stock.symbol} type="button" aria-pressed={active} onClick={() => setSelectedSymbol(stock.symbol)} className={`group grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b px-2 py-5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-banan-primary ${active ? 'border-banan-primary bg-banan-primary/5' : 'border-white/15 hover:border-white/50 hover:bg-white/[0.03]'}`}>
                                        <span className="min-w-0"><span className={`block text-lg font-black ${active ? 'text-banan-primary' : 'text-white'}`}>{stock.symbol}</span><span className="block truncate text-xs text-white/60">{stock.name}</span></span>
                                        <span className="text-right"><span className="inline-flex items-center justify-end gap-1 font-mono text-sm font-bold tabular-nums text-white">{formatNumber(stock.current_price)} <Banana className="h-3.5 w-3.5 shrink-0 text-banan-primary" aria-label="bananes" /></span><span className={`block font-mono text-xs tabular-nums ${up ? 'text-lime-400' : 'text-rose-400'}`}>{up ? '+' : ''}{stock.change_24h.toFixed(2)}%</span></span>
                                    </button>
                                );
                            })}
                        </div>
                        <Link to="/clicker" className="mt-6 inline-flex items-center gap-2 font-mono text-sm font-bold text-banan-primary underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-banan-primary">Ouvrir le jeu <ArrowUpRight size={16} aria-hidden="true" /></Link>
                    </div>
                </div>
            )}
        </ShowcaseSection>
    );
}
