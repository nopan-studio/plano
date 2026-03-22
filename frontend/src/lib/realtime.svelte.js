import { browser } from '$app/environment';

export const realtime = $state({
  connection: 'disconnected', // 'connected', 'connecting', 'disconnected'
  lastEvent: null
});

let source = null;
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
 * Initialize the EventSource connection to the server.
 */
export function initRealtime() {
  if (!browser || source) return;
  
  console.log('📡 Initializing Real-time Events...');
  source = new EventSource('/api/events');
  realtime.connection = 'connecting';

  source.onopen = () => {
    realtime.connection = 'connected';
    console.log('✅ SSE Connected');
  };

  source.onmessage = (e) => {
    try {
      const event = JSON.parse(e.data);
      console.log('🔗 Event Received:', event.type, event.data);
      realtime.lastEvent = event;
      handlers.forEach(h => h(event));
    } catch (err) {
      if (e.data === ': heartbeat') return;
      console.error('SSE JSON Error:', err, e.data);
    }
  };

  source.onerror = () => {
    realtime.connection = 'disconnected';
    console.warn('⚠️ SSE Disconnected, retrying...');
  };
}

/**
 * Close the realtime connection.
 */
export function closeRealtime() {
  if (source) {
    source.close();
    source = null;
    realtime.connection = 'disconnected';
  }
}
