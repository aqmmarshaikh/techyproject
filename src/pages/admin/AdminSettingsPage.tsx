import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Settings, Shield, Save, AlertCircle } from 'lucide-react';
import { adminRepository } from '../../repositories/adminRepository';
import { adminService } from '../../services/adminService';
import { SystemSettings } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/common/Toast';
import { systemSettingsSchema, SystemSettingsFormData } from '../../schemas/adminSchemas';
import { Button } from '../../components/common/Button';

export const AdminSettingsPage: React.FC = () => {
  const { userProfile, isSuperAdmin } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SystemSettingsFormData>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      companyDomain: '',
      registrationPolicy: 'INVITE_ONLY',
      arenaMinVoteThreshold: 10,
      maxCoverImageSizeBytes: 5242880,
      maxScreenshotsPerProject: 6,
      trendingWindowDays: 7,
    },
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const s = await adminRepository.getSettings();
        reset({
          companyDomain: s.companyDomain || '',
          registrationPolicy: s.registrationPolicy || 'INVITE_ONLY',
          arenaMinVoteThreshold: s.arenaMinVoteThreshold || 10,
          maxCoverImageSizeBytes: s.maxCoverImageSizeBytes || 5242880,
          maxScreenshotsPerProject: s.maxScreenshotsPerProject || 6,
          trendingWindowDays: s.trendingWindowDays || 7,
        });
      } catch (err) {
        console.warn('Failed to load settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [reset]);

  const onSave = async (data: SystemSettingsFormData) => {
    if (!userProfile || !isSuperAdmin) {
      toastError('Unauthorized', 'Only Super Administrators can update platform settings.');
      return;
    }

    try {
      await adminService.updatePlatformSettings(data, userProfile);
      toastSuccess('Settings Saved', 'Platform security and Arena thresholds have been updated.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update settings';
      toastError('Error', msg);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-sm text-slate-500">Super Administrator privileges required.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-[#FF3D88]" />
          <span className="text-xs font-mono uppercase tracking-wider text-[#FF3D88] font-bold">
            Super Admin Exclusive
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#0F1B3D] tracking-tight">
          Platform Governance Settings
        </h2>
        <p className="mt-1 text-sm text-slate-500 font-sans">
          Configure security policies, company email domain restrictions, and Arena ranking algorithms.
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <form onSubmit={handleSubmit(onSave)} className="space-y-6">
          {/* Registration Policy */}
          <div>
            <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1.5">
              Employee Registration Policy <span className="text-[#FF3D88]">*</span>
            </label>
            <select
              {...register('registrationPolicy')}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30 font-sans"
            >
              <option value="INVITE_ONLY">Invite Only (Admins manually onboard employees)</option>
              <option value="RESTRICTED_DOMAIN">Domain Restricted (Auto-allow emails matching company domain)</option>
              <option value="OPEN_REGISTRATION">Open Registration (Not recommended for enterprise internal)</option>
            </select>
          </div>

          {/* Company Email Domain */}
          <div>
            <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1.5">
              Allowed Company Email Domain
            </label>
            <input
              type="text"
              {...register('companyDomain')}
              placeholder="e.g. company.com (without @)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Required when Registration Policy is set to Restricted Domain.
            </p>
          </div>

          {/* Arena Min Vote Threshold */}
          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label className="text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider">
                Arena Top-Rated Minimum Vote Threshold <span className="text-[#FF3D88]">*</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">Default: 10 votes</span>
            </div>
            <input
              type="number"
              {...register('arenaMinVoteThreshold', { valueAsNumber: true })}
              min={1}
              max={100}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
            />
            {errors.arenaMinVoteThreshold && (
              <p className="text-xs text-rose-600 mt-1">{errors.arenaMinVoteThreshold.message}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              Projects with fewer votes will display an explanatory notice and not skew the Top Rated leaderboard.
            </p>
          </div>

          {/* Trending Decay Window Days */}
          <div>
            <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1.5">
              Trending Velocity Window (Days) <span className="text-[#FF3D88]">*</span>
            </label>
            <input
              type="number"
              {...register('trendingWindowDays', { valueAsNumber: true })}
              min={1}
              max={90}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
            />
          </div>

          {/* Max Screenshots Per Project */}
          <div>
            <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1.5">
              Max Screenshots per Project
            </label>
            <input
              type="number"
              {...register('maxScreenshotsPerProject', { valueAsNumber: true })}
              min={1}
              max={10}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
            />
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Save className="w-4 h-4" />}
              isLoading={isSubmitting}
            >
              Save Configuration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

