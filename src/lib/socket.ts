type WebSocketMessage = {
    type: string;
    data: any;
};

class WebSocketManager {
    private socket: WebSocket | null = null;
    private url: string;
    private listeners = new Set<(message: WebSocketMessage) => void>();
    private reconnectInterval = 3000;
    private connectResolvers: (() => void)[] = [];
    private currentToken: string | null = null;
    private currentUserId: string | null = null;
    private sequenceIdx = 0;

    constructor() {
        const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        this.url = `${proto}//${window.location.host}/api/ws`;
    }

    setToken(token: string | null) {
        this.currentToken = token;
    }

    connect(userId: string) {
        if (this.currentUserId === userId && this.socket) {
            if (this.socket.readyState === WebSocket.OPEN) this.resolveWaiters();
            if (this.socket.readyState !== WebSocket.CLOSED) return;
        }

        this.currentUserId = userId;
        this.sequenceIdx = 0; // Reset sequence on new connection
        this.disconnect(true);

        const wsUrl = `${this.url}/${userId}`;
        const protocols: string[] = ['bananint'];
        
        if (this.currentToken) {
            protocols.push(`bearer.${btoa(this.currentToken).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')}`);
        }

        const socket = new WebSocket(wsUrl, protocols);
        this.socket = socket;

        console.log('[WS] Connecting:', wsUrl);

        socket.onopen = () => {
            if (socket !== this.socket) return;
            console.log('[WS] Connected');
            this.resolveWaiters();
        };

        socket.onmessage = (event) => {
            if (socket !== this.socket) return;
            try {
                const message: WebSocketMessage = JSON.parse(event.data);
                if (message.type === 'ping') {
                    socket.send(JSON.stringify({ type: 'pong' }));
                } else {
                    this.listeners.forEach(listener => listener(message));
                }
            } catch (e) {
                console.error('[WS] Failed to parse message', e);
            }
        };

        socket.onclose = (event) => {
            if (socket !== this.socket) return;
            console.log(`[WS] Closed (code: ${event.code})`);
            this.socket = null;

            if (event.code === 4003 || event.code === 4001) {
                console.error('[WS] Fatal close (Duplicate/Auth) — not reconnecting.');
                return;
            }

            console.log(`[WS] Reconnecting in ${this.reconnectInterval}ms…`);
            setTimeout(() => {
                if (!this.socket && this.currentUserId) this.connect(this.currentUserId);
            }, this.reconnectInterval);
        };

        socket.onerror = (error) => {
            if (socket !== this.socket) return;
            console.error('[WS] Error:', error);
        };
    }

    disconnect(internal = false) {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        if (!internal) {
            this.connectResolvers = [];
            this.currentUserId = null;
            console.log('[WS] Disconnected by caller.');
        }
    }

    private resolveWaiters() {
        this.connectResolvers.forEach(resolve => resolve());
        this.connectResolvers = [];
    }

    waitForConnection(): Promise<void> {
        if (this.socket?.readyState === WebSocket.OPEN) return Promise.resolve();
        return new Promise(resolve => this.connectResolvers.push(resolve));
    }

    send(type: string, data: any) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.sequenceIdx++;
            this.socket.send(JSON.stringify({ type, seq: this.sequenceIdx, ...data }));
        } else {
            console.warn('[WS] Socket not open, dropping message:', type);
        }
    }

    subscribe(listener: (message: WebSocketMessage) => void) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    unsubscribe(listener: (message: WebSocketMessage) => void) {
        this.listeners.delete(listener);
    }
}

export const socketManager = new WebSocketManager();
