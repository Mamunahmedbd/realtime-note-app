import { NextFunction, Request, Response } from 'express';
import { UsersService } from './service';
import { ForbiddenException, NotFoundException } from '../../utils';

export class UsersController {
    static async index(req: Request, res: Response, next: NextFunction) {
        const users = await UsersService.index();

        res.json(users);
    }

    static async show(req: Request, res: Response, next: NextFunction) {
        const id = +req.params.id;

        const user = await UsersService.show(id);

        res.json(user);
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        const id = +req.params.id;

        const payload = req.body;

        const user = await UsersService.update(id, payload);

        res.json(user);
    }

    static async destroy(req: Request, res: Response, next: NextFunction) {
        const id = +req.params.id;

        const isDeleted = await UsersService.destroy(id);

        if (!isDeleted) {
            throw new NotFoundException('User not found');
        }

        res.json({ message: 'User deleted' });
    }
}
