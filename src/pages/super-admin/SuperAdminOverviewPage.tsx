import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  UserCheck, 
  Users, 
  CheckCircle2, 
  Clock, 
  Flag, 
  Settings, 
  FileText, 
  Lock, 
  ArrowRight,
  TrendingUp,
  Activity,
  Server
} from 'lucide-react';
import { adminRepository } from '../../repositories/adminRepository';
import { userRepository } from '../../repositories/userRepository';
import { projectRepository } from '../../repositories/projectRepository';
import { reportRepository } from '../../repositories/reportRepository';
import { AdminAnalyticsSummary, AuditLog, UserProfile, Project } from '../../types';
import { Button } from '../../components/common/Button';
import { formatCompactNumber, formatRelativeTime } from '../../utils/formatters';

export const SuperAdminOverviewPage: React.FC = () => {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<AdminAnalyticsSummary | null>(null);
  const [adminCount, setAdminCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSuperAdminOverview = async () => {
      setIsLoading(true);
      try {
        const [summary, allUsers, pending, reports, logs] = await Promise.all([
          adminRepository.getAnalyticsSummary(),
          userRepository.listEmployees({ maxResults: 200 }),
          projectRepository.listPendingReview(),
          reportRepository.list('PENDING'),
          adminRepository.listAuditLogs(6),
        ]);

        setAnalytics(summary);
        setAdminCount(allUsers.filter((u: UserProfile) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length);
        setPendingCount(pending.length);
        setFlaggedCount(reports.length);
        setRecentLogs(logs);
      } catch (err) {
        console.warn('Super Admin overview load warning:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSuperAdminOverview();
  }, []);

  const kpis = [
    {
      title: 'Active Administrators',
      value: adminCount,
      icon: <ShieldAlert className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50 border-purple-200/80',
      action: () => navigate('/super-admin/admins'),
      actionLabel: 'Manage Admins →',
    },
    {
      title: 'Company Employees',
      value: analytics?.totalEmployees || 0,
      icon: <Users className="w-5 h-5 text-[#0F1B3D]" />,
      bg: 'bg-slate-50 border-slate-200',
      action: () => navigate('/super-admin/employees'),
      actionLabel: 'View Directory →',
    },
    {
      title: 'Pending Review Queue',
      value: pendingCount,
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-200',
      highlight: pendingCount > 0,
      action: () => navigate('/admin/review-queue'),
      actionLabel: 'Review Submissions →',
    },
    {
      title: 'Approved Projects',
      value: analytics?.totalApprovedProjects || 0,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-200',
      action: () => navigate('/super-admin/projects'),
      actionLabel: 'All Projects →',
    },
    {
      title: 'Moderation Reports',
      value: flaggedCount,
      icon: <Flag className="w-5 h-5 text-rose-600" />,
      bg: 'bg-rose-50 border-rose-200',
      action: () => navigate('/admin/reports'),
      actionLabel: 'Inspect Reports →',
    },
    {
      title: 'Total Engagement Votes',
      value: formatCompactNumber(analytics?.totalVotes || 0),
      icon: <TrendingUp className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title & System Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-purple-100 text-purple-700 border border-purple-200">
              Super Admin Level 1
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#0F1B3D] tracking-tight">
            Executive Governance & Control Center
          </h2>
          <p className="mt-1 text-sm text-slate-500 font-sans">
            Centralized platform oversight, administrator management, security parameters, and audit logging.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Settings className="w-4 h-4" />}
            onClick={() => navigate('/super-admin/settings')}
          >
            Settings
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Lock className="w-4 h-4" />}
            onClick={() => navigate('/super-admin/security')}
          >
            Security Controls
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <div
            key={k.title}
            className={`p-4 rounded-2xl border ${k.bg} flex flex-col justify-between ${
              k.highlight ? 'ring-2 ring-amber-400' : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-600 leading-tight">
                  {k.title}
                </span>
                {k.icon}
              </div>
              <span className="text-2xl font-heading font-bold text-[#0F1B3D]">
                {isLoading ? '...' : k.value}
              </span>
            </div>
            {k.action && (
              <button
                type="button"
                onClick={k.action}
                className="mt-3 text-[11px] font-semibold text-[#FF3D88] hover:underline text-left cursor-pointer"
              >
                {k.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Executive Command Center Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module 1: Admin & Role Governance */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl w-fit mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[#0F1B3D]">
              Administrator Governance
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-1.5 leading-relaxed">
              Designate, promote, or demote platform administrators. Oversee administrative access privileges and enforce security boundaries.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-6"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/super-admin/admins')}
          >
            Manage Administrators
          </Button>
        </div>

        {/* Module 2: Platform Settings & Policies */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-3 bg-slate-100 text-slate-800 rounded-2xl w-fit mb-4">
              <Settings className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[#0F1B3D]">
              Platform Configuration
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-1.5 leading-relaxed">
              Adjust project arena minimum vote thresholds, registration policies, email domain restrictions, and media upload size limits.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-6"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/super-admin/settings')}
          >
            Configure Settings
          </Button>
        </div>

        {/* Module 3: Security & Verification */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl w-fit mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[#0F1B3D]">
              Security & Audit Posture
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-1.5 leading-relaxed">
              Inspect immutable audit trails of all administrative actions, verify Firebase rule policies, and check role hierarchy constraints.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-6"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/super-admin/audit-logs')}
          >
            Inspect Audit Trails
          </Button>
        </div>
      </div>

      {/* Recent Immutable Audit Logs Stream */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-base text-[#0F1B3D]">
              Immutable System Audit Stream
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Cryptographically timestamped record of administrative and security events.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/super-admin/audit-logs')}
          >
            View All Logs
          </Button>
        </div>

        {recentLogs.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">No audit log records logged yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded font-mono font-semibold bg-slate-100 text-slate-800 text-[11px]">
                    {log.action}
                  </span>
                  <span className="text-slate-600 font-medium">{log.actorEmail}</span>
                  <span className="text-slate-400">→</span>
                  <span className="text-slate-500 font-mono text-[11px] truncate max-w-xs">
                    {log.targetEntity}: {log.targetId}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-400 shrink-0">
                  {formatRelativeTime(log.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
