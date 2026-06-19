import React, { useState, useEffect } from 'react';
import { 
  X, Edit2, Check, Star, Trash2, ExternalLink, GitBranch, Copy, 
  Calendar, Eye, Heart, Code, User, Save, Shield
} from 'lucide-react';
import type { Project, ProjectSubmission } from '../types';
import { Badge } from './Badge';
import { useAuth } from '../context/AuthContext';
import { 
  approveProject, 
  rejectProject, 
  deleteProject, 
  toggleFeatured,
  updateProject,
  updatePendingSubmission
} from '../lib/firestore';
import { DEFAULT_CATEGORIES, DEFAULT_STATUSES, STATUS_DISPLAY_NAMES, getCategoryPlaceholder } from '../utils/constants';

interface ProjectModalProps {
  project: Project | ProjectSubmission;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => Promise<void> | void;
  isPending?: boolean;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project: initialProject,
  isOpen,
  onClose,
  onUpdate,
  isPending = false
}) => {
  const { user, isAdmin } = useAuth();
  const [project, setProject] = useState(initialProject);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: project.title,
    description: project.description,
    category: project.category,
    technologies: project.technologies.join(', '),
    liveDemoUrl: project.liveDemoUrl,
    githubUrl: project.githubUrl || '',
    status: project.status || 'completed'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync state if initialProject prop changes
  useEffect(() => {
    setProject(initialProject);
    setEditData({
      title: initialProject.title,
      description: initialProject.description,
      category: initialProject.category,
      technologies: initialProject.technologies.join(', '),
      liveDemoUrl: initialProject.liveDemoUrl,
      githubUrl: initialProject.githubUrl || '',
      status: initialProject.status || 'completed'
    });
  }, [initialProject]);

  if (!isOpen) return null;

  // Determine preview image source based on priority
  const previewImage = project.coverImageUrl || project.previewImageUrl || getCategoryPlaceholder(project.category);

  // Date formatter
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString(undefined, {
          year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
      }
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString(undefined, {
          year: 'numeric', month: 'long', day: 'numeric'
        });
      }
      return new Date(timestamp).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(project.liveDemoUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Admin Action Handlers
  const handleApproveAction = async () => {
    if (!project.id) return;
    if (!window.confirm('Approve this project? It will become public and move to the Approved list.')) return;
    try {
      setIsSaving(true);
      await approveProject(project.id);
      await onUpdate();
      onClose();
    } catch (error: any) {
      alert(error.message || 'Failed to approve project.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRejectAction = async () => {
    if (!project.id) return;
    if (!window.confirm('Are you sure you want to reject and permanently delete this submission?')) return;
    try {
      setIsSaving(true);
      await rejectProject(project.id);
      await onUpdate();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to reject submission.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFeatureAction = async () => {
    if (!project.id) return;
    const isCurrentlyFeatured = (project as Project).featured || false;
    try {
      setIsSaving(true);
      await toggleFeatured(project.id, isCurrentlyFeatured);
      // Update local state to reflect change immediately
      setProject(prev => ({
        ...prev,
        featured: !isCurrentlyFeatured
      } as any));
      await onUpdate();
    } catch (error) {
      console.error(error);
      alert('Failed to update feature status.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAction = async () => {
    if (!project.id) return;
    if (!window.confirm('Are you sure you want to permanently delete this project? This cannot be undone.')) return;
    try {
      setIsSaving(true);
      await deleteProject(project.id);
      await onUpdate();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to delete project.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project.id) return;
    setIsSaving(true);

    const updatedFields = {
      title: editData.title,
      description: editData.description,
      category: editData.category,
      technologies: editData.technologies.split(',').map(t => t.trim()).filter(Boolean),
      liveDemoUrl: editData.liveDemoUrl,
      githubUrl: editData.githubUrl || undefined,
      status: editData.status
    };

    try {
      if (isPending) {
        await updatePendingSubmission(project.id, updatedFields);
      } else {
        await updateProject(project.id, updatedFields);
      }

      setProject(prev => ({
        ...prev,
        ...updatedFields
      }) as any);
      setIsEditing(false);
      await onUpdate();
    } catch (error) {
      console.error(error);
      alert('Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const isFeatured = (project as Project).featured || false;

  return (
    <div className="project-modal-backdrop animate-fade-in" onClick={onClose}>
      <div 
        className={`project-modal-container glass ${isFeatured ? 'featured' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="project-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`neon-dot ${isFeatured ? 'featured' : ''}`}></span>
            <h2 className="project-modal-title">{isEditing ? 'Edit Submission' : 'Inspect Project'}</h2>
          </div>
          <button className="project-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="project-modal-body">
          {/* Top Preview Image */}
          <div className="project-modal-preview">
            <img src={previewImage} alt={project.title} className="preview-img" />
            <div className="preview-overlay">
              <span className={`badge-glow ${isFeatured ? 'featured' : ''}`}>
                {isPending ? 'PENDING APPROVAL' : isFeatured ? 'FEATURED' : 'APPROVED'}
              </span>
            </div>
          </div>

          {isEditing ? (
            /* EDIT MODE FORM */
            <form onSubmit={handleSaveEdit} className="edit-form">
              <div className="input-group">
                <label className="input-label">Project Title</label>
                <input
                  type="text"
                  className="input-field"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea
                  className="input-field"
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  required
                  rows={4}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select
                    className="input-field select-field"
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  >
                    {DEFAULT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat} style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Status</label>
                  <select
                    className="input-field select-field"
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  >
                    {DEFAULT_STATUSES.map(stat => (
                      <option key={stat} value={stat} style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        {STATUS_DISPLAY_NAMES[stat] || stat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Technologies (comma separated)</label>
                <input
                  type="text"
                  className="input-field"
                  value={editData.technologies}
                  onChange={(e) => setEditData({ ...editData, technologies: e.target.value })}
                  placeholder="React, TypeScript, Three.js"
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Live Demo URL</label>
                <input
                  type="url"
                  className="input-field"
                  value={editData.liveDemoUrl}
                  onChange={(e) => setEditData({ ...editData, liveDemoUrl: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">GitHub URL (Optional)</label>
                <input
                  type="url"
                  className="input-field"
                  value={editData.githubUrl}
                  onChange={(e) => setEditData({ ...editData, githubUrl: e.target.value })}
                />
              </div>

              <div className="edit-form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSaving}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            /* VIEW MODE */
            <div className="modal-details">
              <div className="details-main-header">
                <h1 className="project-title-display">{project.title}</h1>
                <p className="project-creator-display">
                  <User size={14} style={{ color: 'var(--accent-primary)' }} />
                  by <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{project.teamMemberName}</span>
                </p>
              </div>

              {/* Status and Category Badges */}
              <div className="badge-row">
                <Badge type="category" value={project.category} />
                <Badge type="status" value={project.status || 'completed'} />
                {isFeatured && <Badge type="status" value="Featured" className="badge-featured" />}
              </div>

              <p className="project-description-display">{project.description}</p>

              {/* Tech stack */}
              <div className="tech-section">
                <h4 className="section-title"><Code size={16} /> Technologies</h4>
                <div className="tech-badges">
                  {project.technologies.map(tech => (
                    <span key={tech} className="tech-tag">{tech}</span>
                  ))}
                </div>
              </div>

              {/* Project Stats (Only for approved) */}
              {!isPending && (
                <div className="stats-grid">
                  <div className="stat-card">
                    <Heart size={18} color="#ec4899" fill="#ec4899" />
                    <div>
                      <span className="stat-value">{(project as Project).likesCount || 0}</span>
                      <span className="stat-label">Likes</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <Eye size={18} color="var(--accent-primary)" />
                    <div>
                      <span className="stat-value">{(project as Project).viewsCount || 0}</span>
                      <span className="stat-label">Views</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Creator & Admin Panel Meta */}
              {(isAdmin || user?.uid === project.ownerId) ? (
                <div className="meta-card glass" style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h4 className="meta-card-title" style={{ margin: '0 0 8px 0', fontSize: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={16} color="var(--accent-primary)" /> Creator & Administrative Metadata
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.9rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Owner Name: </span>
                      <strong>{project.ownerName || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Owner Email: </span>
                      <strong>{project.ownerEmail || 'N/A'}</strong>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Owner UID: </span>
                      <code style={{ color: 'var(--accent-primary)', fontSize: '0.8rem' }}>{project.ownerId || 'N/A'}</code>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Approval Status: </span>
                      <strong style={{ 
                        color: project.approvalStatus === 'approved' ? 'var(--success)' : 
                               project.approvalStatus === 'rejected' ? 'var(--danger)' : 
                               'var(--accent-primary)' 
                      }}>
                        {project.approvalStatus?.toUpperCase() || 'PENDING'}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Edited After Approval: </span>
                      <strong style={{ color: project.editedAfterApproval ? 'var(--danger)' : 'var(--text-secondary)' }}>
                        {project.editedAfterApproval ? 'YES (Pending Re-review)' : 'NO'}
                      </strong>
                    </div>
                  </div>

                  <div style={{ marginTop: '8px', borderTop: '1px dashed var(--border-color)', paddingTop: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>📅 Submitted: <strong>{formatDate(project.submittedAt)}</strong></div>
                      {project.lastEditedAt && (
                        <div>✏️ Last Edited: <strong>{formatDate(project.lastEditedAt)}</strong></div>
                      )}
                      {project.approvalStatus === 'approved' && (project as Project).publishedAt && (
                        <div>🚀 Published/Approved: <strong>{formatDate((project as Project).publishedAt)}</strong></div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Timestamps */
                <div className="dates-section">
                  <div className="date-item">
                    <Calendar size={14} />
                    <span>Submitted: <strong>{formatDate(project.submittedAt)}</strong></span>
                  </div>
                  {!isPending && (project as Project).publishedAt && (
                    <div className="date-item">
                      <Calendar size={14} />
                      <span>Published: <strong>{formatDate((project as Project).publishedAt)}</strong></span>
                    </div>
                  )}
                </div>
              )}

              {/* Live Website Actions */}
              <div className="link-actions">
                <a 
                  href={project.liveDemoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary demo-btn"
                >
                  <ExternalLink size={16} /> Open Demo
                </a>
                {project.githubUrl && (
                  <a 
                    href={project.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-secondary github-btn"
                  >
                    <GitBranch size={16} /> Open GitHub
                  </a>
                )}
                <button 
                  onClick={handleCopyUrl} 
                  className="btn btn-secondary copy-btn"
                >
                  <Copy size={16} /> {copied ? 'Copied!' : 'Copy URL'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!isEditing && (user?.uid === project.ownerId || isAdmin) && (
          <div className="project-modal-footer">
            <button 
              onClick={() => setIsEditing(true)} 
              className="btn btn-secondary edit-btn"
              disabled={isSaving}
            >
              <Edit2 size={16} /> Edit Project
            </button>

            <div className="admin-danger-actions">
              {/* Creator owner delete action */}
              {!isAdmin && user?.uid === project.ownerId && (
                <button 
                  onClick={handleDeleteAction} 
                  className="btn btn-danger delete-btn"
                  disabled={isSaving}
                >
                  <Trash2 size={16} /> Delete
                </button>
              )}

              {/* Admin specific actions */}
              {isAdmin && (
                isPending ? (
                  <>
                    <button 
                      onClick={handleRejectAction} 
                      className="btn btn-danger reject-btn"
                      disabled={isSaving}
                    >
                      <Trash2 size={16} /> Reject
                    </button>
                    <button 
                      onClick={handleApproveAction} 
                      className="btn btn-primary approve-btn"
                      disabled={isSaving}
                    >
                      <Check size={16} /> Approve
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleDeleteAction} 
                      className="btn btn-danger delete-btn"
                      disabled={isSaving}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                    <button 
                      onClick={handleToggleFeatureAction} 
                      className={`btn ${isFeatured ? 'btn-primary featured-active' : 'btn-secondary'}`}
                      disabled={isSaving}
                    >
                      <Star size={16} fill={isFeatured ? 'currentColor' : 'none'} />
                      {isFeatured ? 'Featured' : 'Feature'}
                    </button>
                  </>
                )
              )}
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          .project-modal-backdrop {
            position: fixed;
            inset: 0;
            background-color: rgba(5, 8, 22, 0.85);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: modalFadeIn 0.25s ease-out;
          }

          .project-modal-container {
            width: 100%;
            max-width: 900px;
            background-color: var(--bg-secondary);
            border-radius: var(--radius-lg);
            border: 1px solid var(--border-color);
            box-shadow: var(--shadow-lg);
            display: flex;
            flex-direction: column;
            max-height: 90vh;
            overflow: hidden;
            animation: modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
          }

          .project-modal-container.featured {
            border: 1px solid var(--accent-secondary);
            box-shadow: 0 0 30px rgba(255, 0, 128, 0.15), var(--shadow-lg);
          }

          .project-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            border-bottom: 1px solid var(--border-color);
          }

          .project-modal-title {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 700;
            letter-spacing: -0.02em;
          }

          .neon-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: var(--accent-primary);
            box-shadow: 0 0 8px var(--accent-primary);
          }

          .neon-dot.featured {
            background-color: var(--accent-secondary);
            box-shadow: 0 0 8px var(--accent-secondary);
          }

          .project-modal-close {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all var(--transition-fast);
            border: 1px solid transparent;
          }

          .project-modal-close:hover {
            color: var(--text-primary);
            background-color: rgba(255, 255, 255, 0.05);
            border-color: var(--border-color);
          }

          .project-modal-body {
            padding: 24px;
            overflow-y: auto;
            flex: 1;
          }

          .project-modal-preview {
            width: 100%;
            aspect-ratio: 16/9;
            border-radius: var(--radius-md);
            overflow: hidden;
            border: 1px solid var(--border-color);
            position: relative;
            margin-bottom: 24px;
            background-color: var(--bg-primary);
          }

          .preview-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
          }

          .preview-overlay {
            position: absolute;
            top: 16px;
            right: 16px;
          }

          .badge-glow {
            padding: 6px 12px;
            border-radius: var(--radius-pill);
            font-size: 0.75rem;
            font-weight: 700;
            background: rgba(0, 229, 255, 0.1);
            color: var(--accent-primary);
            border: 1px solid var(--border-color);
            box-shadow: 0 0 10px rgba(0, 229, 255, 0.2);
            letter-spacing: 0.05em;
          }

          .badge-glow.featured {
            background: rgba(255, 0, 128, 0.1);
            color: var(--accent-secondary);
            border: 1px solid rgba(255, 0, 128, 0.3);
            box-shadow: 0 0 10px rgba(255, 0, 128, 0.2);
          }

          .modal-details {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .details-main-header {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .project-title-display {
            margin: 0;
            font-size: 2.25rem;
            font-weight: 800;
            line-height: 1.2;
            word-break: break-word;
          }

          .project-creator-display {
            margin: 0;
            font-size: 1rem;
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .badge-row {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .badge-featured {
            background-color: rgba(251, 191, 36, 0.1) !important;
            color: #fbbf24 !important;
            border-color: rgba(251, 191, 36, 0.3) !important;
          }

          .project-description-display {
            font-size: 1.05rem;
            line-height: 1.7;
            color: var(--text-primary);
            white-space: pre-wrap;
            word-break: break-word;
            margin: 8px 0;
          }

          .section-title {
            margin: 0 0 12px 0;
            font-size: 1.1rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--text-primary);
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 8px;
          }

          .tech-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .tech-tag {
            padding: 4px 12px;
            background-color: var(--bg-tertiary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm);
            font-size: 0.85rem;
            font-weight: 500;
            color: var(--text-primary);
          }

          .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 12px 0;
          }

          .stat-card {
            background-color: var(--bg-tertiary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .stat-value {
            display: block;
            font-size: 1.5rem;
            font-weight: 700;
            line-height: 1.2;
          }

          .stat-label {
            display: block;
            font-size: 0.8rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .dates-section {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 16px;
            background-color: rgba(255, 255, 255, 0.02);
            border-radius: var(--radius-md);
            border: 1px dashed var(--border-color);
            font-size: 0.9rem;
            color: var(--text-secondary);
          }

          .date-item {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .link-actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 16px;
          }

          .link-actions .btn {
            flex: 1;
            min-width: 150px;
          }

          .project-modal-footer {
            padding: 20px 24px;
            border-top: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            background-color: rgba(11, 17, 32, 0.9);
          }

          .admin-danger-actions {
            display: flex;
            gap: 12px;
          }

          .featured-active {
            background-color: rgba(255, 0, 128, 0.15) !important;
            color: var(--accent-secondary) !important;
            border: 1px solid var(--accent-secondary) !important;
            box-shadow: 0 0 10px rgba(255, 0, 128, 0.2);
          }

          /* Edit Mode styling */
          .edit-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .select-field {
            cursor: pointer;
            appearance: none;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300E5FF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 16px center;
            background-size: 16px;
            padding-right: 40px;
          }

          .edit-form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 12px;
            border-top: 1px solid var(--border-color);
            padding-top: 16px;
          }

          /* Responsive Breakpoints */
          /* Tablet (max-width: 900px) */
          @media (max-width: 900px) {
            .project-modal-container {
              width: 80%;
            }
          }

          /* Mobile (max-width: 640px) */
          @media (max-width: 640px) {
            .project-modal-backdrop {
              padding: 0;
            }

            .project-modal-container {
              width: 100%;
              height: 100%;
              max-height: 100vh;
              border-radius: 0;
              border: none;
            }

            .project-modal-container.featured {
              box-shadow: none;
              border: none;
            }

            .project-modal-body {
              padding: 16px;
            }

            .stats-grid {
              grid-template-columns: 1fr;
            }

            .link-actions {
              flex-direction: column;
              gap: 8px;
            }

            .link-actions .btn {
              width: 100%;
            }

            .project-modal-footer {
              flex-direction: column;
              padding: 16px;
              gap: 12px;
            }

            .project-modal-footer .btn {
              width: 100%;
            }

            .admin-danger-actions {
              width: 100%;
              flex-direction: column;
              gap: 8px;
            }
          }

          @keyframes modalFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes modalSlideUp {
            from { opacity: 0; transform: translateY(40px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}
      </style>
    </div>
  );
};
