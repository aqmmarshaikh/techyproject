import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Building, 
  Edit3, 
  X, 
  Upload,
  Trash2,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { userRepository } from '../repositories/userRepository';
import { cloudinaryService } from '../services/cloudinaryService';
import { profileUpdateSchema, ProfileUpdateFormData } from '../schemas/profileSchemas';
import { RoleBadge, AccountStatusBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { formatDate } from '../utils/formatters';
import { UserAvatar } from '../components/common/UserAvatar';
import { getUserDisplayName } from '../utils/userDisplay';

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
      displayName: userProfile?.displayName || userProfile?.fullName || '',
      designation: userProfile?.designation || '',
      department: userProfile?.department || '',
      avatarUrl: userProfile?.avatarUrl || '',
      customAvatarUrl: userProfile?.customAvatarUrl || '',
      googlePhotoUrl: userProfile?.googlePhotoUrl || '',
      skills: userProfile?.skills || [],
      technologies: userProfile?.technologies || [],
    },
  });

  const currentSkills = watch('skills') || [];
  const currentTechs = watch('technologies') || [];
  const currentAvatar = watch('avatarUrl');
  const watchedFullName = watch('fullName');
  const watchedDisplayName = watch('displayName');
  const watchedDesignation = watch('designation') || '';
  const watchedDepartment = watch('department') || '';

  const handleOpenEdit = () => {
    reset({
      fullName: userProfile?.fullName || '',
      displayName: userProfile?.displayName || userProfile?.fullName || '',
      designation: userProfile?.designation || '',
      department: userProfile?.department || '',
      avatarUrl: userProfile?.avatarUrl || '',
      customAvatarUrl: userProfile?.customAvatarUrl || '',
      googlePhotoUrl: userProfile?.googlePhotoUrl || '',
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

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toastError('Invalid Format', 'Supported formats are JPG, PNG, and WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toastError('File Too Large', 'Maximum profile picture size is 5 MB.');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const url = await cloudinaryService.uploadImage(file, { folder: 'avatars', maxSizeMb: 5 });
      setValue('avatarUrl', url, { shouldValidate: true });
      setValue('customAvatarUrl', url, { shouldValidate: true });
      toastSuccess('Photo Uploaded', 'New custom profile photo uploaded. Click "Save Profile" to persist changes.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Photo upload failed';
      toastError('Upload Failed', msg);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveCustomAvatar = () => {
    // If the user has a Google photo available, restore it; otherwise clear to empty string (branded initials fallback)
    const fallbackPhoto = userProfile?.googlePhotoUrl || '';
    setValue('avatarUrl', fallbackPhoto, { shouldValidate: true });
    setValue('customAvatarUrl', '', { shouldValidate: true });
    toastSuccess(
      'Custom Photo Removed',
      fallbackPhoto ? 'Restored Google account photo.' : 'Restored branded fallback initials avatar.'
    );
  };

  const onSaveProfile = async (data: ProfileUpdateFormData) => {
    if (!userProfile?.id) return;
    try {
      const trimmedName = (data.displayName?.trim() || data.fullName.trim());
      const payload = {
        fullName: trimmedName,
        displayName: trimmedName,
        designation: data.designation.trim(),
        department: data.department.trim(),
        avatarUrl: data.avatarUrl || '',
        customAvatarUrl: data.customAvatarUrl || (data.avatarUrl && data.avatarUrl !== userProfile.googlePhotoUrl ? data.avatarUrl : ''),
        googlePhotoUrl: userProfile.googlePhotoUrl || '',
        skills: data.skills,
        technologies: data.technologies,
      };

      await userRepository.updateProfile(userProfile.id, payload);
      await refreshProfile();
      toastSuccess('Profile Updated', 'Your display name and profile photo have been saved successfully.');
      setIsEditModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      toastError('Error', msg);
    }
  };

  if (!userProfile) return null;

  const effectiveDisplayName = getUserDisplayName(userProfile);

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <UserAvatar
              user={userProfile}
              size="2xl"
              className="border-2 border-slate-200 shadow-sm ring-4 ring-[#FF3D88]/20"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#0F1B3D]">
                  {effectiveDisplayName}
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
          <div className="p-3 bg-slate-50/60 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400 block font-sans">Approved Projects</span>
            <span className="text-xl font-heading font-bold text-[#0F1B3D]">{userProfile.totalApprovedProjects || 0}</span>
          </div>
          <div className="p-3 bg-slate-50/60 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400 block font-sans">Submitted Projects</span>
            <span className="text-xl font-heading font-bold text-[#0F1B3D]">{userProfile.totalSubmittedProjects || 0}</span>
          </div>
          <div className="p-3 bg-pink-50/40 rounded-2xl border border-pink-100">
            <span className="text-[11px] font-medium text-[#FF3D88] block font-sans">Valid Likes Received</span>
            <span className="text-xl font-heading font-bold text-[#FF3D88]">{userProfile.totalLikesReceived || 0}</span>
          </div>
          <div className="p-3 bg-indigo-50/40 rounded-2xl border border-indigo-100">
            <span className="text-[11px] font-medium text-indigo-600 block font-sans">Peer Votes Received</span>
            <span className="text-xl font-heading font-bold text-indigo-700">{userProfile.totalVotesReceived || 0}</span>
          </div>
        </div>
      </div>

      {/* Account Info Details */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <h3 className="font-heading font-bold text-lg text-[#0F1B3D]">
          Professional Portfolio &amp; Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Display Name
            </span>
            <span className="text-slate-800 font-medium">{effectiveDisplayName}</span>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Email Address (Protected)
            </span>
            <span className="text-slate-800 font-medium font-mono text-xs">{userProfile.email}</span>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Designation
            </span>
            <span className="text-slate-800 font-medium">{userProfile.designation}</span>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Department
            </span>
            <span className="text-slate-800 font-medium">{userProfile.department}</span>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Member Since
            </span>
            <span className="text-slate-800 font-medium">{formatDate(userProfile.joinDate)}</span>
          </div>
        </div>

        {/* Skills Section */}
        <div className="pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Skills &amp; Competencies
          </span>
          <div className="flex flex-wrap gap-1.5">
            {userProfile.skills && userProfile.skills.length > 0 ? (
              userProfile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-700"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No skills listed yet.</span>
            )}
          </div>
        </div>

        {/* Technologies Section */}
        <div className="pt-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Technologies &amp; Frameworks
          </span>
          <div className="flex flex-wrap gap-1.5">
            {userProfile.technologies && userProfile.technologies.length > 0 ? (
              userProfile.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700"
                >
                  {tech}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No technologies listed yet.</span>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        maxWidth="lg"
        title="Edit Profile Settings"
        description="Update your display name, profile photo, and professional information."
      >
        <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-5 font-sans">
          {/* Profile Picture Section */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#0F1B3D] uppercase tracking-wider">
                Profile Photo
              </label>
              <span className="text-[11px] text-slate-400">JPG, PNG, WebP (Max 5MB)</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <UserAvatar
                user={{
                  ...userProfile,
                  avatarUrl: currentAvatar,
                  displayName: watchedDisplayName || watchedFullName,
                }}
                size="xl"
                className="ring-2 ring-slate-200 shadow-sm"
              />

              <div className="flex flex-wrap items-center gap-2">
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-sm">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isUploadingAvatar ? 'Uploading...' : 'Upload New Photo'}</span>
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                  />
                </label>

                {currentAvatar && (
                  <button
                    type="button"
                    onClick={handleRemoveCustomAvatar}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Your profile picture will be shown across ProjectHub and on the homepage Leaderboard Podium.
            </p>
          </div>

          {/* Display Name Section */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#0F1B3D] uppercase tracking-wider">
                Display Name <span className="text-[#FF3D88]">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {(watchedDisplayName || watchedFullName || '').length}/50
              </span>
            </div>
            <input
              type="text"
              {...register('displayName')}
              placeholder="e.g. Alex Morgan"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30 font-sans"
              maxLength={50}
            />
            {errors.displayName && <p className="text-xs text-rose-600 mt-1">{errors.displayName.message}</p>}
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#FF3D88]" />
              This name represents you on project initiatives and team ranking podiums.
            </p>
          </div>

          {/* Designation & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider">
                  Designation <span className="text-[#FF3D88]">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {watchedDesignation.length}/100
                </span>
              </div>
              <input
                type="text"
                maxLength={100}
                {...register('designation')}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30 font-sans"
              />
              {errors.designation && <p className="text-xs text-rose-600 mt-1">{errors.designation.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider">
                  Department <span className="text-[#FF3D88]">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {watchedDepartment.length}/80
                </span>
              </div>
              <input
                type="text"
                maxLength={80}
                {...register('department')}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30 font-sans"
              />
              {errors.department && <p className="text-xs text-rose-600 mt-1">{errors.department.message}</p>}
            </div>
          </div>

          {/* Protected Info Note */}
          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center gap-2 text-xs text-slate-600">
            <Info className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              Your account email (<span className="font-mono text-slate-800">{userProfile.email}</span>) and authorization role (<span className="font-semibold text-slate-800">{userProfile.role}</span>) are system-protected.
            </span>
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
                placeholder="Add skill and press Enter..."
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
                placeholder="Add technology (e.g. React, Go) and press Enter..."
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
