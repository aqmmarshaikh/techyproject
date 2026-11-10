import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X, Plus, AlertCircle, Link, Github, Globe, Info } from 'lucide-react';
import { 
  projectSubmissionSchema, 
  ProjectSubmissionFormData, 
  projectRevisionSchema, 
  ProjectRevisionFormData 
} from '../../schemas/projectSchemas';
import { categoryRepository } from '../../repositories/categoryRepository';
import { cloudinaryService } from '../../services/cloudinaryService';
import { Category, ProjectStatus, Project } from '../../types';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';

interface ProjectSubmitFormProps {
  initialProject?: Project;
  isRevision?: boolean;
  onSubmit: (data: ProjectSubmissionFormData, changeSummary?: string) => Promise<void>;
  onCancel?: () => void;
}

export const ProjectSubmitForm: React.FC<ProjectSubmitFormProps> = ({
  initialProject,
  isRevision = false,
  onSubmit,
  onCancel,
}) => {
  const { error: toastError, success: toastSuccess } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [techInput, setTechInput] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [changeSummary, setChangeSummary] = useState('');

  // Load available categories
  useEffect(() => {
    categoryRepository.list().then(setCategories).catch(console.warn);
  }, []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectSubmissionFormData>({
    resolver: zodResolver(projectSubmissionSchema),
    defaultValues: {
      title: initialProject?.title || '',
      description: initialProject?.description || '',
      coverImageUrl: initialProject?.coverImageUrl || '',
      screenshots: initialProject?.screenshots || [],
      category: initialProject?.category || '',
      technologies: initialProject?.technologies || [],
      projectStatus: (initialProject?.projectStatus as ProjectStatus) || 'IN_DEVELOPMENT',
      liveWebsiteUrl: initialProject?.liveWebsiteUrl || '',
      githubRepoUrl: initialProject?.githubRepoUrl || '',
    },
  });

  const selectedStatus = watch('projectStatus');
  const currentTechnologies = watch('technologies') || [];
  const currentScreenshots = watch('screenshots') || [];
  const coverImageUrl = watch('coverImageUrl');

  const handleAddTechnology = () => {
    const trimmed = techInput.trim();
    if (!trimmed) return;
    if (currentTechnologies.includes(trimmed)) {
      setTechInput('');
      return;
    }
    if (currentTechnologies.length >= 15) {
      toastError('Limit Reached', 'You can specify a maximum of 15 technologies.');
      return;
    }
    setValue('technologies', [...currentTechnologies, trimmed], { shouldValidate: true });
    setTechInput('');
  };

  const handleRemoveTechnology = (tech: string) => {
    setValue(
      'technologies',
      currentTechnologies.filter((t) => t !== tech),
      { shouldValidate: true }
    );
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const url = await cloudinaryService.uploadImage(file, { folder: 'covers', maxSizeMb: 5 });
      setValue('coverImageUrl', url, { shouldValidate: true });
      toastSuccess('Cover Uploaded', 'Cover image updated successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cover upload failed';
      toastError('Upload Failed', msg);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (currentScreenshots.length + files.length > 6) {
      toastError('Screenshot Limit', 'You can upload a maximum of 6 screenshots total.');
      return;
    }

    setIsUploadingScreenshot(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await cloudinaryService.uploadImage(files[i], {
          folder: 'screenshots',
          maxSizeMb: 5,
        });
        uploadedUrls.push(url);
      }
      setValue('screenshots', [...currentScreenshots, ...uploadedUrls], { shouldValidate: true });
      toastSuccess('Screenshots Added', `${uploadedUrls.length} screenshot(s) uploaded.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Screenshot upload failed';
      toastError('Upload Failed', msg);
    } finally {
      setIsUploadingScreenshot(false);
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    setValue(
      'screenshots',
      currentScreenshots.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  const onFormSubmit = async (data: ProjectSubmissionFormData) => {
    if (isRevision && (!changeSummary || changeSummary.trim().length < 10)) {
      toastError(
        'Revision Summary Required',
        'Please describe what changes are included in this revision (minimum 10 characters).'
      );
      return;
    }

    try {
      await onSubmit(data, changeSummary);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      toastError('Error', msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Revision Notice Banner */}
      {isRevision && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Submitting a Revision for an Approved Project:</span>
            <p className="mt-0.5 text-xs text-amber-800">
              Your live project remains active and visible to company employees. This revision will enter the admin review queue and be merged once approved.
            </p>
          </div>
        </div>
      )}

      {/* Revision Change Summary Field */}
      {isRevision && (
        <div>
          <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1.5">
            What changed in this revision? <span className="text-[#FF3D88]">*</span>
          </label>
          <textarea
            rows={2}
            value={changeSummary}
            onChange={(e) => setChangeSummary(e.target.value)}
            placeholder="E.g., Updated screenshots, added new Docker deployment instructions, upgraded to React 19."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30 font-sans"
          />
          <p className="text-[11px] text-slate-400 mt-1">Minimum 10 characters.</p>
        </div>
      )}

      {/* 1. Project Title */}
      <div>
        <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1.5">
          Project Title <span className="text-[#FF3D88]">*</span>
        </label>
        <input
          type="text"
          {...register('title')}
          placeholder="E.g., Real-Time Fraud Detection Engine"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30 font-sans"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {errors.title.message}
          </p>
        )}
      </div>

      {/* 2. Project Description (approx. 3-4 meaningful lines) */}
      <div>
        <div className="flex justify-between items-baseline mb-1.5">
          <label className="text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider">
            Project Description <span className="text-[#FF3D88]">*</span>
          </label>
          <span className="text-[11px] text-slate-400">Aim for ~3-4 meaningful lines</span>
        </div>
        <textarea
          rows={4}
          {...register('description')}
          placeholder="Describe the architecture, problem solved, primary business impact, and how colleagues can utilize this project..."
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30 font-sans leading-relaxed"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {errors.description.message}
          </p>
        )}
      </div>

      {/* 3. Category & Project Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1.5">
            Category <span className="text-[#FF3D88]">*</span>
          </label>
          <select
            {...register('category')}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
          >
            <option value="">Select a category...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.category.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1.5">
            Project Status <span className="text-[#FF3D88]">*</span>
          </label>
          <select
            {...register('projectStatus')}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
          >
            <option value="IN_DEVELOPMENT">In Development</option>
            <option value="LIVE">Live (Production URL required)</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
          {errors.projectStatus && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.projectStatus.message}
            </p>
          )}
        </div>
      </div>

      {/* 4. External Links: Live Website & GitHub Repository */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1.5">
            Live Website URL {selectedStatus === 'LIVE' && <span className="text-[#FF3D88]">* (Mandatory for LIVE)</span>}
          </label>
          <div className="relative">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              {...register('liveWebsiteUrl')}
              placeholder="https://myproject.internal.company"
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30 font-sans"
            />
          </div>
          {errors.liveWebsiteUrl && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.liveWebsiteUrl.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1.5">
            GitHub / GitLab Repository URL <span className="text-slate-400 text-[11px] lowercase">(optional)</span>
          </label>
          <div className="relative">
            <Github className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              {...register('githubRepoUrl')}
              placeholder="https://github.com/company/repo"
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30 font-sans"
            />
          </div>
          {errors.githubRepoUrl && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.githubRepoUrl.message}
            </p>
          )}
        </div>
      </div>

      {/* 5. Technologies Used (Tags) */}
      <div>
        <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1.5">
          Technologies Used <span className="text-[#FF3D88]">*</span>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTechnology();
              }
            }}
            placeholder="Type technology and press Enter (e.g. Next.js, PyTorch, Kafka)"
            className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddTechnology}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-slate-50/50 rounded-xl border border-slate-200">
          {currentTechnologies.length === 0 ? (
            <span className="text-xs text-slate-400 italic">No technologies added yet.</span>
          ) : (
            currentTechnologies.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono font-medium text-[#0F1B3D]"
              >
                {t}
                <button
                  type="button"
                  onClick={() => handleRemoveTechnology(t)}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
        {errors.technologies && (
          <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {errors.technologies.message}
          </p>
        )}
      </div>

      {/* 6. Cover Image Upload */}
      <div>
        <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1.5">
          Project Cover Image <span className="text-[#FF3D88]">*</span>
        </label>
        
        {coverImageUrl ? (
          <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-200 group">
            <img src={coverImageUrl} alt="Cover preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[#0F1B3D]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white text-[#0F1B3D] text-xs font-semibold hover:bg-slate-100 transition-colors">
                Change Image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
              </label>
              <button
                type="button"
                onClick={() => setValue('coverImageUrl', '', { shouldValidate: true })}
                className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 rounded-2xl hover:border-[#FF3D88] hover:bg-slate-50 transition-all cursor-pointer">
            <Upload className="w-8 h-8 text-slate-400 mb-2" />
            <span className="text-xs font-semibold text-[#0F1B3D]">
              {isUploadingCover ? 'Uploading securely...' : 'Click or drop cover image here'}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">JPEG, PNG, or WebP up to 5MB</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleCoverUpload}
              disabled={isUploadingCover}
            />
          </label>
        )}
        {errors.coverImageUrl && (
          <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {errors.coverImageUrl.message}
          </p>
        )}
      </div>

      {/* 7. Additional Screenshots (Optional, max 6) */}
      <div>
        <div className="flex justify-between items-baseline mb-1.5">
          <label className="text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider">
            Additional Screenshots <span className="text-slate-400 text-[11px] lowercase">(optional, max 6)</span>
          </label>
          <span className="text-[11px] font-mono text-slate-400">{currentScreenshots.length} / 6</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {currentScreenshots.map((url, idx) => (
            <div key={url} className="relative h-24 rounded-xl overflow-hidden border border-slate-200 group">
              <img src={url} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveScreenshot(idx)}
                className="absolute top-1 right-1 p-1 rounded-lg bg-black/60 text-white hover:bg-rose-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {currentScreenshots.length < 6 && (
            <label className="flex flex-col items-center justify-center h-24 border border-dashed border-slate-300 rounded-xl hover:border-[#FF3D88] hover:bg-slate-50 transition-all cursor-pointer text-center p-2">
              <Plus className="w-5 h-5 text-slate-400 mb-1" />
              <span className="text-[11px] font-medium text-slate-600">
                {isUploadingScreenshot ? 'Uploading...' : 'Add Image'}
              </span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleScreenshotUpload}
                disabled={isUploadingScreenshot}
              />
            </label>
          )}
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {isRevision ? 'Submit Revision for Review' : 'Submit Project for Approval'}
        </Button>
      </div>
    </form>
  );
};

