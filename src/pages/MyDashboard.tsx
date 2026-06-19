import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutGrid, PlusCircle, ExternalLink, Edit, Trash2, 
  Copy, Eye, Heart, CheckCircle2, AlertCircle, RefreshCw, LogOut, Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logout } from '../lib/auth';
import { getUserProjects, deleteProject, duplicateProject } from '../lib/firestore';
import type { Project } from '../types';
import { Badge } from '../components/Badge';
import { ProjectModal } from '../components/ProjectModal';
import { formatNumber, timeAgo } from '../utils/helpers';

export const MyDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  // Modal State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIsPending, setModalIsPending] = useState(false);

  const fetchUserProjects = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userProjects = await getUserProjects(user.uid);
      setProjects(userProjects);
    } catch (error) {
      console.error('Error fetching creator projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProjects();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this project? This cannot be undone.')) return;
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      setDuplicatingId(id);
      await duplicateProject(id);
      await fetchUserProjects(); // reload list
    } catch (error) {
      console.error('Failed to duplicate project:', error);
      alert('Failed to duplicate project.');
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleOpenDetails = (project: Project) => {
    setSelectedProject(project);
    setModalIsPending(project.approvalStatus === 'pending');
    setIsModalOpen(true);
  };

  // Filtered projects
  const filteredProjects = projects.filter(p => {
    if (activeTab === 'all') return true;
    return p.approvalStatus === activeTab;
  });

  // Calculate quick stats from local project state
  const totalProjects = projects.length;
  const approvedCount = projects.filter(p => p.approvalStatus === 'approved').length;
  const pendingCount = projects.filter(p => p.approvalStatus === 'pending').length;
  const rejectedCount = projects.filter(p => p.approvalStatus === 'rejected').length;
  
  // Total Views/Likes of approved projects only
  const totalViews = projects.filter(p => p.approvalStatus === 'approved').reduce((sum, p) => sum + (p.viewsCount || 0), 0);
  const totalLikes = projects.filter(p => p.approvalStatus === 'approved').reduce((sum, p) => sum + (p.likesCount || 0), 0);

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
      {/* Upper Profile section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            background: 'var(--accent-gradient)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white', 
            fontWeight: 800, 
            fontSize: '1.5rem',
            boxShadow: '0 0 15px rgba(0, 229, 255, 0.4)'
          }}>
            {profile?.name?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Creator Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Logged in as <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{profile?.name}</span> ({profile?.email})
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/submit" className="btn btn-primary">
            <PlusCircle size={16} /> Submit Project
          </Link>
          <button 
            onClick={handleLogout} 
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="glass stat-card-dashboard">
          <span className="stat-label">Total Submissions</span>
          <span className="stat-value">{totalProjects}</span>
        </div>
        <div className="glass stat-card-dashboard" style={{ borderColor: 'var(--success)' }}>
          <span className="stat-label" style={{ color: 'var(--success)' }}>Approved</span>
          <span className="stat-value">{approvedCount}</span>
        </div>
        <div className="glass stat-card-dashboard" style={{ borderColor: 'var(--warning)' }}>
          <span className="stat-label" style={{ color: 'var(--warning)' }}>Pending Review</span>
          <span className="stat-value">{pendingCount}</span>
        </div>
        <div className="glass stat-card-dashboard" style={{ borderColor: 'var(--danger)' }}>
          <span className="stat-label" style={{ color: 'var(--danger)' }}>Rejected</span>
          <span className="stat-value">{rejectedCount}</span>
        </div>
        <div className="glass stat-card-dashboard">
          <span className="stat-label">Total Views</span>
          <span className="stat-value" style={{ color: 'var(--accent-primary)' }}>{formatNumber(totalViews)}</span>
        </div>
        <div className="glass stat-card-dashboard">
          <span className="stat-label">Total Likes</span>
          <span className="stat-value" style={{ color: '#ec4899' }}>{formatNumber(totalLikes)}</span>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="dashboard-tabs hide-scrollbar" style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {(['all', 'approved', 'pending', 'rejected'] as const).map(tab => (
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
              fontSize: '1.05rem',
              cursor: 'pointer',
              textTransform: 'capitalize',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {tab === 'all' && <LayoutGrid size={16} />}
            {tab === 'approved' && <CheckCircle2 size={16} color="var(--success)" />}
            {tab === 'pending' && <RefreshCw size={16} color="var(--warning)" />}
            {tab === 'rejected' && <AlertCircle size={16} color="var(--danger)" />}
            {tab} ({
              tab === 'all' ? totalProjects :
              tab === 'approved' ? approvedCount :
              tab === 'pending' ? pendingCount :
              rejectedCount
            })
          </button>
        ))}
      </div>

      {/* Projects List display */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="loader"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass" style={{ padding: '60px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            No {activeTab !== 'all' ? activeTab : ''} projects found.
          </p>
          {activeTab === 'all' && (
            <Link to="/submit" className="btn btn-primary">
              Submit Your First Project
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredProjects.map(project => (
            <div key={project.id} className={`glass creator-project-card ${project.approvalStatus}`}>
              <h3 className="project-card-title">{project.title}</h3>
              
              <div className="project-badges-row">
                <Badge type="category" value={project.category} />
                
                {/* Approval Status indicators */}
                {project.approvalStatus === 'approved' && (
                  <span className="status-indicator approved">Approved</span>
                )}
                {project.approvalStatus === 'pending' && (
                  <span className="status-indicator pending">Pending Review</span>
                )}
                {project.approvalStatus === 'rejected' && (
                  <span className="status-indicator rejected">Rejected</span>
                )}
              </div>
              
              <p className="project-description-summary">
                {project.description}
              </p>

              <div className="project-stats-row">
                <div className="stat-inline">
                  <Eye size={14} /> <span>{formatNumber(project.viewsCount || 0)} views</span>
                </div>
                <div className="stat-inline">
                  <Heart size={14} color="#ec4899" fill={project.likesCount > 0 ? "#ec4899" : "none"} /> <span>{formatNumber(project.likesCount || 0)} likes</span>
                </div>
                {project.submittedAt && (
                  <div className="stat-inline date">
                    <Calendar size={14} />
                    <span>Submitted {timeAgo(project.submittedAt)}</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="project-actions-container">
                <button 
                  onClick={() => handleOpenDetails(project)} 
                  className="btn btn-secondary action-btn-text"
                  title="View Details"
                >
                  <ExternalLink size={16} /> Details
                </button>
                <button 
                  onClick={() => {
                    handleOpenDetails(project);
                    // Force edit mode in modal
                    setTimeout(() => {
                      const editBtn = document.querySelector('.edit-btn') as HTMLButtonElement;
                      if (editBtn) editBtn.click();
                    }, 50);
                  }} 
                  className="btn btn-secondary action-btn-text edit"
                  title="Edit Project"
                >
                  <Edit size={16} /> Edit
                </button>
                <button 
                  onClick={() => handleDuplicate(project.id)} 
                  className="btn btn-secondary action-btn-text duplicate"
                  title="Duplicate Project"
                  disabled={duplicatingId === project.id}
                >
                  <Copy size={16} /> {duplicatingId === project.id ? 'Cloning...' : 'Duplicate'}
                </button>
                <button 
                  onClick={() => handleDelete(project.id)} 
                  className="btn btn-danger action-btn-text delete"
                  title="Delete Project"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Render the details/edit modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProject(null);
          }}
          onUpdate={fetchUserProjects}
          isPending={modalIsPending}
        />
      )}

      <style>
        {`
          .stat-card-dashboard {
            padding: 20px;
            border-radius: var(--radius-md);
            display: flex;
            flex-direction: column;
            gap: 4px;
            border: 1px solid var(--border-color);
            background-color: var(--bg-secondary);
            box-shadow: var(--shadow-sm);
          }

          .stat-card-dashboard .stat-label {
            font-size: 0.85rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .stat-card-dashboard .stat-value {
            font-size: 2rem;
            font-weight: 800;
            line-height: 1.1;
          }

          .creator-project-card {
            padding: 24px !important;
            border-radius: var(--radius-lg);
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 0;
            border: 1px solid var(--border-color) !important;
            border-left: 4px solid var(--border-color) !important;
            background-color: var(--bg-secondary);
            box-sizing: border-box;
          }

          @media (max-width: 640px) {
            .creator-project-card {
              padding: 18px !important;
            }
          }

          .creator-project-card.approved {
            border-left: 4px solid var(--success) !important;
          }

          .creator-project-card.pending {
            border-left: 4px solid var(--warning) !important;
          }

          .creator-project-card.rejected {
            border-left: 4px solid var(--danger) !important;
          }

          .project-card-title {
            margin-top: 0 !important;
            margin-bottom: 10px !important;
            font-size: 24px !important;
            font-weight: 700 !important;
            color: var(--text-primary);
          }

          .project-badges-row {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 10px;
            margin-bottom: 18px;
          }

          .project-description-summary {
            margin-top: 8px !important;
            margin-bottom: 16px !important;
            line-height: 1.6 !important;
            max-width: 80ch !important;
            font-size: 0.95rem;
            color: var(--text-secondary);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            word-break: break-word;
          }

          .project-stats-row {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            font-size: 0.85rem;
            color: var(--text-secondary);
            margin-top: 16px !important;
            padding-top: 12px !important;
            border-top: 1px solid rgba(255,255,255,0.08) !important;
          }

          .stat-inline {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .status-indicator {
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.02em;
            text-transform: uppercase;
          }

          .status-indicator.approved {
            background-color: rgba(16, 185, 129, 0.1);
            color: var(--success);
            border: 1px solid rgba(16, 185, 129, 0.2);
          }

          .status-indicator.pending {
            background-color: rgba(245, 158, 11, 0.1);
            color: var(--warning);
            border: 1px solid rgba(245, 158, 11, 0.2);
          }

          .status-indicator.rejected {
            background-color: rgba(239, 68, 68, 0.1);
            color: var(--danger);
            border: 1px solid rgba(239, 68, 68, 0.2);
          }

          .project-actions-container {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 12px !important;
            margin-top: 20px !important;
            align-items: center;
          }

          .action-btn-text {
            padding: 8px 14px;
            font-size: 0.85rem;
            border-radius: var(--radius-sm);
            height: 38px;
          }
        `}
      </style>
    </div>
  );
};
