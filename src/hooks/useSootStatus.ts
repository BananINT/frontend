import { useEffect, useState } from 'react';
import { useGame } from '@app/context/GameContext';

/** A dud chamber costs five minutes of dead clicks. */
export const SOOT_DURATION_SECONDS = 300;

export interface SootStatus {
    /** True while clicks are neutralised and the casino tables are locked. */
    isSooty: boolean;
    /** Seconds left, smoothed locally between server sync ticks. */
    remaining: number;
    /** mm:ss, ready to render. */
    label: string;
    /** 0 → 1, share of the penalty already served. */
    progress: number;
}

export function formatCountdown(seconds: number): string {
    const safe = Math.max(0, Math.floor(seconds));
    const m = Math.floor(safe / 60);
    const s = safe % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * The soot timer is server-authoritative (it arrives on every sync payload),
 * but syncs can stutter, so we tick it down locally and re-anchor whenever the
 * server speaks. Anything that can be blocked by soot should read this rather
 * than gameState.sootRemaining directly.
 */
export function useSootStatus(): SootStatus {
    const { gameState } = useGame();
    const isSooty = !!gameState.isSooty;
    const serverRemaining = gameState.sootRemaining ?? 0;
    const [ticked, setTicked] = useState(serverRemaining);
    const [anchor, setAnchor] = useState(serverRemaining);

    // Re-anchor during render whenever the server reports a new value — the
    // sanctioned "adjust state while rendering" pattern, no extra effect pass.
    if (anchor !== serverRemaining) {
        setAnchor(serverRemaining);
        setTicked(serverRemaining);
    }

    // Local countdown so the number keeps moving even if a sync is late.
    useEffect(() => {
        if (!isSooty) return;
        const id = setInterval(() => setTicked(r => (r > 0 ? r - 1 : 0)), 1000);
        return () => clearInterval(id);
    }, [isSooty]);

    const remaining = isSooty ? ticked : 0;

    return {
        isSooty,
        remaining,
        label: formatCountdown(remaining),
        progress: isSooty
            ? Math.min(1, Math.max(0, 1 - remaining / SOOT_DURATION_SECONDS))
            : 1,
    };
}
