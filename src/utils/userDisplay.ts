import { UserProfile } from '../types';

/**
 * Priority 1: User-edited display name
 * Priority 2: Existing collected full name
 * Priority 3: Email-based fallback (first 5-6 chars, never full email)
 */
export function getUserDisplayName(
  user?: Partial<UserProfile> | { fullName?: string; displayName?: string; email?: string; creatorName?: string } | null
): string {
  if (!user) return 'Team Member';

  // Priority 1: User-edited display name
  const displayName = 'displayName' in user ? user.displayName?.trim() : undefined;
  if (displayName && displayName.length > 0) {
    return displayName;
  }

  // Priority 2: Existing collected name
  const fullName = user.fullName?.trim() || ('creatorName' in user ? user.creatorName?.trim() : undefined);
  if (fullName && fullName.length > 0) {
    return fullName;
  }

  // Priority 3: Email-based fallback (first 5-6 characters, never exposes full email)
  if (user.email && typeof user.email === 'string') {
    const localPart = user.email.split('@')[0]?.trim();
    if (localPart && localPart.length > 0) {
      if (localPart.length > 6) {
        return `${localPart.slice(0, 6)}...`;
      }
      return localPart;
    }
  }

  return 'Team Member';
}

/**
 * Generates clean 1-2 letter initials for branded fallback avatars.
 */
export function getUserInitials(nameOrEmail?: string): string {
  if (!nameOrEmail) return 'PH';
  const clean = nameOrEmail.trim().replace(/^@/, '');
  if (!clean) return 'PH';

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

/**
 * Resolves avatar image URL with three-tier priority:
 * 1. Custom uploaded profile picture
 * 2. Google account profile picture
 * 3. Undefined (triggers branded initials fallback)
 */
export function resolveUserAvatarUrl(
  user?: Partial<UserProfile> | { avatarUrl?: string; customAvatarUrl?: string; googlePhotoUrl?: string; creatorAvatarUrl?: string } | null
): string | undefined {
  if (!user) return undefined;

  // Priority 1: Custom uploaded profile photo
  if ('customAvatarUrl' in user && user.customAvatarUrl && user.customAvatarUrl.trim()) {
    return user.customAvatarUrl.trim();
  }

  // Priority 2: Avatar URL or Google account photo
  if (user.avatarUrl && user.avatarUrl.trim()) {
    return user.avatarUrl.trim();
  }

  if ('googlePhotoUrl' in user && user.googlePhotoUrl && user.googlePhotoUrl.trim()) {
    return user.googlePhotoUrl.trim();
  }

  if ('creatorAvatarUrl' in user && user.creatorAvatarUrl && user.creatorAvatarUrl.trim()) {
    return user.creatorAvatarUrl.trim();
  }

  return undefined;
}

