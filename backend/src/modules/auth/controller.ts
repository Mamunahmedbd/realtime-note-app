import { NextFunction, Request, Response } from 'express';
import { AuthService } from './service';
import { UsersService } from '../users';
import { BadRequestException } from '../../utils';
import User from 'src/models/User';
import { RtPayload } from 'src/models/Auth';

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        const { email, name, password } = req.body;

        const username =
            name.toLowerCase().replace(/\s+/g, '') + Math.random().toString(36).substring(2, 15);

        console.log({ req });
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new BadRequestException('User already exists');
        }

        const user = new User({ email, name, password, username });
        await user.save();

        res.json({ message: 'User created successfully' });
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        const { email, password } = req.body;
        // deselect password from user
        const user = await User.findOne({ email });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            throw new BadRequestException('Invalid password');
        }

        const { accessToken, refreshToken } = await AuthService.generateAuthTokens(user);

        const response = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            accessToken,
            refreshToken,
        };

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3000 * 1000, // 30 seconds
            sameSite: 'strict',
        });

        res.json(response);
    }

    static async me(req: Request, res: Response, next: NextFunction) {
        const user = req.user;

        res.json(user);
    }

    static async refresh(req: Request, res: Response, next: NextFunction) {
        const user = req.user!;
        const rtPayload: RtPayload = (req as any).jwtPayload;

        const { accessToken, refreshToken } = await AuthService.generateAuthTokens(user, rtPayload);

        const response = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            accessToken,
            refreshToken,
        };
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 300 * 1000, // 30 seconds
            sameSite: 'strict',
        });
        res.json(response);
    }

    static async logout(req: Request, res: Response, next: NextFunction) {
        await AuthService.revokeRefreshToken(req.user!.id);

        res.json({ message: 'Logged out' });
    }
}
