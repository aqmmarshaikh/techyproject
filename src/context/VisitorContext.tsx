import React, { createContext, useContext, useEffect, useState } from 'react';
import { generateVisitorId } from '../utils/helpers';

interface VisitorContextType {
  visitorId: string;
  likedProjects: Set<string>;
  addLikedProject: (projectId: string) => void;
}

const VisitorContext = createContext<VisitorContextType>({
  visitorId: '',
  likedProjects: new Set(),
  addLikedProject: () => {},
});

export const useVisitor = () => useContext(VisitorContext);

export const VisitorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visitorId, setVisitorId] = useState('');
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Initialize visitor ID
    const id = generateVisitorId();
    setVisitorId(id);

    // Load liked projects from local storage
    const storedLikes = localStorage.getItem('techyboy_liked_projects');
    if (storedLikes) {
      try {
        const parsed = JSON.parse(storedLikes);
        if (Array.isArray(parsed)) {
          setLikedProjects(new Set(parsed));
        }
      } catch (e) {
        console.error('Failed to parse liked projects', e);
      }
    }
  }, []);

  const addLikedProject = (projectId: string) => {
    setLikedProjects((prev) => {
      const newSet = new Set(prev);
      newSet.add(projectId);
      
      // Save back to local storage
      localStorage.setItem('techyboy_liked_projects', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  return (
    <VisitorContext.Provider value={{ visitorId, likedProjects, addLikedProject }}>
      {children}
    </VisitorContext.Provider>
  );
};
