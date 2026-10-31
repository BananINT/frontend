import { useEffect, type Dispatch, type SetStateAction } from 'react';
import type { RateLimitStatus } from '../types';

/** Full energy, no cooldown: what the lab assumes until /ai/config answers. */
export const INITIAL_RATE_LIMITS: RateLimitStatus = {
  cooldown_remaining_seconds: 0,
  is_in_flight: false,
  energy: {
    current: 100,
    max: 100,
    cost_normal: 10,
    cost_palantint: 100,
    recharge_rate_per_sec: 100 / 43200,
    recharge_seconds_total: 43200,
  },
};

/**
 * Ticks the server-reported prompt limits locally between reports: energy
 * recharges over 12 hours and the cooldown counts down in half seconds.
 */
export function useLabRateLimitTicks(
  cooldownSeconds: number,
  setRateLimits: Dispatch<SetStateAction<RateLimitStatus>>,
) {
  // Periodic Energy recharge simulation (12h recharge)
  useEffect(() => {
    const timer = setInterval(() => {
      setRateLimits((prev) => {
        if (!prev.energy) return prev;
        const rate = prev.energy.recharge_rate_per_sec || (100 / 43200);
        const nextVal = Math.min(prev.energy.max, prev.energy.current + rate * 0.5);
        if (nextVal === prev.energy.current) return prev;
        return {
          ...prev,
          energy: {
            ...prev.energy,
            current: nextVal,
          },
        };
      });
    }, 500);
    return () => clearInterval(timer);
  }, [setRateLimits]);

  // Handle Cooldown countdown
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setRateLimits((prev) => ({
        ...prev,
        cooldown_remaining_seconds: Math.max(0, prev.cooldown_remaining_seconds - 0.5),
      }));
    }, 500);
    return () => clearInterval(timer);
  }, [cooldownSeconds, setRateLimits]);
}
