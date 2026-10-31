import { TIMEFRAMES, type ChartType } from './stockMeta';

interface ChartOverlayControlsProps {
    timeframe: string;
    onTimeframe: (tf: string) => void;
    chartType: ChartType;
    onChartType: (type: ChartType) => void;
}

/** Timeframe and chart-type toggles floating over the chart. */
export default function ChartOverlayControls({ timeframe, onTimeframe, chartType, onChartType }: ChartOverlayControlsProps) {
    return (
        <>
            {/* Timeframes Overlay */}
            <div className="absolute top-2 left-2 z-10 flex gap-2">
                <div className="flex bg-black/50 border border-white/10 rounded backdrop-blur-sm overflow-hidden">
                    {TIMEFRAMES.map(tf => (
                        <button
                            key={tf}
                            onClick={() => onTimeframe(tf)}
                            className={`px-3 py-1 text-[11px] font-mono font-bold transition-colors ${timeframe === tf ? 'text-banan-primary bg-white/10' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
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
                         onClick={() => onChartType('candle')}
                         className={`px-3 py-1 text-[11px] font-mono font-bold transition-colors ${chartType === 'candle' ? 'text-banan-primary bg-white/10' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                     >
                         CANDLES
                     </button>
                     <button
                         onClick={() => onChartType('area')}
                         className={`px-3 py-1 text-[11px] font-mono font-bold transition-colors ${chartType === 'area' ? 'text-banan-primary bg-white/10' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                     >
                         LINE
                     </button>
                </div>
            </div>
        </>
    );
}
