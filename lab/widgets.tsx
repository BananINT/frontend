import DoubleOrNothing from '../src/features/casino/components/DoubleOrNothing';

/**
 * Static renders of single components, with no timers or socket traffic, for
 * eyeballing layout. `?widget=<name>` — pair it with `&frame=<px>` so responsive
 * classes see a real viewport width rather than a narrow container.
 */
export const WIDGETS: Record<string, () => React.JSX.Element> = {
    gamble: () => (
        <div className="p-4 bg-banan-background min-h-screen">
            <DoubleOrNothing
                gamble={{ amount: 2000, chain: 1, max_chain: 5, expires_in: 600 }}
                onGamble={() => {}}
                onDecline={() => {}}
            />
        </div>
    ),
};
