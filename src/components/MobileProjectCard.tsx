import React from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import type { Project } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import { Badge } from './Badge';
import { LikeButton } from './LikeButton';
import { formatNumber } from '../utils/helpers';
import { getCategoryPlaceholder } from '../utils/constants';

interface MobileProjectCardProps {
  project: Project;
  onViewDetails?: (project: Project) => void;
}

export const MobileProjectCard: React.FC<MobileProjectCardProps> = ({ project, onViewDetails }) => {
  return (
    <Link 
      to={`/project/${project.id}`} 
      className="mobile-project-card animate-fade-in mobile-only"
    >
      <div className="mobile-card-img-wrapper">
        <ImageWithFallback 
          src={project.coverImageUrl || ''} 
          previewSrc={project.previewImageUrl}
          liveDemoUrl={project.liveDemoUrl}
          fallbackSrc={getCategoryPlaceholder(project.category)}
          alt={project.title}
          className="mobile-card-img"
          previewSource={project.previewSource}
        />
        <div className="mobile-status-badge">
          <Badge type="status" value={project.status || ''} />
        </div>
      </div>

      <div className="mobile-card-content">
        <h3 className="mobile-card-title">
          {project.title}
        </h3>
        
        <p className="mobile-card-desc">
          {project.description}
        </p>
        
        <p className="mobile-card-creator">
          by <span>{project.teamMemberName}</span>
        </p>

        <div className="mobile-card-footer" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge type="category" value={project.category} />
            <button 
              onClick={(e) => {
                if (onViewDetails) {
                  e.preventDefault();
                  onViewDetails(project);
                }
              }}
              className="btn btn-secondary"
              style={{ padding: '2px 8px', fontSize: '0.7rem', height: '22px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
            >
              View Details
            </button>
          </div>
          
          <div className="mobile-card-stats">
            <div className="mobile-stat-item">
              <Eye size={14} />
              <span>{formatNumber(project.viewsCount)}</span>
            </div>
            
            <div onClick={(e) => e.preventDefault()} className="mobile-like-btn">
              <LikeButton projectId={project.id} initialLikes={project.likesCount} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
