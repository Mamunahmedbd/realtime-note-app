import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/dotenv';

const socketAuth = (socket: Socket, next: (err?: Error) => void) => {
    console.log(socket);
    const token = socket.handshake.auth.token as string;
    if (!token) return next(new Error('Authentication error: No token provided'));

    try {
        const decoded = jwt.verify(token, config.jwtSecretAT) as any;
        socket.data.user = decoded.user;
        next();
    } catch (error) {
        console.error('JWT verification failed:', error);
        return next(new Error('Authentication error: Invalid token'));
    }
};

export default socketAuth;
