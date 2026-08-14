import { useEffect, useState } from 'react';

type Key = string | number | undefined;

/**
 * Plays a timed sequence of `length` beats each time `key` changes.
 *
 * Casino results arrive already resolved, so the animation is pure playback of
 * what the server decided. Returns the current beat, or -1 when idle/finished.
 *
 * The reset happens during render rather than in an effect: React re-renders
 * before committing, so a new result starts its sequence without the cascading
 * render an effect would cause.
 */
export function useSequence(key: Key, length: number, intervalMs: number) {
    const [run, setRun] = useState<{ key: Key; step: number }>({ key: undefined, step: -1 });

    if (key !== run.key) {
        setRun({ key, step: key === undefined || length <= 0 ? -1 : 0 });
    }

    const playing = run.step >= 0;

    useEffect(() => {
        if (!playing) return;
        const timer = setTimeout(() => {
            setRun((prev) => {
                if (prev.key !== key) return prev;
                const next = prev.step + 1;
                return { ...prev, step: next >= length ? -1 : next };
            });
        }, intervalMs);
        return () => clearTimeout(timer);
    }, [playing, run.step, key, length, intervalMs]);

    return { step: run.step, playing };
}

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
