import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import type { Project } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import { Badge } from './Badge';
import { LikeButton } from './LikeButton';
import { formatNumber } from '../utils/helpers';
import { getCategoryPlaceholder } from '../utils/constants';

interface FeaturedCarouselProps {
  projects: Project[];
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ projects }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [projects]);

  if (!projects || projects.length === 0) {
    return null; // Auto-hide if no featured projects
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="featured-section" style={{ position: 'relative', margin: '40px 0' }}>
      <div className="container" style={{ padding: '0 24px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '4px', height: '24px', backgroundColor: 'var(--accent-primary)', borderRadius: '2px' }}></span>
          Featured Projects
        </h2>
      </div>

      <div style={{ position: 'relative' }}>
        {/* Left Navigation Arrow */}
        {showLeftArrow && (
          <button 
            onClick={() => scroll('left')}
            className="carousel-btn left glass"
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Carousel Container */}
        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          className="carousel-container hide-scrollbar"
        >
          {projects.map((project, index) => (
            <div key={project.id} className="carousel-card-wrapper animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <Link to={`/project/${project.id}`} className="carousel-card">
                <ImageWithFallback 
                  src={project.coverImageUrl || ''} 
                  previewSrc={project.previewImageUrl}
                  liveDemoUrl={project.liveDemoUrl}
                  fallbackSrc={getCategoryPlaceholder(project.category)}
                  alt={project.title}
                  className="carousel-img"
                  previewSource={project.previewSource}
                />
                
                {/* Always visible minimal info */}
                <div className="carousel-info-minimal">
                  <Badge type="category" value={project.category} />
                </div>

                {/* Hover Reveal Overlay */}
                <div className="carousel-overlay">
                  <div className="carousel-overlay-content">
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 700 }}>{project.title}</h3>
                    <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#ccc' }}>
                      by {project.teamMemberName}
                    </p>
                    
                    <p className="carousel-desc">
                      {project.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      {project.technologies.slice(0, 3).map(tech => (
                        <Badge key={tech} type="tech" value={tech} />
                      ))}
                      {project.technologies.length > 3 && (
                        <Badge type="tech" value={`+${project.technologies.length - 3}`} />
                      )}
                    </div>

                    <div className="carousel-actions" onClick={(e) => e.preventDefault()}>
                      <Link to={`/project/${project.id}`} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                        View Details
                      </Link>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.8)' }}>
                          <Eye size={16} />
                          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{formatNumber(project.viewsCount)}</span>
                        </div>
                        <LikeButton projectId={project.id} initialLikes={project.likesCount} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Right Navigation Arrow */}
        {showRightArrow && (
          <button 
            onClick={() => scroll('right')}
            className="carousel-btn right glass"
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      <style>
        {`
          .carousel-container {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            gap: 20px;
            padding: 0 24px 20px 24px; /* extra bottom padding for shadow */
            scroll-behavior: smooth;
          }

          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          .carousel-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            z-index: 20;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;
            transition: all var(--transition-fast);
          }

          .carousel-btn:hover {
            background-color: rgba(255, 255, 255, 0.1);
            transform: translateY(-50%) scale(1.1);
          }

          .carousel-btn.left { left: 16px; }
          .carousel-btn.right { right: 16px; }

          .carousel-card-wrapper {
            scroll-snap-align: start;
            flex: 0 0 320px;
          }

          @media (min-width: 768px) {
            .carousel-card-wrapper { flex: 0 0 400px; }
          }

          @media (min-width: 1024px) {
            .carousel-card-wrapper { flex: 0 0 480px; }
          }

          .carousel-card {
            display: block;
            position: relative;
            width: 100%;
            aspect-ratio: 16/9;
            border-radius: var(--radius-lg);
            overflow: hidden;
            box-shadow: inset 0 1px 0 0 rgba(0, 229, 255, 0.1);
            transition: all var(--transition-normal);
            border: 1px solid var(--border-color);
            background-color: var(--bg-secondary);
          }

          .carousel-card:hover {
            transform: scale(1.02);
            box-shadow: 0 0 30px rgba(0, 229, 255, 0.3), inset 0 1px 0 rgba(0, 229, 255, 0.4);
            border-color: rgba(0, 229, 255, 0.5);
            z-index: 10;
          }

          .carousel-img {
            transition: transform 0.7s ease;
          }

          .carousel-card:hover .carousel-img {
            transform: scale(1.05);
          }

          .carousel-info-minimal {
            position: absolute;
            top: 12px;
            left: 12px;
            z-index: 2;
          }

          .carousel-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to top, rgba(5, 8, 22, 0.98) 0%, rgba(5, 8, 22, 0.8) 40%, rgba(5, 8, 22, 0.2) 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
            display: flex;
            align-items: flex-end;
            padding: 24px;
            z-index: 3;
          }

          .carousel-card:hover .carousel-overlay {
            opacity: 1;
          }

          .carousel-overlay-content {
            width: 100%;
            transform: translateY(20px);
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }

          .carousel-card:hover .carousel-overlay-content {
            transform: translateY(0);
          }

          .carousel-desc {
            font-size: 0.9rem;
            color: #ddd;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            margin-bottom: 16px;
          }

          .carousel-actions {
            display: flex;
            align-items: center;
            width: 100%;
          }

          @media (max-width: 768px) {
            /* On mobile, tap expands details, no hover dependency */
            .carousel-btn { display: none; }
            .carousel-card { aspect-ratio: 4/3; }
            .carousel-overlay {
              opacity: 1;
              background: linear-gradient(to top, rgba(10, 10, 15, 0.95) 0%, rgba(10, 10, 15, 0.4) 60%, transparent 100%);
            }
            .carousel-overlay-content { transform: translateY(0); }
            .carousel-desc { display: none; } /* Hide desc on mobile to save space */
          }
        `}
      </style>
    </section>
  );
};
