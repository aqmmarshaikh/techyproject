import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // If already authenticated, redirect straight to Explore
  if (isAuthenticated) {
    return <Navigate to="/explore" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0F1B3D] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background glow using Hot Pink token */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF3D88]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-block mb-3">
            <img
              src="/android-chrome-192x192.png"
              alt="ProjectHub Logo"
              className="w-16 h-16 mx-auto rounded-2xl object-contain shadow-pinkGlow border border-[#FF3D88]/30"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight flex items-center justify-center">
            <span>Project</span><span className="text-[#FF3D88]">Hub</span>
          </h1>
          <p className="mt-1 text-xs font-decorative uppercase tracking-wider text-[#FF3D88]/90">
            Team Project Arena
          </p>
          <p className="mt-2 text-xs sm:text-sm text-white/60 font-sans">
            Showcase, Discover &amp; Celebrate Team Innovation
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

