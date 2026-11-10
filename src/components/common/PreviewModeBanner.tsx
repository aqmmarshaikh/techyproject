import React from 'react';
import { Eye, ShieldAlert, CheckSquare, Users, ArrowRight, X } from 'lucide-react';
import { useRolePreview } from '../../contexts/RolePreviewContext';
import { Button } from './Button';

export const PreviewModeBanner: React.FC = () => {
  const { isPreviewActive, previewRole, switchPreviewRole, exitPreview } = useRolePreview();

  if (!isPreviewActive) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 text-white px-4 py-2 shadow-md relative z-40 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Notice Info */}
        <div className="flex items-center gap-2 font-medium">
          <span className="p-1 rounded-md bg-black/20 shrink-0">
            <Eye className="w-4 h-4 text-white animate-pulse" />
          </span>
          <span>
            <strong className="tracking-wide uppercase font-mono font-bold text-amber-100">
              ROLE PREVIEW ACTIVE:
            </strong>{' '}
            Viewing ProjectHub as <strong className="underline decoration-white/60 underline-offset-2">{previewRole}</strong>. Real backend authorization remains securely locked to Super Admin.
          </span>
        </div>

        {/* Quick Role Switcher Buttons & Exit */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-1 bg-black/20 p-0.5 rounded-lg border border-white/20">
            <button
              onClick={() => switchPreviewRole('SUPER_ADMIN')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                previewRole === 'SUPER_ADMIN'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShieldAlert className="w-3 h-3 text-purple-600" />
              <span>Super Admin</span>
            </button>
            <button
              onClick={() => switchPreviewRole('ADMIN')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                previewRole === 'ADMIN'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <CheckSquare className="w-3 h-3 text-amber-600" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => switchPreviewRole('EMPLOYEE')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                previewRole === 'EMPLOYEE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-3 h-3 text-blue-600" />
              <span>Employee</span>
            </button>
          </div>

          <button
            onClick={exitPreview}
            className="px-3 py-1 bg-white text-[#0F1B3D] hover:bg-slate-100 rounded-lg font-heading font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            title="Exit preview and return to Super Admin dashboard"
          >
            <span>Exit Preview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

