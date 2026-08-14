/* eslint-disable react-refresh/only-export-components -- lab stub, not app code */
import type { ReactNode } from 'react';

const labParams = new URLSearchParams(window.location.search);

/** Stand-in for the real GameContext, for the layout lab only. */
export const gameState = {
    bananas: 12_500_000,
    // `?sooty=1` / `?noclan=1` switch the states the clan pages branch on.
    isSooty: labParams.has('sooty'),
    sootRemaining: labParams.has('sooty') ? 214 : 0,
    clan_id: labParams.has('noclan') ? null : 'clan-lab',
    userId: 'lab',
    username: 'lab',
    autoClickers: 250_000,
    clickValue: 12_000,
    taxRate: 0.1,
    totalDonated: 27_000_000_000,
};

export const useGame = () => ({
    gameState,
    setClanTaxRate: async () => {},
});

export const GameProvider = ({ children }: { children: ReactNode }) => <>{children}</>;
