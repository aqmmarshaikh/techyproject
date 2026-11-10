import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Sparkles, 
  ArrowRight, 
  Compass, 
  FolderGit2, 
  Users, 
  Heart, 
  Vote, 
  CheckCircle2, 
  Layers, 
  Globe, 
  ShieldCheck, 
  Menu, 
  X, 
  LogIn, 
  ExternalLink,
  Award,
  Zap,
  Code2,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { projectRepository } from '../repositories/projectRepository';
import { userRepository } from '../repositories/userRepository';
import { leaderboardService, LeaderboardUser } from '../services/leaderboardService';
import { LeaderboardPodium } from '../components/common/LeaderboardPodium';
import { TechMarquee } from '../components/common/TechMarquee';
import { Project, UserProfile } from '../types';

export const SESSION_ENTRY_KEY = 'projecthub_entry_completed';
export const INTENDED_DESTINATION_KEY = 'projecthub_intended_destination';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, isAuthenticated, openAuthModal } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Real Database Metrics, Showcase Projects, Active Team Members & Top 3 Users Leaderboard
  const [showcaseProjects, setShowcaseProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Sticky header background handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch real approved projects, active team members & top user leaderboard from Firestore
  useEffect(() => {
    const loadPlatformData = async () => {
      setIsLoadingData(true);
      try {
        const [approvedList, employeesList, topUsersList] = await Promise.all([
          projectRepository.listApproved({}, 12),
          userRepository.listEmployees({ accountStatus: 'ACTIVE', maxResults: 8 }),
          leaderboardService.getTopUsers(3),
        ]);

        setShowcaseProjects(approvedList);
        setTeamMembers(employeesList);
        setTopUsers(topUsersList);
      } catch (err) {
        console.warn('Failed to load landing page showcase data:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadPlatformData();
  }, []);

  /**
   * Centralized Entry Action
   * Marks session as completed and navigates into application.
   */
  const handleEnterApp = (targetPath?: string) => {
    try {
      sessionStorage.setItem(SESSION_ENTRY_KEY, 'true');
    } catch {
      // safe fallback
    }

    // Check if an intended internal destination was previously captured
    const intended = sessionStorage.getItem(INTENDED_DESTINATION_KEY);
    if (intended) {
      sessionStorage.removeItem(INTENDED_DESTINATION_KEY);
    }

    const destination = targetPath || intended;

    if (destination && destination !== '/' && destination !== '/welcome') {
      navigate(destination);
      return;
    }

    // Default entry routing based on authentication & role
    if (isAuthenticated && userProfile) {
      if (userProfile.role === 'SUPER_ADMIN') {
        navigate('/super-admin');
      } else if (userProfile.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      // Unauthenticated visitor enters the public showcase
      navigate('/explore');
    }
  };

  const handleSignInClick = () => {
    if (isAuthenticated) {
      handleEnterApp();
      return;
    }
    try {
      sessionStorage.setItem(SESSION_ENTRY_KEY, 'true');
    } catch {
      // safe fallback
    }
    openAuthModal('Sign in to your ProjectHub account.');
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Compute real Arena leaderboard: sorted by highest goodPercentage and totalValidVotes
  const arenaRankedProjects = [...showcaseProjects].sort((a, b) => {
    if ((b.totalValidVotes || 0) > 0 && (a.totalValidVotes || 0) === 0) return 1;
    if ((a.totalValidVotes || 0) > 0 && (b.totalValidVotes || 0) === 0) return -1;
    if (b.goodPercentage !== a.goodPercentage) {
      return (b.goodPercentage || 0) - (a.goodPercentage || 0);
    }
    if ((b.totalValidVotes || 0) !== (a.totalValidVotes || 0)) {
      return (b.totalValidVotes || 0) - (a.totalValidVotes || 0);
    }
    return (b.likeCount || 0) - (a.likeCount || 0);
  });

  const leaderboardList = arenaRankedProjects.slice(0, 5);

  // Showcase portfolio: lead project + secondary grid
  const showcaseLead = showcaseProjects[0];
  const showcaseGrid = showcaseProjects.slice(1, 4);

  return (
    <div className="min-h-screen bg-[#0F1B3D] text-white selection:bg-[#FF3D88] selection:text-white relative overflow-hidden font-sans">
      {/* Subtle ambient depth lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 left-1/3 w-[450px] h-[450px] bg-[#FF3D88]/10 rounded-full blur-[140px]" />
        <div className="absolute -top-10 right-1/4 w-[500px] h-[500px] bg-[#182B5C]/50 rounded-full blur-[160px]" />
      </div>

      {/* ========================================================= */}
      {/* SECTION 01 — NAVIGATION                                   */}
      {/* ========================================================= */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
          isScrolled
            ? 'bg-[#0F1B3D]/95 backdrop-blur-md border-b border-white/10 shadow-lg py-3.5'
            : 'bg-[#0F1B3D]/80 backdrop-blur-sm border-b border-white/5 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo & Wordmark */}
          <div 
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              src="/android-chrome-192x192.png"
              alt="ProjectHub Logo"
              className="w-9 h-9 rounded-xl object-contain border border-[#FF3D88]/30 group-hover:border-[#FF3D88]/60 transition-colors shrink-0"
            />
            <div>
              <span className="font-display font-bold text-lg tracking-tight text-white flex items-center">
                <span>Project</span><span className="text-[#FF3D88]">Hub</span>
              </span>
              <p className="text-[10px] text-slate-400 font-decorative tracking-wider uppercase">TEAM PROJECT ARENA</p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <button
              onClick={() => scrollToSection('hero')}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-white transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('showcase')}
              className="hover:text-white transition-colors"
            >
              Showcase
            </button>
            <button
              onClick={() => scrollToSection('arena')}
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Project Arena</span>
            </button>
            <button
              onClick={() => scrollToSection('team')}
              className="hover:text-white transition-colors"
            >
              About
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-semibold text-white truncate max-w-[150px]">{userProfile?.fullName || 'Colleague'}</p>
                  <p className="text-[10px] text-slate-400 font-mono uppercase">{userProfile?.role}</p>
                </div>
                <button
                  onClick={() => handleEnterApp()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FF3D88] hover:bg-[#E02D73] text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handleSignInClick}
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleEnterApp('/explore')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FF3D88] hover:bg-[#E02D73] text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0F1B3D] border-b border-white/10 px-6 py-6 space-y-4">
            <button
              onClick={() => scrollToSection('hero')}
              className="block w-full text-left text-sm font-medium text-slate-200 py-1.5"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left text-sm font-medium text-slate-200 py-1.5"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('showcase')}
              className="block w-full text-left text-sm font-medium text-slate-200 py-1.5"
            >
              Showcase
            </button>
            <button
              onClick={() => scrollToSection('arena')}
              className="block w-full text-left text-sm font-medium text-slate-200 py-1.5 flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Project Arena</span>
            </button>
            <button
              onClick={() => scrollToSection('team')}
              className="block w-full text-left text-sm font-medium text-slate-200 py-1.5"
            >
              About
            </button>

            <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
              {isAuthenticated ? (
                <button
                  onClick={() => handleEnterApp()}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#FF3D88] hover:bg-[#E02D73] text-white flex items-center justify-center gap-2"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSignInClick}
                    className="w-full py-2.5 rounded-xl border border-white/15 text-xs font-semibold text-white bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleEnterApp('/explore')}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#FF3D88] hover:bg-[#E02D73] text-white flex items-center justify-center gap-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* SECTION 02 — HERO SECTION                                 */}
      {/* ========================================================= */}
      <section id="hero" className="pt-32 pb-20 sm:pt-40 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Introductory Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-[#FF3D88]" />
              <span className="font-decorative tracking-wider text-xs">YOUR TEAM. YOUR IDEAS. ONE ARENA.</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight leading-[1.12]">
              Where Your Team's Ideas <span className="text-[#FF3D88]">Become Reality.</span>
            </h1>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg text-slate-300 font-sans max-w-2xl leading-relaxed">
              One place to showcase innovation, explore incredible projects, celebrate creativity and discover the best work created by your team.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={() => handleEnterApp()}
                className="px-6 py-3.5 rounded-xl bg-[#FF3D88] hover:bg-[#E02D73] text-white font-sans font-semibold text-sm transition-all flex items-center justify-center gap-2 group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => handleEnterApp('/arena')}
                className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-sans font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Explore the Arena</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-3 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Mock Data</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verified Peer Votes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Role Protected</span>
              </div>
            </div>
          </div>

          {/* Right Column: Top 3 User Leaderboard Podium */}
          <div className="lg:col-span-6 w-full">
            <LeaderboardPodium
              users={topUsers}
              isLoading={isLoadingData}
              onUserClick={(user) => {
                handleEnterApp(`/directory?search=${encodeURIComponent(user.displayName)}`);
              }}
              onEmptyAction={() => handleEnterApp('/submit')}
            />
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* INFINITE TECHNOLOGY LOGO MARQUEE                         */}
      {/* ========================================================= */}
      <TechMarquee />

      {/* ========================================================= */}
      {/* SECTION 03 — PLATFORM INTRODUCTION                        */}
      {/* ========================================================= */}
      <section id="about" className="py-24 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mb-14 space-y-3">
          <span className="text-xs font-decorative uppercase tracking-wider text-[#FF3D88]">
            PLATFORM PILLARS
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            More Than a Project Gallery.
          </h2>
          <p className="text-base text-slate-300 font-sans leading-relaxed">
            A shared space for teams to present their work, discover new ideas and learn from one another.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Showcase */}
          <div className="p-7 rounded-2xl bg-[#0A1229] border border-white/10 hover:border-[#FF3D88]/30 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#FF3D88]/10 text-[#FF3D88] flex items-center justify-center">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                01 / Presentation
              </span>
              <h3 className="font-heading font-bold text-lg text-white">
                Give every project a place to be seen.
              </h3>
              <p className="text-sm text-slate-300 font-sans leading-relaxed">
                Provide internal tools, client platforms, libraries, and design systems with dedicated architectural context, technology stacks, and live demo access.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 text-xs font-mono text-slate-400">
              Dedicated Profiles & Live Links
            </div>
          </div>

          {/* Pillar 2: Discover */}
          <div className="p-7 rounded-2xl bg-[#0A1229] border border-white/10 hover:border-[#FF3D88]/30 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                02 / Discovery
              </span>
              <h3 className="font-heading font-bold text-lg text-white">
                Explore the work, technologies and ideas created across your team.
              </h3>
              <p className="text-sm text-slate-300 font-sans leading-relaxed">
                Break departmental silos. Search by framework, language, or department to discover subject-matter experts and reuse proven solutions across squads.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 text-xs font-mono text-slate-400">
              Categorized Stacks & Tech Indexing
            </div>
          </div>

          {/* Pillar 3: Compete */}
          <div className="p-7 rounded-2xl bg-[#0A1229] border border-white/10 hover:border-[#FF3D88]/30 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                03 / Recognition
              </span>
              <h3 className="font-heading font-bold text-lg text-white">
                Receive peer feedback and earn recognition in the Project Arena.
              </h3>
              <p className="text-sm text-slate-300 font-sans leading-relaxed">
                Authentic peer evaluations and verified community likes. Discover top initiatives on velocity leaderboards that reward genuine innovation and team impact.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 text-xs font-mono text-slate-400">
              Gated Peer Feedback & Leaderboards
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 04 — FEATURED PROJECTS                            */}
      {/* ========================================================= */}
      <section id="showcase" className="py-24 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <span className="text-xs font-decorative uppercase tracking-wider text-[#FF3D88]">
              SELECTED WORK
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
              Ideas Worth Showing.
            </h2>
            <p className="text-sm text-slate-400 font-sans max-w-xl">
              Inspect actual approved company initiatives, verified by administrators and celebrated by peers.
            </p>
          </div>

          <button
            onClick={() => handleEnterApp('/explore')}
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-sans font-semibold text-xs transition-colors flex items-center gap-2"
          >
            <span>View All Projects</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#FF3D88]" />
          </button>
        </div>

        {/* Real Projects Showcase */}
        {showcaseProjects.length > 0 ? (
          <div className="space-y-6">
            {/* Primary Asymmetric Lead Project */}
            {showcaseLead && (
              <div
                onClick={() => handleEnterApp(`/projects/${showcaseLead.id}`)}
                className="bg-[#0A1229] border border-white/10 hover:border-[#FF3D88]/40 rounded-3xl p-6 sm:p-8 transition-all cursor-pointer group grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-7 relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
                  <img
                    src={showcaseLead.coverImageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80'}
                    alt={showcaseLead.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF3D88] text-white">
                      {showcaseLead.category}
                    </span>
                    {showcaseLead.isFeatured && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-amber-950">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-heading font-bold text-2xl text-white group-hover:text-[#FF3D88] transition-colors">
                      {showcaseLead.title}
                    </h3>
                    <p className="text-sm text-slate-300 font-sans leading-relaxed line-clamp-3">
                      {showcaseLead.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 py-2">
                    {(showcaseLead.technologies || []).slice(0, 5).map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white block font-sans">{showcaseLead.creatorName}</span>
                      <span className="text-[10px] text-slate-400 font-sans">{showcaseLead.creatorDepartment}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 group-hover:text-[#FF3D88] font-sans font-semibold">
                      <span>View Project</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Complementary Project Grid */}
            {showcaseGrid.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {showcaseGrid.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleEnterApp(`/projects/${p.id}`)}
                    className="bg-[#0A1229] border border-white/10 hover:border-[#FF3D88]/40 rounded-2xl overflow-hidden transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 bg-slate-900 overflow-hidden border-b border-white/10">
                        <img
                          src={p.coverImageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80'}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#FF3D88] text-white">
                            {p.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 space-y-2">
                        <h4 className="font-heading font-bold text-base text-white group-hover:text-[#FF3D88] transition-colors truncate">
                          {p.title}
                        </h4>
                        <p className="text-xs text-slate-300 font-sans line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {(p.technologies || []).slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-white/5 mt-4 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-sans text-slate-400 truncate">
                        By {p.creatorName}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-rose-400 font-mono text-[11px]">
                          <Heart className="w-3 h-3 fill-current" />
                          {p.likeCount || 0}
                        </span>
                        <span className="text-emerald-400 font-mono text-[11px] font-bold">
                          {p.goodPercentage || 100}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-[#0A1229] border border-white/10 text-center space-y-4">
            <Compass className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-heading font-bold text-lg text-white">Showcase Pipeline Ready</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto font-sans">
              As team members submit projects and administrators approve them, verified initiatives will populate this showcase automatically.
            </p>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* SECTION 05 — PROJECT ARENA                                */}
      {/* ========================================================= */}
      <section id="arena" className="py-24 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="max-w-3xl mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs">
            <Trophy className="w-3.5 h-3.5" />
            <span className="font-decorative tracking-wider text-xs">THE ARENA</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Let the Best Projects Rise.
          </h2>
          <p className="text-base text-slate-300 font-sans leading-relaxed">
            Real peer evaluation, velocity rankings, and recognition without bias. Discover what happens when your entire team votes, rates, and awards internal initiatives.
          </p>
        </div>

        {/* Arena Leaderboard — Clean Ranked List */}
        <div className="max-w-4xl bg-[#0A1229] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-white/10 gap-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-decorative uppercase tracking-wider text-slate-300">
                ARENA LEADERBOARD
              </span>
            </div>
            <span className="text-xs font-sans text-slate-400">
              Sorted by Peer Evaluation &amp; Engagement
            </span>
          </div>

          {leaderboardList.length > 0 ? (
            <div className="divide-y divide-white/5">
              {leaderboardList.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handleEnterApp(`/projects/${item.id}`)}
                  className="py-3.5 px-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.03] rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      index === 0
                        ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                        : index === 1
                        ? 'bg-slate-300/20 text-slate-300 border border-slate-300/30'
                        : index === 2
                        ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30'
                        : 'bg-white/5 text-slate-400 border border-white/10'
                    }`}>
                      #{index + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-semibold text-sm sm:text-base text-white group-hover:text-[#FF3D88] transition-colors truncate">
                          {item.title}
                        </h4>
                        {index === 0 && (
                          <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-decorative uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/20">
                            1st Place
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-sans truncate mt-0.5">
                        {item.creatorName} &bull; <span className="font-mono text-slate-300">{item.category}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 shrink-0 text-xs">
                    <span className="flex items-center gap-1.5 text-rose-400 font-mono text-xs">
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      {item.likeCount || 0}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs font-bold">
                      {item.goodPercentage || 100}%
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#FF3D88] group-hover:translate-x-0.5 transition-all hidden sm:block" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 font-sans">
              Leaderboard will populate as peers cast live evaluations.
            </div>
          )}
        </div>

        {/* Arena CTA */}
        <div>
          <button
            onClick={() => handleEnterApp('/arena')}
            className="px-6 py-3 rounded-xl bg-[#FF3D88] hover:bg-[#E02D73] text-white font-sans font-semibold text-sm transition-all flex items-center gap-2"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Enter Project Arena</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 06 — HOW IT WORKS                                 */}
      {/* ========================================================= */}
      <section id="how-it-works" className="py-24 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="max-w-3xl mb-14 space-y-3">
          <span className="text-xs font-decorative uppercase tracking-wider text-[#FF3D88]">
            FOUR-STAGE LIFECYCLE
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            From Idea to Recognition.
          </h2>
          <p className="text-base text-slate-300 font-sans leading-relaxed">
            A transparent, quality-first lifecycle designed to turn internal innovation into company-wide impact.
          </p>
        </div>

        {/* 4 Steps: Horizontal Process on Desktop, Vertical on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 01 */}
          <div className="p-6 rounded-2xl bg-[#0A1229] border border-white/10 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="font-mono text-2xl font-bold text-[#FF3D88] block">01</span>
              <h3 className="font-heading font-bold text-base text-white">
                Submit
              </h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Employees submit their projects with descriptions, technologies, architecture context, and repository or demo links.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-slate-400">
              Structured metadata
            </div>
          </div>

          {/* Step 02 */}
          <div className="p-6 rounded-2xl bg-[#0A1229] border border-white/10 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="font-mono text-2xl font-bold text-[#FF3D88] block">02</span>
              <h3 className="font-heading font-bold text-base text-white">
                Review
              </h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Administrators review submissions before publication to ensure security, quality standards, and working external links.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-slate-400">
              Admin quality gate
            </div>
          </div>

          {/* Step 03 */}
          <div className="p-6 rounded-2xl bg-[#0A1229] border border-white/10 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="font-mono text-2xl font-bold text-[#FF3D88] block">03</span>
              <h3 className="font-heading font-bold text-base text-white">
                Showcase
              </h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Approved initiatives become visible across the company showcase, searchable by tech stack, category, and author.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-slate-400">
              Public company board
            </div>
          </div>

          {/* Step 04 */}
          <div className="p-6 rounded-2xl bg-[#0A1229] border border-white/10 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="font-mono text-2xl font-bold text-[#FF3D88] block">04</span>
              <h3 className="font-heading font-bold text-base text-white">
                Compete
              </h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Team members explore, like, and cast authenticated evaluations in the Arena leaderboards to celebrate outstanding work.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-slate-400">
              Gated peer feedback
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 07 — TEAM AND COMMUNITY                           */}
      {/* ========================================================= */}
      <section id="team" className="py-24 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <span className="text-xs font-decorative uppercase tracking-wider text-[#FF3D88]">
              PROJECT SPOTLIGHT
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
              The People Behind the Projects.
            </h2>
            <p className="text-sm text-slate-400 font-sans max-w-xl">
              Meet the engineers, designers, and project leads building internal tools and breakthrough solutions.
            </p>
          </div>

          <button
            onClick={() => handleEnterApp('/directory')}
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-sans font-semibold text-xs transition-colors flex items-center gap-2"
          >
            <span>Employee Directory</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#FF3D88]" />
          </button>
        </div>

        {/* Real Active Employees Grid */}
        {teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => handleEnterApp('/directory')}
                className="bg-[#0A1229] border border-white/10 hover:border-[#FF3D88]/30 rounded-2xl p-5 transition-all cursor-pointer group flex items-center gap-4"
              >
                <img
                  src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                  alt={member.fullName}
                  className="w-12 h-12 rounded-xl object-cover border border-white/10 group-hover:border-[#FF3D88]/40 transition-colors shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-sans font-semibold text-sm text-white group-hover:text-[#FF3D88] transition-colors truncate">
                    {member.fullName}
                  </h4>
                  <p className="text-xs text-slate-400 font-sans truncate">
                    {member.designation || 'Colleague'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                    {member.department || 'Team Member'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#0A1229] border border-white/10 text-center text-xs text-slate-400 font-sans">
            Company team network loaded. Sign in to browse the complete employee directory.
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* SECTION 08 — FINAL CALL TO ACTION                         */}
      {/* ========================================================= */}
      <section id="cta" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="rounded-3xl bg-[#0A1229] border border-white/15 p-10 sm:p-14 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
              Your Next Great Project Starts Here.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
              Share what you build. Discover what others create. Give great ideas the recognition they deserve.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => handleEnterApp()}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#FF3D88] hover:bg-[#E02D73] text-white font-sans font-semibold text-sm transition-all flex items-center justify-center gap-2 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => handleEnterApp()}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-white font-sans font-semibold text-sm transition-all"
              >
                Open Dashboard
              </button>
            ) : (
              <button
                onClick={handleSignInClick}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-white font-sans font-semibold text-sm transition-all"
              >
                Sign In With Work Account
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 09 — FOOTER                                       */}
      {/* ========================================================= */}
      <footer className="border-t border-white/10 bg-[#060B1A] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/android-chrome-192x192.png"
              alt="ProjectHub Logo"
              className="w-8 h-8 rounded-lg object-contain border border-[#FF3D88]/30"
            />
            <div>
              <span className="font-display font-bold text-base text-white">
                Project<span className="text-[#FF3D88]">Hub</span>
              </span>
              <p className="text-[10px] text-slate-500 font-decorative tracking-wider uppercase">Team Project Arena</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <button onClick={() => scrollToSection('hero')} className="hover:text-white transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">
              How It Works
            </button>
            <button onClick={() => scrollToSection('showcase')} className="hover:text-white transition-colors">
              Showcase
            </button>
            <button onClick={() => scrollToSection('arena')} className="hover:text-white transition-colors">
              Project Arena
            </button>
            <button onClick={() => scrollToSection('team')} className="hover:text-white transition-colors">
              About
            </button>
            <button onClick={() => handleEnterApp('/directory')} className="hover:text-white transition-colors">
              Employee Directory
            </button>
          </div>

          {/* Copyright */}
          <p className="text-xs text-slate-500 font-mono text-center md:text-right">
            &copy; 2026 ProjectHub – Team Project Arena. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
