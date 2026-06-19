import React from 'react';
import type { Project } from '../types';
import { ProjectCard } from './ProjectCard';
import { MobileProjectCard } from './MobileProjectCard';

interface ProjectGridProps {
  projects: Project[];
  emptyMessage?: string;
  onViewDetails?: (project: Project) => void;
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({ 
  projects, 
  emptyMessage = 'The future is waiting to be built. Be the first to showcase a project.',
  onViewDetails
}) => {
  if (!projects || projects.length === 0) {
    return (
      <div 
        style={{ 
          padding: '40px 20px', 
          textAlign: 'center', 
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-color)',
          marginTop: '20px'
        }}
      >
        <p style={{ fontSize: '1.1rem' }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="project-grid">
      {projects.map((project, index) => (
        <div 
          key={project.id} 
          style={{ 
            animationDelay: `${index * 0.05}s` 
          }}
          className="animate-fade-in"
        >
          <ProjectCard project={project} onViewDetails={onViewDetails} />
          <MobileProjectCard project={project} onViewDetails={onViewDetails} />
        </div>
      ))}

      <style>
        {`
          .project-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 32px;
            margin-top: 20px;
          }
          
          @media (max-width: 992px) {
            .project-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 767px) {
            .project-grid {
              grid-template-columns: 1fr;
              gap: 20px;
            }
          }
        `}
      </style>
    </div>
  );
};
