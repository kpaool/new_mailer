
import { writable } from 'svelte/store';

interface WebSocketMessage {
  message: string;
}

interface WebSocketStore {
  subscribe: typeof store.subscribe;
  reconnect: () => WebSocket | null;
  send: (message: WebSocketMessage) => void;
}

const store = writable<WebSocket | null>(null);

export const websocketStore: WebSocketStore = (() => {
  const connect = (): WebSocket | null => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      store.set(ws);
    };

    ws.onmessage = (event: MessageEvent) => {
      const data: WebSocketMessage = JSON.parse(event.data);
      console.log('Received:', data);
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
      store.set(null);
    };

    return ws;
  };

  // Initialize WebSocket connection
  connect();

  return {
    subscribe: store.subscribe,
    reconnect: connect,
    send: (message: WebSocketMessage) => {
      store.update((ws) => {
        ws?.send(JSON.stringify(message));
        return ws;
      });
    }
  };
})();
