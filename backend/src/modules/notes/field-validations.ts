import * as z from 'zod';

const name = z.string().min(2).max(32);
const description = z.string().min(5).max(1024);
const content = z.string().min(5).max(1024);
const owner = z.string().min(5).max(64);

export {
    name as nameValidation,
    description as descriptionValidation,
    content as contentValidation,
    owner as ownerValidation,
};
