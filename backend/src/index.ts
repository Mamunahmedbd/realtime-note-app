import 'dotenv/config';
import express, { NextFunction, Request, Response, Router } from 'express';
import http from 'http';
import 'express-async-errors'; // This module monkey patches express to allow async error handling
import cors from 'cors';
import './tasks'; // Import the tasks to run the cron jobs
import { HttpError } from 'http-errors';
import { AuthRouter } from './modules/auth';
import { UserRouter } from './modules/users';
import cookieParser from 'cookie-parser';
import { config } from './config/dotenv';
import connectDB from './config/db';
import { NotesRouter } from './modules/notes';
import { Server } from 'socket.io';
import registerSocketHandlers from './socket/socketHandlers';
import socketAuth from './middlewares/socketAuth';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(express.json() as any);
app.use(cors({ origin: 'http://localhost:3000', credentials: true })); // You may want to restrict this to only the domains you trust in a production app
app.use(cookieParser());

// Connect to DB
connectDB();

const api = Router();

api.get('/', (req, res) => {
    res.json({ message: 'Hello World!' });
});

api.use('/auth', AuthRouter);
api.use('/users', UserRouter);
api.use('/notes', NotesRouter);

app.use('/api', api);

// Socket authentication middleware
// io.use(socketAuth);

// Register socket handlers
registerSocketHandlers(io);

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (!(err instanceof HttpError)) return void next(err);

    res.statusCode = err.statusCode;
    res.json({ message: err.message });
});

server.listen(config.port, () => {
    console.log(`App listening on port ${config.port}`);
});
