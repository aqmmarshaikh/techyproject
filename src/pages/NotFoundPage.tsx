import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Compass, Home, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full text-center space-y-8">
        {/* Glow badge & 404 status indicator */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute -inset-4 bg-gradient-to-r from-[#FF3D88]/20 to-[#6366F1]/20 rounded-full blur-xl pointer-events-none" />
          <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700/60 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#FF3D88] animate-pulse" />
            <span className="text-xs font-mono font-semibold tracking-wider text-white uppercase">
              Error 404 • Route Not Found
            </span>
          </div>
        </div>

        {/* Large stylized 404 typography */}
        <div className="space-y-3">
          <h1 className="text-7xl sm:text-8xl font-black font-heading tracking-tight text-[#0F1B3D]">
            4<span className="text-[#FF3D88]">0</span>4
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#0F1B3D]">
            Lost in the Project Arena?
          </h2>
          <p className="text-slate-600 font-sans text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            The page you are looking for doesn't exist, may have been moved, or the link may be broken.
          </p>
        </div>

        {/* Requested route badge */}
        {location.pathname && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 max-w-md truncate">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Requested: {location.pathname}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/explore')}
            leftIcon={<Compass className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Explore Projects
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/')}
            leftIcon={<Home className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Platform Home
          </Button>

          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/explore');
              }
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors w-full sm:w-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Helpful hints */}
        <div className="pt-8 border-t border-slate-100 flex items-center justify-center gap-6 text-xs text-slate-400 font-sans">
          <button
            type="button"
            onClick={() => navigate('/arena')}
            className="hover:text-[#FF3D88] transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-[#FF3D88]" />
            <span>Project Arena</span>
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => navigate('/directory')}
            className="hover:text-[#FF3D88] transition-colors"
          >
            Employee Directory
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="hover:text-[#FF3D88] transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

