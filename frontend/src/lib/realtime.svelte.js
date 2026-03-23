import { browser } from '$app/environment';
import { io } from 'socket.io-client';

export const realtime = $state({
  connection: 'disconnected', // 'connected', 'connecting', 'disconnected'
  lastEvent: null
});

let socket = null;
const handlers = new Set();

/**
 * Register a callback to handle incoming realtime events.
 * Returns an unregister function.
 * @param {Function} fn 
 */
export function addRealtimeHandler(fn) {
  handlers.add(fn);
  return () => handlers.delete(fn);
}

/**
 * Initialize the Socket.IO connection to the server.
 */
export function initRealtime() {
  if (!browser || socket) return;
  
  console.log('📡 Initializing WebSocket Real-time Events...');
  realtime.connection = 'connecting';
  
  // Use current host for socket connection
  socket = io({
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity
  });

  socket.on('connect', () => {
    realtime.connection = 'connected';
    console.log('✅ WebSocket Connected');
  });

  socket.on('message', (event) => {
    console.log('🔗 Socket Event Received:', event.type, event.data);
    realtime.lastEvent = event;
    handlers.forEach(h => h(event));
  });

  socket.on('disconnect', (reason) => {
    realtime.connection = 'disconnected';
    console.warn('⚠️ WebSocket Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    realtime.connection = 'disconnected';
    console.error('❌ Socket Connection Error:', error);
  });
}

/**
 * Close the realtime connection.
 */
export function closeRealtime() {
  if (socket) {
    socket.close();
    socket = null;
    realtime.connection = 'disconnected';
  }
}
