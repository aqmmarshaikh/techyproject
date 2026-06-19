import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { submitProject, generatePreviewForSubmission } from '../lib/firestore';
import { DEFAULT_CATEGORIES } from '../utils/constants';
import type { ProjectSubmission } from '../types';
import { useAuth } from '../context/AuthContext';

export const SubmitPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  // Steps: 1 = Form, 2 = Success (Step 0 password bypass)
  const [step, setStep] = useState(1);

  // Form State
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState<ProjectSubmission>({
    title: '',
    description: '',
    teamMemberName: '',
    category: DEFAULT_CATEGORIES[0],
    liveDemoUrl: '',
    githubUrl: '',
    technologies: [],
    status: 'completed',
    coverImageUrl: '',
    approvalStatus: 'pending'
  });

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        teamMemberName: prev.teamMemberName || profile.name
      }));
    }
  }, [profile]);
  
  // Tech Tag Input
  const [techInput, setTechInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTech = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = techInput.trim();
      if (tag && !formData.technologies.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          technologies: [...prev.technologies, tag]
        }));
      }
      setTechInput('');
    }
  };

  const removeTech = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.description || !formData.teamMemberName || !formData.liveDemoUrl) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const submissionData = {
        ...formData,
        ownerId: user?.uid || '',
        ownerName: profile?.name || user?.displayName || 'Anonymous',
        ownerEmail: user?.email || '',
      };

      const submissionId = await submitProject(submissionData);
      
      // Asynchronously trigger preview generation without blocking the user
      if (!formData.coverImageUrl && formData.liveDemoUrl) {
        generatePreviewForSubmission(submissionId, formData.liveDemoUrl).catch(console.error);
      }

      setStep(2); // Success step
    } catch (error: any) {
      console.error('Submission error:', error);
      setFormError(error.message || 'Unable to submit project. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  // RENDER STEP 2: SUCCESS
  if (step === 2) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <div className="glass animate-fade-in" style={{ padding: '60px 40px', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={40} color="var(--success)" />
          </div>
          <h2 style={{ marginBottom: '16px' }}>Project Submitted!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
            Your project has been submitted successfully. It will appear on the platform once approved by an admin.
          </p>

          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px' }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // RENDER STEP 1: FORM
  return (
    <div className="container animate-fade-in" style={{ paddingTop: '100px', paddingBottom: '80px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Submit Project</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Share your latest creation with the TechyBoy community.
        </p>
      </div>

      {formError && (
        <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <X size={20} /> {formError}
        </div>
      )}

      <form onSubmit={handleProjectSubmit} className="glass" style={{ padding: '40px', borderRadius: 'var(--radius-lg)' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="input-group">
            <label className="input-label">Project Title *</label>
            <input
              type="text"
              name="title"
              className="input-field"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="e.g. Projectpedia"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Team Member Name *</label>
            <input
              type="text"
              name="teamMemberName"
              className="input-field"
              value={formData.teamMemberName}
              onChange={handleInputChange}
              required
              placeholder="e.g. John Doe"
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Description *</label>
          <textarea
            name="description"
            className="input-field"
            value={formData.description}
            onChange={handleInputChange}
            required
            placeholder="Describe what the project does, who it's for, and why you built it..."
            rows={5}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="input-group">
            <label className="input-label">Category *</label>
            <select
              name="category"
              className="input-field"
              value={formData.category}
              onChange={handleInputChange as any}
              required
            >
              {DEFAULT_CATEGORIES.map(cat => (
                <option key={cat} value={cat} style={{ background: 'var(--bg-secondary)' }}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Status</label>
            <select
              name="status"
              className="input-field"
              value={formData.status}
              onChange={handleInputChange as any}
            >
              <option value="completed" style={{ background: 'var(--bg-secondary)' }}>Completed</option>
              <option value="beta" style={{ background: 'var(--bg-secondary)' }}>Beta</option>
              <option value="prototype" style={{ background: 'var(--bg-secondary)' }}>Prototype</option>
              <option value="in-progress" style={{ background: 'var(--bg-secondary)' }}>In Progress</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="input-group">
            <label className="input-label">Live Demo URL *</label>
            <input
              type="url"
              name="liveDemoUrl"
              className="input-field"
              value={formData.liveDemoUrl}
              onChange={handleInputChange}
              required
              placeholder="https://"
            />
          </div>

          <div className="input-group">
            <label className="input-label">GitHub Repository (Optional)</label>
            <input
              type="url"
              name="githubUrl"
              className="input-field"
              value={formData.githubUrl}
              onChange={handleInputChange}
              placeholder="https://github.com/..."
            />
          </div>
        </div>

        {/* Cover Image URL */}
        <div className="input-group" style={{ marginBottom: '24px' }}>
          <label className="input-label">Cover Image URL (Optional)</label>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-4px', marginBottom: '12px' }}>
            Provide a direct link to an image (e.g., Imgur, Cloudinary, Unsplash).
          </p>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
              <ImageIcon size={18} />
            </div>
            <input
              type="url"
              name="coverImageUrl"
              className="input-field"
              value={formData.coverImageUrl}
              onChange={handleInputChange}
              placeholder="https://images.unsplash.com/..."
              style={{ paddingLeft: '44px' }}
            />
          </div>
        </div>

        <div className="input-group" style={{ marginBottom: '40px' }}>
          <label className="input-label">Technologies Used (Optional)</label>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-4px', marginBottom: '8px' }}>
            Press Enter or comma to add a tag.
          </p>
          <div 
            className="input-field" 
            style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '8px',
              padding: '8px',
              minHeight: '48px'
            }}
          >
            {formData.technologies.map(tag => (
              <span 
                key={tag}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'var(--bg-primary)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  border: '1px solid var(--border-color)'
                }}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTech(tag)}
                  style={{ color: 'var(--text-secondary)', padding: 0, display: 'flex' }}
                >
                  <X size={14} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={handleAddTech}
              placeholder={formData.technologies.length === 0 ? "e.g. React, Firebase, Tailwind..." : ""}
              style={{
                flex: 1,
                minWidth: '150px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.95rem'
              }}
            />
          </div>
        </div>

        <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => navigate('/')}
            disabled={submitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={submitting}
            style={{ minWidth: '150px' }}
          >
            {submitting ? 'Submitting...' : 'Submit Project'}
          </button>
        </div>

      </form>

      <style>
        {`
          @media (max-width: 768px) {
            form { padding: 24px !important; }
            form > div[style*="grid"] { grid-template-columns: 1fr !important; }
            .form-actions { flex-direction: column; }
            .form-actions .btn { width: 100%; }
          }
        `}
      </style>
    </div>
  );
};
