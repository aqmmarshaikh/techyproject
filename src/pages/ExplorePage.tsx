import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, Filter, Plus } from 'lucide-react';
import { projectRepository } from '../repositories/projectRepository';
import { categoryRepository } from '../repositories/categoryRepository';
import { interactionRepository } from '../repositories/interactionRepository';
import { Project, Category, ProjectFilterCriteria } from '../types';
import { ProjectCard } from '../features/projects/ProjectCard';
import { ProjectFilterBar } from '../features/projects/ProjectFilterBar';
import { ProjectCardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ensureInitialSeedData } from '../utils/seedData';

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, isAuthenticated, openAuthModal } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [userBookmarks, setUserBookmarks] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [criteria, setCriteria] = useState<ProjectFilterCriteria>({
    searchQuery: '',
    category: 'all',
    technology: 'all',
    projectStatus: 'all',
    sortBy: 'newest',
  });

  // Load categories and initial data
  useEffect(() => {
    const init = async () => {
      await ensureInitialSeedData();
      const cats = await categoryRepository.list();
      setCategories(cats);
    };
    init();
  }, []);

  // Fetch approved projects whenever criteria changes
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const items = await projectRepository.listApproved(criteria, 60);
      setProjects(items);

      // Batch load user interactions if user is logged in
      if (userProfile?.id && items.length > 0) {
        const likesMap: Record<string, boolean> = {};
        const bookmarksMap: Record<string, boolean> = {};

        // Load all user bookmarks in a single batch query
        try {
          const userBookmarksList = await interactionRepository.listUserBookmarks(userProfile.id);
          userBookmarksList.forEach((b) => {
            bookmarksMap[b.projectId] = true;
          });
        } catch (bErr) {
          console.warn('Bookmarks batch load warning:', bErr);
        }

        // Load all user likes in a single batch query
        try {
          const userLikedIds = await interactionRepository.listUserLikedProjectIds(userProfile.id);
          userLikedIds.forEach((id) => {
            likesMap[id] = true;
          });
        } catch (lErr) {
          console.warn('Likes batch load warning:', lErr);
        }

        setUserLikes(likesMap);
        setUserBookmarks(bookmarksMap);
      }
    } catch (err) {
      console.warn('Failed to fetch projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    // Set up real-time sync when on default view to show approved projects instantly
    if (!criteria.searchQuery && criteria.category === 'all' && criteria.technology === 'all') {
      const unsubscribe = projectRepository.subscribeToApproved((items) => {
        setProjects(items);
      });
      return () => unsubscribe();
    }
  }, [criteria, userProfile?.id]);

  const handleFilterChange = (updates: Partial<ProjectFilterCriteria>) => {
    setCriteria((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setCriteria({
      searchQuery: '',
      category: 'all',
      technology: 'all',
      projectStatus: 'all',
      sortBy: 'newest',
    });
  };

  const featuredProjects = projects.filter((p) => p.isFeatured);
  const regularProjects = projects.filter((p) => !p.isFeatured);

  return (
    <div className="space-y-8">
      {/* Welcome & Discover Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0F1B3D] tracking-tight">
            Discover Company Projects
          </h2>
          <p className="mt-1 text-sm text-slate-500 font-sans">
            Explore approved innovations, tools, and platforms built across our teams.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            if (!isAuthenticated) {
              openAuthModal('Sign in to submit your project to the showcase.');
              return;
            }
            navigate('/submit');
          }}
          className="self-start md:self-auto"
        >
          Submit New Project
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <ProjectFilterBar
        criteria={criteria}
        categories={categories}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && projects.length === 0 && (
        <EmptyState
          icon={<Compass className="w-8 h-8" />}
          title="No Matching Projects Found"
          description="Try adjusting your search criteria, switching categories, or resetting active filters."
          actionLabel="Reset Filters"
          onAction={handleResetFilters}
        />
      )}

      {/* Projects Grid */}
      {!isLoading && projects.length > 0 && (
        <div className="space-y-10">
          {/* Featured Row (if any and not actively searching specific query) */}
          {featuredProjects.length > 0 && !criteria.searchQuery && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF3D88]" />
                <h3 className="font-heading font-bold text-base text-[#0F1B3D] uppercase tracking-wider text-xs">
                  Spotlight & Featured
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProjects.map((p) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    initialIsLiked={userLikes[p.id]}
                    initialIsBookmarked={userBookmarks[p.id]}
                  />
                ))}
              </div>
            </section>
          )}

          {/* All Showcase Projects */}
          <section className="space-y-4">
            {featuredProjects.length > 0 && !criteria.searchQuery && (
              <h3 className="font-heading font-bold text-base text-[#0F1B3D] uppercase tracking-wider text-xs">
                All Approved Initiatives ({projects.length})
              </h3>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(featuredProjects.length > 0 && !criteria.searchQuery
                ? regularProjects
                : projects
              ).map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  initialIsLiked={userLikes[p.id]}
                  initialIsBookmarked={userBookmarks[p.id]}
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

