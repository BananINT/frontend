import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { socketManager } from '@app/lib/socket';
import { useGame } from '@app/context/GameContext';
import { fireWinConfetti, fireJackpotConfetti } from '@app/utils/confetti';
import type { CasinoResult, CasinoResultBase, GambleState } from './types';
import { claimCasinoError, trackCasinoPending } from './casinoErrorClaims';

interface Options {
    /** Extra game keys whose results this page should also accept. */
    also?: string[];
    /** Fire confetti automatically when a result pays out. Default true. */
    confetti?: boolean;
    /**
     * Lets `play` fire again before the previous bet has come back, for tables
     * where several stakes can be in flight at once (plinko's multi-ball).
     * Such a table cannot show a meaningful `busy`, so it is never set.
     */
    concurrent?: boolean;
}

/**
 * Wires one casino table to the WebSocket.
 *
 * Every payout, multiplier and outcome comes from the server; this hook only
 * sends the player's choices and surfaces what comes back.
 */
export function useCasinoGame<R extends CasinoResultBase = CasinoResult>(
    game: string,
    { also = [], confetti = true, concurrent = false }: Options = {}
) {
    const { gameState } = useGame();
    const [result, setResult] = useState<R | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [gamble, setGamble] = useState<GambleState | null>(null);
    const [flashKey, setFlashKey] = useState(0);
    // Requests this table has sent and not yet heard back about. The socket's
    // catch-all 'error' carries no game key, so it only lands on the table
    // while one of its own requests is outstanding.
    const pendingRef = useRef(0);
    const markSent = useCallback(() => {
        pendingRef.current += 1;
        trackCasinoPending(1);
    }, []);
    const markSettled = useCallback(() => {
        if (pendingRef.current === 0) return;
        pendingRef.current -= 1;
        trackCasinoPending(-1);
    }, []);

    // Which game keys this page will render. `gamble` is always accepted since
    // the Double ou Rien bolt-on hangs off every table.
    const alsoKey = also.join(',');
    const accepted = useMemo(
        () => [game, 'gamble', ...(alsoKey ? alsoKey.split(',') : [])],
        [game, alsoKey]
    );

    useEffect(() => {
        const handle = (msg: { type: string; data?: unknown; game?: string; message?: string }) => {
            if (msg.type === 'casino_result') {
                const data = msg.data as R;
                if (!accepted.includes(data.game)) return;

                markSettled();
                setBusy(false);
                setError(null);
                setGamble((data.gamble as GambleState | null) ?? null);

                // The gamble bolt-on reports its own outcome; it must not
                // overwrite the table result the player is still looking at.
                if (data.game !== 'gamble' || game === 'gamble') setResult(data);

                const payout = Number(data.payout ?? 0);
                if (confetti && payout > 0 && payout > Number(data.bet ?? 0)) {
                    setFlashKey((k) => k + 1);
                    if (Number(data.global_jackpot_won ?? 0) > 0) fireJackpotConfetti();
                    else fireWinConfetti();
                }
            } else if (msg.type === 'casino_error') {
                if (msg.game && !accepted.includes(msg.game)) return;
                markSettled();
                setBusy(false);
                setError(msg.message ?? 'Erreur inconnue');
            } else if (msg.type === 'error') {
                // The socket's catch-all. Without this the table would sit on
                // "..." forever whenever a handler failed before it could reply.
                // Errors from unrelated actions elsewhere in the app are ignored.
                // A claimed frame keeps the global ERROR modal from showing it
                // a second time (see casinoErrorClaims).
                if (pendingRef.current === 0) return;
                claimCasinoError(msg);
                markSettled();
                setBusy(false);
                setError(msg.message ?? 'Erreur inconnue');
            }
        };

        socketManager.subscribe(handle);
        return () => socketManager.unsubscribe(handle);
    }, [game, confetti, accepted, markSettled]);

    // A table that unmounts mid-request will never hear back; release its
    // share so the global modal is not muted afterwards.
    useEffect(
        () => () => {
            trackCasinoPending(-pendingRef.current);
            pendingRef.current = 0;
        },
        []
    );

    const play = useCallback(
        (bet: number, params: Record<string, unknown> = {}) => {
            if (!concurrent && busy) return;
            if (!concurrent) setBusy(true);
            setError(null);
            markSent();
            socketManager.send('casino_play', { game, bet, params });
        },
        [game, busy, concurrent, markSent]
    );

    const act = useCallback(
        (action: string, params: Record<string, unknown> = {}, targetGame = game) => {
            setBusy(true);
            setError(null);
            markSent();
            socketManager.send('casino_action', { game: targetGame, action, params });
        },
        [game, markSent]
    );

    /** Silent variant used for crash polling, which must not toggle `busy`. */
    const poke = useCallback(
        (action: string, params: Record<string, unknown> = {}) => {
            socketManager.send('casino_action', { game, action, params });
        },
        [game]
    );

    const playGamble = useCallback(() => {
        setBusy(true);
        markSent();
        socketManager.send('casino_action', { game: 'gamble', action: 'play', params: {} });
    }, [markSent]);

    const reset = useCallback(() => {
        setResult(null);
        setError(null);
    }, []);

    /**
     * Turns down the Double ou Rien offer.
     *
     * The win is already in the player's balance — the pending amount is only
     * the stake they *may* risk — so declining costs nothing and needs no round
     * trip. The server drops its own copy when the offer times out.
     */
    const dismissGamble = useCallback(() => setGamble(null), []);

    return {
        gameState,
        result,
        error,
        busy,
        gamble,
        flashKey,
        play,
        act,
        poke,
        playGamble,
        dismissGamble,
        reset,
        setResult,
        setBusy,
    };
}

/** Subscribes to a read-only casino topic (`lobby`, `fairness`, `seed_crack`). */
export function useCasinoTopic<T extends { topic: string }>(topic: string, deps: unknown[] = []) {
    const [state, setState] = useState<T | null>(null);

    useEffect(() => {
        const handle = (msg: { type: string; data?: unknown }) => {
            if (msg.type !== 'casino_result') return;
            const data = msg.data as T;
            if (data?.topic === topic) setState(data);
        };

        socketManager.subscribe(handle);
        socketManager.send('casino_state', { topic });
        return () => socketManager.unsubscribe(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topic, ...deps]);

    const refresh = useCallback(() => socketManager.send('casino_state', { topic }), [topic]);

    return { state, setState, refresh };
}
