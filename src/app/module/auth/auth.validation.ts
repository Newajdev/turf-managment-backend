import { z } from 'zod';

const registerPlayerSchema = z.object({
    body: z.object({
        name: z.string({ message: 'Name is required' }),
        email: z.string({ message: 'Email is required' }).email(),
        password: z.string({ message: 'Password is required' }).min(6),
        contactNumber: z.string({ message: 'Contact number is required' }),
        profilePhoto: z.string().optional(),
    }),
});

const createTurfOwnerSchema = z.object({
    body: z.object({
        name: z.string({ message: 'Name is required' }),
        email: z.string({ message: 'Email is required' }).email(),
        password: z.string({ message: 'Password is required' }).min(6),
        contactNumber: z.string({ message: 'Contact number is required' }),
        profilePhoto: z.string().optional(),
    }),
});

const loginSchema = z.object({
    body: z.object({
        email: z.string({ message: 'Email is required' }).email(),
        password: z.string({ message: 'Password is required' }),
    }),
});

export const AuthValidations = {
    registerPlayerSchema,
    createTurfOwnerSchema,
    loginSchema,
};
