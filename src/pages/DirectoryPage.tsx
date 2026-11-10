import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Users, Search, Filter, Mail, Briefcase, Award, X, Sparkles, FolderGit2 } from 'lucide-react';
import { userRepository } from '../repositories/userRepository';
import { projectRepository } from '../repositories/projectRepository';
import { UserProfile, Project } from '../types';
import { RoleBadge, Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ProjectCard } from '../features/projects/ProjectCard';

export const DirectoryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedDept, setSelectedDept] = useState(searchParams.get('dept') || 'all');
  const [isLoading, setIsLoading] = useState(true);

  // Selected employee modal for portfolio view
  const [selectedEmployee, setSelectedEmployee] = useState<UserProfile | null>(null);
  const [employeeProjects, setEmployeeProjects] = useState<Project[]>([]);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const users = await userRepository.listEmployees({
          department: selectedDept,
          searchQuery,
          accountStatus: 'ACTIVE',
        });
        setEmployees(users);

        // Check if query param specifies creator modal
        const creatorId = searchParams.get('creator');
        if (creatorId) {
          const target = users.find((u) => u.id === creatorId) || (await userRepository.getById(creatorId));
          if (target) {
            handleOpenProfile(target);
          }
        }
      } catch (err) {
        console.warn('Failed to load directory:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [searchQuery, selectedDept, searchParams]);

  const handleOpenProfile = async (emp: UserProfile) => {
    setSelectedEmployee(emp);
    setIsLoadingPortfolio(true);
    try {
      const projects = await projectRepository.listByCreator(emp.id);
      // Only show approved projects for public portfolio view
      setEmployeeProjects(projects.filter((p) => p.approvalStatus === 'APPROVED' && !p.isArchived));
    } catch (err) {
      console.warn('Failed to load portfolio:', err);
    } finally {
      setIsLoadingPortfolio(false);
    }
  };

  const departments = ['all', 'Executive', 'Engineering', 'Product Development', 'Design', 'Data & AI', 'Security'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#0F1B3D] tracking-tight">
          Employee Directory
        </h2>
        <p className="mt-1 text-sm text-slate-500 font-sans">
          Discover company innovators, technical skills, and project collections.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, role, skill or technology..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
        >
          {departments.map((d) => (
            <option key={d} value={d}>
              {d === 'all' ? 'All Departments' : d}
            </option>
          ))}
        </select>
      </div>

      {/* Employee Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : employees.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="No Employees Found"
          description="Try broadening your search term or selecting All Departments."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedDept('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((emp) => (
            <div
              key={emp.id}
              onClick={() => handleOpenProfile(emp)}
              className="group bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card hover:shadow-cardHover transition-all flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <img
                    src={
                      emp.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
                    }
                    alt={emp.fullName}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-[#FF3D88]/30 transition-all"
                  />
                  <RoleBadge role={emp.role} />
                </div>

                <h3 className="font-heading font-bold text-base text-[#0F1B3D] group-hover:text-[#FF3D88] transition-colors truncate">
                  {emp.fullName}
                </h3>
                <p className="text-xs text-slate-500 font-sans truncate">{emp.designation}</p>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">{emp.department}</p>

                {/* Skills Preview */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {emp.skills?.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-medium text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                  {(emp.skills?.length || 0) > 3 && (
                    <span className="text-[10px] font-mono text-slate-400 self-center">
                      +{(emp.skills?.length || 0) - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer: Project Count and Likes */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
                  {emp.totalApprovedProjects || 0} approved
                </span>
                <span className="text-[#FF3D88] font-bold font-sans text-xs">
                  View Portfolio →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Employee Portfolio Modal */}
      <Modal
        isOpen={Boolean(selectedEmployee)}
        onClose={() => {
          setSelectedEmployee(null);
          // clear query param
          navigate('/directory', { replace: true });
        }}
        maxWidth="3xl"
        title={selectedEmployee?.fullName}
        description={`${selectedEmployee?.designation} • ${selectedEmployee?.department}`}
      >
        {selectedEmployee && (
          <div className="space-y-6">
            {/* Header Bio */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <img
                src={selectedEmployee.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                alt={selectedEmployee.fullName}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-heading font-bold text-base text-[#0F1B3D]">
                    {selectedEmployee.fullName}
                  </h4>
                  <RoleBadge role={selectedEmployee.role} />
                </div>
                <p className="text-xs text-slate-600 font-sans flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedEmployee.email}
                </p>
                <div className="flex gap-4 pt-1 text-xs font-mono text-slate-500">
                  <span>{selectedEmployee.totalApprovedProjects || 0} Approved Projects</span>
                  <span>{selectedEmployee.totalLikesReceived || 0} Likes Received</span>
                </div>
              </div>
            </div>

            {/* Skills & Tech */}
            <div className="space-y-2">
              <h5 className="font-heading font-semibold text-xs uppercase tracking-wider text-slate-400">
                Skills & Technologies
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {selectedEmployee.skills?.map((s) => (
                  <Badge key={s} variant="navy">{s}</Badge>
                ))}
                {selectedEmployee.technologies?.map((t) => (
                  <Badge key={t} variant="tech">{t}</Badge>
                ))}
              </div>
            </div>

            {/* Approved Projects Showcase */}
            <div className="space-y-3 pt-2">
              <h5 className="font-heading font-semibold text-xs uppercase tracking-wider text-slate-400">
                Approved Project Showcase ({employeeProjects.length})
              </h5>

              {isLoadingPortfolio ? (
                <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
              ) : employeeProjects.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                  No public approved projects found for this employee yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {employeeProjects.map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

