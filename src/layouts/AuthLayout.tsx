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
          <div className="inline-flex w-14 h-14 rounded-2xl bg-[#FF3D88] items-center justify-center font-heading font-bold text-white text-3xl shadow-pinkGlow mb-4">
            P
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
            PROJECT<span className="text-[#FF3D88]">HUB</span>
          </h1>
          <p className="mt-2 text-sm text-white/60 font-sans">
            Company Innovation Showcase & Community Platform
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

