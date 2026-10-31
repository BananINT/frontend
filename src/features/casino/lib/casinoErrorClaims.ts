/**
 * Shared bookkeeping between casino tables and the global error modal.
 *
 * The socket's catch-all `{type: 'error'}` frame carries no game key, so both
 * the table that sent the request and the app-wide ERROR modal hear it. While
 * a casino request is outstanding the table shows the error itself, and the
 * modal should stay closed. Every listener receives the same parsed message
 * object, so a claim is recorded on that object and the answer does not depend
 * on which listener runs first.
 */

let pendingTotal = 0;
const claimed = new WeakSet<object>();

/** Records `delta` casino requests sent (positive) or settled (negative). */
export function trackCasinoPending(delta: number) {
    pendingTotal = Math.max(0, pendingTotal + delta);
}

/** Marks an error frame as handled by a casino table. */
export function claimCasinoError(message: object) {
    claimed.add(message);
}

/**
 * True when a casino table owns this error frame, either because a table has
 * already claimed it or because a casino request is still waiting for a reply.
 */
export function isCasinoError(message: object) {
    return claimed.has(message) || pendingTotal > 0;
}
