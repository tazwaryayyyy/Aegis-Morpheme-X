/**
 * AMX Protocol – WebSocket Client Hook
 * Manages connection, reconnection, and event dispatching.
 */

import { useEffect, useRef, useCallback, useState } from 'react';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';
const RECONNECT_INTERVAL = 3000;
const MAX_RECONNECT = 10;

export function useAMXWebSocket(onEvent) {
  const wsRef = useRef(null);
  const reconnectCount = useRef(0);
  const reconnectTimer = useRef(null);
  const [connected, setConnected] = useState(false);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[AMX WS] Connected');
        setConnected(true);
        reconnectCount.current = 0;
        // Start keepalive ping
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 25000);
        ws._pingInterval = pingInterval;
        wsRef.current._pingInterval = pingInterval;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type !== 'pong') {
            onEvent(data);
          }
        } catch (e) {
          console.warn('[AMX WS] Parse error:', e);
        }
      };

      ws.onclose = () => {
        console.log('[AMX WS] Disconnected');
        setConnected(false);
        clearInterval(ws._pingInterval);
        if (reconnectCount.current < MAX_RECONNECT) {
          reconnectCount.current += 1;
          reconnectTimer.current = setTimeout(connect, RECONNECT_INTERVAL);
        }
      };

      ws.onerror = (err) => {
        console.error('[AMX WS] Error:', err);
        ws.close();
      };
    } catch (e) {
      console.error('[AMX WS] Failed to connect:', e);
      setConnected(false);
    }
  }, [onEvent]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        // Clear ping interval
        if (wsRef.current._pingInterval) {
          clearInterval(wsRef.current._pingInterval);
        }
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);

  const send = useCallback((payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  return { connected, send };
}
