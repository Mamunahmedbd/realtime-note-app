import * as argon2 from '@node-rs/argon2';
import { UserUpdatePayload } from './request-schemas';
import { capitalize, formatSqliteDate, NotFoundException } from '../../utils';
import { UserRegistrationPayload } from '../auth/request-schemas';
import User from 'src/models/User';

export const returningUserFields = [
    'id',
    'email',
    'firstName',
    'lastName',
    'role',
    'createdAt',
    'updatedAt',
];

class UsersService {
    async index() {
        const users = await User.find();
        return users;
    }

    async show(id: number) {
        const user = await User.findById(id);
        return user;
    }

    async store(payloadRaw: UserRegistrationPayload) {
        const user = await User.create(payloadRaw);

        return user;
    }

    async update(id: number, payloadRaw: UserUpdatePayload) {
        const payload = await this.prepareUserPayload(payloadRaw);

        await User.findByIdAndUpdate(id, payload);

        const updatedUserRaw = await User.findById(id);

        if (!updatedUserRaw) {
            throw new NotFoundException('User not found');
        }

        // const updatedUser = parseUser(updatedUserRaw);

        return updatedUserRaw;
    }

    // async destroy(id: number) {
    //     const deletedUsersCount = await Users().where({ id }).delete();

    //     return deletedUsersCount === 1;
    // }

    private async prepareUserPayload(payloadRaw: UserUpdatePayload, lang = 'en') {
        const email = (payloadRaw.email as string)?.toLocaleLowerCase(lang);

        const name = payloadRaw.name ? capitalize(payloadRaw.name, lang) : undefined;

        const password = payloadRaw.password;
        const hashedPassword = password ? await argon2.hash(password) : undefined;

        const userPayload = {
            email,
            name,
            hashedPassword,
        };

        Object.keys(userPayload).forEach((key) => {
            const _key = key as keyof typeof userPayload;
            if (userPayload[_key] == null) {
                delete userPayload[_key];
            }
        });

        return userPayload;
    }
}

const service = new UsersService();

export { service as UsersService };
