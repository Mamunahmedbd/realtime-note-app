import * as z from 'zod';
import {
    contentValidation,
    descriptionValidation,
    nameValidation,
    ownerValidation,
} from './field-validations';
import { idValidation } from '../../utils';

export const noteIndexRequestSchema = z.strictObject({
    query: z
        .strictObject({
            userId: idValidation.optional(),
        })
        .optional(),
});

export const noteShowRequestSchema = z.strictObject({
    params: z.strictObject({
        id: z.string().min(1),
    }),
});

export const noteCreationRequestSchema = z.strictObject({
    body: z.strictObject({
        name: nameValidation,
        owner: ownerValidation,
        content: contentValidation,
    }),
});

export const noteUpdateRequestSchema = z.strictObject({
    params: z.strictObject({
        id: z.string().min(1),
    }),
    body: z.strictObject({
        name: nameValidation.optional(),
        description: descriptionValidation.optional(),
        content: contentValidation.optional(),
    }),
});

export const noteDestroyRequestSchema = z.strictObject({
    params: z.strictObject({
        id: z.string().min(1),
    }),
});

export type NoteCreatePayload = z.infer<typeof noteCreationRequestSchema>['body'];
export type NoteUpdatePayload = z.infer<typeof noteUpdateRequestSchema>['body'];
