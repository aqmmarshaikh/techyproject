import React, { useState } from 'react';
import { Crown } from 'lucide-react';
import { getUserDisplayName, getUserInitials, resolveUserAvatarUrl } from '../../utils/userDisplay';
import { UserProfile } from '../../types';

interface UserAvatarProps {
  user?: Partial<UserProfile> | { 
    id?: string;
    fullName?: string; 
    displayName?: string; 
    email?: string; 
    avatarUrl?: string; 
    customAvatarUrl?: string; 
    googlePhotoUrl?: string;
    creatorName?: string;
    creatorAvatarUrl?: string;
  } | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'podium-first' | 'podium-second' | 'podium-third';
  className?: string;
  showRankBadge?: number;
  showCrown?: boolean;
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl font-bold',
  'podium-first': 'w-20 h-20 sm:w-24 sm:h-24 text-xl sm:text-2xl font-bold',
  'podium-second': 'w-16 h-16 sm:w-20 sm:h-20 text-base sm:text-lg font-bold',
  'podium-third': 'w-16 h-16 sm:w-20 sm:h-20 text-base sm:text-lg font-bold',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  className = '',
  showRankBadge,
  showCrown = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const avatarUrl = resolveUserAvatarUrl(user);
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(displayName);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  const hasValidImage = Boolean(avatarUrl && !imageError);

  return (
    <div className="relative inline-flex items-center justify-center shrink-0 aspect-square">
      {/* Crown indicator for Rank #1 */}
      {showCrown && (
        <div className="absolute -top-6 sm:-top-7 inset-x-0 flex justify-center z-10 animate-bounce">
          <div className="p-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 shadow-sm backdrop-blur-sm">
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 fill-amber-300 drop-shadow" />
          </div>
        </div>
      )}

      {/* Main Avatar Circle */}
      <div
        className={`rounded-full overflow-hidden flex items-center justify-center shrink-0 aspect-square ${sizeClass} ${className}`}
      >
        {hasValidImage ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-full h-full object-cover object-center rounded-full aspect-square"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#FF3D88] via-[#8C1448] to-[#0F1B3D] text-white flex items-center justify-center font-heading font-bold select-none shadow-inner rounded-full aspect-square">
            <span>{initials}</span>
          </div>
        )}
      </div>

      {/* Rank Indicator Badge */}
      {typeof showRankBadge === 'number' && (
        <div
          className={`absolute -bottom-2 -right-1 sm:right-0 px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border shadow-md ${
            showRankBadge === 1
              ? 'bg-[#FF3D88] text-white border-white/40 shadow-[0_0_12px_rgba(255,61,136,0.5)]'
              : showRankBadge === 2
              ? 'bg-[#1C1F2E] text-slate-100 border-slate-500/50'
              : 'bg-white text-[#0F1B3D] border-slate-300'
          }`}
        >
          #{showRankBadge}
        </div>
      )}
    </div>
  );
};

