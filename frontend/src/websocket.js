/**
 * AMX Protocol – WebSocket Client Hook
 * Manages connection, reconnection, and event dispatching.
 */

import { useEffect, useRef, useCallback, useState } from 'react';

// BUGFIX: Improved WS_URL fallback logic to use REACT_APP_API_URL or REACT_APP_BACKEND_URL
const getWsUrl = () => {
  const apiUrl = process.env.REACT_APP_API_URL; // e.g. https://aegis-morpheme-x.onrender.com
  const backendUrl = process.env.REACT_APP_BACKEND_URL; // fallback

  const baseUrl = apiUrl || backendUrl;
  if (baseUrl) {
    const wsBase = baseUrl.replace(/^http/, 'ws');
    return `${wsBase}/ws`;
  }
  return process.env.REACT_APP_WS_URL || 'wss://aegis-morpheme-x.onrender.com/ws'; // BUGFIX: default to prod backend
};

const WS_URL = getWsUrl();
const RECONNECT_INTERVAL = 3000;
const MAX_RECONNECT = 5;  // BUGFIX: Reduced from 100 to 5 retries

// BUGFIX: Calculate exponential backoff delay (3s, 6s, 12s, 24s, 48s)
const getReconnectDelay = (attemptNumber) => {
  return Math.min(RECONNECT_INTERVAL * Math.pow(2, attemptNumber - 1), 48000);
};

export function useAMXWebSocket(onEvent) {
  const wsRef = useRef(null);
  const reconnectCount = useRef(0);
  const reconnectTimer = useRef(null);
  const [connected, setConnected] = useState(false);
  const onEventRef = useRef(onEvent);
  const isMounted = useRef(true); // BUGFIX: track mount status

  // Update onEvent ref when it changes
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  // BUGFIX: Track mount status for safe state updates
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const connect = useCallback(() => {
    try {
      if (!isMounted.current) return; // BUGFIX: don't connect if unmounted

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[AMX WS] Connected');
        if (isMounted.current) setConnected(true); // BUGFIX: safe state update
        reconnectCount.current = 0;

        // Start keepalive ping
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 25000);
        ws._pingInterval = pingInterval;
      };

      ws.onmessage = (event) => {
        if (!isMounted.current) return; // BUGFIX: don't process if unmounted
        try {
          const data = JSON.parse(event.data);
          if (data && data.type !== 'pong') { // BUGFIX: null check data
            onEventRef.current(data);
          }
        } catch (e) {
          console.warn('[AMX WS] Parse error:', e);
        }
      };

      ws.onclose = () => {
        console.log('[AMX WS] Disconnected');
        if (isMounted.current) setConnected(false); // BUGFIX: safe state update

        if (ws._pingInterval) clearInterval(ws._pingInterval);

        // BUGFIX: prevent multiple timers
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);

        if (isMounted.current && reconnectCount.current < MAX_RECONNECT) {
          reconnectCount.current += 1;
          // BUGFIX: Use exponential backoff for reconnect delays
          const delay = getReconnectDelay(reconnectCount.current);
          console.log(`[AMX WS] Reconnect attempt ${reconnectCount.current}/${MAX_RECONNECT} in ${delay / 1000}s`);
          reconnectTimer.current = setTimeout(connect, delay);
        } else if (isMounted.current && reconnectCount.current >= MAX_RECONNECT) {
          console.log('[AMX WS] Max reconnection attempts reached. Giving up.');
        }
      };

      ws.onerror = (err) => {
        console.error('[AMX WS] Error:', err);
        ws.close();
      };
    } catch (e) {
      console.error('[AMX WS] Failed to connect:', e);
      if (isMounted.current) setConnected(false);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      // BUGFIX: robust cleanup
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        if (wsRef.current._pingInterval) {
          clearInterval(wsRef.current._pingInterval);
        }
        wsRef.current.onclose = null; // BUGFIX: prevent close listener from firing reconnect
        wsRef.current.onerror = null;
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
