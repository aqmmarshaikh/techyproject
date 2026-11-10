/**
 * Recursively cleans an object by removing undefined keys before sending to Firestore.
 * Firestore rejects documents containing undefined fields.
 */
export function cleanFirestoreData<T extends Record<string, any>>(obj: T): T {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj) || obj instanceof Date) {
    return obj;
  }

  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date) && typeof (value as any).toMillis !== 'function') {
        result[key] = cleanFirestoreData(value);
      } else {
        result[key] = value;
      }
    }
  }

  return result as T;
}

