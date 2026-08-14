import type { ReactNode } from 'react';

interface ResultSlotProps {
    /** True while nothing is being announced, so the idle line is shown. */
    idle?: boolean;
    children: ReactNode;
}

/**
 * The fixed stage every table announces its outcome on.
 *
 * The card itself is absolutely positioned inside a slot of constant height:
 * a result arriving, changing or leaving never moves the stake panel below it,
 * which is what made the tables jump under the player's cursor. The idle line
 * keeps the reserved space from reading as a hole in the page.
 */
export default function ResultSlot({ idle = false, children }: ResultSlotProps) {
    return (
        <div className="relative h-28 md:h-32 shrink-0">
            {idle && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-white/15">
                        En attente
                    </span>
                </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">{children}</div>
        </div>
    );
}
