import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Flag } from 'lucide-react';
import { reportSubmissionSchema, ReportSubmissionFormData } from '../../schemas/adminSchemas';
import { reportRepository } from '../../repositories/reportRepository';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { ReportReason } from '../../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
}) => {
  const { userProfile } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReportSubmissionFormData>({
    resolver: zodResolver(reportSubmissionSchema),
    defaultValues: {
      projectId,
      projectTitle,
      reason: 'SPAM',
      details: '',
    },
  });

  const onSubmit = async (data: ReportSubmissionFormData) => {
    if (!userProfile) return;

    try {
      const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await reportRepository.create({
        id: reportId,
        projectId,
        projectTitle,
        reporterId: userProfile.id,
        reporterEmail: userProfile.email,
        reason: data.reason as ReportReason,
        details: data.details,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      });

      toastSuccess(
        'Report Submitted',
        'Thank you. Administrators will review the flagged project content.'
      );
      reset();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit report';
      toastError('Submission Error', msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Project Concern"
      description={`Submitting feedback for "${projectTitle}"`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1.5">
            Report Reason <span className="text-[#FF3D88]">*</span>
          </label>
          <select
            {...register('reason')}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
          >
            <option value="SPAM">Spam or Duplicate Submission</option>
            <option value="MISLEADING">Misleading Information or Fake Stats</option>
            <option value="INAPPROPRIATE">Inappropriate Content</option>
            <option value="BROKEN_LINK">Broken or Suspicious External Link</option>
            <option value="IP_CONCERN">Intellectual Property Concern</option>
            <option value="OTHER">Other Issue</option>
          </select>
          {errors.reason && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.reason.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1.5">
            Explanation & Details <span className="text-[#FF3D88]">*</span>
          </label>
          <textarea
            rows={3}
            {...register('details')}
            placeholder="Please detail why this project requires administrator attention..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30 font-sans"
          />
          {errors.details && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.details.message}
            </p>
          )}
        </div>

        <div className="pt-3 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" size="sm" isLoading={isSubmitting}>
            Submit Report
          </Button>
        </div>
      </form>
    </Modal>
  );
};

