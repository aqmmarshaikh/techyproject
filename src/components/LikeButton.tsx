import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { toggleLike, checkHasLiked } from '../lib/firestore';
import { useVisitor } from '../context/VisitorContext';
import { formatNumber } from '../utils/helpers';

interface LikeButtonProps {
  projectId: string;
  initialLikes?: number;
  showCount?: boolean;
}

export const LikeButton: React.FC<LikeButtonProps> = ({ 
  projectId, 
  initialLikes = 0,
  showCount = false
}) => {
  const { visitorId } = useVisitor();
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkHasLiked(projectId, visitorId);
      setHasLiked(status);
    };
    checkStatus();
  }, [projectId, visitorId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if inside a link
    e.stopPropagation();
    
    if (isLiking) return;
    
    setIsLiking(true);
    
    // Optimistic UI update
    setHasLiked(!hasLiked);
    setLikes(prev => hasLiked ? prev - 1 : prev + 1);

    try {
      const newStatus = await toggleLike(projectId, visitorId);
      // Only sync if the server response differs from our optimistic state
      if (newStatus !== !hasLiked) {
         setHasLiked(newStatus);
         setLikes(prev => newStatus ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on failure
      setHasLiked(hasLiked);
      setLikes(initialLikes);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <button 
      onClick={handleLike}
      disabled={isLiking}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="like-button"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'none',
        border: 'none',
        padding: '4px',
        cursor: isLiking ? 'default' : 'pointer',
        color: hasLiked ? '#ec4899' : (isHovered ? '#f472b6' : 'var(--text-secondary)'),
        transition: 'all 0.2s ease',
        transform: isHovered && !isLiking ? 'scale(1.1)' : 'scale(1)'
      }}
      aria-label={hasLiked ? "Unlike project" : "Like project"}
    >
      <Heart 
        size={showCount ? 20 : 18} 
        fill={hasLiked ? 'currentColor' : 'none'} 
        style={{ 
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: isLiking ? 'scale(0.8)' : 'scale(1)'
        }}
      />
      {showCount && (
        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {formatNumber(likes)}
        </span>
      )}
    </button>
  );
};
