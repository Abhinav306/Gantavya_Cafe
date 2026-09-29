import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export function useWebSocket(onOrderUpdate) {
  const clientRef = useRef(null);
  const callbackRef = useRef(onOrderUpdate);

  useEffect(() => {
    callbackRef.current = onOrderUpdate;
  }, [onOrderUpdate]);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 4000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        client.subscribe('/topic/orders', (message) => {
          try {
            const order = JSON.parse(message.body);
            if (callbackRef.current) {
              callbackRef.current(order);
            }
          } catch (err) {
            console.error('Error parsing order message from WebSocket:', err);
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP broker error:', frame.headers['message']);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, []);
}
