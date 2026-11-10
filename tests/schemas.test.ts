import { describe, it, expect } from 'vitest';
import { projectSubmissionSchema, adminReviewSchema } from '../src/schemas/projectSchemas';

describe('Zod Validation Schemas', () => {
  const validBaseProject = {
    title: 'Cloud Optimization Dashboard',
    description: 'This is a production-grade internal cloud infrastructure dashboard that monitors idle Kubernetes pods, computes cost savings, and provides one-click resource reclaiming.',
    coverImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    screenshots: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'],
    category: 'Cloud & Infrastructure',
    technologies: ['React', 'TypeScript', 'Kubernetes'],
    projectStatus: 'IN_DEVELOPMENT',
    liveWebsiteUrl: '',
    githubRepoUrl: 'https://github.com/company/cloud-dashboard',
  };

  it('validates a correct project submission', () => {
    const result = projectSubmissionSchema.safeParse(validBaseProject);
    expect(result.success).toBe(true);
  });

  it('rejects titles that are too short (<3 characters)', () => {
    const result = projectSubmissionSchema.safeParse({
      ...validBaseProject,
      title: 'AI',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least 3 characters');
    }
  });

  it('rejects descriptions that are too short (<2 lines / <25 characters)', () => {
    const result = projectSubmissionSchema.safeParse({
      ...validBaseProject,
      description: 'Short demo description.',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least 2 lines');
    }
  });

  it('accepts descriptions with 2 lines or at least 25 characters', () => {
    const result = projectSubmissionSchema.safeParse({
      ...validBaseProject,
      description: 'Internal project hub.\nBuilt for team innovations.',
    });
    expect(result.success).toBe(true);
  });

  it('strictly requires liveWebsiteUrl when projectStatus is LIVE', () => {
    const result = projectSubmissionSchema.safeParse({
      ...validBaseProject,
      projectStatus: 'LIVE',
      liveWebsiteUrl: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('liveWebsiteUrl'))).toBe(true);
    }
  });

  it('accepts LIVE status when a valid liveWebsiteUrl is provided', () => {
    const result = projectSubmissionSchema.safeParse({
      ...validBaseProject,
      projectStatus: 'LIVE',
      liveWebsiteUrl: 'https://cloud-optimizer.internal.company',
    });
    expect(result.success).toBe(true);
  });

  it('accepts client-compressed base64 data URLs for coverImageUrl and screenshots', () => {
    const base64Cover = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...';
    const base64Screenshot = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...';

    const result = projectSubmissionSchema.safeParse({
      ...validBaseProject,
      coverImageUrl: base64Cover,
      screenshots: [base64Screenshot],
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid cover image strings that are neither URL nor data:image/', () => {
    const result = projectSubmissionSchema.safeParse({
      ...validBaseProject,
      coverImageUrl: 'not-an-image-or-url',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('coverImageUrl'))).toBe(true);
    }
  });

  it('requires a mandatory reason when admin decision is REJECT', () => {
    const result = adminReviewSchema.safeParse({
      decision: 'REJECT',
      reason: '',
    });
    expect(result.success).toBe(false);
  });

  it('requires actionable feedback when admin decision is CHANGES_REQUESTED', () => {
    const result = adminReviewSchema.safeParse({
      decision: 'CHANGES_REQUESTED',
      feedback: 'Too short',
    });
    expect(result.success).toBe(false);

    const validResult = adminReviewSchema.safeParse({
      decision: 'CHANGES_REQUESTED',
      feedback: 'Please update the cover image to show the new production telemetry screen.',
    });
    expect(validResult.success).toBe(true);
  });
});

