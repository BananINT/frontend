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
    private isManuallyClosed: boolean = false;
    private connectResolvers: (() => void)[] = [];

    constructor() {
        // Construct WebSocket URL based on current window location
        const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

        this.url = `${proto}//${window.location.host}/api/websocket/ws`;
    }

    connect(sessionId: string) {
        this.isManuallyClosed = false;
        if (this.socket?.readyState === WebSocket.OPEN) {
            // Already connected, ensure we resolve pending waiters if any (though usually empty)
            this.resolveWaiters();
            return;
        }
        if (this.isConnecting) return;

        this.isConnecting = true;
        const wsUrl = `${this.url}/${sessionId}`;

        console.log('Connecting to WebSocket:', wsUrl);
        const socket = new WebSocket(wsUrl);
        this.socket = socket;

        socket.onopen = () => {
            if (this.socket !== socket) return;
            console.log('WebSocket connected');
            this.isConnecting = false;
            this.resolveWaiters();
        };

        socket.onmessage = (event) => {
            if (this.socket !== socket) return;
            try {
                const message: WebSocketMessage = JSON.parse(event.data);
                this.handleMessage(message);
            } catch (e) {
                console.error('Failed to parse WebSocket message', e);
            }
        };

        socket.onclose = () => {
            // Only old socket disconnecting message if mismatched
            if (this.socket !== socket) return;
            console.log('WebSocket disconnected');
            this.isConnecting = false;
            this.socket = null;
            // Auto reconnect if not manually closed
            if (!this.isManuallyClosed) {
                setTimeout(() => this.connect(sessionId), this.reconnectInterval);
            }
        };

        socket.onerror = (error) => {
            if (this.socket !== socket) return;
            console.error('WebSocket error:', error);
            this.isConnecting = false;
        };
    }

    disconnect() {
        this.isManuallyClosed = true;
        this.isConnecting = false;
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
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
