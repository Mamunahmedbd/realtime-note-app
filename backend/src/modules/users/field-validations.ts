import * as z from 'zod';

const email = z.string().email();
const password = z.string().min(8).max(32);
const name = z.string().min(2).max(32);

export { email as emailValidation, password as passwordValidation, name as nameValidation };
