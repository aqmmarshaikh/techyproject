import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Bookmark, ExternalLink, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { Project } from '../../types';
import { ProjectStatusBadge, Badge } from '../../components/common/Badge';
import { useAuth } from '../../hooks/useAuth';
import { interactionService } from '../../services/interactionService';
import { useToast } from '../../components/common/Toast';
import { calculateVotePercentages, formatCompactNumber } from '../../utils/formatters';

interface ProjectCardProps {
  project: Project;
  initialIsLiked?: boolean;
  initialIsBookmarked?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  initialIsLiked = false,
  initialIsBookmarked = false,
}) => {
  const navigate = useNavigate();
  const { userProfile, isAuthenticated, openAuthModal } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [likeCount, setLikeCount] = useState(project.likeCount || 0);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const [isTogglingBookmark, setIsTogglingBookmark] = useState(false);

  const isOwner = userProfile?.id === project.creatorId;

  const { goodPercentage, totalVotes } = calculateVotePercentages(
    project.goodVoteCount || 0,
    project.needsImprovementVoteCount || 0
  );

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated || !userProfile) {
      openAuthModal('Sign in to like projects and celebrate great work.');
      return;
    }
    if (isOwner) {
      toastError('Self-Liking Prohibited', 'You cannot like your own project.');
      return;
    }

    setIsTogglingLike(true);
    try {
      const res = await interactionService.toggleLike(project.id, userProfile.id);
      setIsLiked(res.isLiked);
      setLikeCount(res.newCount);
      if (res.isLiked) {
        toastSuccess('Project Liked', `Added to your liked projects.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to like project';
      toastError('Action Failed', msg);
    } finally {
      setIsTogglingLike(false);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated || !userProfile) {
      openAuthModal('Sign in to save projects to your private collection.');
      return;
    }

    setIsTogglingBookmark(true);
    try {
      const res = await interactionService.toggleBookmark(project, userProfile.id);
      setIsBookmarked(res.isBookmarked);
      toastSuccess(
        res.isBookmarked ? 'Project Saved' : 'Project Removed',
        res.isBookmarked ? 'Added to your Saved Projects list.' : 'Removed from Saved Projects.'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save project';
      toastError('Action Failed', msg);
    } finally {
      setIsTogglingBookmark(false);
    }
  };

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-card hover:shadow-cardHover transition-all duration-200 flex flex-col cursor-pointer relative"
    >
      {/* Cover Image & Overlays */}
      <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
        <img
          src={project.coverImageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80'}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80';
          }}
        />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <ProjectStatusBadge status={project.projectStatus} />
          {project.isFeatured && (
            <Badge variant="pink" className="shadow-sm">
              <Sparkles className="w-3 h-3 text-[#FF3D88]" />
              Featured
            </Badge>
          )}
        </div>

        {/* Top Right Save Bookmark Button */}
        <button
          onClick={handleBookmark}
          disabled={isTogglingBookmark}
          title={isBookmarked ? 'Remove from Saved' : 'Save Project'}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${
            isBookmarked
              ? 'bg-[#FF3D88] text-white shadow-md'
              : 'bg-white/80 text-slate-700 hover:bg-white hover:text-[#0F1B3D]'
          }`}
        >
          <Bookmark className="w-4 h-4 fill-current" />
        </button>

        {/* Category Pill at Bottom Right of Image */}
        <div className="absolute bottom-3 right-3">
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-[#0F1B3D]/80 backdrop-blur-md text-white">
            {project.category}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Project Title */}
          <h3 className="font-heading font-semibold text-base text-[#0F1B3D] group-hover:text-[#FF3D88] transition-colors line-clamp-1">
            {project.title}
          </h3>

          {/* Description (approx 2-3 lines) */}
          <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed font-sans">
            {project.description}
          </p>

          {/* Technology Badges */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 3).map((tech) => (
              <Badge key={tech} variant="tech">
                {tech}
              </Badge>
            ))}
            {project.technologies.length > 3 && (
              <span className="text-[11px] font-mono text-slate-400 self-center">
                +{project.technologies.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Card Footer */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          {/* Creator Snapshot */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/directory?creator=${project.creatorId}`);
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            title={`View ${project.creatorName}'s profile`}
          >
            <img
              src={
                project.creatorAvatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'
              }
              alt={project.creatorName}
              className="w-7 h-7 rounded-full object-cover border border-slate-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80';
              }}
            />
            <div className="text-left">
              <p className="text-xs font-semibold text-[#0F1B3D] leading-none line-clamp-1">
                {project.creatorName}
              </p>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5 line-clamp-1">
                {project.creatorDepartment}
              </p>
            </div>
          </div>

          {/* Engagement Counts (Likes & Votes) */}
          <div className="flex items-center gap-2">
            {/* Vote Rating Pill */}
            {totalVotes > 0 ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                <ThumbsUp className="w-3 h-3" />
                <span>{goodPercentage}%</span>
              </span>
            ) : (
              <span className="text-[11px] font-mono text-slate-400">
                No votes
              </span>
            )}

            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={isTogglingLike || isOwner}
              title={isOwner ? 'You cannot like your own project' : isLiked ? 'Unlike' : 'Like'}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                isLiked
                  ? 'bg-rose-50 text-[#FF3D88] border border-rose-200'
                  : 'text-slate-500 hover:text-[#FF3D88] hover:bg-rose-50/50'
              } ${isOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-[#FF3D88]' : ''}`} />
              <span>{formatCompactNumber(likeCount)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

