import { z } from 'zod';

export const categorySchema = z.object({
  id: z
    .string()
    .trim()
    .min(2, 'Category slug must be at least 2 characters')
    .max(50, 'Category slug cannot exceed 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lower-case alphanumeric with hyphens'),
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name cannot exceed 60 characters'),
  description: z
    .string()
    .trim()
    .min(5, 'Description must be at least 5 characters')
    .max(300, 'Description cannot exceed 300 characters'),
  icon: z.string().trim().optional(),
  isActive: z.boolean().default(true),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export const reportSubmissionSchema = z.object({
  projectId: z.string().min(1),
  projectTitle: z.string().min(1),
  reason: z.enum([
    'SPAM',
    'MISLEADING',
    'INAPPROPRIATE',
    'BROKEN_LINK',
    'IP_CONCERN',
    'OTHER',
  ], {
    errorMap: () => ({ message: 'Please select a valid report reason' }),
  }),
  details: z
    .string()
    .trim()
    .min(10, 'Please provide details describing the concern (minimum 10 characters)')
    .max(500, 'Details cannot exceed 500 characters'),
});

export type ReportSubmissionFormData = z.infer<typeof reportSubmissionSchema>;

export const systemSettingsSchema = z.object({
  companyDomain: z.string().trim().default(''),
  registrationPolicy: z.enum(['INVITE_ONLY', 'RESTRICTED_DOMAIN', 'OPEN_REGISTRATION']),
  arenaMinVoteThreshold: z.number().int().min(1).max(100).default(10),
  maxCoverImageSizeBytes: z.number().int().min(1048576).max(20971520), // 1MB - 20MB
  maxScreenshotsPerProject: z.number().int().min(1).max(10).default(6),
  trendingWindowDays: z.number().int().min(1).max(90).default(7),
});

export type SystemSettingsFormData = z.infer<typeof systemSettingsSchema>;

