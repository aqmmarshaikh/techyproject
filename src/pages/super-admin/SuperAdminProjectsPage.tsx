import React, { useState, useEffect } from 'react';
import { 
  FolderGit2, 
  Search, 
  Sparkles, 
  Archive, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle,
  Images
} from 'lucide-react';
import { projectRepository } from '../../repositories/projectRepository';
import { projectService } from '../../services/projectService';
import { Project, ApprovalStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/common/Toast';
import { Button } from '../../components/common/Button';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { Modal } from '../../components/common/Modal';
import { ApprovalStatusBadge } from '../../components/common/Badge';
import { ProjectMediaGalleryModal } from '../../components/common/ProjectMediaGalleryModal';
import { formatDate } from '../../utils/formatters';
import { NavLink } from 'react-router-dom';

export const SuperAdminProjectsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Deletion modal
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Dedicated Media Review Gallery State
  const [galleryProject, setGalleryProject] = useState<{
    title: string;
    coverImageUrl?: string;
    screenshots?: string[];
    initialIndex?: number;
  } | null>(null);

  const countWords = (text: string) => {
    const trimmed = text.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  };

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const items = await projectRepository.listAllForAdmin();
      setProjects(items);
    } catch (err) {
      console.warn('Failed to load projects for Super Admin moderation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleToggleFeatured = async (project: Project) => {
    if (!userProfile) return;
    try {
      await projectService.toggleFeatured(project.id, !project.isFeatured, userProfile);
      toastSuccess(
        project.isFeatured ? 'Spotlight Removed' : 'Project Spotlighted',
        `"${project.title}" featured status updated.`
      );
      loadProjects();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      toastError('Error', msg);
    }
  };

  const handleToggleArchive = async (project: Project) => {
    if (!userProfile) return;
    try {
      await projectService.toggleArchive(project.id, !project.isArchived, userProfile);
      toastSuccess(
        project.isArchived ? 'Project Restored' : 'Project Archived',
        `"${project.title}" archive status updated.`
      );
      loadProjects();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      toastError('Error', msg);
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteTarget || !userProfile) return;

    if (!deleteReason || deleteReason.trim().length < 5) {
      toastError(
        'Reason Required',
        'Please enter a documented reason (at least 5 characters) for removing this project.'
      );
      return;
    }

    setIsDeleting(true);
    try {
      await projectService.deleteProject({
        projectId: deleteTarget.id,
        requestor: userProfile,
        reason: deleteReason.trim(),
      });
      toastSuccess('Project Deleted', `"${deleteTarget.title}" and all related data have been permanently removed.`);
      setDeleteTarget(null);
      setDeleteReason('');
      loadProjects();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      toastError('Delete Failed', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.approvalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0F1B3D] tracking-tight">
            Global Project Moderation
          </h2>
          <p className="mt-1 text-sm text-slate-500 font-sans">
            Full platform visibility over all submissions, live initiatives, spotlight features, and archiving.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects, creators, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'APPROVED', 'PENDING_REVIEW', 'CHANGES_REQUESTED', 'REJECTED'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? 'bg-[#0F1B3D] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s === 'all' ? 'All Projects' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-6">Project Title</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Review Status</th>
                <th className="py-3 px-4 text-center">Likes / Votes</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-6 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    Loading platform projects...
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No matching projects found.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.coverImageUrl}
                          alt={p.title}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-semibold text-slate-900 truncate">{p.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {p.isFeatured && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-mono font-semibold">
                                ★ Featured
                              </span>
                            )}
                            {p.isArchived && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[10px] font-mono font-semibold">
                                Archived
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800">{p.creatorName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{p.creatorDepartment || 'Engineering'}</p>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {p.category}
                    </td>

                    <td className="py-3.5 px-4">
                      <ApprovalStatusBadge status={p.approvalStatus} />
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="text-[#FF3D88] font-bold">{p.likeCount || 0}</span>
                      <span className="text-slate-400 mx-1">/</span>
                      <span className="text-indigo-600 font-bold">{p.totalValidVotes || 0}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {formatDate(p.createdAt)}
                    </td>

                    <td className="py-3.5 px-6 text-right space-x-1">
                      {/* View Media & Screenshots */}
                      <button
                        onClick={() =>
                          setGalleryProject({
                            title: p.title,
                            coverImageUrl: p.coverImageUrl,
                            screenshots: p.screenshots,
                            initialIndex: 0,
                          })
                        }
                        className="inline-flex p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#FF3D88] hover:bg-slate-100"
                        title={`View Screenshots & Media (${1 + (p.screenshots?.length || 0)})`}
                      >
                        <Images className="w-3.5 h-3.5" />
                      </button>

                      {/* View details */}
                      <NavLink
                        to={`/projects/${p.id}`}
                        className="inline-flex p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                        title="View Public Showcase"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </NavLink>

                      {/* Spotlight Toggle */}
                      <button
                        onClick={() => handleToggleFeatured(p)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          p.isFeatured
                            ? 'bg-amber-100 border-amber-300 text-amber-700'
                            : 'border-slate-200 text-slate-500 hover:bg-amber-50'
                        }`}
                        title={p.isFeatured ? 'Remove Featured Spotlight' : 'Spotlight Project'}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>

                      {/* Archive Toggle */}
                      <button
                        onClick={() => handleToggleArchive(p)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          p.isArchived
                            ? 'bg-slate-200 border-slate-300 text-slate-700'
                            : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                        title={p.isArchived ? 'Restore Project' : 'Archive Project'}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Action (Super Admin Only) */}
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors"
                        title="Permanently Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal with Mandatory Reason */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteReason('');
        }}
        title={`Permanently Delete "${deleteTarget?.title}"?`}
        description="Permanently remove this project and all associated records across ProjectHub."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDeleteTarget(null);
                setDeleteReason('');
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteProject}
              isLoading={isDeleting}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Permanently Delete
            </Button>
          </>
        }
      >
        {deleteTarget && (
          <div className="space-y-4">
            <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 flex items-start gap-3">
              <Trash2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Irreversible Super Admin Action</p>
                <p className="leading-relaxed">
                  Removing <strong>"{deleteTarget.title}"</strong> by <strong>{deleteTarget.creatorName}</strong> will purge all interactions, votes, screenshots, and revisions. The creator will be notified of this action.
                </p>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-1">
                <label className="text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider">
                  Administrative Reason <span className="text-[#FF3D88]">*</span>
                </label>
                <span className={`text-[11px] font-mono ${
                  deleteReason.length > 270 ? 'text-amber-600 font-semibold' : 'text-slate-400'
                }`}>
                  {deleteReason.length}/300 chars • {countWords(deleteReason)} words
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={300}
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Specify the reason for this administrative removal (minimum 5 characters)..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 font-sans"
              />
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                <span>Minimum 5 characters required.</span>
                {deleteReason.length > 0 && deleteReason.trim().length < 5 && (
                  <span className="text-rose-500 font-medium">{5 - deleteReason.trim().length} more characters needed</span>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Dedicated Project Media Gallery Modal */}
      {galleryProject && (
        <ProjectMediaGalleryModal
          isOpen={Boolean(galleryProject)}
          onClose={() => setGalleryProject(null)}
          projectTitle={galleryProject.title}
          coverImageUrl={galleryProject.coverImageUrl}
          screenshots={galleryProject.screenshots}
          initialIndex={galleryProject.initialIndex || 0}
        />
      )}
    </div>
  );
};
