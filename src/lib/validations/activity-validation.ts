// lib/validations/activity-validation.ts
import * as z from 'zod';

export const activityFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Activity title is required')
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  duration: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 1440),
      'Duration must be between 1 and 1440 minutes (24 hours)'
    ),
  category: z.enum([
    'play',
    'learning', 
    'exercise',
    'meal',
    'sleep',
    'medical',
    'social',
    'creative',
    'outdoor',
    'other'
  ]),
  recordedAt: z
    .string()
    .min(1, 'Date and time is required')
    .refine((date) => !isNaN(new Date(date).getTime()), 'Please enter a valid date and time')
    .refine((date) => new Date(date) <= new Date(), 'Date cannot be in the future'),
  childId: z.string().min(1, 'Child ID is required'),
  image: z.string().optional(),
});

export type ClientActivityFormValues = z.infer<typeof activityFormSchema>;