import { z } from 'zod';

export const projectStatuses = ['IN_DEVELOPMENT', 'LIVE', 'COMPLETED', 'ON_HOLD'] as const;

export const projectSubmissionSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),
  description: z
    .string()
    .min(50, 'Description must contain approximately 3-4 meaningful lines (at least 50 characters)')
    .max(1200, 'Description cannot exceed 1200 characters')
    .trim(),
  coverImageUrl: z
    .string()
    .url('Cover image must be a valid image URL')
    .min(1, 'Cover image is required'),
  screenshots: z
    .array(z.string().url('Each screenshot must be a valid URL'))
    .max(6, 'You can upload a maximum of 6 screenshots')
    .default([]),
  category: z
    .string()
    .min(1, 'Please select a project category'),
  technologies: z
    .array(z.string().trim().min(1, 'Technology tag cannot be empty'))
    .min(1, 'Please specify at least one technology tag')
    .max(15, 'Maximum of 15 technologies allowed'),
  projectStatus: z.enum(projectStatuses, {
    errorMap: () => ({ message: 'Please select a valid project status' }),
  }),
  liveWebsiteUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  githubRepoUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
}).superRefine((data, ctx) => {
  // Conditional validation: Live URL is required when project status is LIVE
  if (data.projectStatus === 'LIVE') {
    if (!data.liveWebsiteUrl || data.liveWebsiteUrl.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['liveWebsiteUrl'],
        message: 'A valid live website URL is required when project status is LIVE',
      });
    } else {
      try {
        new URL(data.liveWebsiteUrl);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['liveWebsiteUrl'],
          message: 'Please provide a valid URL format (e.g., https://myproject.com)',
        });
      }
    }
  } else if (data.liveWebsiteUrl && data.liveWebsiteUrl.trim().length > 0) {
    try {
      new URL(data.liveWebsiteUrl);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['liveWebsiteUrl'],
        message: 'Please provide a valid URL format (e.g., https://myproject.com)',
      });
    }
  }

  // Optional GitHub URL validation
  if (data.githubRepoUrl && data.githubRepoUrl.trim().length > 0) {
    try {
      new URL(data.githubRepoUrl);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['githubRepoUrl'],
        message: 'Please provide a valid repository URL (e.g., https://github.com/org/repo)',
      });
    }
  }
});

export type ProjectSubmissionFormData = z.infer<typeof projectSubmissionSchema>;

export const projectRevisionSchema = z.object({
  title: z.string().min(3).max(100).trim(),
  description: z.string().min(50).max(1200).trim(),
  coverImageUrl: z.string().url(),
  screenshots: z.array(z.string().url()).max(6).default([]),
  category: z.string().min(1),
  technologies: z.array(z.string().trim().min(1)).min(1).max(15),
  projectStatus: z.enum(projectStatuses),
  liveWebsiteUrl: z.string().trim().optional().or(z.literal('')),
  githubRepoUrl: z.string().trim().optional().or(z.literal('')),
  changeSummary: z
    .string()
    .min(10, 'Please describe what changes were made in this revision (minimum 10 characters)')
    .max(500, 'Change summary cannot exceed 500 characters')
    .trim(),
});

export type ProjectRevisionFormData = z.infer<typeof projectRevisionSchema>;

export const adminReviewSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT', 'CHANGES_REQUESTED']),
  reason: z.string().optional(),
  feedback: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.decision === 'REJECT' && (!data.reason || data.reason.trim().length < 10)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['reason'],
      message: 'Rejection requires a clear explanation (at least 10 characters)',
    });
  }
  if (data.decision === 'CHANGES_REQUESTED' && (!data.feedback || data.feedback.trim().length < 10)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['feedback'],
      message: 'Requested changes must include actionable feedback (at least 10 characters)',
    });
  }
});

export type AdminReviewFormData = z.infer<typeof adminReviewSchema>;

