import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldAlert, 
  Ban, 
  CheckCircle, 
  Mail, 
  AlertCircle,
  Eye,
  X,
  Trash2
} from 'lucide-react';
import { userRepository } from '../../repositories/userRepository';
import { adminService } from '../../services/adminService';
import { UserProfile, UserRole, AccountStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/common/Toast';
import { RoleBadge, AccountStatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { inviteEmployeeSchema, InviteEmployeeFormData } from '../../schemas/authSchemas';
import { formatDate } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

export const AdminEmployeesPage: React.FC = () => {
  const { userProfile, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Invite modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Suspension confirmation state
  const [suspendTarget, setSuspendTarget] = useState<UserProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Role modification state (Super Admin only)
  const [roleTarget, setRoleTarget] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('EMPLOYEE');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: isInviting },
  } = useForm<InviteEmployeeFormData>({
    resolver: zodResolver(inviteEmployeeSchema),
    defaultValues: {
      email: '',
      fullName: '',
      department: 'Engineering',
      designation: 'Software Engineer',
      role: 'EMPLOYEE',
    },
  });

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const users = await userRepository.listEmployees({
        department: selectedDept,
        searchQuery,
        maxResults: 150,
      });
      setEmployees(users);
    } catch (err) {
      console.warn('Failed to load employees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [searchQuery, selectedDept]);

  const onInviteSubmit = async (data: InviteEmployeeFormData) => {
    if (!userProfile) return;

    try {
      await adminService.inviteEmployee({
        ...data,
        currentAdmin: userProfile,
      });
      toastSuccess('Employee Invited', `Onboarding record created for ${data.email}.`);
      setIsInviteOpen(false);
      reset();
      loadEmployees();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invitation failed';
      toastError('Error', msg);
    }
  };

  const handleToggleSuspend = async () => {
    if (!suspendTarget || !userProfile) return;

    const newStatus: AccountStatus =
      suspendTarget.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

    setIsProcessingAction(true);
    try {
      await adminService.setUserAccountStatus(suspendTarget.id, newStatus, userProfile);
      toastSuccess(
        newStatus === 'SUSPENDED' ? 'Account Suspended' : 'Account Reactivated',
        `User ${suspendTarget.fullName} is now ${newStatus.toLowerCase()}.`
      );
      setSuspendTarget(null);
      loadEmployees();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      toastError('Error', msg);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deleteTarget || !userProfile) return;

    setIsProcessingAction(true);
    try {
      await adminService.deleteEmployee(deleteTarget.id, userProfile);
      toastSuccess('Employee Deleted', `User ${deleteTarget.fullName} has been permanently deleted.`);
      setDeleteTarget(null);
      loadEmployees();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      toastError('Error', msg);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!roleTarget || !userProfile) return;

    setIsProcessingAction(true);
    try {
      await adminService.setUserRole(roleTarget.id, selectedRole, userProfile);
      toastSuccess('Role Updated', `${roleTarget.fullName} is now a ${selectedRole}.`);
      setRoleTarget(null);
      loadEmployees();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Role update failed';
      toastError('Error', msg);
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0F1B3D] tracking-tight">
            Employee & Access Management
          </h2>
          <p className="mt-1 text-sm text-slate-500 font-sans">
            Oversee company accounts, invite new colleagues, and manage security statuses.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={() => setIsInviteOpen(true)}
        >
          Invite Employee
        </Button>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
        >
          <option value="all">All Departments</option>
          <option value="Executive">Executive</option>
          <option value="Engineering">Engineering</option>
          <option value="Product Development">Product Development</option>
          <option value="Design">Design</option>
          <option value="Data & AI">Data & AI</option>
          <option value="Security">Security</option>
        </select>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department & Title</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Approved Projects</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={emp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                        alt={emp.fullName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">{emp.fullName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{emp.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <RoleBadge role={emp.role} />
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-medium text-slate-700">{emp.designation}</p>
                    <p className="text-[11px] text-slate-400">{emp.department}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <AccountStatusBadge status={emp.accountStatus} />
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                    {emp.totalApprovedProjects || 0}
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-1">
                    {/* View Portfolio */}
                    <button
                      onClick={() => navigate(`/directory?creator=${emp.id}`)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
                      title="View Portfolio"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Role Modification (Super Admin Only) */}
                    {isSuperAdmin && emp.role !== 'SUPER_ADMIN' && (
                      <button
                        onClick={() => {
                          setRoleTarget(emp);
                          setSelectedRole(emp.role);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 text-indigo-600 hover:bg-indigo-50"
                        title="Change Role"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Suspend / Reactivate */}
                    {emp.role !== 'SUPER_ADMIN' && (
                      <button
                        onClick={() => setSuspendTarget(emp)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          emp.accountStatus === 'SUSPENDED'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                        }`}
                        title={emp.accountStatus === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}
                      >
                        {emp.accountStatus === 'SUSPENDED' ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Ban className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    {/* Delete Employee Account (Super Admin only) */}
                    {isSuperAdmin && emp.role !== 'SUPER_ADMIN' && (
                      <button
                        onClick={() => setDeleteTarget(emp)}
                        className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors"
                        title="Delete Employee Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        maxWidth="md"
        title="Invite Employee to Platform"
        description="Add a new team member to participate and showcase projects."
      >
        <form onSubmit={handleSubmit(onInviteSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1">
              Company Email <span className="text-[#FF3D88]">*</span>
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="colleague@company.com"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
            />
            {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1">
              Full Name <span className="text-[#FF3D88]">*</span>
            </label>
            <input
              type="text"
              {...register('fullName')}
              placeholder="e.g. Maya Lin"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
            />
            {errors.fullName && <p className="text-xs text-rose-600 mt-1">{errors.fullName.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1">
                Department <span className="text-[#FF3D88]">*</span>
              </label>
              <input
                type="text"
                {...register('department')}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
              />
              {errors.department && <p className="text-xs text-rose-600 mt-1">{errors.department.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1">
                Designation <span className="text-[#FF3D88]">*</span>
              </label>
              <input
                type="text"
                {...register('designation')}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
              />
              {errors.designation && <p className="text-xs text-rose-600 mt-1">{errors.designation.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1">
              Initial Role
            </label>
            <select
              {...register('role')}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
            >
              <option value="EMPLOYEE">Employee</option>
              {isSuperAdmin && <option value="ADMIN">Administrator</option>}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isInviting}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Suspend Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(suspendTarget)}
        onClose={() => setSuspendTarget(null)}
        onConfirm={handleToggleSuspend}
        title={suspendTarget?.accountStatus === 'ACTIVE' ? 'Suspend Employee Account?' : 'Reactivate Account?'}
        message={
          suspendTarget?.accountStatus === 'ACTIVE'
            ? `Suspending ${suspendTarget?.fullName} (${suspendTarget?.email}) will instantly terminate active sessions, block new submissions, and prevent peer voting.`
            : `Reactivating ${suspendTarget?.fullName} will restore full employee platform access.`
        }
        confirmLabel={suspendTarget?.accountStatus === 'ACTIVE' ? 'Confirm Suspension' : 'Reactivate'}
        variant={suspendTarget?.accountStatus === 'ACTIVE' ? 'danger' : 'primary'}
        isLoading={isProcessingAction}
      />

      {/* Delete Confirmation Modal (Super Admin only) */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteEmployee}
        title="Permanently Delete Employee Account"
        message={`Are you sure you want to permanently delete the profile for ${deleteTarget?.fullName} (${deleteTarget?.email})? This action will remove the account from Firestore and cannot be undone.`}
        confirmLabel="Permanently Delete"
        variant="danger"
        isLoading={isProcessingAction}
      />

      {/* Role Modification Modal (Super Admin only) */}
      <Modal
        isOpen={Boolean(roleTarget)}
        onClose={() => setRoleTarget(null)}
        maxWidth="sm"
        title="Modify Administrator Role"
        description={`Configure role assignment for ${roleTarget?.fullName}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1">
              Select Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Administrator</option>
              <option value="SUPER_ADMIN">Super Administrator</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setRoleTarget(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleUpdateRole} isLoading={isProcessingAction}>
              Save Role
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

