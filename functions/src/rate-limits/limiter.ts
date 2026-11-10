import * as admin from 'firebase-admin';

export interface RateLimitOptions {
  windowSeconds: number;
  maxRequests: number;
}

/**
 * Distributed Sliding-Window Rate Limiter using Firestore
 * Ensures limits are enforced across multi-instance serverless functions.
 */
export async function checkRateLimit(
  db: admin.firestore.Firestore,
  actionKey: string,
  entityId: string,
  options: RateLimitOptions
): Promise<{ isAllowed: boolean; retryAfterSeconds?: number }> {
  const docId = `${actionKey}_${entityId}`;
  const rateLimitRef = db.collection('rateLimits').doc(docId);
  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;
  const threshold = now - windowMs;

  return await db.runTransaction(async (tx) => {
    const snap = await tx.get(rateLimitRef);
    let timestamps: number[] = [];

    if (snap.exists) {
      const data = snap.data();
      timestamps = ((data?.timestamps as number[]) || []).filter((ts) => ts > threshold);
    }

    if (timestamps.length >= options.maxRequests) {
      const oldestInWindow = timestamps[0];
      const retryAfterSeconds = Math.ceil((oldestInWindow + windowMs - now) / 1000);
      return { isAllowed: false, retryAfterSeconds: Math.max(1, retryAfterSeconds) };
    }

    timestamps.push(now);
    tx.set(
      rateLimitRef,
      {
        action: actionKey,
        entityId,
        timestamps,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return { isAllowed: true };
  });
}

