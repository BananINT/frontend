import { useEffect, useState } from 'react';

type Key = string | number | undefined;

/**
 * Stays `true` for `durationMs` after `key` changes — for one-shot spins and
 * reel blurs that have no per-step state of their own.
 */
export function useBeat(key: Key, durationMs: number) {
    const [run, setRun] = useState<{ key: Key; active: boolean }>({ key: undefined, active: false });

    if (key !== run.key) {
        setRun({ key, active: key !== undefined });
    }

    useEffect(() => {
        if (!run.active) return;
        const timer = setTimeout(() => {
            setRun((prev) => (prev.key === key ? { ...prev, active: false } : prev));
        }, durationMs);
        return () => clearTimeout(timer);
    }, [run.active, key, durationMs]);

    return run.active;
}

/**
 * Returns a value that resets to `initial` whenever `key` changes — used for
 * per-round UI state such as scratched cells or held cards.
 */
export function useResettable<T>(key: Key, initial: T) {
    const [run, setRun] = useState<{ key: Key; value: T }>({ key, value: initial });

    if (key !== run.key) {
        setRun({ key, value: initial });
    }

    const set = (value: T) => setRun((prev) => ({ ...prev, value }));
    const update = (fn: (previous: T) => T) => setRun((prev) => ({ ...prev, value: fn(prev.value) }));

    return [run.value, set, update] as const;
}
