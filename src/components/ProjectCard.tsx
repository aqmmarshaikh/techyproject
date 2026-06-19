import React from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import type { Project } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import { Badge } from './Badge';
import { LikeButton } from './LikeButton';
import { formatNumber } from '../utils/helpers';
import { getCategoryPlaceholder } from '../utils/constants';

interface ProjectCardProps {
  project: Project;
  onViewDetails?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onViewDetails }) => {
  return (
    <Link 
      to={`/project/${project.id}`} 
      className="project-card desktop-project-card animate-fade-in"
    >
      {/* 1. Preview Image */}
      <div className="card-img-container">
        <ImageWithFallback 
          src={project.coverImageUrl || ''} 
          previewSrc={project.previewImageUrl}
          liveDemoUrl={project.liveDemoUrl}
          fallbackSrc={getCategoryPlaceholder(project.category)}
          alt={project.title}
          style={{ transition: 'transform 0.5s ease' }}
          className="card-img"
          previewSource={project.previewSource}
        />
        
        {/* Status Badge overlay */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
          <Badge type="status" value={project.status || ''} />
        </div>
      </div>

      {/* Content Container */}
      <div className="card-content" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        
        {/* 2. Project Title */}
        <h3 className="card-title" style={{ 
          margin: '0 0 8px 0', 
          fontSize: '1.1rem',
          fontWeight: 600
        }}>
          {project.title}
        </h3>

        {/* 3. Description (Implied by Constraints) */}
        <p className="card-desc" style={{ 
          margin: '0 0 12px 0', 
          fontSize: '0.9rem', 
          color: 'var(--text-secondary)',
          lineHeight: 1.5
        }}>
          {project.description}
        </p>

        {/* 4. Creator Name */}
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          by <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{project.teamMemberName}</span>
        </p>

        {/* 6. Category + Stats (Buttons) */}
        <div className="card-footer" style={{ paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '48px', flexWrap: 'wrap', gap: '8px' }}>
          <Badge type="category" value={project.category} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={(e) => {
                if (onViewDetails) {
                  e.preventDefault();
                  onViewDetails(project);
                }
              }}
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.75rem', height: '24px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
            >
              View Details
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Eye size={16} />
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{formatNumber(project.viewsCount)}</span>
              </div>
              
              {/* We stop propagation here so clicking the like button doesn't navigate */}
              <div onClick={(e) => e.preventDefault()}>
                <LikeButton projectId={project.id} initialLikes={project.likesCount} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
};
