import { z } from 'zod';

export const sportTypeValidationSchema = z.object({
    title: z.string({ message: 'Title is required' }),
    icon: z.string({ message: 'Icon is required' }).url(),
});

export const updateSportTypeValidationSchema = z.object({
    title: z.string().optional(),
    icon: z.string().url().optional(),
});

export const SportTypeValidations = {
    sportTypeValidationSchema,
    updateSportTypeValidationSchema,
};
