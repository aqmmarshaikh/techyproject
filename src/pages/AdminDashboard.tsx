import React, { useState, useEffect } from 'react';
import { 
  Shield, LogOut, Check, X, Star, Trash2, 
  BarChart3, Settings as SettingsIcon, LayoutGrid, Clock, ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminLogin, adminLogout } from '../lib/auth';
import { 
  getPendingSubmissions,
  getApprovedProjects,
  getSettings,
  updateSettings,
  approveProject, 
  rejectProject, 
  toggleFeatured, 
  deleteProject 
} from '../lib/firestore';
import type { Project, ProjectSubmission, Settings } from '../types';
import { Badge } from '../components/Badge';
import { formatNumber, timeAgo } from '../utils/helpers';
import { ProjectModal } from '../components/ProjectModal';

export const AdminDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Data State
  const [pendingSubmissions, setPendingSubmissions] = useState<ProjectSubmission[]>([]);
  const [approvedProjects, setApprovedProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<Settings>({
    submissionPassword: '',
    featuredProjectsLimit: 5,
    maintenanceMode: false
  });
  const [dataLoading, setDataLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'analytics' | 'settings'>('pending');

  // Settings Form State
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Review Modal State
  const [selectedProject, setSelectedProject] = useState<Project | ProjectSubmission | null>(null);
  const [isPendingModal, setIsPendingModal] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setDataLoading(true);
      const [pending, approved, config] = await Promise.all([
        getPendingSubmissions(),
        getApprovedProjects(),
        getSettings()
      ]);
      setPendingSubmissions(pending);
      setApprovedProjects(approved);
      if (config) {
        setSettings(config);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    
    try {
      await adminLogin(email, password);
    } catch (error: any) {
      setLoginError(error.message || 'Failed to login');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Action Handlers
  const handleApprove = async (id: string) => {
    if (!window.confirm('Approve this project? It will become public and move to the Approved list.')) return;
    try {
      await approveProject(id);
      await fetchDashboardData(); // Refresh to move item across lists
    } catch (error: any) {
      alert(error.message || 'Unable to approve project. Please refresh and try again.');
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Are you sure you want to reject and delete this submission permanently?')) return;
    try {
      await rejectProject(id);
      setPendingSubmissions(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  const handleToggleFeature = async (id: string, currentState: boolean) => {
    try {
      await toggleFeatured(id, currentState);
      setApprovedProjects(prev => prev.map(p => p.id === id ? { ...p, featured: !currentState } : p));
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this project?')) return;
    try {
      await deleteProject(id);
      setApprovedProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await updateSettings(settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (authLoading) {
    return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loader"></div></div>;
  }

  // RENDER LOGIN PAGE
  if (!user) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <div className="glass animate-fade-in" style={{ padding: '40px', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(108, 92, 231, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Shield size={32} color="var(--accent-primary)" />
          </div>
          <h2 style={{ marginBottom: '8px' }}>Admin Login</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            Sign in to manage TechyBoy Projects.
          </p>

          <form onSubmit={handleLogin}>
            <div className="input-group" style={{ textAlign: 'left' }}>
              <input
                type="email"
                className="input-field"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group" style={{ textAlign: 'left' }}>
              <input
                type="password"
                className="input-field"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {loginError && (
              <div style={{ color: 'var(--danger)', fontSize: '0.9rem', marginBottom: '16px', textAlign: 'left' }}>
                {loginError}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px', marginTop: '8px' }}
              disabled={isLoggingIn || !email || !password}
            >
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Calculate Analytics Data
  const totalProjects = approvedProjects.length;
  const totalLikes = approvedProjects.reduce((sum, p) => sum + (p.likesCount || 0), 0);
  const totalViews = approvedProjects.reduce((sum, p) => sum + (p.viewsCount || 0), 0);
  const mostLikedProjects = [...approvedProjects].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0)).slice(0, 3);
  const mostViewedProjects = [...approvedProjects].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0)).slice(0, 3);

  // RENDER DASHBOARD
  return (
    <div className="container animate-fade-in" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage submissions, featured projects, and settings.</p>
        </div>
        
        <button 
          onClick={() => adminLogout()} 
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <div className="dashboard-tabs hide-scrollbar" style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {(['pending', 'approved', 'analytics', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab ? 600 : 500,
              fontSize: '1rem',
              cursor: 'pointer',
              textTransform: 'capitalize',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {tab === 'pending' && <Clock size={16} />}
            {tab === 'approved' && <LayoutGrid size={16} />}
            {tab === 'analytics' && <BarChart3 size={16} />}
            {tab === 'settings' && <SettingsIcon size={16} />}
            {tab} {tab === 'pending' && `(${pendingSubmissions.length})`}
            {tab === 'approved' && `(${approvedProjects.length})`}
          </button>
        ))}
      </div>

      {dataLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="loader"></div>
        </div>
      ) : (
        <>
          {/* PENDING SUBMISSIONS TAB */}
          {activeTab === 'pending' && (
            pendingSubmissions.length === 0 ? (
              <div className="glass" style={{ padding: '60px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>No pending submissions.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pendingSubmissions.map(project => (
                  <div key={project.id} className="glass list-card">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{project.title}</h3>
                        <Badge type="category" value={project.category} />
                        {project.editedAfterApproval && (
                          <span style={{ 
                            padding: '2px 8px', 
                            fontSize: '0.75rem', 
                            fontWeight: 700, 
                            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                            border: '1px solid rgba(239, 68, 68, 0.3)', 
                            color: 'var(--danger)', 
                            borderRadius: '4px',
                            boxShadow: '0 0 8px rgba(239, 68, 68, 0.15)'
                          }}>
                            ⚠️ EDITED AFTER APPROVAL
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '0 0 6px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        By {project.teamMemberName} • Submitted {timeAgo(project.submittedAt)}
                      </p>
                      {project.ownerName && (
                        <p style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          Owner: <strong style={{ color: 'var(--text-primary)' }}>{project.ownerName}</strong> ({project.ownerEmail}) • UID: <code style={{ color: 'var(--accent-primary)', fontSize: '0.75rem' }}>{project.ownerId}</code>
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
                        <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>View Demo</a>
                        {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>GitHub</a>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button 
                        onClick={() => {
                          setSelectedProject(project);
                          setIsPendingModal(true);
                        }} 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '0.85rem', height: '40px' }}
                      >
                        View Details
                      </button>
                      <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="action-btn preview" title="Preview Live Demo">
                        <ExternalLink size={18} />
                      </a>
                      <button onClick={() => handleApprove(project.id!)} className="action-btn approve" title="Approve">
                        <Check size={18} />
                      </button>
                      <button onClick={() => handleReject(project.id!)} className="action-btn reject" title="Reject">
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* APPROVED PROJECTS TAB */}
          {activeTab === 'approved' && (
            approvedProjects.length === 0 ? (
              <div className="glass" style={{ padding: '60px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>No approved projects.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {approvedProjects.map(project => (
                  <div key={project.id} className="glass list-card">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{project.title}</h3>
                        <Badge type="category" value={project.category} />
                        {project.featured && <Badge type="status" value="Featured" className="badge-featured" />}
                      </div>
                      <p style={{ margin: '0 0 6px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        By {project.teamMemberName} • Published {timeAgo(project.publishedAt)}
                      </p>
                      {project.ownerName && (
                        <p style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          Owner: <strong style={{ color: 'var(--text-primary)' }}>{project.ownerName}</strong> ({project.ownerEmail}) • UID: <code style={{ color: 'var(--accent-primary)', fontSize: '0.75rem' }}>{project.ownerId}</code>
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <span>Likes: <strong style={{ color: 'var(--text-primary)' }}>{formatNumber(project.likesCount)}</strong></span>
                        <span>Views: <strong style={{ color: 'var(--text-primary)' }}>{formatNumber(project.viewsCount)}</strong></span>
                        <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>View Demo</a>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button 
                        onClick={() => {
                          setSelectedProject(project);
                          setIsPendingModal(false);
                        }} 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '0.85rem', height: '40px' }}
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleToggleFeature(project.id, project.featured)} 
                        className={`action-btn ${project.featured ? 'featured' : ''}`}
                        title={project.featured ? "Remove from Featured" : "Add to Featured"}
                      >
                        <Star size={18} fill={project.featured ? 'currentColor' : 'none'} />
                      </button>
                      <button onClick={() => handleDelete(project.id)} className="action-btn delete" title="Delete Permanently">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                  <p style={{ color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>Total Projects</p>
                  <h3 style={{ fontSize: '2.5rem', margin: 0 }}>{formatNumber(totalProjects)}</h3>
                </div>
                <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                  <p style={{ color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>Total Likes</p>
                  <h3 style={{ fontSize: '2.5rem', margin: 0, color: '#ec4899' }}>{formatNumber(totalLikes)}</h3>
                </div>
                <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                  <p style={{ color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>Total Views</p>
                  <h3 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--accent-primary)' }}>{formatNumber(totalViews)}</h3>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Most Liked Projects</h3>
                  {mostLikedProjects.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {mostLikedProjects.map((p, i) => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.95rem' }}>{i + 1}. {p.title}</span>
                          <strong style={{ color: '#ec4899' }}>{formatNumber(p.likesCount)}</strong>
                        </div>
                      ))}
                    </div>
                  ) : <p style={{ color: 'var(--text-secondary)' }}>No data yet.</p>}
                </div>
                
                <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Most Viewed Projects</h3>
                  {mostViewedProjects.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {mostViewedProjects.map((p, i) => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.95rem' }}>{i + 1}. {p.title}</span>
                          <strong style={{ color: 'var(--accent-primary)' }}>{formatNumber(p.viewsCount)}</strong>
                        </div>
                      ))}
                    </div>
                  ) : <p style={{ color: 'var(--text-secondary)' }}>No data yet.</p>}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="glass animate-fade-in" style={{ padding: '40px', borderRadius: 'var(--radius-lg)', maxWidth: '600px' }}>
              <h2 style={{ marginBottom: '24px' }}>Platform Settings</h2>
              
              <form onSubmit={handleSaveSettings}>
                <div className="input-group">
                  <label className="input-label">Submission Password</label>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-4px', marginBottom: '8px' }}>
                    The shared password team members need to submit projects.
                  </p>
                  <input
                    type="text"
                    className="input-field"
                    value={settings.submissionPassword}
                    onChange={(e) => setSettings({ ...settings, submissionPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Featured Projects Limit</label>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-4px', marginBottom: '8px' }}>
                    Maximum number of projects to display in the hero carousel.
                  </p>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    className="input-field"
                    value={settings.featuredProjectsLimit}
                    onChange={(e) => setSettings({ ...settings, featuredProjectsLimit: parseInt(e.target.value) || 5 })}
                    required
                  />
                </div>

                <div className="input-group" style={{ marginBottom: '32px' }}>
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                      style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }}
                    />
                    Enable Maintenance Mode (Future implementation)
                  </label>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSavingSettings}
                >
                  {isSavingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </form>
            </div>
          )}
        </>
      )}

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          onUpdate={fetchDashboardData}
          isPending={isPendingModal}
        />
      )}

      <style>
        {`
          .list-card {
            padding: 24px; 
            border-radius: var(--radius-lg);
            display: grid;
            grid-template-columns: minmax(200px, 1fr) auto;
            gap: 24px;
            align-items: center;
          }

          .action-btn {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            background-color: rgba(255, 255, 255, 0.03);
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all var(--transition-fast);
          }
          
          .action-btn:hover {
            color: var(--text-primary);
            border-color: rgba(255, 255, 255, 0.2);
          }

          .action-btn.preview:hover {
            background-color: rgba(0, 212, 255, 0.1);
            color: var(--accent-primary);
            border-color: rgba(0, 212, 255, 0.3);
          }

          .action-btn.approve:hover {
            background-color: rgba(34, 197, 94, 0.1);
            color: var(--success);
            border-color: rgba(34, 197, 94, 0.3);
          }

          .action-btn.reject:hover, .action-btn.delete:hover {
            background-color: rgba(239, 68, 68, 0.1);
            color: var(--danger);
            border-color: rgba(239, 68, 68, 0.3);
          }

          .action-btn.featured {
            color: #fbbf24;
            background-color: rgba(251, 191, 36, 0.1);
            border-color: rgba(251, 191, 36, 0.3);
          }
          
          .badge-featured {
            background-color: rgba(251, 191, 36, 0.1) !important;
            color: #fbbf24 !important;
            border-color: rgba(251, 191, 36, 0.3) !important;
          }

          @media (max-width: 640px) {
            .list-card { grid-template-columns: 1fr !important; }
            .action-btn { flex: 1; min-height: 48px; }
          }
        `}
      </style>
    </div>
  );
};
