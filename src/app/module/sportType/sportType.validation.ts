import { z } from 'zod';

export const sportTypeValidationSchema = z.object({
    body: z.object({
        title: z.string('Title is required'),
        icon: z.string( 'Icon is required'),
    }),
});

export const updateSportTypeValidationSchema = z.object({
    body: z.object({
        title: z.string().optional(),
        icon: z.string().optional(),
    }),
});

export const SportTypeValidations = {
    sportTypeValidationSchema,
    updateSportTypeValidationSchema,
};
