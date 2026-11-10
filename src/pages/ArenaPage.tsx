import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Flame, 
  ThumbsUp, 
  Heart, 
  Clock, 
  Vote, 
  AlertCircle, 
  ExternalLink, 
  Sparkles,
  Award
} from 'lucide-react';
import { projectRepository } from '../repositories/projectRepository';
import { categoryRepository } from '../repositories/categoryRepository';
import { adminRepository } from '../repositories/adminRepository';
import { Project, ArenaSection, Category, ProjectFilterCriteria } from '../types';
import { Badge, ProjectStatusBadge } from '../components/common/Badge';
import { ProjectFilterBar } from '../features/projects/ProjectFilterBar';
import { EmptyState } from '../components/common/EmptyState';
import { useNavigate } from 'react-router-dom';
import { formatCompactNumber, formatDate } from '../utils/formatters';

export const ArenaPage: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ArenaSection>('TOP_RATED');
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [minVoteThreshold, setMinVoteThreshold] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [criteria, setCriteria] = useState<ProjectFilterCriteria>({
    category: 'all',
    technology: 'all',
    projectStatus: 'all',
    department: 'all',
    searchQuery: '',
  });

  useEffect(() => {
    const init = async () => {
      const [cats, settings] = await Promise.all([
        categoryRepository.list(),
        adminRepository.getSettings(),
      ]);
      setCategories(cats);
      setMinVoteThreshold(settings.arenaMinVoteThreshold || 10);
    };
    init();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const items = await projectRepository.listApproved(criteria, 100);
      setProjects(items);
    } catch (err) {
      console.warn('Failed to load arena projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [criteria]);

  // Sorting & Gating Logic per Arena Section
  let rankedProjects: Project[] = [];
  let underThresholdProjects: Project[] = [];

  switch (activeTab) {
    case 'TOP_RATED':
      // Must have >= minVoteThreshold
      rankedProjects = projects
        .filter((p) => (p.totalValidVotes || 0) >= minVoteThreshold)
        .sort((a, b) => {
          // Primary: Highest Good %; Secondary: Total Valid Votes; Tie-break: ApprovedAt / CreatedAt
          if (b.goodPercentage !== a.goodPercentage) {
            return b.goodPercentage - a.goodPercentage;
          }
          if (b.totalValidVotes !== a.totalValidVotes) {
            return b.totalValidVotes - a.totalValidVotes;
          }
          return b.createdAt.localeCompare(a.createdAt);
        });

      underThresholdProjects = projects
        .filter((p) => (p.totalValidVotes || 0) < minVoteThreshold)
        .sort((a, b) => b.goodPercentage - a.goodPercentage);
      break;

    case 'MOST_LIKED':
      rankedProjects = [...projects].sort((a, b) => {
        if (b.likeCount !== a.likeCount) {
          return b.likeCount - a.likeCount;
        }
        return b.createdAt.localeCompare(a.createdAt);
      });
      break;

    case 'MOST_VOTED':
      rankedProjects = [...projects].sort((a, b) => {
        if (b.totalValidVotes !== a.totalValidVotes) {
          return b.totalValidVotes - a.totalValidVotes;
        }
        return b.createdAt.localeCompare(a.createdAt);
      });
      break;

    case 'TRENDING':
      rankedProjects = [...projects].sort((a, b) => {
        if (b.trendingScore !== a.trendingScore) {
          return b.trendingScore - a.trendingScore;
        }
        return b.createdAt.localeCompare(a.createdAt);
      });
      break;

    case 'NEWEST':
      rankedProjects = [...projects].sort((a, b) => {
        const dateA = a.approvedAt || a.createdAt;
        const dateB = b.approvedAt || b.createdAt;
        return dateB.localeCompare(dateA);
      });
      break;
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-9 h-9 rounded-xl bg-amber-400 text-amber-950 font-heading font-bold text-base flex items-center justify-center shadow-md">
          1
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-800 font-heading font-bold text-base flex items-center justify-center shadow-sm">
          2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-9 h-9 rounded-xl bg-amber-700/20 text-amber-800 font-heading font-bold text-base flex items-center justify-center">
          3
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 font-mono font-medium text-xs flex items-center justify-center">
        #{rank}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Arena Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#0F1B3D] via-[#182B5C] to-[#0A1229] p-6 sm:p-10 text-white overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[#FF3D88]/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono mb-3">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Company Innovation Arena
          </div>
          <h2 className="text-2xl sm:text-4xl font-heading font-bold tracking-tight">
            Project Arena Leaderboards
          </h2>
          <p className="mt-2 text-sm text-white/70 font-sans leading-relaxed">
            Real-time rankings powered by verified peer evaluations, community likes, and time-decayed velocity. No mock data.
          </p>
        </div>
      </div>

      {/* 5 Arena Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        {[
          { key: 'TOP_RATED', label: 'Top Rated', icon: <Award className="w-4 h-4" /> },
          { key: 'MOST_LIKED', label: 'Most Liked', icon: <Heart className="w-4 h-4" /> },
          { key: 'MOST_VOTED', label: 'Most Evaluated', icon: <Vote className="w-4 h-4" /> },
          { key: 'TRENDING', label: 'Trending Velocity', icon: <Flame className="w-4 h-4 text-[#FF3D88]" /> },
          { key: 'NEWEST', label: 'Recently Approved', icon: <Clock className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as ArenaSection)}
            className={`flex items-center gap-2 px-4 py-3 font-heading font-semibold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-[#FF3D88] text-[#0F1B3D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <ProjectFilterBar
        criteria={criteria}
        categories={categories}
        onChange={(updates) => setCriteria((prev) => ({ ...prev, ...updates }))}
        onReset={() =>
          setCriteria({
            category: 'all',
            technology: 'all',
            projectStatus: 'all',
            department: 'all',
            searchQuery: '',
          })
        }
      />

      {/* Top Rated Minimum Vote Threshold Notice */}
      {activeTab === 'TOP_RATED' && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-950 text-xs sm:text-sm flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Top Rated Eligibility Gate:</span>
            <p className="mt-0.5 text-xs text-indigo-800 font-sans">
              To eliminate bias from single 100% scores, projects require a minimum of{' '}
              <strong className="font-bold underline">{minVoteThreshold} valid peer votes</strong> to enter the Top Rated leaderboard.
            </p>
          </div>
        </div>
      )}

      {/* Ranked List View */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : rankedProjects.length === 0 ? (
        <EmptyState
          icon={<Trophy className="w-8 h-8" />}
          title="No Projects Qualifying in this Arena"
          description={
            activeTab === 'TOP_RATED'
              ? `No approved projects have reached the minimum threshold of ${minVoteThreshold} valid votes yet.`
              : 'Try selecting different filters or exploring newly submitted projects.'
          }
        />
      ) : (
        <div className="space-y-3">
          {rankedProjects.map((project, idx) => {
            const rank = idx + 1;
            return (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="group bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-card hover:shadow-cardHover transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Rank Indicator */}
                  {getRankBadge(rank)}

                  {/* Thumbnail */}
                  <img
                    src={project.coverImageUrl}
                    alt={project.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-slate-200"
                  />

                  {/* Content */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <ProjectStatusBadge status={project.projectStatus} />
                      <span className="text-[11px] font-mono text-slate-400">
                        {project.category}
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-sm sm:text-base text-[#0F1B3D] group-hover:text-[#FF3D88] transition-colors truncate">
                      {project.title}
                    </h3>

                    <p className="text-xs text-slate-500 font-sans line-clamp-1 mt-0.5">
                      By {project.creatorName} ({project.creatorDepartment})
                    </p>
                  </div>
                </div>

                {/* Score & Metric Stats Pill */}
                <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-between sm:justify-end">
                  {activeTab === 'TOP_RATED' && (
                    <div className="text-right">
                      <span className="font-heading font-bold text-lg text-emerald-600 block">
                        {project.goodPercentage}%
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {project.totalValidVotes} votes
                      </span>
                    </div>
                  )}

                  {activeTab === 'MOST_LIKED' && (
                    <div className="text-right">
                      <span className="font-heading font-bold text-lg text-rose-600 flex items-center justify-end gap-1">
                        <Heart className="w-4 h-4 fill-current text-[#FF3D88]" />
                        {project.likeCount}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">Total Likes</span>
                    </div>
                  )}

                  {activeTab === 'MOST_VOTED' && (
                    <div className="text-right">
                      <span className="font-heading font-bold text-lg text-[#0F1B3D] flex items-center justify-end gap-1">
                        <Vote className="w-4 h-4 text-[#0F1B3D]" />
                        {project.totalValidVotes}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {project.goodVoteCount} Good / {project.needsImprovementVoteCount} Needs Work
                      </span>
                    </div>
                  )}

                  {activeTab === 'TRENDING' && (
                    <div className="text-right">
                      <span className="font-heading font-bold text-lg text-[#FF3D88] flex items-center justify-end gap-1">
                        <Flame className="w-4 h-4" />
                        {project.trendingScore}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">Decayed Velocity</span>
                    </div>
                  )}

                  {activeTab === 'NEWEST' && (
                    <div className="text-right">
                      <span className="font-mono font-medium text-xs text-[#0F1B3D] block">
                        {formatDate(project.approvedAt || project.createdAt)}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">Approved Date</span>
                    </div>
                  )}

                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-[#FF3D88] transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Under Threshold Explanation List (Part 6.2) */}
      {activeTab === 'TOP_RATED' && underThresholdProjects.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-slate-400" />
            <h4 className="font-heading font-bold text-sm text-[#0F1B3D]">
              Projects Awaiting Votes for Top Rated Qualification ({underThresholdProjects.length})
            </h4>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            These approved projects have received positive ratings but have not yet met the {minVoteThreshold}-vote requirement:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {underThresholdProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className="bg-slate-50 hover:bg-white rounded-xl p-3 border border-slate-200 text-xs flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <p className="font-semibold text-slate-800 truncate">{p.title}</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {p.totalValidVotes} / {minVoteThreshold} required votes
                  </p>
                </div>
                <span className="shrink-0 font-mono font-bold text-slate-500">
                  {p.goodPercentage}% ({p.totalValidVotes} v)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

