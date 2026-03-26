import { z } from 'zod';

export const sportTypeValidationSchema = z.object({
    title: z.string('Title is required' ),
});

export const updateSportTypeValidationSchema = z.object({
    title: z.string().optional(),
});

export const SportTypeValidations = {
    sportTypeValidationSchema,
    updateSportTypeValidationSchema,
};
