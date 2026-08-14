type Msg = { type: string; data?: unknown; game?: string; message?: string };

const listeners = new Set<(m: Msg) => void>();

export const socketManager = {
    subscribe(fn: (m: Msg) => void) {
        listeners.add(fn);
    },
    unsubscribe(fn: (m: Msg) => void) {
        listeners.delete(fn);
    },
    send() {
        /* the lab drives results by hand */
    },
};

// The lab pushes server messages through this.
(window as unknown as { __emit: (m: Msg) => void }).__emit = (m: Msg) => {
    listeners.forEach((fn) => fn(m));
};
