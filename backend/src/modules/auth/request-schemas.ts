import * as z from 'zod';
import { passwordValidation, nameValidation, emailValidation } from '../users/field-validations';

export const userRegistrationRequestSchema = z.strictObject({
    body: z.strictObject({
        email: emailValidation,
        password: passwordValidation,
        name: nameValidation,
    }),
});

export const userLoginRequestSchema = z.strictObject({
    body: z.strictObject({
        email: emailValidation,
        password: passwordValidation,
    }),
});

export type UserRegistrationPayload = z.infer<typeof userRegistrationRequestSchema>['body'];
