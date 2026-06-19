import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Heart, Eye } from 'lucide-react';
import type { Project } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import { formatNumber } from '../utils/helpers';

interface LeaderboardProps {
  projects: Project[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ projects }) => {
  if (!projects || projects.length === 0) {
    return null;
  }

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0: return { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.3)' }; // Gold
      case 1: return { color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.1)', border: 'rgba(156, 163, 175, 0.3)' }; // Silver
      case 2: return { color: '#b45309', bg: 'rgba(180, 83, 9, 0.1)', border: 'rgba(180, 83, 9, 0.3)' }; // Bronze
      default: return { color: 'var(--text-secondary)', bg: 'var(--bg-tertiary)', border: 'var(--border-color)' };
    }
  };

  return (
    <div className="leaderboard-container glass">
      <div className="leaderboard-header">
        <Trophy size={24} color="#fbbf24" style={{ marginBottom: '8px' }} />
        <h2 style={{ fontSize: '1.5rem', margin: '0 0 8px 0' }}>Most Loved Projects</h2>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
          Top ranking projects based on community likes
        </p>
      </div>

      <div className="leaderboard-list">
        {projects.map((project, index) => {
          const rankStyle = getRankStyle(index);
          
          return (
            <Link 
              to={`/project/${project.id}`}
              key={project.id} 
              className="leaderboard-item animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div 
                className="rank-badge"
                style={{
                  color: rankStyle.color,
                  backgroundColor: rankStyle.bg,
                  borderColor: rankStyle.border
                }}
              >
                {index + 1}
              </div>
              
              <div className="leaderboard-thumbnail">
                <ImageWithFallback 
                  src={project.coverImageUrl || undefined} 
                  previewSrc={project.previewImageUrl}
                  liveDemoUrl={project.liveDemoUrl}
                  alt={project.title}
                  previewSource={project.previewSource}
                />
              </div>
              
              <div className="leaderboard-info">
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 600 }}>{project.title}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  by {project.teamMemberName}
                </p>
              </div>
              
              <div className="leaderboard-stats">
                <div className="stat-item" style={{ color: 'var(--danger)' }}>
                  <Heart size={14} fill="currentColor" />
                  <span>{formatNumber(project.likesCount)}</span>
                </div>
                <div className="stat-item" style={{ color: 'var(--text-secondary)' }}>
                  <Eye size={14} />
                  <span>{formatNumber(project.viewsCount)}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <style>
        {`
          .leaderboard-container {
            border-radius: var(--radius-lg);
            overflow: hidden;
          }

          .leaderboard-header {
            padding: 24px;
            border-bottom: 1px solid var(--border-color);
            background: linear-gradient(to right, rgba(0, 229, 255, 0.05), transparent);
          }

          .leaderboard-list {
            display: flex;
            flex-direction: column;
          }

          .leaderboard-item {
            display: flex;
            align-items: center;
            padding: 16px 24px;
            border-bottom: 1px solid var(--border-color);
            text-decoration: none;
            color: inherit;
            transition: all var(--transition-fast);
            gap: 16px;
          }

          .leaderboard-item:last-child {
            border-bottom: none;
          }

          .leaderboard-item:hover {
            background-color: rgba(0, 229, 255, 0.05);
            transform: scale(1.005);
            box-shadow: 0 0 15px rgba(0, 229, 255, 0.2), inset 0 1px 0 rgba(0, 229, 255, 0.4);
            z-index: 10;
            position: relative;
            border-color: rgba(0, 229, 255, 0.3);
          }

          .rank-badge {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.9rem;
            border: 1px solid;
            flex-shrink: 0;
          }

          .leaderboard-thumbnail {
            width: 60px;
            height: 40px;
            border-radius: var(--radius-sm);
            overflow: hidden;
            flex-shrink: 0;
            border: 1px solid var(--border-color);
          }

          .leaderboard-info {
            flex: 1;
            min-width: 0; /* Enables text truncation */
          }

          .leaderboard-info h4 {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .leaderboard-stats {
            display: flex;
            flex-direction: column;
            gap: 4px;
            align-items: flex-end;
            flex-shrink: 0;
          }

          .stat-item {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 0.85rem;
            font-weight: 500;
          }

          @media (min-width: 640px) {
            .leaderboard-stats {
              flex-direction: row;
              gap: 16px;
              align-items: center;
            }
          }
        `}
      </style>
    </div>
  );
};
