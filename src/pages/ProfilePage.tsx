import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  UserCircle, 
  Mail, 
  Briefcase, 
  Building, 
  Calendar, 
  Shield, 
  Heart, 
  Vote, 
  FolderGit2, 
  Edit3, 
  Plus, 
  X, 
  Upload,
  Check
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { userRepository } from '../repositories/userRepository';
import { cloudinaryService } from '../services/cloudinaryService';
import { profileUpdateSchema, ProfileUpdateFormData } from '../schemas/profileSchemas';
import { RoleBadge, AccountStatusBadge, Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { formatDate } from '../utils/formatters';

export const ProfilePage: React.FC = () => {
  const { userProfile, refreshProfile } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: userProfile?.fullName || '',
      designation: userProfile?.designation || '',
      department: userProfile?.department || '',
      avatarUrl: userProfile?.avatarUrl || '',
      skills: userProfile?.skills || [],
      technologies: userProfile?.technologies || [],
    },
  });

  const currentSkills = watch('skills') || [];
  const currentTechs = watch('technologies') || [];
  const currentAvatar = watch('avatarUrl');

  const handleOpenEdit = () => {
    reset({
      fullName: userProfile?.fullName || '',
      designation: userProfile?.designation || '',
      department: userProfile?.department || '',
      avatarUrl: userProfile?.avatarUrl || '',
      skills: userProfile?.skills || [],
      technologies: userProfile?.technologies || [],
    });
    setIsEditModalOpen(true);
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (!currentSkills.includes(trimmed)) {
      setValue('skills', [...currentSkills, trimmed], { shouldValidate: true });
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    setValue('skills', currentSkills.filter((s) => s !== skill), { shouldValidate: true });
  };

  const handleAddTech = () => {
    const trimmed = techInput.trim();
    if (!trimmed) return;
    if (!currentTechs.includes(trimmed)) {
      setValue('technologies', [...currentTechs, trimmed], { shouldValidate: true });
    }
    setTechInput('');
  };

  const handleRemoveTech = (tech: string) => {
    setValue('technologies', currentTechs.filter((t) => t !== tech), { shouldValidate: true });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const url = await cloudinaryService.uploadImage(file, { folder: 'avatars', maxSizeMb: 2 });
      setValue('avatarUrl', url, { shouldValidate: true });
      toastSuccess('Avatar Uploaded', 'Profile image updated.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Avatar upload failed';
      toastError('Error', msg);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onSaveProfile = async (data: ProfileUpdateFormData) => {
    if (!userProfile?.id) return;
    try {
      await userRepository.updateProfile(userProfile.id, data);
      await refreshProfile();
      toastSuccess('Profile Updated', 'Your changes have been saved successfully.');
      setIsEditModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      toastError('Error', msg);
    }
  };

  if (!userProfile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={
                userProfile.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
              }
              alt={userProfile.fullName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-slate-200 shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
              }}
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#0F1B3D]">
                  {userProfile.fullName}
                </h2>
                <RoleBadge role={userProfile.role} />
                <AccountStatusBadge status={userProfile.accountStatus} />
              </div>

              <p className="text-sm font-medium text-slate-700 font-sans">
                {userProfile.designation}
              </p>
              <p className="text-xs text-slate-400 font-sans flex items-center gap-1">
                <Building className="w-3.5 h-3.5" /> {userProfile.department}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit3 className="w-4 h-4" />}
            onClick={handleOpenEdit}
            className="self-start sm:self-auto"
          >
            Edit Profile
          </Button>
        </div>

        {/* Engagement Stats Strip */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
          <div>
            <span className="text-[11px] font-mono text-slate-400 block uppercase">Approved Projects</span>
            <span className="text-xl font-heading font-bold text-[#0F1B3D]">
              {userProfile.totalApprovedProjects || 0}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-mono text-slate-400 block uppercase">Submitted Total</span>
            <span className="text-xl font-heading font-bold text-[#0F1B3D]">
              {userProfile.totalSubmittedProjects || 0}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-mono text-slate-400 block uppercase">Likes Received</span>
            <span className="text-xl font-heading font-bold text-[#FF3D88]">
              {userProfile.totalLikesReceived || 0}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-mono text-slate-400 block uppercase">Votes Received</span>
            <span className="text-xl font-heading font-bold text-emerald-600">
              {userProfile.totalVotesReceived || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Details & Read-Only System Security Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills & Technologies */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-base text-[#0F1B3D]">
            Skills & Competencies
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {userProfile.skills && userProfile.skills.length > 0 ? (
              userProfile.skills.map((s) => (
                <Badge key={s} variant="navy">{s}</Badge>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No skills listed yet. Click Edit Profile.</span>
            )}
          </div>

          <h3 className="font-heading font-bold text-base text-[#0F1B3D] pt-2">
            Technologies & Tools
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {userProfile.technologies && userProfile.technologies.length > 0 ? (
              userProfile.technologies.map((t) => (
                <Badge key={t} variant="tech">{t}</Badge>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No technologies listed yet.</span>
            )}
          </div>
        </div>

        {/* System & Identity Information (Non-editable for integrity) */}
        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-400" />
            <h3 className="font-heading font-bold text-base text-[#0F1B3D]">
              Verified Employee Identity
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Administrative, role, and security credentials are authenticated and managed by company administrators.
          </p>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-400">Work Email:</span>
              <span className="text-slate-800 font-semibold">{userProfile.email}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-400">Assigned Role:</span>
              <RoleBadge role={userProfile.role} />
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-400">Account Status:</span>
              <AccountStatusBadge status={userProfile.accountStatus} />
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-400">Member Since:</span>
              <span className="text-slate-800">{formatDate(userProfile.joinDate)}</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-400">Employee UID:</span>
              <span className="text-slate-500 text-[10px] truncate max-w-[150px]">{userProfile.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        maxWidth="lg"
        title="Edit Employee Profile"
        description="Update your display details, designation, and skills portfolio."
      >
        <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4">
            <img
              src={currentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt="Avatar preview"
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
            />
            <label className="cursor-pointer">
              <span className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors inline-block">
                {isUploadingAvatar ? 'Uploading...' : 'Change Avatar'}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={isUploadingAvatar}
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1">
              Full Name <span className="text-[#FF3D88]">*</span>
            </label>
            <input
              type="text"
              {...register('fullName')}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30 font-sans"
            />
            {errors.fullName && <p className="text-xs text-rose-600 mt-1">{errors.fullName.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1">
                Designation <span className="text-[#FF3D88]">*</span>
              </label>
              <input
                type="text"
                {...register('designation')}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30 font-sans"
              />
              {errors.designation && <p className="text-xs text-rose-600 mt-1">{errors.designation.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1">
                Department <span className="text-[#FF3D88]">*</span>
              </label>
              <input
                type="text"
                {...register('department')}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30 font-sans"
              />
              {errors.department && <p className="text-xs text-rose-600 mt-1">{errors.department.message}</p>}
            </div>
          </div>

          {/* Skills Tag Input */}
          <div>
            <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1">
              Skills
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add a skill and press Enter..."
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddSkill}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 p-2 bg-slate-50 rounded-xl border border-slate-200 min-h-[32px]">
              {currentSkills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-xs font-sans text-slate-700"
                >
                  {s}
                  <button type="button" onClick={() => handleRemoveSkill(s)} className="text-slate-400 hover:text-rose-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Technologies Tag Input */}
          <div>
            <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1">
              Technologies
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTech();
                  }
                }}
                placeholder="Add technology (e.g., React, Go) and press Enter..."
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddTech}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 p-2 bg-slate-50 rounded-xl border border-slate-200 min-h-[32px]">
              {currentTechs.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-xs font-mono text-slate-700"
                >
                  {t}
                  <button type="button" onClick={() => handleRemoveTech(t)} className="text-slate-400 hover:text-rose-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

