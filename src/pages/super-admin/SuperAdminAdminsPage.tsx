import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  UserPlus, 
  UserMinus, 
  CheckCircle, 
  Search, 
  AlertCircle,
  Mail,
  ShieldCheck,
  Info
} from 'lucide-react';
import { userRepository } from '../../repositories/userRepository';
import { adminService } from '../../services/adminService';
import { UserProfile, UserRole } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/common/Toast';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { RoleBadge } from '../../components/common/Badge';
import { UserAvatar } from '../../components/common/UserAvatar';
import { formatDate } from '../../utils/formatters';

export const SuperAdminAdminsPage: React.FC = () => {
  const { userProfile, isSuperAdmin } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [allEmployees, setAllEmployees] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [isPromoting, setIsPromoting] = useState(false);

  // Demote Confirmation
  const [demoteTarget, setDemoteTarget] = useState<UserProfile | null>(null);
  const [isDemoting, setIsDemoting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const users = await userRepository.listEmployees({ maxResults: 200 });
      setAllEmployees(users);
      setAdmins(users.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN'));
    } catch (err) {
      console.warn('Failed to load administrators:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePromote = async () => {
    if (!selectedEmployeeId || !userProfile) return;

    setIsPromoting(true);
    try {
      await adminService.setUserRole(selectedEmployeeId, 'ADMIN', userProfile);
      toastSuccess('Administrator Designated', 'Employee has been elevated to Administrator.');
      setIsPromoteModalOpen(false);
      setSelectedEmployeeId('');
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Promotion failed';
      toastError('Promotion Failed', msg);
    } finally {
      setIsPromoting(false);
    }
  };

  const handleDemote = async () => {
    if (!demoteTarget || !userProfile) return;

    setIsDemoting(true);
    try {
      await adminService.setUserRole(demoteTarget.id, 'EMPLOYEE', userProfile);
      toastSuccess('Privileges Revoked', `${demoteTarget.fullName} has been reverted to Employee.`);
      setDemoteTarget(null);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Demotion failed';
      toastError('Demotion Failed', msg);
    } finally {
      setIsDemoting(false);
    }
  };

  const eligibleEmployees = allEmployees.filter(
    (e) => e.role === 'EMPLOYEE' && e.accountStatus !== 'SUSPENDED'
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0F1B3D] tracking-tight">
            Administrator Management
          </h2>
          <p className="mt-1 text-sm text-slate-500 font-sans">
            Govern authorized platform administrators, designate new moderators, and revoke administrative privileges.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={() => setIsPromoteModalOpen(true)}
        >
          Designate New Admin
        </Button>
      </div>

      {/* Admin Testing Guidance Card */}
      <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 flex flex-col sm:flex-row sm:items-start gap-4">
        <Info className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div className="text-xs font-sans leading-relaxed">
          <h4 className="font-heading font-bold text-sm text-purple-900 mb-1">
            Testing Actual Administrator Permissions
          </h4>
          <p className="text-purple-800">
            To test native Admin permissions without preview mode:
          </p>
          <ul className="list-disc pl-4 mt-1.5 space-y-1 text-purple-800">
            <li>Designate a test employee account below by selecting their name and clicking <strong>Promote</strong>.</li>
            <li>Log in using that account (e.g. from an incognito window or alternate browser session).</li>
            <li>The test account will immediately have server-enforced <code>ADMIN</code> permissions across Firestore without Super Admin settings access.</li>
          </ul>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <span className="font-heading font-bold text-base text-[#0F1B3D]">
            Active Platform Administrators ({admins.length})
          </span>
          <span className="text-xs font-mono text-slate-400">
            Hierarchy: SUPER_ADMIN &gt; ADMIN &gt; EMPLOYEE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-6">Administrator</th>
                <th className="py-3 px-4">Role Tier</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Member Since</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    Loading platform administrators...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    No administrators found.
                  </td>
                </tr>
              ) : (
                admins.map((adm) => {
                  const isPrimarySuperAdmin = adm.role === 'SUPER_ADMIN';
                  return (
                    <tr key={adm.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={adm} size="sm" className="ring-1 ring-slate-200" />
                          <div>
                            <p className="font-semibold text-slate-900">{adm.fullName}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{adm.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <RoleBadge role={adm.role} />
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {adm.department || 'Executive'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {formatDate(adm.joinDate || adm.createdAt)}
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        {isPrimarySuperAdmin ? (
                          <span className="text-[11px] font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
                            Primary Super Admin
                          </span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDemoteTarget(adm)}
                            className="text-rose-600 hover:bg-rose-50 border-rose-200 hover:border-rose-300"
                            leftIcon={<UserMinus className="w-3.5 h-3.5" />}
                          >
                            Revoke Admin
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promote to Admin Modal */}
      <Modal
        isOpen={isPromoteModalOpen}
        onClose={() => setIsPromoteModalOpen(false)}
        maxWidth="md"
        title="Designate Platform Administrator"
        description="Select an employee from the company roster to grant elevated Administrator moderation privileges."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1.5">
              Select Company Employee <span className="text-[#FF3D88]">*</span>
            </label>
            {eligibleEmployees.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border">
                All active company employees already hold administrative roles or none are registered yet.
              </p>
            ) : (
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
              >
                <option value="">Choose an employee...</option>
                {eligibleEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.email}) — {emp.department}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Promoting an employee grants them permission to review project submissions, approve/reject projects, manage categories, and handle moderation reports.
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPromoteModalOpen(false)}
              disabled={isPromoting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePromote}
              isLoading={isPromoting}
              disabled={!selectedEmployeeId}
            >
              Confirm Promotion to Admin
            </Button>
          </div>
        </div>
      </Modal>

      {/* Demote Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(demoteTarget)}
        onClose={() => setDemoteTarget(null)}
        onConfirm={handleDemote}
        title="Revoke Administrator Privileges"
        message={`Are you sure you want to demote ${demoteTarget?.fullName} (${demoteTarget?.email}) from Administrator to Employee? They will lose access to the review queue and moderation center.`}
        confirmLabel="Revoke Admin Access"
        variant="danger"
        isLoading={isDemoting}
      />
    </div>
  );
};
