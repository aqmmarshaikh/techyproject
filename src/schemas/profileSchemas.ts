import { z } from 'zod';

export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Display name must be at least 2 characters')
    .max(80, 'Display name cannot exceed 80 characters'),
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name cannot exceed 50 characters')
    .optional()
    .or(z.literal('')),
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
    .optional()
    .or(z.literal('')),
  customAvatarUrl: z
    .string()
    .optional()
    .or(z.literal('')),
  googlePhotoUrl: z
    .string()
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
