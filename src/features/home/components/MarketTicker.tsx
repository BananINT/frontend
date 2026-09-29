import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, Zap, Banana, ChartCandlestick, Globe, Cpu, Database } from 'lucide-react';
import { api } from '@app/lib/api';
import ShowcaseSection from './ShowcaseSection';
import { formatNumber } from '@app/utils/format';

interface Stock {
    symbol: string;
    name: string;
    description: string;
    current_price: number;
    change_24h: number;
    volatility: number;
    stock_type: string;
    history?: number[];
}

const Sparkline = ({ data, color, symbol }: { data: number[], color: string, symbol: string }) => {
    if (!data || data.length < 2) return (
        <div className="w-full h-12 flex items-center justify-center opacity-20">
            <Activity className="w-full h-4 animate-pulse text-white/30" />
        </div>
    );
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((val, i) => ({
        x: (i / (data.length - 1)) * 100,
        y: 100 - ((val - min) / range) * 100
    }));
    
    const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
    
    return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-12 overflow-visible">
            <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                d={pathData}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d={`${pathData} L 100,100 L 0,100 Z`}
                fill={`url(#gradient-${symbol})`}
                opacity="0.1"
            />
            <defs>
                <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>
        </svg>
    );
};


const StockCard = ({ stock }: { stock: Stock }) => {
    const isUp = stock.change_24h >= 0;
    const color = isUp ? 'var(--color-banan-green)' : 'var(--color-banan-red)';
    const [glitch, setGlitch] = useState(false);
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.95) {
                setGlitch(true);
                setTimeout(() => setGlitch(false), 200);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div 
            className={`relative group bg-white/5 border border-white/10 rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 ${glitch ? 'animate-pulse opacity-80' : ''}`}
        >
            {/* Background Noise Decor */}
            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                <Banana size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-mono text-lg font-bold text-white tracking-widest">{stock.symbol}</h3>
                            <span className="text-[10px] px-1.5 py-0.5 bg-banan-primary/10 text-banan-primary border border-banan-primary/20 rounded font-mono uppercase">
                                {stock.stock_type}
                            </span>
                        </div>
                        <p className="text-xs text-white/50 font-medium truncate max-w-[150px]">{stock.name}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-black text-white font-mono leading-none mb-1">
                            {formatNumber(stock.current_price)}
                        </div>
                        <div className={`text-xs font-bold font-mono ${isUp ? 'text-banan-green' : 'text-banan-red'}`}>
                            {isUp ? '+' : ''}{stock.change_24h.toFixed(2)}%
                        </div>
                    </div>
                </div>

                <div className="mt-6 mb-4">
                    <Sparkline data={stock.history || []} color={color} symbol={stock.symbol} />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-white/30">
                        <Activity size={14} className="text-banan-primary/50" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Vol: {stock.volatility.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/30 justify-end">
                        <ShieldCheck size={14} className="text-banan-teal/50" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em]">{isUp ? "Stable" : "Critique"}</span>
                    </div>
                </div>
            </div>

            {/* Scanning line animation */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.div 
                    initial={{ y: -100 }}
                    animate={{ y: 300 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
            </div>
        </motion.div>
    );
};

export default function MarketTicker() {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/market/stocks');
                const stocksData = res.data;

                // Limit to top 6 stocks for clean homepage look
                const limitedStocks = stocksData.slice(0, 6);

                // Fetch history for these stocks
                const withHistory = await Promise.all(limitedStocks.map(async (s: Stock) => {
                    try {
                        const hRes = await api.get(`/market/history/${s.symbol}?timeframe=1M`);
                        return {
                            ...s,
                            history: hRes.data.candles.slice(-15).map((c: { close: number }) => c.close)
                        };
                    } catch {
                        return { ...s, history: [] };
                    }
                }));

                setStocks(withHistory);
            } catch (err) {
                console.error("Failed to fetch market data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <ShowcaseSection 
            title="Stocks bananes" 
            icon={ChartCandlestick}
            className="relative"
        >
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none hidden 2xl:block">
                <div className="text-4xl font-black rotate-90 text-white/20 select-none tracking-[0.2em]">STONKS_67_MDR</div>
            </div>


            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-20 px-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-48 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <AnimatePresence mode="popLayout">
                        {stocks.map((stock) => (
                            <motion.div
                                key={stock.symbol}
                                initial={false}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                layout
                            >
                                <StockCard stock={stock} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <div className="flex flex-wrap justify-between items-center gap-6 mt-12 p-8 bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-banan-primary/20" />
                <div className="flex-1 min-w-[300px]">
                    <h4 className="flex items-center gap-2 font-mono text-white text-sm font-bold mb-3 uppercase tracking-wider">
                        <ShieldCheck size={16} className="text-banan-green" /> INTÉGRITÉ SYSTÈME : OPTIMALE
                    </h4>
                    <p className="text-white/40 text-xs leading-relaxed max-w-lg mb-6 font-mono">
                        Protocole de transaction chiffré de bout en bout. Synchronisation du registre distribué vérifiée. 
                        Toutes les opérations de marché sont signées cryptographiquement et sécurisées par le réseau K-Potassium.
                    </p>
                    <div className="flex flex-wrap gap-6 text-[10px] font-mono text-white/20">
                        <div className="flex items-center gap-2"><Cpu size={12} /> CHARGE_CYCLE: 12%</div>
                        <div className="flex items-center gap-2"><Database size={12} /> LATENCE_SYNC: 4ms</div>
                        <div className="flex items-center gap-2"><Globe size={12} /> NŒUDS_ACTIFS: 1,337</div>
                    </div>
                </div>
                
                <div className="p-1 px-1.5 bg-white/5 rounded-2xl border border-white/10 group-hover:border-banan-primary/30 transition-colors">
                    <div className="flex items-center gap-5 p-4 rounded-xl">
                        <div className="p-3 bg-white/5 rounded-xl text-white/20 group-hover:text-banan-primary group-hover:bg-banan-primary/10 transition-all">
                            <Zap size={24} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white/60 mb-1 font-mono uppercase tracking-widest">Flux Marché</div>
                            <div className="text-[10px] text-banan-teal font-mono uppercase animate-pulse">● REST API</div>
                        </div>
                    </div>
                </div>
            </div>
        </ShowcaseSection>
    );
}
