import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FolderGit2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Archive, 
  Plus, 
  Edit3, 
  Eye, 
  ExternalLink,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { projectRepository } from '../repositories/projectRepository';
import { projectService } from '../services/projectService';
import { Project, ApprovalStatus } from '../types';
import { Button } from '../components/common/Button';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { useToast } from '../components/common/Toast';
import { ProjectStatusBadge, ApprovalStatusBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { formatDate } from '../utils/formatters';

type TabKey = 'ALL' | 'APPROVED' | 'PENDING' | 'ACTION' | 'ARCHIVED';

export const MyProjectsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { success: toastSuccess, error: toastError } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>(
    searchParams.get('tab') === 'action'
      ? 'ACTION'
      : searchParams.get('submitted')
      ? 'PENDING'
      : 'ALL'
  );
  const newlySubmittedId = searchParams.get('submitted');

  // Real-time synchronization for instant updates across tabs/devices
  useEffect(() => {
    if (!userProfile?.id) return;
    setIsLoading(true);

    const unsubscribe = projectRepository.subscribeToMyProjects(
      userProfile.id,
      (items) => {
        setProjects(items);
        setIsLoading(false);
      },
      (err) => {
        console.warn('MyProjects real-time subscription failed, falling back to manual fetch:', err);
        projectRepository
          .listByCreator(userProfile.id)
          .then((items) => {
            setProjects(items);
            setIsLoading(false);
          })
          .catch((fetchErr) => {
            console.error('Failed to load user projects:', fetchErr);
            setIsLoading(false);
          });
      }
    );

    return () => unsubscribe();
  }, [userProfile?.id]);

  const handleDeleteProject = async () => {
    if (!projectToDelete || !userProfile) return;

    setIsDeleting(true);
    try {
      await projectService.deleteProject({
        projectId: projectToDelete.id,
        requestor: userProfile,
      });

      toastSuccess(
        'Project Deleted',
        `"${projectToDelete.title}" has been permanently deleted.`
      );
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
      setProjectToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete project';
      toastError('Deletion Failed', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    switch (activeTab) {
      case 'APPROVED':
        return p.approvalStatus === 'APPROVED' && !p.isArchived;
      case 'PENDING':
        return p.approvalStatus === 'PENDING_REVIEW';
      case 'ACTION':
        return (
          p.approvalStatus === 'CHANGES_REQUESTED' ||
          p.approvalStatus === 'REJECTED' ||
          p.approvalStatus === 'DRAFT'
        );
      case 'ARCHIVED':
        return p.isArchived;
      case 'ALL':
      default:
        return true;
    }
  });

  const getTabCount = (tab: TabKey) => {
    switch (tab) {
      case 'APPROVED':
        return projects.filter((p) => p.approvalStatus === 'APPROVED' && !p.isArchived).length;
      case 'PENDING':
        return projects.filter((p) => p.approvalStatus === 'PENDING_REVIEW').length;
      case 'ACTION':
        return projects.filter(
          (p) =>
            p.approvalStatus === 'CHANGES_REQUESTED' ||
            p.approvalStatus === 'REJECTED' ||
            p.approvalStatus === 'DRAFT'
        ).length;
      case 'ARCHIVED':
        return projects.filter((p) => p.isArchived).length;
      case 'ALL':
      default:
        return projects.length;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#0F1B3D] tracking-tight">
            My Projects & Submissions
          </h2>
          <p className="mt-1 text-sm text-slate-500 font-sans">
            Manage your project pipeline, review admin feedback, and submit revisions.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/submit')}
        >
          Submit Project
        </Button>
      </div>

      {/* Newly Submitted Confirmation Banner */}
      {newlySubmittedId && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold">Project Submitted Successfully!</h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Your project has been recorded in the database and is currently under <strong>Pending Review</strong>. Administrators can now inspect and approve it.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSearchParams({})}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 px-2 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        {[
          { key: 'ALL', label: 'All Projects' },
          { key: 'APPROVED', label: 'Approved & Live' },
          { key: 'PENDING', label: 'Pending Review' },
          { key: 'ACTION', label: 'Action Required' },
          { key: 'ARCHIVED', label: 'Archived' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabKey)}
            className={`flex items-center gap-2 px-4 py-3 font-heading font-semibold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-[#FF3D88] text-[#0F1B3D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[11px] font-mono ${
                activeTab === tab.key
                  ? 'bg-[#FF3D88] text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {getTabCount(tab.key as TabKey)}
            </span>
          </button>
        ))}
      </div>

      {/* Projects Table / Cards List */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={<FolderGit2 className="w-8 h-8" />}
          title="No Projects in this Filter"
          description="You don't have any projects currently matching this status."
          actionLabel="Submit a Project"
          onAction={() => navigate('/submit')}
        />
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              {/* Left Details */}
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

                  <p className="text-xs text-slate-500 font-sans line-clamp-1">
                    {p.description}
                  </p>

                  {/* Feedback preview if rejected or changes requested */}
                  {(p.rejectionReason || p.adminFeedback) && (
                    <div className="pt-1 text-xs text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1.5 font-sans">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        <strong>Admin Feedback:</strong> {p.rejectionReason || p.adminFeedback}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Action Buttons & Timestamp */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 self-end md:self-center">
                <span className="text-[11px] font-mono text-slate-400">
                  Updated {formatDate(p.updatedAt)}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Eye className="w-4 h-4" />}
                    onClick={() => navigate(`/projects/${p.id}`)}
                  >
                    View
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Edit3 className="w-4 h-4" />}
                    onClick={() => navigate(`/projects/${p.id}`)}
                  >
                    {p.approvalStatus === 'APPROVED' ? 'Propose Revision' : 'Edit'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Trash2 className="w-4 h-4 text-rose-500" />}
                    onClick={() => setProjectToDelete(p)}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal for Project Deletion */}
      {projectToDelete && (
        <ConfirmationModal
          isOpen={Boolean(projectToDelete)}
          onClose={() => setProjectToDelete(null)}
          onConfirm={handleDeleteProject}
          title={`Delete "${projectToDelete.title}"?`}
          message={
            projectToDelete.approvalStatus === 'APPROVED'
              ? 'Are you sure you want to permanently delete this project? Because it is currently Approved & Live, deleting it will permanently remove it from your portfolio, the public Explore showcase, and the Project Arena leaderboard. This action cannot be undone.'
              : 'Are you sure you want to permanently delete this project? All submission details, uploaded screenshots, and revision histories will be permanently deleted. This action cannot be undone.'
          }
          confirmLabel="Permanently Delete"
          cancelLabel="Keep Project"
          variant="danger"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

