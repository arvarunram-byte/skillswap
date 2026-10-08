import { io } from 'socket.io-client';

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    // In production on Render or local port 3000, connects to current host
    const serverUrl = window.location.hostname === 'localhost' && window.location.port === '5173'
      ? 'http://localhost:3000'
      : window.location.origin;

    socketInstance = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Connected to SkillSwap Real-Time WebSocket Server:', socketInstance.id);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('Socket connection note (retrying):', err.message);
    });
  }
  return socketInstance;
}
