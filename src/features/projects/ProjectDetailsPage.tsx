import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Globe, 
  Github, 
  Heart, 
  Bookmark, 
  Share2, 
  Flag, 
  Edit3, 
  ArrowLeft, 
  ExternalLink, 
  Calendar,
  Layers,
  Sparkles,
  AlertCircle,
  Clock
} from 'lucide-react';
import { projectRepository } from '../../repositories/projectRepository';
import { revisionRepository } from '../../repositories/revisionRepository';
import { interactionService } from '../../services/interactionService';
import { projectService } from '../../services/projectService';
import { Project, ProjectRevision, VoteChoice } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/common/Toast';
import { ProjectStatusBadge, ApprovalStatusBadge, Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { VoteButtonPair } from '../voting/VoteButtonPair';
import { formatDate, formatCompactNumber } from '../../utils/formatters';
import { ProjectSubmitForm } from './ProjectSubmitForm';
import { Modal } from '../../components/common/Modal';
import { ReportModal } from './ReportModal';

export const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { userProfile, isAuthenticated, openAuthModal } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [activeRevision, setActiveRevision] = useState<ProjectRevision | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userVote, setUserVote] = useState<VoteChoice | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const loadData = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const proj = await projectRepository.getById(projectId);
      if (!proj) {
        setProject(null);
        return;
      }
      setProject(proj);

      if (proj.activeRevisionId) {
        const rev = await revisionRepository.getById(proj.activeRevisionId);
        setActiveRevision(rev);
      }

      if (userProfile?.id) {
        const interactions = await interactionService.checkUserInteractions(projectId, userProfile.id);
        setIsLiked(interactions.isLiked);
        setIsBookmarked(interactions.isBookmarked);
        setUserVote(interactions.userVoteChoice);
      }
    } catch (err) {
      console.warn('Failed to load project details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId, userProfile?.id]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-slate-200 rounded-lg" />
        <div className="h-80 w-full bg-slate-200 rounded-3xl" />
        <div className="h-10 w-2/3 bg-slate-200 rounded-lg" />
        <div className="h-32 w-full bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-heading font-semibold text-[#0F1B3D]">Project Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          The requested project might have been removed or you do not have permission to view it.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate('/explore')}>
          Back to Explore
        </Button>
      </div>
    );
  }

  const isOwner = userProfile?.id === project.creatorId;

  const handleToggleLike = async () => {
    if (!userProfile) {
      openAuthModal('Sign in to like this project.');
      return;
    }
    if (isOwner) {
      toastError('Self-Liking Prohibited', 'You cannot like your own project.');
      return;
    }

    try {
      const res = await interactionService.toggleLike(project.id, userProfile.id);
      setIsLiked(res.isLiked);
      setProject((prev) => (prev ? { ...prev, likeCount: res.newCount } : null));
      toastSuccess(res.isLiked ? 'Liked!' : 'Unliked');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      toastError('Error', msg);
    }
  };

  const handleToggleBookmark = async () => {
    if (!userProfile) {
      openAuthModal('Sign in to save this project to your bookmarks.');
      return;
    }

    try {
      const res = await interactionService.toggleBookmark(project, userProfile.id);
      setIsBookmarked(res.isBookmarked);
      toastSuccess(res.isBookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      toastError('Error', msg);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toastSuccess('Link Copied', 'Project link copied to clipboard.');
    }
  };

  const handleUpdateOrRevisionSubmit = async (formData: any, changeSummary?: string) => {
    if (!userProfile) return;

    if (project.approvalStatus === 'APPROVED') {
      // Must submit as revision
      await projectService.submitRevision(project.id, formData, changeSummary || 'General updates', userProfile);
      toastSuccess('Revision Submitted', 'Your proposed changes have been sent to admins for review.');
    } else {
      // Direct update for draft or changes requested
      await projectRepository.update(project.id, {
        ...formData,
        approvalStatus: 'PENDING_REVIEW', // Resubmit
      });
      toastSuccess('Project Updated', 'Project resubmitted for admin review.');
    }

    setIsEditing(false);
    loadData();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Back button & Action Toolbar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#0F1B3D] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-2">
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit3 className="w-4 h-4" />}
              onClick={() => setIsEditing(true)}
            >
              {project.approvalStatus === 'APPROVED' ? 'Propose Revision' : 'Edit Project'}
            </Button>
          )}

          <button
            onClick={handleShare}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            title="Share Project"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {!isOwner && (
            <button
              onClick={() => {
                if (!userProfile) {
                  openAuthModal('Sign in to report a concern about this project.');
                  return;
                }
                setIsReportModalOpen(true);
              }}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-rose-600 transition-colors"
              title="Report Concern"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Revision In-Review Notice */}
      {project.activeRevisionId && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold">Active Revision Under Review</h4>
            <p className="text-xs text-amber-800 mt-0.5">
              A revision submitted by the creator is currently in the administrator review queue. The live version below remains publicly active until approved.
            </p>
            {activeRevision && (
              <p className="text-xs font-mono text-amber-700 mt-1">
                Summary: "{activeRevision.changeSummary}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* Hero Cover Card */}
      <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden border border-slate-200/90 shadow-card bg-slate-900 group">
        <img
          src={project.coverImageUrl}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1B3D]/90 via-[#0F1B3D]/30 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-5 left-5 flex items-center gap-2">
          <ProjectStatusBadge status={project.projectStatus} />
          <ApprovalStatusBadge status={project.approvalStatus} />
          {project.isFeatured && (
            <Badge variant="pink">
              <Sparkles className="w-3.5 h-3.5" /> Featured
            </Badge>
          )}
        </div>

        {/* Bottom Banner inside Hero */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-medium text-white/70 uppercase tracking-wider">
              {project.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
              {project.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Bookmark button */}
            <Button
              variant={isBookmarked ? 'primary' : 'outline'}
              size="sm"
              leftIcon={<Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />}
              onClick={handleToggleBookmark}
              className={!isBookmarked ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : ''}
            >
              {isBookmarked ? 'Saved' : 'Save'}
            </Button>

            {/* Like button */}
            <Button
              variant={isLiked ? 'primary' : 'outline'}
              size="sm"
              leftIcon={<Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />}
              onClick={handleToggleLike}
              disabled={isOwner}
              className={!isLiked ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : ''}
            >
              {formatCompactNumber(project.likeCount)}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Details & Right Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Description, Screenshots, Revisions */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-lg text-[#0F1B3D]">About this Project</h3>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-sans whitespace-pre-line">
              {project.description}
            </p>

            {/* External Links */}
            <div className="pt-4 flex flex-wrap gap-3">
              {project.liveWebsiteUrl && (
                <a
                  href={project.liveWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F1B3D] text-white text-xs sm:text-sm font-medium hover:bg-[#182B5C] transition-colors shadow-sm"
                >
                  <Globe className="w-4 h-4" />
                  <span>Launch Live Site</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/60 ml-0.5" />
                </a>
              )}

              {project.githubRepoUrl && (
                <a
                  href={project.githubRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm font-medium hover:bg-slate-100 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>View Repository</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                </a>
              )}
            </div>
          </section>

          {/* Screenshots Gallery */}
          {project.screenshots && project.screenshots.length > 0 && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="font-heading font-bold text-lg text-[#0F1B3D]">Screenshots & Media</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {project.screenshots.map((shot, idx) => (
                  <div
                    key={shot}
                    onClick={() => setSelectedImage(shot)}
                    className="relative h-36 rounded-2xl overflow-hidden border border-slate-200 cursor-pointer group"
                  >
                    <img
                      src={shot}
                      alt={`Screenshot ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-[#0F1B3D]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                      Enlarge
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Technologies Used */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-3">
            <h3 className="font-heading font-bold text-base text-[#0F1B3D]">Technologies & Tooling</h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/90 text-xs font-mono font-medium text-slate-800"
                >
                  {t}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (1 Col): Community Evaluation & Creator Card */}
        <div className="space-y-6">
          {/* Community Evaluation (Voting System) */}
          <VoteButtonPair
            projectId={project.id}
            creatorId={project.creatorId}
            initialGoodCount={project.goodVoteCount || 0}
            initialNeedsImprovementCount={project.needsImprovementVoteCount || 0}
            initialUserVote={userVote}
            onVoteSuccess={(newGood, newNeedsImp, newTotal, newPct) => {
              setProject((prev) =>
                prev
                  ? {
                      ...prev,
                      goodVoteCount: newGood,
                      needsImprovementVoteCount: newNeedsImp,
                      totalValidVotes: newTotal,
                      goodPercentage: newPct,
                    }
                  : null
              );
            }}
          />

          {/* Creator Profile Snapshot */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-slate-400">
              Project Creator
            </h4>
            <div className="flex items-center gap-3">
              <img
                src={
                  project.creatorAvatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
                }
                alt={project.creatorName}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-200 ring-2 ring-[#FF3D88]/20"
              />
              <div className="min-w-0">
                <h4 className="font-sans font-bold text-sm text-[#0F1B3D] truncate">
                  {project.creatorName}
                </h4>
                <p className="text-xs text-slate-500 font-sans truncate">
                  {project.creatorDepartment}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate(`/directory?creator=${project.creatorId}`)}
            >
              View Full Portfolio
            </Button>
          </div>

          {/* Metadata Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/70 text-xs text-slate-600 space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Created:</span>
              <span>{formatDate(project.createdAt)}</span>
            </div>
            {project.approvedAt && (
              <div className="flex justify-between">
                <span className="text-slate-400">Approved:</span>
                <span>{formatDate(project.approvedAt)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Project ID:</span>
              <span className="truncate max-w-[120px]">{project.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Screenshots */}
      <Modal
        isOpen={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        maxWidth="3xl"
      >
        {selectedImage && (
          <img
            src={selectedImage}
            alt="Screenshot preview"
            className="w-full h-auto max-h-[75vh] object-contain rounded-xl"
          />
        )}
      </Modal>

      {/* Edit / Revision Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        maxWidth="2xl"
        title={project.approvalStatus === 'APPROVED' ? 'Propose Revision' : 'Edit Project Details'}
      >
        <ProjectSubmitForm
          initialProject={project}
          isRevision={project.approvalStatus === 'APPROVED'}
          onSubmit={handleUpdateOrRevisionSubmit}
          onCancel={() => setIsEditing(false)}
        />
      </Modal>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        projectId={project.id}
        projectTitle={project.title}
      />
    </div>
  );
};

