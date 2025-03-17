import * as z from 'zod';
import { emailValidation, passwordValidation, nameValidation } from './field-validations';
import { idValidation } from '../../utils';

export const userShowRequestSchema = z.strictObject({
    params: z.strictObject({
        id: idValidation,
    }),
});

export const userUpdateRequestSchema = z.strictObject({
    params: z.strictObject({
        id: idValidation,
    }),
    body: z.strictObject({
        email: emailValidation.optional(),
        password: passwordValidation.optional(),
        name: nameValidation.optional(),
    }),
});

export const userDestroyRequestSchema = userShowRequestSchema;

export type UserUpdatePayload = z.infer<typeof userUpdateRequestSchema>['body'];
