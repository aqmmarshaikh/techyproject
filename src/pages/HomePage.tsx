import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HeroSection } from '../components/HeroSection';
import { FeaturedCarousel } from '../components/FeaturedCarousel';
import { ProjectGrid } from '../components/ProjectGrid';
import { Leaderboard } from '../components/Leaderboard';
import type { Project } from '../types';
import { getApprovedProjects, getFeaturedProjects, getLeaderboard } from '../lib/firestore';
import { useAuth } from '../context/AuthContext';
import { ProjectModal } from '../components/ProjectModal';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [leaderboard, setLeaderboard] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    console.log("HomePage mounted");
    return () => {
      console.log("HomePage unmounted");
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [approved, featured, topProjects] = await Promise.all([
        getApprovedProjects().catch(e => { console.error("Error fetching approved projects:", e); return []; }),
        getFeaturedProjects().catch(e => { console.error("Error fetching featured projects:", e); return []; }),
        getLeaderboard().catch(e => { console.error("Error fetching leaderboard projects:", e); return []; })
      ]);
      
      console.log("Fetched projects:", approved);
      console.log("Fetched featured:", featured);
      console.log("Fetched leaderboard:", topProjects);
      
      setProjects(approved);
      setFeaturedProjects(featured);
      setLeaderboard(topProjects);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          project.title.toLowerCase().includes(query) ||
          project.teamMemberName.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [projects, searchQuery]);

  return (
    <div className="home-page">
      <HeroSection />

      <FeaturedCarousel projects={featuredProjects} />

      <section id="projects" className="container" style={{ margin: '60px auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Discover Projects'}
            </h2>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="loader"></div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <ProjectGrid 
                projects={filteredProjects} 
                emptyMessage={
                  searchQuery 
                    ? `Nothing matched your search. Try another keyword.` 
                    : "The future is waiting to be built. Be the first to showcase a project."
                } 
                onViewDetails={user ? (project) => setSelectedProject(project) : undefined}
              />
            </div>
          </div>
        )}
      </section>

      {leaderboard.length > 0 && (
        <section className="container" style={{ margin: '80px auto' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Leaderboard projects={leaderboard} />
          </div>
        </section>
      )}

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          onUpdate={fetchData}
          isPending={false}
        />
      )}

      <style>
        {`
          .loader {
            width: 48px;
            height: 48px;
            border: 4px solid var(--border-color);
            border-bottom-color: var(--accent-primary);
            border-radius: 50%;
            display: inline-block;
            box-sizing: border-box;
            animation: rotation 1s linear infinite;
          }

          @keyframes rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            .category-filters {
              justify-content: flex-start !important;
              flex-wrap: nowrap !important;
            }
          }
        `}
      </style>
    </div>
  );
};
