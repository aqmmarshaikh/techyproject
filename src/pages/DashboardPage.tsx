import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderGit2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Heart, 
  Vote, 
  Plus, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { projectRepository } from '../repositories/projectRepository';
import { Project } from '../types';
import { Button } from '../components/common/Button';
import { ProjectCard } from '../features/projects/ProjectCard';
import { formatCompactNumber, formatDate } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.id) return;
    setIsLoading(true);

    const unsubscribe = projectRepository.subscribeToMyProjects(
      userProfile.id,
      (userProjects) => {
        setMyProjects(userProjects);
        setIsLoading(false);
      },
      (err) => {
        console.warn('Dashboard real-time subscription error, falling back:', err);
        projectRepository
          .listByCreator(userProfile.id)
          .then((userProjects) => {
            setMyProjects(userProjects);
            setIsLoading(false);
          })
          .catch((fetchErr) => {
            console.error('Dashboard load failed:', fetchErr);
            setIsLoading(false);
          });
      }
    );

    return () => unsubscribe();
  }, [userProfile?.id]);

  // Aggregate stats directly from actual user project entities (Zero fake statistics!)
  const totalSubmitted = myProjects.length;
  const approvedProjects = myProjects.filter((p) => p.approvalStatus === 'APPROVED');
  const pendingProjects = myProjects.filter((p) => p.approvalStatus === 'PENDING_REVIEW');
  const actionRequiredProjects = myProjects.filter(
    (p) => p.approvalStatus === 'REJECTED' || p.approvalStatus === 'CHANGES_REQUESTED'
  );

  let totalLikes = 0;
  let totalVotes = 0;
  for (const p of myProjects) {
    totalLikes += p.likeCount || 0;
    totalVotes += p.totalValidVotes || 0;
  }

  const statCards = [
    {
      title: 'Submitted Projects',
      value: totalSubmitted,
      icon: <FolderGit2 className="w-5 h-5 text-[#0F1B3D]" />,
      bg: 'bg-slate-50',
      border: 'border-slate-200',
    },
    {
      title: 'Approved & Live',
      value: approvedProjects.length,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-200',
    },
    {
      title: 'Pending Review',
      value: pendingProjects.length,
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50/50',
      border: 'border-amber-200',
    },
    {
      title: 'Action / Changes',
      value: actionRequiredProjects.length,
      icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
      bg: 'bg-rose-50/50',
      border: 'border-rose-200',
    },
    {
      title: 'Total Likes Received',
      value: formatCompactNumber(totalLikes),
      icon: <Heart className="w-5 h-5 text-[#FF3D88]" />,
      bg: 'bg-pink-50/50',
      border: 'border-[#FF3D88]/20',
    },
    {
      title: 'Valid Votes Received',
      value: formatCompactNumber(totalVotes),
      icon: <Vote className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50/50',
      border: 'border-indigo-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Employee Workspace
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#0F1B3D] tracking-tight mt-1">
            Welcome back, {userProfile?.fullName || 'Colleague'}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-sans">
            Track your innovation pipeline, peer community ratings, and approval feedback.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/submit')}
          className="shrink-0 self-start sm:self-auto"
        >
          Submit New Project
        </Button>
      </div>

      {/* Real Statistics Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className={`p-4 rounded-2xl border ${card.border} ${card.bg} flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-slate-600 leading-tight">
                {card.title}
              </span>
              {card.icon}
            </div>
            <span className="text-2xl font-heading font-bold text-[#0F1B3D]">
              {isLoading ? '...' : card.value}
            </span>
          </div>
        ))}
      </div>

      {/* Action Required Banner if Any */}
      {actionRequiredProjects.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">
                Action Required on {actionRequiredProjects.length} Project(s)
              </h4>
              <p className="text-xs text-rose-800 mt-0.5">
                Admin feedback or revisions are needed before these projects can be approved.
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => navigate('/my-projects?tab=action')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Review Feedback
          </Button>
        </div>
      )}

      {/* Recent Submissions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0F1B3D]" />
            <h3 className="font-heading font-bold text-base text-[#0F1B3D]">
              Your Recent Project Pipeline
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/my-projects')}
          >
            Manage All ({myProjects.length})
          </Button>
        </div>

        {isLoading ? (
          <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
        ) : myProjects.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
            <p className="text-sm text-slate-500 font-sans">
              You haven't submitted any projects yet. Share your latest tool, library, or experiment!
            </p>
            <div className="mt-4">
              <Button variant="primary" size="sm" onClick={() => navigate('/submit')}>
                Submit Your First Project
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProjects.slice(0, 3).map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

