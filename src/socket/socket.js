import { io } from 'socket.io-client';

const socket = io('http://localhost:4000', {
    withCredentials: true,
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

export default socket;
