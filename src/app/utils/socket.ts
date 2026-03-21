// utils/socket.ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – TS types for socket.io-client version are slightly incompatible with named import
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/env';

let socket: any = null;

export const getSocket = () => {
  if (!socket) {
    console.log('Initializing socket connection to:', SOCKET_URL);

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
