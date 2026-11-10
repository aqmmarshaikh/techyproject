import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Eye, 
  Globe, 
  Github, 
  Sparkles, 
  Archive, 
  RotateCcw,
  ExternalLink,
  Layers,
  FileDiff
} from 'lucide-react';
import { projectRepository } from '../../repositories/projectRepository';
import { revisionRepository } from '../../repositories/revisionRepository';
import { projectService } from '../../services/projectService';
import { Project, ProjectRevision } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/common/Toast';
import { ProjectStatusBadge, ApprovalStatusBadge, Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { RevisionDiff } from '../../features/projects/RevisionDiff';
import { formatDate } from '../../utils/formatters';

export const AdminReviewQueuePage: React.FC = () => {
  const { userProfile } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'NEW_SUBMISSIONS' | 'REVISIONS' | 'ALL_PROJECTS'>('NEW_SUBMISSIONS');
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [pendingRevisions, setPendingRevisions] = useState<ProjectRevision[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal review state
  const [inspectProject, setInspectProject] = useState<Project | null>(null);
  const [inspectRevision, setInspectRevision] = useState<ProjectRevision | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT' | 'CHANGES_REQUESTED' | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    const unsubProjects = projectRepository.subscribeToPendingReview(
      (items) => {
        setPendingProjects(items);
        setIsLoading(false);
      },
      (err) => {
        console.warn('AdminReviewQueue pending projects subscription error:', err);
        projectRepository
          .listPendingReview()
          .then(setPendingProjects)
          .catch(console.error)
          .finally(() => setIsLoading(false));
      }
    );

    const unsubRevisions = revisionRepository.subscribeToPending(
      (items) => {
        setPendingRevisions(items);
      },
      (err) => {
        console.warn('AdminReviewQueue revisions subscription error:', err);
        revisionRepository.listPending().then(setPendingRevisions).catch(console.error);
      }
    );

    const unsubAll = projectRepository.subscribeToAllForAdmin(
      (items) => {
        setAllProjects(items);
      },
      undefined,
      (err) => {
        console.warn('AdminReviewQueue all projects subscription error:', err);
        projectRepository.listAllForAdmin().then(setAllProjects).catch(console.error);
      }
    );

    return () => {
      unsubProjects();
      unsubRevisions();
      unsubAll();
    };
  }, []);

  const handleExecuteProjectReview = async () => {
    if (!inspectProject || !reviewAction || !userProfile) return;

    if (reviewAction === 'REJECT' && (!reviewText || reviewText.trim().length < 10)) {
      toastError('Explanation Required', 'Please provide a clear rejection reason (minimum 10 characters).');
      return;
    }

    if (reviewAction === 'CHANGES_REQUESTED' && (!reviewText || reviewText.trim().length < 10)) {
      toastError('Feedback Required', 'Please provide actionable feedback for the creator (minimum 10 characters).');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await projectService.reviewProject({
        projectId: inspectProject.id,
        decision: reviewAction,
        reason: reviewAction === 'REJECT' ? reviewText : undefined,
        feedback: reviewAction === 'CHANGES_REQUESTED' ? reviewText : undefined,
        adminUser: userProfile,
      });

      toastSuccess(
        'Review Completed',
        `Project "${inspectProject.title}" has been marked as ${reviewAction}.`
      );

      setInspectProject(null);
      setReviewAction(null);
      setReviewText('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Review failed';
      toastError('Error', msg);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleExecuteRevisionReview = async (decision: 'APPROVE' | 'REJECT') => {
    if (!inspectRevision || !userProfile) return;

    setIsSubmittingReview(true);
    try {
      await projectService.reviewRevision({
        revisionId: inspectRevision.id,
        decision,
        feedback: reviewText || undefined,
        adminUser: userProfile,
      });

      toastSuccess(
        'Revision Reviewed',
        `Revision marked as ${decision}. Changes merged if approved.`
      );

      setInspectRevision(null);
      setReviewText('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Revision review failed';
      toastError('Error', msg);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleToggleArchive = async (project: Project) => {
    if (!userProfile) return;
    try {
      await projectService.toggleArchive(project.id, !project.isArchived, userProfile);
      toastSuccess(
        project.isArchived ? 'Project Restored' : 'Project Archived',
        `Visibility updated.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      toastError('Error', msg);
    }
  };

  const handleToggleFeature = async (project: Project) => {
    if (!userProfile) return;
    try {
      await projectService.toggleFeatured(project.id, !project.isFeatured, userProfile);
      toastSuccess(
        project.isFeatured ? 'Spotlight Removed' : 'Project Featured',
        `Featured status updated.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      toastError('Error', msg);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#0F1B3D] tracking-tight">
          Project Moderation & Review Queue
        </h2>
        <p className="mt-1 text-sm text-slate-500 font-sans">
          Verify safety, inspect URLs, and approve new initiatives or pending revisions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('NEW_SUBMISSIONS')}
          className={`flex items-center gap-2 px-4 py-3 font-heading font-semibold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'NEW_SUBMISSIONS'
              ? 'border-[#FF3D88] text-[#0F1B3D]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Pending Submissions</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-xs">
            {pendingProjects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('REVISIONS')}
          className={`flex items-center gap-2 px-4 py-3 font-heading font-semibold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'REVISIONS'
              ? 'border-[#FF3D88] text-[#0F1B3D]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileDiff className="w-4 h-4 text-slate-400" />
          <span>Pending Revisions</span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-mono text-xs">
            {pendingRevisions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ALL_PROJECTS')}
          className={`flex items-center gap-2 px-4 py-3 font-heading font-semibold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'ALL_PROJECTS'
              ? 'border-[#FF3D88] text-[#0F1B3D]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>All Platform Projects</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs">
            {allProjects.length}
          </span>
        </button>
      </div>

      {/* 1. Pending Submissions Tab */}
      {activeTab === 'NEW_SUBMISSIONS' && (
        <div>
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
              ))}
            </div>
          ) : pendingProjects.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="w-8 h-8 text-emerald-600" />}
              title="Review Queue is Empty"
              description="No project submissions are currently awaiting administrator review."
            />
          ) : (
            <div className="space-y-4">
              {pendingProjects.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <img
                      src={p.coverImageUrl}
                      alt={p.title}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <ApprovalStatusBadge status={p.approvalStatus} />
                        <ProjectStatusBadge status={p.projectStatus} />
                        <span className="text-[11px] font-mono text-slate-400">{p.category}</span>
                      </div>
                      <h3 className="font-heading font-bold text-base text-[#0F1B3D] truncate">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-sans line-clamp-2">
                        {p.description}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400">
                        Submitted by {p.creatorName} ({p.creatorDepartment}) • {formatDate(p.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setInspectProject(p)}
                    >
                      Inspect & Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Pending Revisions Tab */}
      {activeTab === 'REVISIONS' && (
        <div>
          {isLoading ? (
            <div className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
          ) : pendingRevisions.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="w-8 h-8 text-emerald-600" />}
              title="No Pending Revisions"
              description="No existing projects currently have unreviewed revisions."
            />
          ) : (
            <div className="space-y-4">
              {pendingRevisions.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="pink">Revision Proposed</Badge>
                      <span className="text-xs font-mono text-slate-400">
                        Target Project: {rev.projectId}
                      </span>
                    </div>
                    <h4 className="font-heading font-semibold text-sm text-[#0F1B3D]">
                      Summary: "{rev.changeSummary}"
                    </h4>
                    <p className="text-xs text-slate-500 font-sans">
                      Submitted on {formatDate(rev.createdAt)}
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setInspectRevision(rev)}
                  >
                    Compare & Apply
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. All Platform Projects Tab (Archive, Feature, Status Management) */}
      {activeTab === 'ALL_PROJECTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-heading uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Creator</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Approval</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-semibold text-[#0F1B3D] max-w-xs truncate">
                      {p.title}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {p.category}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {p.creatorName}
                    </td>
                    <td className="py-3.5 px-4">
                      <ProjectStatusBadge status={p.projectStatus} />
                    </td>
                    <td className="py-3.5 px-4">
                      <ApprovalStatusBadge status={p.approvalStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleToggleFeature(p)}
                        title={p.isFeatured ? 'Remove Feature' : 'Spotlight Feature'}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          p.isFeatured
                            ? 'bg-[#FF3D88] text-white border-[#FF3D88]'
                            : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleArchive(p)}
                        title={p.isArchived ? 'Restore' : 'Archive'}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          p.isArchived
                            ? 'bg-amber-100 text-amber-900 border-amber-200'
                            : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Project Modal */}
      <Modal
        isOpen={Boolean(inspectProject)}
        onClose={() => {
          setInspectProject(null);
          setReviewAction(null);
          setReviewText('');
        }}
        maxWidth="2xl"
        title={inspectProject?.title}
        description="Inspect submission metadata, preview screenshots, and make a decision."
      >
        {inspectProject && (
          <div className="space-y-5">
            <div className="h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <img
                src={inspectProject.coverImageUrl}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">Description</h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {inspectProject.description}
              </p>
            </div>

            {/* Inspect URLs safely */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">External Links Safety Inspection</h4>
              <div className="space-y-1.5">
                {inspectProject.liveWebsiteUrl ? (
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <span className="truncate max-w-sm font-mono text-slate-700">
                      Live: {inspectProject.liveWebsiteUrl}
                    </span>
                    <a
                      href={inspectProject.liveWebsiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF3D88] hover:underline flex items-center gap-1 font-semibold"
                    >
                      Test Link <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No live website URL provided.</p>
                )}

                {inspectProject.githubRepoUrl && (
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <span className="truncate max-w-sm font-mono text-slate-700">
                      Repo: {inspectProject.githubRepoUrl}
                    </span>
                    <a
                      href={inspectProject.githubRepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF3D88] hover:underline flex items-center gap-1 font-semibold"
                    >
                      Test Repo <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Decision selector */}
            <div className="pt-2 border-t border-slate-200 space-y-3">
              <h4 className="text-xs font-heading font-semibold text-[#0F1B3D]">Select Review Decision:</h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setReviewAction('APPROVE')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    reviewAction === 'APPROVE'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  Approve Project
                </button>

                <button
                  type="button"
                  onClick={() => setReviewAction('CHANGES_REQUESTED')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    reviewAction === 'CHANGES_REQUESTED'
                      ? 'bg-amber-600 text-white border-amber-600 shadow'
                      : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  Request Changes
                </button>

                <button
                  type="button"
                  onClick={() => setReviewAction('REJECT')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    reviewAction === 'REJECT'
                      ? 'bg-rose-600 text-white border-rose-600 shadow'
                      : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  Reject Project
                </button>
              </div>

              {/* Conditional text input for Reason or Feedback */}
              {(reviewAction === 'REJECT' || reviewAction === 'CHANGES_REQUESTED') && (
                <div>
                  <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1">
                    {reviewAction === 'REJECT' ? 'Mandatory Rejection Reason' : 'Actionable Feedback for Employee'} <span className="text-[#FF3D88]">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Provide specific notes so the employee can address the concern..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30 font-sans"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Minimum 10 characters required.</p>
                </div>
              )}

              {reviewAction && (
                <div className="pt-2 flex justify-end">
                  <Button
                    variant={reviewAction === 'APPROVE' ? 'success' : reviewAction === 'REJECT' ? 'danger' : 'primary'}
                    size="sm"
                    onClick={handleExecuteProjectReview}
                    isLoading={isSubmittingReview}
                  >
                    Confirm {reviewAction.replace('_', ' ')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Inspect Revision Modal */}
      <Modal
        isOpen={Boolean(inspectRevision)}
        onClose={() => setInspectRevision(null)}
        maxWidth="2xl"
        title="Review Proposed Revision"
        description="Verify proposed modifications side-by-side against the current project."
      >
        {inspectRevision && (
          <div className="space-y-4">
            <RevisionDiff revision={inspectRevision} />

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleExecuteRevisionReview('REJECT')}
                disabled={isSubmittingReview}
              >
                Reject Revision
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => handleExecuteRevisionReview('APPROVE')}
                isLoading={isSubmittingReview}
              >
                Approve & Merge Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

