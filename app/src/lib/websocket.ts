/**
 * WebSocket Client Utilities
 * 
 * Provides WebSocket connection management and reconnection logic
 * for real-time generation progress updates.
 */

export interface ProgressEvent {
    event: 'step_complete' | 'stage_change' | 'generation_complete' | 'error';
    job_id: string;
    timestamp: string;
    step?: number;
    total_steps?: number;
    progress?: number;
    elapsed?: number;
    eta?: number;
    stage?: string;
    message?: string;
    success?: boolean;
    [key: string]: any;
}

export type ProgressCallback = (event: ProgressEvent) => void;

export class WebSocketClient {
    private ws: WebSocket | null = null;
    private callbacks: Set<ProgressCallback> = new Set();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private jobId: string;
    private url: string;

    constructor(jobId: string, apiUrl: string) {
        this.jobId = jobId;
        // Convert HTTP URL to WebSocket URL
        const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
        const baseUrl = apiUrl.replace(/^https?:\/\//, '');
        this.url = `${wsProtocol}://${baseUrl}/ws/progress/${jobId}`;
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);

                this.ws.onopen = () => {
                    console.log(`WebSocket connected for job ${this.jobId}`);
                    this.reconnectAttempts = 0;
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        if (event.data === 'pong') return; // Ignore pong responses

                        const data: ProgressEvent = JSON.parse(event.data);
                        this.callbacks.forEach(cb => cb(data));
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log('WebSocket closed');
                    this.attemptReconnect();
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    private attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

        console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

        setTimeout(() => {
            this.connect().catch(console.error);
        }, delay);
    }

    subscribe(callback: ProgressCallback): () => void {
        this.callbacks.add(callback);
        return () => this.callbacks.delete(callback);
    }

    sendPing() {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send('ping');
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.callbacks.clear();
    }
}

// Singleton manager for WebSocket connections
class WebSocketManager {
    private connections = new Map<string, WebSocketClient>();

    getConnection(jobId: string, apiUrl: string): WebSocketClient {
        if (!this.connections.has(jobId)) {
            const client = new WebSocketClient(jobId, apiUrl);
            this.connections.set(jobId, client);
        }
        return this.connections.get(jobId)!;
    }

    removeConnection(jobId: string) {
        const client = this.connections.get(jobId);
        if (client) {
            client.disconnect();
            this.connections.delete(jobId);
        }
    }

    disconnectAll() {
        this.connections.forEach(client => client.disconnect());
        this.connections.clear();
    }
}

export const wsManager = new WebSocketManager();
