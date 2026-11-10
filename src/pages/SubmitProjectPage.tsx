import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { ProjectSubmitForm } from '../features/projects/ProjectSubmitForm';
import { projectService } from '../services/projectService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/common/Toast';
import { ProjectSubmissionFormData } from '../schemas/projectSchemas';

export const SubmitProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const handleSubmit = async (data: ProjectSubmissionFormData) => {
    if (!userProfile) {
      toastError('Auth Required', 'Please log in to submit a project.');
      return;
    }

    try {
      const created = await projectService.submitNewProject(
        {
          title: data.title,
          description: data.description,
          coverImageUrl: data.coverImageUrl,
          screenshots: data.screenshots,
          category: data.category,
          technologies: data.technologies,
          projectStatus: data.projectStatus,
          liveWebsiteUrl: data.liveWebsiteUrl,
          githubRepoUrl: data.githubRepoUrl,
        },
        userProfile
      );

      toastSuccess(
        'Submission Received',
        'Your project has been submitted for administrator review and will appear in Explore once approved.'
      );
      navigate(`/my-projects?submitted=${created.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      toastError('Submission Error', msg);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#0F1B3D] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Showcase
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-[#FF3D88]" />
          <span className="text-xs font-decorative uppercase tracking-wider text-slate-400">
            Internal Innovation Submission
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0F1B3D] tracking-tight">
          Submit a Company Project
        </h2>
        <p className="mt-1 text-sm text-slate-500 font-sans leading-relaxed">
          Showcase tools, microservices, frontend systems, or libraries built for our teams. Projects are reviewed by admins before appearing on the public Explore board and Arena leaderboards.
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card">
        <ProjectSubmitForm
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
};

