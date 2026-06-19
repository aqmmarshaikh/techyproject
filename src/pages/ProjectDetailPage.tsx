import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Eye, Calendar, Code, GitBranch } from 'lucide-react';
import { getProjectById, recordView } from '../lib/firestore';
import type { Project } from '../types';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { Badge } from '../components/Badge';
import { LikeButton } from '../components/LikeButton';
import { formatNumber, timeAgo } from '../utils/helpers';
import { useVisitor } from '../context/VisitorContext';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { visitorId } = useVisitor();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getProjectById(id);
        
        if (data) {
          setProject(data);
          // Only record view if project is approved (publicly visible)
          recordView(data.id, visitorId);
        } else {
          // If not found, navigate to 404
          navigate('/404', { replace: true });
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate, visitorId]);

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader"></div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="project-detail animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* Back Button */}
      <div className="container" style={{ paddingTop: '120px', paddingBottom: '20px' }}>
        <Link 
          to="/" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: 'var(--text-secondary)',
            fontWeight: 500,
            transition: 'color var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={18} /> Back to Projects
        </Link>
      </div>

      <div className="container">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Header & Cover Image */}
          <div 
            style={{ 
              borderRadius: 'var(--radius-lg)', 
              overflow: 'hidden', 
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              marginBottom: '40px'
            }}
          >
            <div style={{ aspectRatio: '16/9', width: '100%', position: 'relative' }}>
              <ImageWithFallback src={project.coverImageUrl || ''} previewSrc={project.previewImageUrl} liveDemoUrl={project.liveDemoUrl} alt={project.title} previewSource={project.previewSource} />
              
              {/* Optional: Add a subtle gradient overlay at bottom of image if we want text over it, 
                  but design spec says below is fine. */}
            </div>

            <div style={{ padding: '32px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <Badge type="category" value={project.category} />
                <Badge type="status" value={project.status || ''} />
                
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', margin: '0 0 8px 0', fontWeight: 800 }}>
                    {project.title}
                  </h1>
                  <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                    Built by <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{project.teamMemberName}</span>
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: 'var(--bg-tertiary)', padding: '12px 20px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <Eye size={20} />
                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{formatNumber(project.viewsCount)}</span>
                  </div>
                  <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }}></div>
                  <LikeButton projectId={project.id} initialLikes={project.likesCount} showCount={true} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
            {/* Main Content Column */}
            <div className="main-content">
              
              {/* Description */}
              <section style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '4px', height: '24px', backgroundColor: 'var(--accent-primary)', borderRadius: '2px' }}></span>
                  About the Project
                </h3>
                <div 
                  style={{ 
                    fontSize: '1.1rem', 
                    lineHeight: 1.8, 
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {project.description}
                </div>
              </section>

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Code size={20} color="var(--accent-primary)" /> Technologies
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Column */}
            <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Actions Card */}
              <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Links</h3>
                
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {project.liveDemoUrl && (
                    <a href={project.liveDemoUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', flex: 1, justifyContent: 'center' }}>
                      <ExternalLink size={18} /> View Live Demo
                    </a>
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noreferrer" className="btn btn-secondary glass" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', flex: 1, justifyContent: 'center' }}>
                      <GitBranch size={18} /> Source Code
                    </a>
                  )}
                </div>
              </div>

              {/* Creator Card */}
              <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Creator</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div 
                    style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '50%', 
                      background: 'var(--accent-gradient)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1.2rem'
                    }}
                  >
                    {project.teamMemberName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{project.teamMemberName}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>TechyBoy Team</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <Calendar size={14} />
                  Submitted {timeAgo(project.submittedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .badge-warning {
            background-color: rgba(245, 158, 11, 0.1) !important;
            color: var(--warning) !important;
            border-color: rgba(245, 158, 11, 0.3) !important;
          }

          @media (min-width: 768px) {
            .main-content {
              grid-column: span 8 / span 8 !important;
            }
            .sidebar {
              grid-column: span 4 / span 4 !important;
            }
          }
        `}
      </style>
    </div>
  );
};
