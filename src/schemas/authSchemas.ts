import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const passwordResetSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

export const inviteEmployeeSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid company email address'),
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name cannot exceed 80 characters'),
  department: z
    .string()
    .trim()
    .min(2, 'Department is required'),
  designation: z
    .string()
    .trim()
    .min(2, 'Job designation is required'),
  role: z.enum(['EMPLOYEE', 'ADMIN']).default('EMPLOYEE'),
});

export type InviteEmployeeFormData = z.infer<typeof inviteEmployeeSchema>;

