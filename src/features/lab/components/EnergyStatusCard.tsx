import { BatteryCharging } from 'lucide-react';
import type { RateLimitStatus } from '../types';

interface EnergyStatusCardProps {
  rateLimits?: RateLimitStatus;
  currentEnergy: number;
}

export function EnergyStatusCard({ currentEnergy, rateLimits }: EnergyStatusCardProps) {
  const energyPercent = Math.min(100, Math.max(0, currentEnergy));
  const rechargePerHour = rateLimits?.energy?.recharge_rate_per_sec
    ? (rateLimits.energy.recharge_rate_per_sec * 3600).toFixed(1)
    : '8.3';

  const statusColor =
    energyPercent < 15
      ? { text: 'text-red-400', bar: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' }
      : energyPercent < 50
      ? { text: 'text-amber-400', bar: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' }
      : { text: 'text-emerald-400', bar: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' };

  return (
    <div className="p-3 border-t border-white/10 bg-black/60 text-[11px] flex flex-col gap-2">
      {/* Noyau d'Énergie */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-white/80">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
            <BatteryCharging className="w-3.5 h-3.5 text-banan-primary" />
            <span>Noyau d&apos;Énergie</span>
            <span className="text-white/40 font-mono font-normal text-[9px] lowercase tracking-normal">
              (+{rechargePerHour}%/h)
            </span>
          </span>
          <span className={`font-mono font-black text-xs ${statusColor.text}`}>
            {Math.floor(energyPercent)}%
          </span>
        </div>

        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
          <div
            className={`h-full transition-all duration-500 rounded-full ${statusColor.bar}`}
            style={{ width: `${energyPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
