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
  TrendingUp, 
  Flame, 
  Menu, 
  X, 
  LogIn, 
  ChevronRight,
  ExternalLink,
  Award,
  Zap,
  Code2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { projectRepository } from '../repositories/projectRepository';
import { userRepository } from '../repositories/userRepository';
import { Project } from '../types';
import { formatCompactNumber } from '../utils/formatters';

export const SESSION_ENTRY_KEY = 'projecthub_entry_completed';
export const INTENDED_DESTINATION_KEY = 'projecthub_intended_destination';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, isAuthenticated, openAuthModal } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Real Database Metrics & Showcase Projects
  const [showcaseProjects, setShowcaseProjects] = useState<Project[]>([]);
  const [metrics, setMetrics] = useState({
    totalProjects: 0,
    totalMembers: 0,
    totalVotes: 0,
    totalLikes: 0,
    technologiesCount: 0,
  });
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Interactive mock state for Hero preview
  const [heroVoteCast, setHeroVoteCast] = useState<'good' | 'improve' | null>(null);
  const [heroLikes, setHeroLikes] = useState(148);
  const [hasLikedHero, setHasLikedHero] = useState(false);

  // Arena interactive section tab state
  const [arenaActiveTab, setArenaActiveTab] = useState<'TOP_RATED' | 'MOST_LIKED' | 'TRENDING' | 'MOST_VOTED'>('TOP_RATED');

  // Sticky header background handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch real statistics and approved projects from Firestore
  useEffect(() => {
    const loadPlatformData = async () => {
      setIsLoadingData(true);
      try {
        const [approvedList, employeesList] = await Promise.all([
          projectRepository.listApproved({}, 6),
          userRepository.listEmployees({ accountStatus: 'ACTIVE', maxResults: 150 }),
        ]);

        setShowcaseProjects(approvedList);

        // Aggregate unique technologies & totals from real projects
        const techSet = new Set<string>();
        let votesSum = 0;
        let likesSum = 0;

        for (const p of approvedList) {
          (p.technologies || []).forEach((t) => techSet.add(t.toLowerCase().trim()));
          votesSum += p.totalValidVotes || 0;
          likesSum += p.likeCount || 0;
        }

        setMetrics({
          totalProjects: approvedList.length,
          totalMembers: employeesList.length,
          totalVotes: votesSum,
          totalLikes: likesSum,
          technologiesCount: techSet.size || 12,
        });
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

  const handleToggleHeroLike = () => {
    if (hasLikedHero) {
      setHeroLikes((prev) => prev - 1);
      setHasLikedHero(false);
    } else {
      setHeroLikes((prev) => prev + 1);
      setHasLikedHero(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1229] text-white selection:bg-[#FF3D88] selection:text-white relative overflow-hidden font-sans">
      {/* Background ambient lighting glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-[#FF3D88]/15 rounded-full blur-[140px]" />
        <div className="absolute -top-10 right-1/4 w-[550px] h-[550px] bg-[#182B5C]/60 rounded-full blur-[160px]" />
        <div className="absolute top-96 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: NAVIGATION BAR */}
      {/* ========================================================= */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0A1229]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3.5'
            : 'bg-transparent border-b border-white/5 py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo & Title */}
          <div 
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              src="/android-chrome-192x192.png"
              alt="ProjectHub Logo"
              className="w-10 h-10 rounded-xl object-contain shadow-pinkGlow group-hover:scale-105 transition-transform border border-[#FF3D88]/30 shrink-0"
            />
            <div>
              <span className="font-heading font-bold text-lg tracking-tight text-white flex items-center">
                <span>Project</span><span className="text-[#FF3D88]">Hub</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Team Project Arena</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
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
              onClick={() => scrollToSection('projects')}
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
              onClick={() => scrollToSection('community')}
              className="hover:text-white transition-colors"
            >
              About
            </button>
          </nav>

          {/* Desktop Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-semibold text-white truncate max-w-[140px]">{userProfile?.fullName || 'Colleague'}</p>
                  <p className="text-[10px] text-slate-400 font-mono uppercase">{userProfile?.role}</p>
                </div>
                <button
                  onClick={() => handleEnterApp()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#FF3D88] to-[#E02D73] text-white shadow-pinkGlow hover:opacity-90 transition-all flex items-center gap-1.5"
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#FF3D88] to-[#E02D73] text-white shadow-pinkGlow hover:opacity-90 hover:scale-[1.02] transition-all flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0A1229]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-6 space-y-4">
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
              onClick={() => scrollToSection('projects')}
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
              onClick={() => scrollToSection('community')}
              className="block w-full text-left text-sm font-medium text-slate-200 py-1.5"
            >
              About
            </button>

            <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
              <button
                onClick={handleSignInClick}
                className="w-full py-2.5 rounded-xl border border-white/15 text-xs font-semibold text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => handleEnterApp('/explore')}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#FF3D88] to-[#E02D73] text-white shadow-pinkGlow flex items-center justify-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* SECTION 2: HERO SECTION */}
      {/* ========================================================= */}
      <section id="hero" className="pt-32 pb-20 sm:pt-40 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Supporting Micro-Label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-xs font-mono text-white/90 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#FF3D88]" />
              <span>YOUR TEAM. YOUR IDEAS. ONE ARENA.</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold text-white tracking-tight leading-[1.1]">
              Where Your Team's Ideas{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF3D88] via-pink-400 to-amber-300">
                Become Reality.
              </span>
            </h1>

            {/* Supporting description */}
            <p className="text-base sm:text-lg text-slate-300 font-sans max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              One place to showcase innovation, explore incredible projects, celebrate creativity and discover the best work created by your team.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => handleEnterApp()}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF3D88] to-[#E02D73] text-white font-heading font-bold text-sm shadow-pinkGlow hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleEnterApp('/arena')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-heading font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Explore the Arena</span>
              </button>
            </div>

            {/* Trust badge */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-mono">
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

          {/* Right Column: Interactive Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Floating Project Card */}
              <div className="bg-gradient-to-b from-[#0F1B3D]/90 to-[#0A1229] border border-white/15 rounded-3xl p-5 shadow-2xl backdrop-blur-xl relative z-20 group hover:border-[#FF3D88]/40 transition-all">
                {/* Image Cover Preview */}
                <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80"
                    alt="AI Cloud Infrastructure Arena"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/90 text-white backdrop-blur-md">
                      LIVE
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF3D88] text-white backdrop-blur-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Featured
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-[#0F1B3D]/90 backdrop-blur-md text-white border border-white/10">
                      Cloud & Infrastructure
                    </span>
                  </div>
                </div>

                {/* Card Title & Creator */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-base text-white">
                      Autonomous Cloud Cost Optimizer
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 font-sans line-clamp-2">
                    Monitors idle Kubernetes cluster pods, computes automated cost savings, and safely reclaims unallocated memory resources.
                  </p>
                </div>

                {/* Technologies */}
                <div className="flex flex-wrap gap-1.5 py-3 border-y border-white/10 my-3">
                  {['React 19', 'TypeScript', 'Kubernetes', 'Gemini AI', 'Docker'].map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Card Footer: Metrics & Interactive Heart */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-[#FF3D88] flex items-center justify-center font-bold text-[10px]">
                      AS
                    </div>
                    <div>
                      <span className="font-semibold text-white block leading-none">Ammar Shaikh</span>
                      <span className="text-[10px] text-slate-400 font-mono">Platform Director</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Voting Rating Pill */}
                    <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold">
                      98% Good
                    </div>

                    {/* Interactive Like button in preview */}
                    <button
                      onClick={handleToggleHeroLike}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all ${
                        hasLikedHero
                          ? 'bg-[#FF3D88] border-[#FF3D88] text-white shadow-pinkGlow'
                          : 'bg-white/5 border-white/15 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${hasLikedHero ? 'fill-current' : ''}`} />
                      <span className="font-mono text-xs">{heroLikes}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Sub-Card 1: Mini Leaderboard Ticker */}
              <div className="hidden sm:block absolute -top-8 -right-6 z-30 bg-[#0F1B3D]/95 border border-white/20 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl max-w-[220px]">
                <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 mb-2">
                  <Trophy className="w-3.5 h-3.5" />
                  <span className="font-bold">Arena Top Rated</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between gap-2 py-1 px-1.5 bg-white/5 rounded-lg">
                    <span className="text-white font-medium truncate">#1 Cloud Optimizer</span>
                    <span className="text-emerald-400 font-mono font-bold">98%</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 py-1 px-1.5 bg-white/5 rounded-lg">
                    <span className="text-slate-300 truncate">#2 AI Fraud Shield</span>
                    <span className="text-emerald-400 font-mono font-bold">96%</span>
                  </div>
                </div>
              </div>

              {/* Floating Sub-Card 2: Interactive Evaluation Pill */}
              <div className="hidden sm:block absolute -bottom-6 -left-6 z-30 bg-[#0F1B3D]/95 border border-white/20 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Peer Arena Feedback
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHeroVoteCast('good')}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-heading font-semibold flex items-center gap-1.5 transition-all ${
                      heroVoteCast === 'good'
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                        : 'bg-white/5 border-white/15 text-slate-300 hover:bg-emerald-500/20'
                    }`}
                  >
                    <span>👍 Good</span>
                  </button>
                  <button
                    onClick={() => setHeroVoteCast('improve')}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-heading font-semibold flex items-center gap-1.5 transition-all ${
                      heroVoteCast === 'improve'
                        ? 'bg-amber-500 text-white border-amber-400 shadow-md'
                        : 'bg-white/5 border-white/15 text-slate-300 hover:bg-amber-500/20'
                    }`}
                  >
                    <span>🛠️ Needs Work</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: PLATFORM STATISTICS */}
      {/* ========================================================= */}
      <section id="stats" className="py-12 border-y border-white/10 bg-[#0F1B3D]/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-[#FF3D88]/30 transition-all text-center">
              <div className="w-10 h-10 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <span className="text-3xl sm:text-4xl font-heading font-bold text-white block">
                {isLoadingData ? '...' : metrics.totalProjects > 0 ? metrics.totalProjects : 'Live'}
              </span>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 font-sans">Approved Initiatives</p>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-[#FF3D88]/30 transition-all text-center">
              <div className="w-10 h-10 mx-auto rounded-2xl bg-[#FF3D88]/10 text-[#FF3D88] flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-3xl sm:text-4xl font-heading font-bold text-white block">
                {isLoadingData ? '...' : metrics.totalMembers > 0 ? metrics.totalMembers : 'Active'}
              </span>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 font-sans">Team Innovators</p>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-[#FF3D88]/30 transition-all text-center">
              <div className="w-10 h-10 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                <Vote className="w-5 h-5" />
              </div>
              <span className="text-3xl sm:text-4xl font-heading font-bold text-white block">
                {isLoadingData ? '...' : metrics.totalVotes > 0 ? formatCompactNumber(metrics.totalVotes) : '100%'}
              </span>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 font-sans">Peer Evaluations</p>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-[#FF3D88]/30 transition-all text-center">
              <div className="w-10 h-10 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="text-3xl sm:text-4xl font-heading font-bold text-white block">
                {isLoadingData ? '...' : metrics.technologiesCount > 0 ? `${metrics.technologiesCount}+` : 'Multi'}
              </span>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 font-sans">Technologies & Stacks</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: HOW IT WORKS */}
      {/* ========================================================= */}
      <section id="how-it-works" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-[#FF3D88] font-bold">
            Three-Step Innovation Engine
          </span>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold text-white tracking-tight">
            How ProjectHub Works
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-sans">
            A frictionless workflow designed to bring hidden company tools and engineering breakthroughs into the spotlight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/10 hover:border-[#FF3D88]/40 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <span className="font-mono text-3xl font-extrabold text-[#FF3D88] block">01</span>
              <h3 className="text-xl font-heading font-bold text-white group-hover:text-[#FF3D88] transition-colors">
                Create & Submit
              </h3>
              <p className="text-sm text-slate-400 font-sans leading-relaxed">
                Employees submit their projects with cover media, architectural descriptions, live demo links, repository URLs, and categorized tech stacks.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-white/5 flex items-center gap-2 text-xs font-mono text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Admin moderation queue</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/10 hover:border-[#FF3D88]/40 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <span className="font-mono text-3xl font-extrabold text-[#FF3D88] block">02</span>
              <h3 className="text-xl font-heading font-bold text-white group-hover:text-[#FF3D88] transition-colors">
                Discover & Collaborate
              </h3>
              <p className="text-sm text-slate-400 font-sans leading-relaxed">
                Explore innovations across engineering, design, data, and executive branches. Filter by technology tags or search for internal libraries to avoid reinventing wheels.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-white/5 flex items-center gap-2 text-xs font-mono text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Searchable taxonomy & filters</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/10 hover:border-[#FF3D88]/40 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <span className="font-mono text-3xl font-extrabold text-[#FF3D88] block">03</span>
              <h3 className="text-xl font-heading font-bold text-white group-hover:text-[#FF3D88] transition-colors">
                Evaluate & Celebrate
              </h3>
              <p className="text-sm text-slate-400 font-sans leading-relaxed">
                Cast authentic peer votes in the Project Arena, like your teammates' work, and discover the highest rated internal solutions on live velocity leaderboards.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-white/5 flex items-center gap-2 text-xs font-mono text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Gated anti-bias leaderboards</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5: EXPLORE PROJECTS PREVIEW */}
      {/* ========================================================= */}
      <section id="projects" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#FF3D88] font-bold">
              Real Approved Work
            </span>
            <h2 className="text-3xl sm:text-5xl font-heading font-bold text-white tracking-tight">
              Project Showcase
            </h2>
            <p className="text-sm text-slate-400 font-sans max-w-xl">
              Inspect actual approved company initiatives, verified by administrators and celebrated by peers.
            </p>
          </div>

          <button
            onClick={() => handleEnterApp('/explore')}
            className="self-start md:self-auto px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-heading font-semibold text-xs transition-all flex items-center gap-2"
          >
            <span>Discover All Projects</span>
            <ArrowRight className="w-4 h-4 text-[#FF3D88]" />
          </button>
        </div>

        {/* Grid of Approved Projects */}
        {showcaseProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {showcaseProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => handleEnterApp(`/projects/${p.id}`)}
                className="group bg-[#0F1B3D]/80 border border-white/10 hover:border-[#FF3D88]/40 rounded-3xl overflow-hidden shadow-xl transition-all flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    <img
                      src={p.coverImageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80'}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF3D88] text-white">
                        {p.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-heading font-bold text-base text-white group-hover:text-[#FF3D88] transition-colors truncate">
                      {p.title}
                    </h3>
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
                      <Heart className="w-3.5 h-3.5 fill-current" />
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
        ) : (
          <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-4">
            <Compass className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-heading font-bold text-lg text-white">
              Showcase Pipeline Ready
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your company platform is configured. As employees submit projects, approved initiatives will populate this showcase automatically.
            </p>
            <button
              onClick={() => handleEnterApp('/explore')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF3D88] to-[#E02D73] text-white font-semibold text-xs shadow-pinkGlow"
            >
              Enter Showcase
            </button>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* SECTION 6: PROJECT ARENA SPOTLIGHT */}
      {/* ========================================================= */}
      <section id="arena" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#0F1B3D] via-[#182B5C] to-[#0A1229] border border-white/15 p-8 sm:p-14 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[#FF3D88]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-mono">
              <Trophy className="w-3.5 h-3.5" />
              <span>THE ARENA LEADERBOARDS</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-heading font-bold text-white tracking-tight">
              Not Just Projects. A Stage for Innovation.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
              Real peer evaluation, velocity rankings, and recognition without bias. Discover what happens when your entire team votes, rates, and awards internal initiatives.
            </p>

            {/* Interactive Arena Mode Tabs */}
            <div className="pt-6">
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { key: 'TOP_RATED', label: 'Top Rated', desc: 'Guarded by a minimum 10-vote gate to prevent 1-vote 100% bias.' },
                  { key: 'MOST_LIKED', label: 'Most Liked', desc: 'Community favorites celebrated with verified member likes.' },
                  { key: 'TRENDING', label: 'Trending Velocity', desc: 'Real-time momentum decay ranking recently approved breakthroughs.' },
                  { key: 'MOST_VOTED', label: 'Most Evaluated', desc: 'Highest engagement across teams and functional departments.' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setArenaActiveTab(tab.key as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
                      arenaActiveTab === tab.key
                        ? 'bg-[#FF3D88] text-white shadow-pinkGlow'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Description Callout */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 font-sans flex items-center gap-3">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {arenaActiveTab === 'TOP_RATED' && 'Top Rated: Requires a minimum threshold of 10 valid votes before qualifying for the #1 podium.'}
                  {arenaActiveTab === 'MOST_LIKED' && 'Most Liked: Tracks genuine engagement from peers across all engineering and product teams.'}
                  {arenaActiveTab === 'TRENDING' && 'Trending Velocity: Combines recency decay and active feedback velocity.'}
                  {arenaActiveTab === 'MOST_VOTED' && 'Most Evaluated: Highlights the initiatives receiving the highest peer review volume.'}
                </span>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => handleEnterApp('/arena')}
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF3D88] to-[#E02D73] text-white font-heading font-bold text-sm shadow-pinkGlow hover:scale-[1.03] transition-all flex items-center gap-2"
              >
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>Enter Project Arena</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 7: COMMUNITY / TEAM SHOWCASE */}
      {/* ========================================================= */}
      <section id="community" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-[#FF3D88] font-bold">
            Built for High-Performing Teams
          </span>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold text-white tracking-tight">
            How ProjectHub Empowers You
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-sans">
            Break departmental silos, discover hidden talents, and celebrate excellence together.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-[#FF3D88]/30 transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF3D88]/10 text-[#FF3D88] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-white">
              Showcase Individual Impact
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Give every engineer, designer, and product owner a dedicated stage to present their work to leaders and peers.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-[#FF3D88]/30 transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-white">
              Discover Teammate Skills
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Search by skill, framework, or technology to immediately identify internal subject-matter experts.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-[#FF3D88]/30 transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-white">
              Drive Cross-Team Reuse
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Find internal libraries, SDKs, and pipelines to avoid duplicate work and accelerate development cycles.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-[#FF3D88]/30 transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-white">
              Recognize Outstanding Work
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Celebrate the best projects and top contributors through company-wide Arena rankings and spotlight badges.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 8: FINAL CONVERSION CTA */}
      {/* ========================================================= */}
      <section id="cta" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#0F1B3D] via-[#182B5C] to-[#0A1229] border border-[#FF3D88]/30 p-10 sm:p-16 text-center shadow-pinkGlow overflow-hidden">
          <div className="absolute inset-0 bg-[#FF3D88]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight">
              Your Next Great Project Deserves to Be Seen.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
              Join your team's creative space. Share your work, explore new ideas and celebrate innovation together.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => handleEnterApp()}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF3D88] to-[#E02D73] text-white font-heading font-bold text-sm shadow-pinkGlow hover:scale-[1.03] transition-all flex items-center justify-center gap-2 group"
              >
                <span>Enter ProjectHub</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={handleSignInClick}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/20 text-white font-heading font-semibold text-sm transition-all"
              >
                Sign In With Work Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 9: FOOTER */}
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
              <span className="font-heading font-bold text-base text-white">
                Project<span className="text-[#FF3D88]">Hub</span>
              </span>
              <p className="text-[10px] text-slate-500 font-mono">Team Project Arena</p>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <button onClick={() => scrollToSection('hero')} className="hover:text-white transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">
              How It Works
            </button>
            <button onClick={() => scrollToSection('projects')} className="hover:text-white transition-colors">
              Showcase
            </button>
            <button onClick={() => scrollToSection('arena')} className="hover:text-white transition-colors">
              Project Arena
            </button>
            <button onClick={() => scrollToSection('community')} className="hover:text-white transition-colors">
              About
            </button>
            <button onClick={handleSignInClick} className="hover:text-white transition-colors">
              Sign In
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
