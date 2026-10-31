import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import type { ReactNode } from 'react';
import { socketManager } from '@app/lib/socket';
import { api } from '@app/lib/api';
import Modal from '@app/components/shared/Modal';
import BananLoader from '@app/components/shared/BananLoader';
import { useInterval } from '@app/hooks/useInterval';
import { useSocketMessage } from '@app/hooks/useSocketMessage';
import { isCasinoError } from '@app/features/casino/lib/casinoErrorClaims';
import {
  GAME_MESSAGE_TYPES,
  ackOldestSync,
  defaultGameState,
  parseGameMessage,
  reduceGameState,
  reduceUpgrades,
  unackedClicks,
  unseenMissions,
  type InFlightSync,
} from './gameReducer';

import type { GameState, Upgrade } from '@app/types/game';

interface GameStateValue {
  gameState: GameState;
  availableUpgrades: Upgrade[];
  isLoading: boolean;
}

interface GameActions {
  clickBanana: () => void;
  buyUpgrade: (upgradeId: string) => Promise<boolean>;
  changeName: (name: string) => void;
  claimMission: (missionId: string) => void;
  buyStock: (symbol: string, quantity: number, maxPrice?: number) => Promise<boolean>;
  sellStock: (symbol: string, quantity: number, minPrice?: number) => Promise<boolean>;
  buyTheme: (themeId: string) => Promise<boolean>;
  getMissions: () => void;
  setClanTaxRate: (rate: number) => Promise<void>;
}

type GameContextType = GameStateValue & GameActions;

// State and actions live in separate contexts: the actions object only changes
// when the player's id appears, so a component that only needs actions can
// read useGameActions() and skip every banana tick. useGame() returns both.
const GameStateContext = createContext<GameStateValue | undefined>(undefined);
const GameActionsContext = createContext<GameActions | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>(defaultGameState);
  const [availableUpgrades, setAvailableUpgrades] = useState<Upgrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);
  // Clicks not yet sent, and syncs sent but not yet answered. Their sum is
  // what the server's banana count does not include yet.
  const pendingClicks = useRef(0);
  const inFlightSyncs = useRef<InFlightSync[]>([]);
  const notifiedMissions = useRef<Set<string>>(new Set());

  const { authenticated, token, userId, loading: authLoading } = useAuth();

  // Signed out: stop the loader and let the UI decide what to show (e.g. a
  // login prompt). Adjusted during render rather than from the effect below.
  const signedOut = !authLoading && (!authenticated || !userId);
  if (signedOut && isLoading) setIsLoading(false);

  // Single effect that manages the WebSocket lifecycle.
  // Rules:
  //  - Wait until Keycloak has resolved (authLoading === false).
  //  - Set the token first so it's baked into the handshake subprotocol.
  //  - Call connect() exactly once per resolved auth state; the manager's
  //    generation counter absorbs any React Strict-Mode double-invoke.
  //  - Do NOT call disconnect() in the cleanup — GameProvider wraps the whole
  //    app and is never unmounted in production, so cleanup only fires during
  //    Strict-Mode's dev double-invoke and would tear down a healthy socket.
  const connectedRef = useRef(false);

  // Keep the manager's token current (initial login and Keycloak silent
  // refresh). Declared before the init effect so the token is set before the
  // first connect() in the same commit.
  useEffect(() => {
    if (!authLoading) socketManager.setToken(token);
  }, [token, authLoading]);

  // Token rotation alone must not re-init the game, so token is not a dep.
  useEffect(() => {
    if (authLoading) return;
    if (!authenticated || !userId) {
      socketManager.disconnect();
      return;
    }

    // Guard against Strict-Mode's deliberate double-fire.
    if (!connectedRef.current) {
      connectedRef.current = true;
      socketManager.connect(userId);
    }

    // Always send init_game once the socket opens.
    socketManager.waitForConnection().then(() => {
      socketManager.send('init_game', { userId: userId });
    });

    return () => {
      connectedRef.current = false;
    };
  }, [authLoading, authenticated, userId]);

  /** Sends a sync carrying the unsent clicks; they stay pending if the socket is down. */
  const sendSync = useCallback(() => {
    const clicks = pendingClicks.current;
    if (socketManager.send('sync', { pendingClicks: clicks })) {
      pendingClicks.current = 0;
      inFlightSyncs.current.push({ clicks, sentAt: Date.now() });
    }
  }, []);

  const handleError = (text: string) => {
    // If it's an auth error, don't show the modal, try to refresh instead
    if (text.toLowerCase().includes('auth failed') || text.toLowerCase().includes('token expired')) {
      console.log("Auth error detected in WebSocket, attempting refresh...");
      // AuthContext handles renewal via periodic sync and token change listeners,
      // so we just log it here.
      return;
    }
    setNotice({ title: 'ERROR', message: text });
  };

  // Socket Listeners: frames are checked by parseGameMessage and applied by the
  // pure reducers in gameReducer.ts; only the side effects live here.
  useSocketMessage<unknown>(GAME_MESSAGE_TYPES, (_data, raw) => {
    const msg = parseGameMessage(raw);
    if (!msg) return;

    switch (msg.type) {
      case 'init_success':
      case 'auth_success':
        // A fresh snapshot supersedes any sync still in flight.
        inFlightSyncs.current = [];
        setGameState(prev => reduceGameState(prev, msg));
        setAvailableUpgrades(prev => reduceUpgrades(prev, msg));

        // Also trigger an immediate sync to get latest portfolio/passive/etc
        sendSync();

        // Fetch initial market data via REST API as requested
        api.get('/market/stocks').then(res => {
          setGameState(prev => ({
            ...prev,
            marketData: res.data
          }));
        }).catch(err => console.error("Failed to fetch initial market data:", err));

        setIsLoading(false);
        return;

      case 'game_update': {
        // Every game_update answers the oldest sync still in flight.
        inFlightSyncs.current = ackOldestSync(inFlightSyncs.current, Date.now());
        const data = msg.data;
        if (!data) return;

        // Read now, at message time, not inside the updater.
        const unacked = unackedClicks(pendingClicks.current, inFlightSyncs.current);

        const newMissions = unseenMissions(data, notifiedMissions.current);
        if (newMissions.length > 0) {
          newMissions.forEach(id => notifiedMissions.current.add(id));
          // Trigger an immediate fetch of missions state to update the UI
          socketManager.send('get_missions', {});
        }

        setGameState(prev => reduceGameState(prev, msg, { unacked }));
        return;
      }

      case 'purchase_success':
        setAvailableUpgrades(prev => reduceUpgrades(prev, msg));
        if (msg.data.data) setGameState(prev => reduceGameState(prev, msg));
        return;

      case 'prestige_success':
        setAvailableUpgrades(prev => reduceUpgrades(prev, msg));
        setGameState(prev => reduceGameState(prev, msg));
        return;

      case 'mission_claimed':
        setNotice({
          title: 'MISSION RÉUSSIE',
          message: `MISSION RÉUSSIE ! +${msg.data.reward} 🍌`
        });
        return;

      case 'error':
        // A casino table shows its own errors; skip the global modal for those.
        // Checked on the raw frame: claims are keyed on the shared message object.
        if (isCasinoError(raw)) return;
        handleError(msg.message);
        return;

      default:
        setGameState(prev => reduceGameState(prev, msg));
    }
  });

  // Sync Interval: every tick carries the unsent clicks (or none, to pick up
  // passive income). Only runs for a loaded, signed-in player on a live socket.
  useInterval(() => {
    if (socketManager.isConnected()) sendSync();
  }, authenticated && !isLoading ? 1000 : null);

  const clickBanana = useCallback(() => {
    pendingClicks.current += 1;
    setGameState(prev => ({
      ...prev,
      bananas: prev.bananas + prev.clickValue,
      clickCount: prev.clickCount + 1
    }));
  }, []);

  const hasUserId = !!gameState.userId;
  const buyUpgrade = useCallback(async (upgradeId: string): Promise<boolean> => {
    if (!hasUserId) return false;
    socketManager.send('buy_upgrade', { upgradeId });
    return true;
  }, [hasUserId]);

  const changeName = useCallback((name: string) => {
    socketManager.send('change_name', { name });
  }, []);

  const claimMission = useCallback((missionId: string) => {
    socketManager.send('claim_mission', { missionId });
  }, []);

  const getMissions = useCallback(() => {
    socketManager.send('get_missions', {});
  }, []);

  // The clan tax lives on the clan_members row but drives every sync, so the
  // context owns it: the new rate lands in gameState before the next tick.
  const setClanTaxRate = useCallback(async (rate: number) => {
    const res = await api.post('/clan/tax/set', { tax_rate: rate });
    const applied = typeof res.data?.tax_rate === 'number' ? res.data.tax_rate : rate;
    setGameState(prev => ({ ...prev, taxRate: applied }));
    sendSync();
  }, [sendSync]);

  const buyStock = useCallback(async (symbol: string, quantity: number, maxPrice?: number): Promise<boolean> => {
    socketManager.send('buy_stock', { symbol, shares: quantity, maxPrice });
    return true;
  }, []);

  const sellStock = useCallback(async (symbol: string, quantity: number, minPrice?: number): Promise<boolean> => {
    socketManager.send('sell_stock', { symbol, shares: quantity, minPrice });
    return true;
  }, []);

  const buyTheme = useCallback(async (themeId: string) => {
    socketManager.send('buy_theme', { themeId });
    return true;
  }, []);

  const stateValue = useMemo<GameStateValue>(
    () => ({ gameState, availableUpgrades, isLoading }),
    [gameState, availableUpgrades, isLoading]
  );

  const actions = useMemo<GameActions>(() => ({
    clickBanana,
    buyUpgrade,
    changeName,
    claimMission,
    buyStock,
    sellStock,
    buyTheme,
    getMissions,
    setClanTaxRate
  }), [clickBanana, buyUpgrade, changeName, claimMission, buyStock, sellStock, buyTheme, getMissions, setClanTaxRate]);

  return (
    <GameActionsContext.Provider value={actions}>
    <GameStateContext.Provider value={stateValue}>
      {isLoading ? (
        <BananLoader message="IMPORTING_GAME..." />
      ) : (
        children
      )}
      <Modal
        isOpen={!!notice}
        onClose={() => setNotice(null)}
        title={notice?.title ?? 'ERROR'}
      >
        <p className="text-white text-lg font-mono">{notice?.message}</p>
      </Modal>
    </GameStateContext.Provider>
    </GameActionsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useGame = (): GameContextType => {
  const state = useContext(GameStateContext);
  const actions = useContext(GameActionsContext);
  if (!state || !actions) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return useMemo(() => ({ ...state, ...actions }), [state, actions]);
};

/** Actions only: does not re-render when the game state changes. */
// eslint-disable-next-line react-refresh/only-export-components
export const useGameActions = (): GameActions => {
  const actions = useContext(GameActionsContext);
  if (!actions) {
    throw new Error('useGameActions must be used within a GameProvider');
  }
  return actions;
};
