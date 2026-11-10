import React from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { ProjectFilterCriteria, Category } from '../../types';

interface ProjectFilterBarProps {
  criteria: ProjectFilterCriteria;
  categories: Category[];
  availableTechnologies?: string[];
  onChange: (updates: Partial<ProjectFilterCriteria>) => void;
  onReset: () => void;
  showArenaSorts?: boolean;
}

export const ProjectFilterBar: React.FC<ProjectFilterBarProps> = ({
  criteria,
  categories,
  availableTechnologies = ['React', 'TypeScript', 'Node.js', 'Python', 'Go', 'Docker', 'Kubernetes', 'AI/ML', 'Tailwind CSS', 'GraphQL'],
  onChange,
  onReset,
  showArenaSorts = false,
}) => {
  const hasActiveFilters = Boolean(
    (criteria.searchQuery && criteria.searchQuery.trim().length > 0) ||
    (criteria.category && criteria.category !== 'all') ||
    (criteria.technology && criteria.technology !== 'all') ||
    (criteria.projectStatus && criteria.projectStatus !== 'all') ||
    (criteria.department && criteria.department !== 'all')
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-4">
      {/* Top Search & Primary Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects, technologies, creators..."
            value={criteria.searchQuery || ''}
            onChange={(e) => onChange({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30 focus:border-[#FF3D88]"
          />
          {criteria.searchQuery && (
            <button
              onClick={() => onChange({ searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={criteria.sortBy || 'newest'}
            onChange={(e) => onChange({ sortBy: e.target.value as ProjectFilterCriteria['sortBy'] })}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
          >
            <option value="newest">Recently Approved</option>
            <option value="likes">Most Liked</option>
            <option value="votes">Most Evaluated</option>
            <option value="rating">Top Rated (Good %)</option>
            {showArenaSorts && <option value="trending">Trending Velocity</option>}
          </select>
        </div>
      </div>

      {/* Filter Row: Category, Technology, Status */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
        <span className="text-xs font-mono uppercase text-slate-400 mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filters:
        </span>

        {/* Category Dropdown */}
        <select
          value={criteria.category || 'all'}
          onChange={(e) => onChange({ category: e.target.value })}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#FF3D88]"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Technology Tag Dropdown */}
        <select
          value={criteria.technology || 'all'}
          onChange={(e) => onChange({ technology: e.target.value })}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#FF3D88]"
        >
          <option value="all">All Technologies</option>
          {availableTechnologies.map((tech) => (
            <option key={tech} value={tech}>
              {tech}
            </option>
          ))}
        </select>

        {/* Status Dropdown */}
        <select
          value={criteria.projectStatus || 'all'}
          onChange={(e) => onChange({ projectStatus: e.target.value })}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#FF3D88]"
        >
          <option value="all">All Statuses</option>
          <option value="LIVE">Live</option>
          <option value="IN_DEVELOPMENT">In Development</option>
          <option value="COMPLETED">Completed</option>
          <option value="ON_HOLD">On Hold</option>
        </select>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="ml-auto text-xs font-semibold text-[#FF3D88] hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

