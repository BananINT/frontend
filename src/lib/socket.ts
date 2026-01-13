type WebSocketMessage = {
    type: string;
    data: any;
};

type WebSocketHandler = (data: any) => void;

class WebSocketManager {
    private socket: WebSocket | null = null;
    private url: string;
    private handlers: Map<string, WebSocketHandler[]> = new Map();
    private reconnectInterval: number = 3000;
    private isConnecting: boolean = false;
    private connectResolvers: (() => void)[] = [];

    constructor() {
        // Construct WebSocket URL based on current window location
        const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

        let host = window.location.host;

        // Handle Beta Basic Auth
        if (import.meta.env.VITE_PROD_BETA === 'true') {
            const user = import.meta.env.VITE_BASIC_AUTH_USER;
            const password = import.meta.env.VITE_BASIC_AUTH_PASSWORD;
            if (user && password) {
                host = `${user}:${password}@${host}`;
            }
        }

        this.url = `${proto}//${host}/api/websocket/ws`;
    }

    connect(sessionId: string) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            // Already connected, ensure we resolve pending waiters if any (though usually empty)
            this.resolveWaiters();
            return;
        }
        if (this.isConnecting) return;

        this.isConnecting = true;
        const wsUrl = `${this.url}/${sessionId}`;

        console.log('Connecting to WebSocket:', wsUrl);
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log('WebSocket connected');
            this.isConnecting = false;
            this.resolveWaiters();
        };

        this.socket.onmessage = (event) => {
            try {
                const message: WebSocketMessage = JSON.parse(event.data);
                this.handleMessage(message);
            } catch (e) {
                console.error('Failed to parse WebSocket message', e);
            }
        };

        this.socket.onclose = () => {
            console.log('WebSocket disconnected');
            this.isConnecting = false;
            this.socket = null;
            // Auto reconnect
            setTimeout(() => this.connect(sessionId), this.reconnectInterval);
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.isConnecting = false;
        };
    }

    private resolveWaiters() {
        this.connectResolvers.forEach(r => r());
        this.connectResolvers = [];
    }

    waitForConnection(): Promise<void> {
        if (this.socket?.readyState === WebSocket.OPEN) {
            return Promise.resolve();
        }
        return new Promise(resolve => {
            this.connectResolvers.push(resolve);
        });
    }

    send(type: string, data: any) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type, ...data }));
        } else {
            console.warn('Socket not open, processing send:', type);
            // Optionally queue? For now just warn.
        }
    }

    on(type: string, handler: WebSocketHandler) {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, []);
        }
        this.handlers.get(type)?.push(handler);
    }

    off(type: string, handler: WebSocketHandler) {
        const typeHandlers = this.handlers.get(type);
        if (typeHandlers) {
            this.handlers.set(type, typeHandlers.filter(h => h !== handler));
        }
    }

    private handleMessage(message: WebSocketMessage) {
        const typeHandlers = this.handlers.get(message.type);
        if (typeHandlers) {
            typeHandlers.forEach(handler => handler(message.data !== undefined ? message.data : message));
        }
    }
}

export const socketManager = new WebSocketManager();
