import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Heart, 
  Vote, 
  ArrowRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { adminRepository } from '../../repositories/adminRepository';
import { projectRepository } from '../../repositories/projectRepository';
import { AdminAnalyticsSummary, AuditLog, Project } from '../../types';
import { Button } from '../../components/common/Button';
import { formatCompactNumber, formatDate, formatRelativeTime } from '../../utils/formatters';

export const AdminOverviewPage: React.FC = () => {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<AdminAnalyticsSummary | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [pendingQueue, setPendingQueue] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      setIsLoading(true);
      try {
        const [summary, logs, pending] = await Promise.all([
          adminRepository.getAnalyticsSummary(),
          adminRepository.listAuditLogs(8),
          projectRepository.listPendingReview(),
        ]);
        setAnalytics(summary);
        setRecentLogs(logs);
        setPendingQueue(pending);
      } catch (err) {
        console.warn('Failed to load admin overview:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadOverview();
  }, []);

  const stats = [
    {
      title: 'Total Employees',
      value: analytics?.totalEmployees || 0,
      icon: <Users className="w-5 h-5 text-[#0F1B3D]" />,
      bg: 'bg-slate-50',
    },
    {
      title: 'Active Employees',
      value: analytics?.activeEmployees || 0,
      icon: <UserCheck className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50/50',
    },
    {
      title: 'Approved Projects',
      value: analytics?.totalApprovedProjects || 0,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50/50',
    },
    {
      title: 'Pending Submissions',
      value: analytics?.pendingSubmissions || 0,
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50/50',
      highlight: (analytics?.pendingSubmissions || 0) > 0,
    },
    {
      title: 'Rejected Projects',
      value: analytics?.rejectedSubmissions || 0,
      icon: <XCircle className="w-5 h-5 text-rose-600" />,
      bg: 'bg-rose-50/50',
    },
    {
      title: 'Total Verified Likes',
      value: formatCompactNumber(analytics?.totalLikes || 0),
      icon: <Heart className="w-5 h-5 text-[#FF3D88]" />,
      bg: 'bg-pink-50/50',
    },
    {
      title: 'Total Peer Votes',
      value: formatCompactNumber(analytics?.totalVotes || 0),
      icon: <Vote className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50/50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#0F1B3D] tracking-tight">
          Platform Governance & Metrics
        </h2>
        <p className="mt-1 text-sm text-slate-500 font-sans">
          Live statistics, moderation alerts, and administrative activity feeds.
        </p>
      </div>

      {/* Real Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {stats.map((s) => (
          <div
            key={s.title}
            className={`p-4 rounded-2xl border border-slate-200/90 ${s.bg} flex flex-col justify-between ${
              s.highlight ? 'ring-2 ring-amber-400/50' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-slate-600 leading-tight">
                {s.title}
              </span>
              {s.icon}
            </div>
            <span className="text-2xl font-heading font-bold text-[#0F1B3D]">
              {isLoading ? '...' : s.value}
            </span>
          </div>
        ))}
      </div>

      {/* Pending Review Alert Banner */}
      {pendingQueue.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">
                {pendingQueue.length} Project Submission(s) Waiting in Review Queue
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Ensure project descriptions are meaningful and URLs are safe before approving.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/admin/review-queue')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Open Review Queue
          </Button>
        </div>
      )}

      {/* Two Column Section: Quick Actions & Recent Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Admin Actions */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-base text-[#0F1B3D]">
            Administrative Workflows
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/admin/review-queue')}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors flex flex-col justify-between cursor-pointer"
            >
              <div>
                <Clock className="w-5 h-5 text-amber-600 mb-2" />
                <h4 className="font-heading font-semibold text-sm text-[#0F1B3D]">Review Queue</h4>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Inspect new submissions & proposed revisions.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#FF3D88] mt-3">
                {pendingQueue.length} pending →
              </span>
            </button>

            <button
              onClick={() => navigate('/admin/employees')}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors flex flex-col justify-between cursor-pointer"
            >
              <div>
                <Users className="w-5 h-5 text-[#0F1B3D] mb-2" />
                <h4 className="font-heading font-semibold text-sm text-[#0F1B3D]">Employees</h4>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Invite members, manage suspensions, and check portfolios.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#FF3D88] mt-3">Manage roster →</span>
            </button>

            <button
              onClick={() => navigate('/admin/categories')}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors flex flex-col justify-between cursor-pointer"
            >
              <div>
                <ShieldCheck className="w-5 h-5 text-emerald-600 mb-2" />
                <h4 className="font-heading font-semibold text-sm text-[#0F1B3D]">Categories</h4>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Configure project categories and taxonomy.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#FF3D88] mt-3">Configure tags →</span>
            </button>

            <button
              onClick={() => navigate('/admin/reports')}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors flex flex-col justify-between cursor-pointer"
            >
              <div>
                <Activity className="w-5 h-5 text-rose-600 mb-2" />
                <h4 className="font-heading font-semibold text-sm text-[#0F1B3D]">Flagged Reports</h4>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Review reported spam or broken links.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#FF3D88] mt-3">Moderate →</span>
            </button>
          </div>
        </div>

        {/* Immutable Audit Log Feed */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-[#0F1B3D]">
              Recent Audit Log Entries
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Immutable</span>
          </div>

          {recentLogs.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No audit records logged yet.</p>
          ) : (
            <div className="space-y-2.5">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-mono font-semibold text-[#0F1B3D]">
                      {log.action}
                    </span>
                    <p className="text-slate-500 text-[11px] truncate">
                      By {log.actorEmail} • Target: {log.targetId}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-slate-400">
                    {formatRelativeTime(log.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

