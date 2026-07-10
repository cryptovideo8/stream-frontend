// utils/socket.ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – TS types for socket.io-client version are slightly incompatible with named import
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/env';

let socket: any = null;

export const getSocket = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      withCredentials: false,
      path: '/socket.io',
      auth: { token },
    });

    socket.on('connect', () => {
      console.log('Socket connected with ID:', socket.id);
    });

    socket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error?.message || error);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', reason);
    });
  } else if (token) {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
  }
  return socket;
};

export const resetSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
