import { z } from 'zod';

export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name cannot exceed 80 characters'),
  designation: z
    .string()
    .trim()
    .min(2, 'Job designation is required')
    .max(100, 'Designation cannot exceed 100 characters'),
  department: z
    .string()
    .trim()
    .min(2, 'Department is required')
    .max(80, 'Department cannot exceed 80 characters'),
  avatarUrl: z
    .string()
    .url('Avatar must be a valid URL')
    .optional()
    .or(z.literal('')),
  skills: z
    .array(z.string().trim().min(1))
    .max(20, 'You can add up to 20 skills')
    .default([]),
  technologies: z
    .array(z.string().trim().min(1))
    .max(20, 'You can add up to 20 technologies')
    .default([]),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

