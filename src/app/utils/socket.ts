// utils/socket.ts
import { io } from 'socket.io-client';

let socket: any = null;

export const getSocket = () => {
  if (!socket) {
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
    console.log("Initializing socket connection to:", SOCKET_URL);
    
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: true,
      withCredentials: true,
      path: '/socket.io/',
    });

    // Add connection event listeners
    socket.on('connect', () => {
      console.log('Socket connected with ID:', socket.id);
    });

    socket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', reason);
    });
  }
  return socket;
};

