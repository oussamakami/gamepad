import UserData from "./userModule";

type SocketMessage = Record<string, any>;

class SocketHandler {
    private readonly socketURL: string;
    private readonly user: UserData;

    private socket: WebSocket | null = null;
    private messageHandlers: Map<string, (data: any) => void> = new Map();

    private reconnectAttempts: number = 0;
    private readonly maxReconnectAttempts: number;
    private readonly reconnectDelay: number = 3000;
    private reconnectInterval: number | null = null;

    constructor(socketURL: string, user: UserData, maxReconnectAttemps = 5) {
        this.maxReconnectAttempts = maxReconnectAttemps;
        this.socketURL = socketURL;
        this.user = user;
    }

    public async connect(): Promise<void> {
        try {
            this.clearReconnectInterval();

            if (!await this.user.isAuthenticated()) {
                console.error("User not authenticated. Socket connection aborted.");
                this.socket?.close();
                return;
            }

            if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
                console.log("Socket already connected");
                return ;
            }

            this.socket = new WebSocket(this.socketURL);
            this.setupSocketEventHandlers();
        } catch (error) {
            console.error("Socket connection error:", error);
            this.scheduleReconnect();
        }
    }

    private setupSocketEventHandlers(): void {
        if (!this.socket) return;

        this.socket.onmessage = (event: MessageEvent) => {
            try {
                const data: SocketMessage = JSON.parse(event.data);

                if (data.type && this.messageHandlers.has(data.type))
                    this.messageHandlers.get(data.type)!(data);
            } catch (error) {
                console.error("Error processing message:", error);
            }
        };

        this.socket.onopen = (event: Event) => {
            console.log("Socket connected");
            this.reconnectAttempts = 0;
        };

        this.socket.onclose = () => {
            console.log("Socket disconnected");
            this.scheduleReconnect();
        };
    }

    private scheduleReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error(`Max reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`);
            return;
        }

        if (!this.reconnectInterval) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            
            this.reconnectInterval = window.setTimeout(async () => {
                if (!await this.user.isAuthenticated()) {
                    console.error("User not authenticated. Socket connection aborted.");
                    this.socket?.close();
                    this.clearReconnectInterval();
                    return;
                }
                this.connect();
            }, this.reconnectDelay);
        }
    }

    private clearReconnectInterval(): void {
        if (this.reconnectInterval)
            clearTimeout(this.reconnectInterval);
        this.reconnectInterval = null;
    }

    public send(message: SocketMessage): boolean {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error("Cannot send message - socket not connected");
            return false;
        }

        try {
            const jsonMessage = JSON.stringify(message);
            this.socket.send(jsonMessage);
            return true;
        } catch (error) {
            console.error("Error sending message:", error);
            return false;
        }
    }

    public addMessageHandler(messageType: string, handler: (data: any) => void): void {
        this.messageHandlers.set(messageType, handler);
    }

    public removeMessageHandler(messageType: string): void {
        this.messageHandlers.delete(messageType);
    }

    public disconnect(): void {
        this.clearReconnectInterval();
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    public get isConnected(): boolean {
        return this.socket?.readyState === WebSocket.OPEN;
    }
}

export default SocketHandler;