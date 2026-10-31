import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Activity, Banana, Skull } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@app/components/shared/Modal';
import { socketManager } from '@app/lib/socket';
import { formatNumber } from '@app/utils/format';
import { useGame } from '@app/context/GameContext';

interface FuturesPosition {
    id: string;
    symbol: string;
    direction: 'long' | 'short';
    leverage: number;
    shares: number;
    entry_price: number;
    margin: number;
    liquidation_price: number;
    status: string;
    realized_pnl: number;
    unrealized_pnl?: number;
    current_price?: number;
    opened_at: string | null;
    closed_at: string | null;
}

interface FuturesState {
    open_positions: FuturesPosition[];
    closed_positions: FuturesPosition[];
    allowed_leverages: number[];
    min_margin: number;
    fee_rate: number;
}

interface Stock {
    symbol: string;
    current_price: number;
}

interface FuturesModalProps {
    isOpen: boolean;
    onClose: () => void;
    stocks: Stock[];
}

export default function FuturesModal({ isOpen, onClose, stocks }: FuturesModalProps) {
    const { gameState } = useGame();
    const [futuresState, setFuturesState] = useState<FuturesState | null>(null);
    const [selectedSymbol, setSelectedSymbol] = useState('');
    const [direction, setDirection] = useState<'long' | 'short'>('long');
    const [leverage, setLeverage] = useState(2);
    const [marginInput, setMarginInput] = useState('');
    const [liquidationAlert, setLiquidationAlert] = useState<{ symbol: string; margin_lost: number } | null>(null);
    const [tab, setTab] = useState<'open' | 'trade' | 'history' | 'hacks'>('trade');

    // `stocks` changes on every market tick; only the first symbol matters here.
    const firstSymbol = stocks[0]?.symbol ?? '';

    useEffect(() => {
        if (isOpen) socketManager.send('get_futures_positions', {});
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && firstSymbol && !selectedSymbol) {
            const timer = setTimeout(() => setSelectedSymbol(firstSymbol), 0);
            return () => clearTimeout(timer);
        }
    }, [isOpen, firstSymbol, selectedSymbol]);

    useEffect(() => {
        const handleMessage = (message: { type: string; data: unknown }) => {
            if (message.type === 'futures_positions') {
                setFuturesState(message.data as FuturesState);
            } else if (message.type === 'futures_opened' || message.type === 'futures_closed') {
                socketManager.send('get_futures_positions', {});
            } else if (message.type === 'futures_liquidated') {
                setLiquidationAlert(message.data as { symbol: string; margin_lost: number });
                socketManager.send('get_futures_positions', {});
                setTimeout(() => setLiquidationAlert(null), 8000);
            }
        };

        socketManager.subscribe(handleMessage);
        return () => socketManager.unsubscribe(handleMessage);
    }, []);

    // Auto-refresh open positions every 10s for PnL updates
    useEffect(() => {
        if (!isOpen) return;
        const interval = setInterval(() => {
            socketManager.send('get_futures_positions', {});
        }, 10000);
        return () => clearInterval(interval);
    }, [isOpen]);

    const openPosition = useCallback(() => {
        const margin = parseInt(marginInput);
        if (!margin || margin <= 0 || !selectedSymbol) return;

        socketManager.send('open_futures', {
            symbol: selectedSymbol,
            direction,
            leverage,
            margin,
        });
        setMarginInput('');
    }, [selectedSymbol, direction, leverage, marginInput]);

    const closePosition = useCallback((positionId: string) => {
        socketManager.send('close_futures', { position_id: positionId });
    }, []);

    const selectedStock = stocks.find(s => s.symbol === selectedSymbol);
    const margin = parseInt(marginInput) || 0;
    const estimatedFee = Math.floor(margin * (futuresState?.fee_rate || 0.005));
    const effectiveMargin = margin - estimatedFee;
    const positionValue = effectiveMargin * leverage;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            borderColor="border-banan-market"
            title={<span className="flex items-center gap-2"><Activity className="h-5 w-5" /> BANANA FUTURES</span>}
        >
            {/* Liquidation Alert */}
            <AnimatePresence>
                {liquidationAlert && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-4 p-4 bg-red-900/50 border border-red-500 text-center"
                    >
                        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <div className="flex items-center gap-2 text-banan-red font-black text-xl mb-2 justify-center">
                            <AlertTriangle className="h-6 w-6" /> LIQUIDATION
                        </div>
                        <div className="text-sm font-mono text-white/70">
                            Position liquidée ({liquidationAlert.symbol})
                        </div>
                        <div className="text-sm font-mono text-banan-red mt-2 flex items-center justify-center gap-1">
                            Marge perdue: {formatNumber(liquidationAlert.margin_lost)} <Banana className="h-3 w-3" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tab Bar */}
            <div className="flex border-b border-white/10 mb-4">
                {(['trade', 'open', 'history', 'hacks'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`flex-1 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-colors
                            ${tab === t ? 'text-banan-primary border-b-2 border-banan-primary' : 'text-white/60 hover:text-white/90'}`}
                    >
                        {t === 'trade' ? 'Trader' : t === 'open' ? `Positions (${futuresState?.open_positions.length || 0})` : t === 'history' ? 'Historique' : 'Hacks'}
                    </button>
                ))}
            </div>

            {/* Trade Tab */}
            {tab === 'trade' && (
                <div className="space-y-4">
                    {/* Stock Selector */}
                    <div>
                        <div className="text-[11px] font-mono text-white/50 uppercase tracking-wider mb-2">Actif</div>
                        <div className="flex gap-2">
                            {stocks.map(s => (
                                <button
                                    key={s.symbol}
                                    onClick={() => setSelectedSymbol(s.symbol)}
                                    className={`flex-1 p-3 border text-center transition-all ${selectedSymbol === s.symbol
                                        ? 'border-banan-primary bg-banan-primary/10 text-banan-primary'
                                        : 'border-white/10 text-white/50 hover:border-white/30'
                                    }`}
                                >
                                    <div className="text-xs font-mono font-bold">{s.symbol}</div>
                                    <div className="text-[11px] font-mono mt-1 flex items-center justify-center gap-1">{formatNumber(s.current_price)} <Banana className="h-2 w-2" /></div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Direction */}
                    <div>
                        <div className="text-[11px] font-mono text-white/50 uppercase tracking-wider mb-2">Direction</div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setDirection('long')}
                                className={`p-3 border flex items-center justify-center gap-2 transition-all ${direction === 'long'
                                    ? 'border-green-500 bg-green-500/10 text-green-400'
                                    : 'border-white/10 text-white/60 hover:border-white/30'
                                }`}
                            >
                                <TrendingUp className="h-4 w-4" />
                                <span className="text-xs font-mono font-bold uppercase">Long</span>
                            </button>
                            <button
                                onClick={() => setDirection('short')}
                                className={`p-3 border flex items-center justify-center gap-2 transition-all ${direction === 'short'
                                    ? 'border-red-500 bg-red-500/10 text-red-400'
                                    : 'border-white/10 text-white/60 hover:border-white/30'
                                }`}
                            >
                                <TrendingDown className="h-4 w-4" />
                                <span className="text-xs font-mono font-bold uppercase">Short</span>
                            </button>
                        </div>
                    </div>

                    {/* Leverage */}
                    <div>
                        <div className="text-[11px] font-mono text-white/50 uppercase tracking-wider mb-2">Levier</div>
                        <div className="flex gap-2">
                            {(futuresState?.allowed_leverages || [2, 5, 10]).map(l => (
                                <button
                                    key={l}
                                    onClick={() => setLeverage(l)}
                                    className={`flex-1 py-3 border text-center text-sm font-mono font-bold transition-all ${leverage === l
                                        ? 'border-banan-primary bg-banan-primary/10 text-banan-primary'
                                        : 'border-white/10 text-white/60 hover:border-white/30'
                                    }`}
                                >
                                    x{l}
                                </button>
                            ))}
                        </div>
                        {leverage >= 10 && (
                            <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-red-400">
                                <AlertTriangle className="h-3 w-3" />
                                Risque de liquidation très élevé
                            </div>
                        )}
                    </div>

                    {/* Margin Input */}
                    <div>
                        <div className="text-[11px] font-mono text-white/50 uppercase tracking-wider mb-2">
                            <span className="flex items-center gap-1">Marge (Collatéral) — Disponible: {formatNumber(gameState.bananas)} <Banana className="h-3 w-3" /></span>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={marginInput}
                                onChange={e => setMarginInput(e.target.value)}
                                placeholder="Montant..."
                                min={futuresState?.min_margin || 100}
                                className="flex-1 bg-black border border-white/20 text-white px-3 py-2 text-sm font-mono focus:border-banan-primary focus:outline-none"
                            />
                            <button
                                onClick={() => setMarginInput(Math.floor(gameState.bananas * 0.25).toString())}
                                className="px-3 text-[11px] font-mono text-white/60 border border-white/10 hover:text-banan-primary hover:border-banan-primary transition-colors"
                            >
                                25%
                            </button>
                            <button
                                onClick={() => setMarginInput(Math.floor(gameState.bananas * 0.5).toString())}
                                className="px-3 text-[11px] font-mono text-white/60 border border-white/10 hover:text-banan-primary hover:border-banan-primary transition-colors"
                            >
                                50%
                            </button>
                        </div>
                    </div>

                    {/* Position Preview */}
                    {margin > 0 && selectedStock && (
                        <div className="border border-white/10 p-3 space-y-2 bg-white/5">
                            <div className="text-[11px] font-mono text-white/50 uppercase tracking-wider">Aperçu de la position</div>
                            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                <div className="flex justify-between">
                                    <span className="text-white/60">Valeur:</span>
                                    <span className="text-white">{formatNumber(positionValue)} 🍌</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/60">Parts:</span>
                                    <span className="text-white flex items-center gap-1">{formatNumber(positionValue)} <Banana className="h-2 w-2" /></span>
                                </div>
                                <div className="flex justify-between text-[11px] font-mono border-t border-white/5 pt-2">
                                    <span className="text-white/60">Frais (0.5%)</span>
                                    <span className="text-banan-red flex items-center gap-1">{formatNumber(estimatedFee)} <Banana className="h-2 w-2" /></span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/60">Liquidation:</span>
                                    <span className="text-red-400">
                                        ~{formatNumber(
                                            direction === 'long'
                                                ? Math.max(1, Math.floor(selectedStock.current_price * (1 - 1 / leverage)))
                                                : Math.floor(selectedStock.current_price * (1 + 1 / leverage))
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Open Position Button */}
                    <button
                        onClick={openPosition}
                        disabled={margin < (futuresState?.min_margin || 100) || margin > gameState.bananas || !selectedSymbol}
                        className={`w-full py-4 border font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all
                            disabled:opacity-30 disabled:cursor-not-allowed
                            ${direction === 'long'
                                ? 'border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                : 'border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            }`}
                    >
                        <Activity className="h-5 w-5" />
                        Ouvrir {direction.toUpperCase()} x{leverage} sur {selectedSymbol}
                    </button>
                </div>
            )}

            {/* Open Positions Tab */}
            {tab === 'open' && (
                <div className="space-y-3">
                    {!futuresState?.open_positions.length ? (
                        <div className="text-center text-white/60 text-xs font-mono uppercase py-8">
                            Aucune position ouverte
                        </div>
                    ) : (
                        futuresState.open_positions.map(p => (
                            <div key={p.id} className="border border-white/10 p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {p.direction === 'long'
                                            ? <TrendingUp className="h-4 w-4 text-green-400" />
                                            : <TrendingDown className="h-4 w-4 text-red-400" />
                                        }
                                        <span className="text-sm font-mono font-bold text-white">
                                            {p.symbol} {p.direction.toUpperCase()} x{p.leverage}
                                        </span>
                                    </div>
                                    <span className={`text-sm font-mono font-bold ${(p.unrealized_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        <span className="flex items-center gap-1">{(p.unrealized_pnl || 0) >= 0 ? '+' : ''}{formatNumber(p.unrealized_pnl || 0)} <Banana className="h-2 w-2" /></span>
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-white/60">
                                    <div>Entrée: {formatNumber(p.entry_price)}</div>
                                    <div>Actuel: {formatNumber(p.current_price || p.entry_price)}</div>
                                    <div className="text-red-400">Liq: {formatNumber(p.liquidation_price)}</div>
                                </div>
                                <button
                                    onClick={() => closePosition(p.id)}
                                    className="w-full py-2 bg-white/5 border border-white/10 text-xs font-mono font-bold uppercase text-white/70 hover:bg-banan-primary/10 hover:text-banan-primary hover:border-banan-primary transition-all"
                                >
                                    Fermer la position
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {tab === 'history' && (
                <div className="space-y-2">
                    {!futuresState?.closed_positions.length ? (
                        <div className="text-center text-white/60 text-xs font-mono uppercase py-8">
                            Aucun historique
                        </div>
                    ) : (
                        futuresState.closed_positions.map(p => (
                            <div key={p.id} className="flex items-center justify-between p-3 bg-white/5 text-xs font-mono">
                                <div className="flex items-center gap-2">
                                    {p.direction === 'long'
                                        ? <TrendingUp className="h-3 w-3 text-green-400/50" />
                                        : <TrendingDown className="h-3 w-3 text-red-400/50" />
                                    }
                                    <span className="text-white/50">{p.symbol} x{p.leverage}</span>
                                </div>
                                <span className={`font-bold ${p.status === 'liquidated' ? 'text-red-500' : p.realized_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {p.status === 'liquidated' ? <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3"/> LIQ</span> : <span className="flex items-center gap-1">{`${p.realized_pnl >= 0 ? '+' : ''}${formatNumber(p.realized_pnl)}`}<Banana className="h-2 w-2" /></span>}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Hacks Tab */}
            {tab === 'hacks' && (
                <div className="space-y-4">
                    <div className="border border-red-500/50 bg-red-900/10 p-4">
                        <div className="flex items-center gap-2 text-red-500 font-bold font-mono mb-2 uppercase text-sm">
                            <Skull className="h-5 w-5" /> DDoS / FUD Campaign
                        </div>
                        <p className="text-xs font-mono text-red-400/70 mb-4">
                            Déployez une ferme de bots surpuissante pour instiller la panique (FUD) et crasher le cours de l'actif sélectionné. Requis: 500,000 🍌
                        </p>
                        
                        <div className="flex gap-2 mb-4">
                            {stocks.map(s => (
                                <button
                                    key={s.symbol}
                                    onClick={() => setSelectedSymbol(s.symbol)}
                                    className={`flex-1 p-2 border text-center transition-all ${selectedSymbol === s.symbol
                                        ? 'border-red-500 bg-red-500/10 text-red-500'
                                        : 'border-white/10 text-white/50 hover:border-white/30'
                                    }`}
                                >
                                    <div className="text-xs font-mono font-bold">{s.symbol}</div>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => socketManager.send('market_manipulate', { symbol: selectedSymbol, type: 'crash' })}
                            disabled={gameState.bananas < 500000 || !selectedSymbol}
                            className="w-full py-3 bg-red-600 hover:bg-red-500 text-black font-black uppercase tracking-wider text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <AlertTriangle className="h-4 w-4" /> Crash {selectedSymbol} (-500k <Banana className="w-3 h-3"/>)
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
