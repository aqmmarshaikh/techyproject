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
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { projectRepository } from '../repositories/projectRepository';
import { Project, ApprovalStatus } from '../types';
import { Button } from '../components/common/Button';
import { ProjectStatusBadge, ApprovalStatusBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { formatDate } from '../utils/formatters';

type TabKey = 'ALL' | 'APPROVED' | 'PENDING' | 'ACTION' | 'ARCHIVED';

export const MyProjectsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>(
    searchParams.get('tab') === 'action' ? 'ACTION' : 'ALL'
  );

  useEffect(() => {
    const load = async () => {
      if (!userProfile?.id) return;
      setIsLoading(true);
      try {
        const items = await projectRepository.listByCreator(userProfile.id);
        setProjects(items);
      } catch (err) {
        console.warn('Failed to load user projects:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [userProfile?.id]);

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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

