import React, { useState, useEffect } from 'react';
import { CheckCircle, ExternalLink } from 'lucide-react';
import { reportRepository } from '../../repositories/reportRepository';
import { adminService } from '../../services/adminService';
import { ProjectReport, ReportStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/common/Toast';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/formatters';

export const AdminReportsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  const [reports, setReports] = useState<ProjectReport[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('PENDING');
  const [isLoading, setIsLoading] = useState(true);

  const [inspectReport, setInspectReport] = useState<ProjectReport | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const items = await reportRepository.list(statusFilter);
      setReports(items);
    } catch (err) {
      console.warn('Failed to load reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const handleResolve = async (newStatus: 'DISMISSED' | 'ACTIONED') => {
    if (!inspectReport || !userProfile) return;

    setIsSubmittingAction(true);
    try {
      await adminService.resolveReport({
        reportId: inspectReport.id,
        status: newStatus,
        adminNotes: adminNotes || undefined,
        actionTaken: newStatus === 'ACTIONED' ? 'Reviewed and actioned by administrator.' : 'Dismissed as non-violating.',
        currentAdmin: userProfile,
      });

      toastSuccess(
        newStatus === 'ACTIONED' ? 'Report Actioned' : 'Report Dismissed',
        `Report has been marked as ${newStatus.toLowerCase()}.`
      );

      setInspectReport(null);
      setAdminNotes('');
      loadReports();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      toastError('Error', msg);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#0F1B3D] tracking-tight">
          Flagged Project Reports
        </h2>
        <p className="mt-1 text-sm text-slate-500 font-sans">
          Review community-reported concerns regarding spam, inappropriate content, or broken external links.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        {(['PENDING', 'ACTIONED', 'DISMISSED', 'ALL'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2.5 font-heading font-semibold text-xs sm:text-sm border-b-2 transition-all ${
              statusFilter === s
                ? 'border-[#FF3D88] text-[#0F1B3D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={<CheckCircle className="w-8 h-8 text-emerald-600" />}
          title="No Reports In this Status"
          description="Everything looks clean and verified."
        />
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="danger">{r.reason}</Badge>
                  <span className="text-xs font-mono text-slate-400">
                    Project: {r.projectTitle}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {r.status}
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-sans leading-relaxed">
                  <strong>Reporter Context:</strong> "{r.details}"
                </p>

                <p className="text-[11px] font-mono text-slate-400">
                  Reported by {r.reporterEmail} • {formatDate(r.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/projects/${r.projectId}`)}
                  leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  View Project
                </Button>

                {r.status === 'PENDING' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setInspectReport(r);
                      setAdminNotes('');
                    }}
                  >
                    Moderate
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Moderate Report Modal */}
      <Modal
        isOpen={Boolean(inspectReport)}
        onClose={() => setInspectReport(null)}
        maxWidth="md"
        title="Moderate Flagged Project"
        description={`Report against "${inspectReport?.projectTitle}"`}
      >
        {inspectReport && (
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-950 font-sans space-y-1">
              <span className="font-semibold block">Reason: {inspectReport.reason}</span>
              <p>{inspectReport.details}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1">
                Admin Notes / Action Log
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Optional notes explaining resolution..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResolve('DISMISSED')}
                disabled={isSubmittingAction}
              >
                Dismiss (No Issue)
              </Button>

              <Button
                variant="danger"
                size="sm"
                onClick={() => handleResolve('ACTIONED')}
                isLoading={isSubmittingAction}
              >
                Action Report
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
