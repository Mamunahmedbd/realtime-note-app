import passport from 'passport';
import { NextFunction, Request, Response } from 'express';
import { IUser } from 'src/models/User';
import jwt from 'jsonwebtoken';
import { RefreshTokenModel } from 'src/models/Auth';
import { config } from 'src/config/dotenv';

const passportCallback =
    (req: Request, res: Response, next: NextFunction, unauthorizedMessage = 'Unauthorized') =>
    (err: Error, user: IUser | null) => {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer Token

        if (!token) {
            return res.status(401).json({ message: unauthorizedMessage });
        }

        jwt.verify(token, config.jwtSecretAT, (err: any, data: any) => {
            if (err) return res.status(401).json({ message: 'Invalid Token' });
            req.user = data.user;
            next();
        });
    };

const local = (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;

    // If email or password is missing, send an error back to the client
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const unauthorizedMessage = 'Incorrect username or password';

    passport.authenticate('local', passportCallback(req, res, next, unauthorizedMessage))(
        req,
        res,
        next,
    );
};

const jwtToken = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('jwt', passportCallback(req, res, next))(req, res, next);
};

const jwtRefresh = (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }

    jwt.verify(refreshToken, config.jwtSecretRT, async (err: any, data: any) => {
        console.log({ err });
        if (err) return res.status(401).json({ message: 'Invalid Token' });
        const storeToken = await RefreshTokenModel.findOne({ userId: data.user.id });
        console.log({ storeToken });
        if (!storeToken) return res.status(401).json({ message: 'Invalid Token' });
        req.user = data.user;
        next();
    });
};

export const authMiddlewares = {
    local,
    jwt: jwtToken,
    'jwt-refresh': jwtRefresh,
};
export const authenticate = authMiddlewares.jwt; // alias
