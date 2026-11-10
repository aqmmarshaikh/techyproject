import React from 'react';
import { Heart, Trophy, Sparkles, FolderGit2, ArrowRight } from 'lucide-react';
import { LeaderboardUser } from '../../services/leaderboardService';
import { UserAvatar } from './UserAvatar';

interface LeaderboardPodiumProps {
  users: LeaderboardUser[];
  isLoading?: boolean;
  onUserClick?: (user: LeaderboardUser) => void;
  onEmptyAction?: () => void;
}

export const LeaderboardPodium: React.FC<LeaderboardPodiumProps> = ({
  users,
  isLoading = false,
  onUserClick,
  onEmptyAction,
}) => {
  if (isLoading) {
    return (
      <div className="bg-[#0A1229] border border-white/15 rounded-3xl p-8 sm:p-10 text-center animate-pulse space-y-6">
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 rounded-full bg-white/10" />
          <div className="h-4 w-36 rounded bg-white/10" />
        </div>
        <div className="flex items-end justify-center gap-4 pt-8 h-64">
          <div className="w-24 sm:w-28 h-36 bg-white/5 rounded-2xl" />
          <div className="w-28 sm:w-36 h-48 bg-[#FF3D88]/20 rounded-2xl" />
          <div className="w-24 sm:w-28 h-28 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Zero users state
  if (!users || users.length === 0) {
    return (
      <div className="bg-[#0A1229] border border-white/15 rounded-3xl p-8 sm:p-10 text-center space-y-5 shadow-2xl relative overflow-hidden group">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF3D88]/20 to-transparent border border-[#FF3D88]/30 flex items-center justify-center mx-auto text-[#FF3D88]">
          <Trophy className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 max-w-sm mx-auto">
          <h3 className="font-heading font-bold text-xl text-white">
            Your team's first leaderboard starts here.
          </h3>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Start sharing projects and earning recognition from your team. Be the first to claim the top podium!
          </p>
        </div>
        {onEmptyAction && (
          <button
            onClick={onEmptyAction}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF3D88] hover:bg-[#E02D73] text-white font-sans text-xs font-semibold transition-all shadow-md group-hover:scale-105"
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Submit First Project</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  // Extract podium positions
  const first = users.find((u) => u.rank === 1) || users[0];
  const second = users.find((u) => u.rank === 2) || (users.length > 1 ? users[1] : null);
  const third = users.find((u) => u.rank === 3) || (users.length > 2 ? users[2] : null);

  return (
    <div className="bg-[#0A1229]/90 border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-sm">
      {/* Subtle top header label */}
      <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-white/10 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="font-decorative uppercase tracking-wider text-xs text-slate-300">
            TEAM RECOGNITION PODIUM
          </span>
        </div>
        <span className="text-[11px] font-sans text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FF3D88]" />
          <span>Top Contributors by Likes</span>
        </span>
      </div>

      {/* Podium Platform Area */}
      <div className="flex items-end justify-center gap-2.5 sm:gap-4 md:gap-5 pt-8 sm:pt-10 min-h-[300px] sm:min-h-[340px]">
        {/* RANK #2 — LEFT (Near-black / Charcoal) */}
        {second && (
          <div
            onClick={() => onUserClick?.(second)}
            className="flex-1 max-w-[140px] sm:max-w-[170px] flex flex-col items-center cursor-pointer group transition-transform duration-300 hover:-translate-y-1.5"
          >
            {/* User Avatar with Rank 2 */}
            <div className="relative mb-2.5">
              <UserAvatar
                user={second}
                size="podium-second"
                className="ring-3 ring-slate-400/40 shadow-lg"
              />
            </div>

            {/* User Name & Department */}
            <div className="text-center w-full px-1 mb-2">
              <p
                className="font-heading font-semibold text-xs sm:text-sm text-slate-100 truncate group-hover:text-white transition-colors"
                title={second.displayName}
              >
                {second.displayName}
              </p>
              <p className="text-[10px] text-slate-400 font-sans truncate">
                {second.department || 'Innovator'}
              </p>
            </div>

            {/* Podium Pillar #2 */}
            <div className="w-full h-28 sm:h-36 rounded-t-2xl bg-gradient-to-b from-[#1C1F2E] via-[#151722] to-[#0D0E15] border-t-2 border-x border-slate-500/30 flex flex-col items-center justify-between p-3 shadow-xl relative overflow-hidden">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-300/15 border border-slate-300/30 text-slate-200 font-heading font-bold text-sm sm:text-base flex items-center justify-center">
                2
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-200">
                <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                <span className="font-bold">{second.totalLikes}</span>
              </div>
            </div>
          </div>
        )}

        {/* RANK #1 — CENTER (Tallest, Pink, Most Dominant) */}
        {first && (
          <div
            onClick={() => onUserClick?.(first)}
            className="flex-1 max-w-[160px] sm:max-w-[190px] flex flex-col items-center cursor-pointer group transition-transform duration-300 hover:-translate-y-2 z-10"
          >
            {/* User Avatar with Crown */}
            <div className="relative mb-3">
              <UserAvatar
                user={first}
                size="podium-first"
                showCrown={true}
                className="ring-4 ring-[#FF3D88] shadow-[0_0_25px_rgba(255,61,136,0.5)]"
              />
            </div>

            {/* User Name & Department */}
            <div className="text-center w-full px-1 mb-2">
              <p
                className="font-heading font-bold text-sm sm:text-base text-white truncate group-hover:text-amber-300 transition-colors"
                title={first.displayName}
              >
                {first.displayName}
              </p>
              <p className="text-[11px] text-pink-200 font-sans truncate">
                {first.department || 'Top Creator'}
              </p>
            </div>

            {/* Podium Pillar #1 */}
            <div className="w-full h-40 sm:h-52 rounded-t-2xl bg-gradient-to-b from-[#FF3D88] via-[#E02D73] to-[#A81753] border-t-2 border-x border-pink-300/40 flex flex-col items-center justify-between p-3.5 shadow-[0_0_40px_rgba(255,61,136,0.35)] relative overflow-hidden">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 border border-white/40 text-white font-heading font-bold text-base sm:text-lg flex items-center justify-center shadow-inner">
                1
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 border border-white/20 text-xs sm:text-sm font-mono text-white">
                <Heart className="w-3.5 h-3.5 fill-white text-white" />
                <span className="font-bold">{first.totalLikes}</span>
              </div>
            </div>
          </div>
        )}

        {/* RANK #3 — RIGHT (White / Silver Surface) */}
        {third && (
          <div
            onClick={() => onUserClick?.(third)}
            className="flex-1 max-w-[140px] sm:max-w-[170px] flex flex-col items-center cursor-pointer group transition-transform duration-300 hover:-translate-y-1.5"
          >
            {/* User Avatar with Rank 3 */}
            <div className="relative mb-2.5">
              <UserAvatar
                user={third}
                size="podium-third"
                className="ring-3 ring-slate-300 shadow-lg"
              />
            </div>

            {/* User Name & Department */}
            <div className="text-center w-full px-1 mb-2">
              <p
                className="font-heading font-semibold text-xs sm:text-sm text-slate-100 truncate group-hover:text-white transition-colors"
                title={third.displayName}
              >
                {third.displayName}
              </p>
              <p className="text-[10px] text-slate-400 font-sans truncate">
                {third.department || 'Innovator'}
              </p>
            </div>

            {/* Podium Pillar #3 */}
            <div className="w-full h-24 sm:h-30 rounded-t-2xl bg-gradient-to-b from-[#FFFFFF] via-[#F1F5F9] to-[#E2E8F0] border-t-2 border-x border-white text-[#0F1B3D] flex flex-col items-center justify-between p-3 shadow-xl relative overflow-hidden">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0F1B3D]/10 border border-[#0F1B3D]/20 text-[#0F1B3D] font-heading font-bold text-sm sm:text-base flex items-center justify-center">
                3
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0F1B3D]/10 border border-[#0F1B3D]/15 text-xs font-mono text-[#0F1B3D]">
                <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                <span className="font-bold">{third.totalLikes}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Podium Base Border */}
      <div className="h-1.5 w-full bg-gradient-to-r from-slate-700 via-[#FF3D88]/60 to-slate-400 rounded-full mt-0 opacity-80" />
    </div>
  );
};

