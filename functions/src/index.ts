import * as functions from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { checkRateLimit } from './rate-limits/limiter';
import { createCloudinarySignature } from './cloudinary/signer';
import { processVoteTransaction } from './votes/voteHandlers';
import { processLikeToggle } from './likes/likeHandlers';
import { submitProjectServer, SubmitProjectInput } from './projects/projectHandlers';

// Initialize Firebase Admin SDK
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Endpoint: Get Cloudinary Signed Upload Signature
 * Enforces rate limiting and ensures CLOUDINARY_API_SECRET is never sent to frontend.
 */
export const getCloudinaryUploadSignature = functions.onCall(
  async (request) => {
    if (!request.auth) {
      throw new functions.HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Rate limit: Max 15 signatures per 5 minutes per user
    const rateCheck = await checkRateLimit(db, 'cloudinary_upload', request.auth.uid, {
      windowSeconds: 300,
      maxRequests: 15,
    });

    if (!rateCheck.isAllowed) {
      throw new functions.HttpsError(
        'resource-exhausted',
        `Rate limit exceeded. Please wait ${rateCheck.retryAfterSeconds}s before uploading again.`
      );
    }

    const folder = (request.data as any)?.folder || 'project_hub/general';
    const timestamp = Math.round(Date.now() / 1000);
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'dev_secret_fallback';

    const signature = createCloudinarySignature({
      folder,
      timestamp,
      apiSecret,
    });

    return {
      signature,
      timestamp,
      folder,
      apiKey: process.env.CLOUDINARY_API_KEY || '123456789012345',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'demo-company',
    };
  }
);

/**
 * Endpoint: Cast Vote (Atomic Good vs Needs Improvement)
 * Strictly verifies identity, prevents self-voting, and computes accurate distribution.
 */
export const castVote = functions.onCall(
  async (request) => {
    if (!request.auth) {
      throw new functions.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { projectId, choice } = (request.data as any) || {};
    if (!projectId || !['GOOD', 'NEEDS_IMPROVEMENT'].includes(choice)) {
      throw new functions.HttpsError('invalid-argument', 'Invalid project ID or vote choice');
    }

    // Rate limit: 30 vote operations per minute
    const rateCheck = await checkRateLimit(db, 'vote', request.auth.uid, {
      windowSeconds: 60,
      maxRequests: 30,
    });

    if (!rateCheck.isAllowed) {
      throw new functions.HttpsError(
        'resource-exhausted',
        'Voting rate limit reached. Please wait a moment.'
      );
    }

    try {
      const result = await processVoteTransaction(db, {
        projectId,
        callerUid: request.auth.uid,
        choice,
      });
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Vote transaction failed';
      throw new functions.HttpsError('failed-precondition', msg);
    }
  }
);

/**
 * Endpoint: Toggle Like (Atomic)
 */
export const toggleLike = functions.onCall(
  async (request) => {
    if (!request.auth) {
      throw new functions.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { projectId } = (request.data as any) || {};
    if (!projectId) {
      throw new functions.HttpsError('invalid-argument', 'Project ID is required');
    }

    // Rate limit: 30 likes per minute
    const rateCheck = await checkRateLimit(db, 'like', request.auth.uid, {
      windowSeconds: 60,
      maxRequests: 30,
    });

    if (!rateCheck.isAllowed) {
      throw new functions.HttpsError(
        'resource-exhausted',
        'Like rate limit reached. Please slow down.'
      );
    }

    try {
      const result = await processLikeToggle(db, projectId, request.auth.uid);
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Like toggle failed';
      throw new functions.HttpsError('failed-precondition', msg);
    }
  }
);

/**
 * Endpoint: Server-authoritative Project Submission
 */
export const submitProject = functions.onCall(
  async (request) => {
    if (!request.auth) {
      throw new functions.HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Rate limit: 5 submissions per hour
    const rateCheck = await checkRateLimit(db, 'submit_project', request.auth.uid, {
      windowSeconds: 3600,
      maxRequests: 5,
    });

    if (!rateCheck.isAllowed) {
      throw new functions.HttpsError(
        'resource-exhausted',
        `Submission rate limit reached. Retry in ${rateCheck.retryAfterSeconds}s.`
      );
    }

    try {
      const result = await submitProjectServer(db, request.data as SubmitProjectInput, {
        uid: request.auth.uid,
        email: request.auth.token.email || '',
        name: request.auth.token.name,
      });
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      throw new functions.HttpsError('invalid-argument', msg);
    }
  }
);
