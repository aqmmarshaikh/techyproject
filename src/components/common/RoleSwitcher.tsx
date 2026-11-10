import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldAlert, 
  CheckSquare, 
  Users, 
  ChevronDown, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';
import { useRolePreview } from '../../contexts/RolePreviewContext';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';

export const RoleSwitcher: React.FC = () => {
  const { userProfile } = useAuth();
  const { isRealSuperAdmin, effectiveRole, switchPreviewRole, isPreviewActive } = useRolePreview();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Strict check: Only real authenticated Super Admins can see or interact with the switcher
  if (!isRealSuperAdmin) {
    return null;
  }

  const roleOptions: {
    role: UserRole;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    badgeText: string;
    badgeClass: string;
  }[] = [
    {
      role: 'SUPER_ADMIN',
      title: 'Super Admin',
      subtitle: 'Full System Governance, Admins & Settings',
      icon: <ShieldAlert className="w-4 h-4 text-purple-400" />,
      badgeText: 'Primary',
      badgeClass: 'bg-purple-100 text-purple-700 border-purple-200',
    },
    {
      role: 'ADMIN',
      title: 'Admin',
      subtitle: 'Review Queue, Categories & Moderation',
      icon: <CheckSquare className="w-4 h-4 text-amber-500" />,
      badgeText: 'Preview',
      badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    {
      role: 'EMPLOYEE',
      title: 'Employee',
      subtitle: 'Explore Projects, Arena, Submit & Portfolio',
      icon: <Users className="w-4 h-4 text-blue-500" />,
      badgeText: 'Preview',
      badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    },
  ];

  const currentOption = roleOptions.find((o) => o.role === effectiveRole) || roleOptions[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Switcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 shadow-sm ${
          effectiveRole === 'SUPER_ADMIN'
            ? 'bg-purple-950/60 border-purple-500/40 text-purple-200 hover:bg-purple-900/60'
            : effectiveRole === 'ADMIN'
            ? 'bg-amber-950/60 border-amber-500/40 text-amber-200 hover:bg-amber-900/60'
            : 'bg-blue-950/60 border-blue-500/40 text-blue-200 hover:bg-blue-900/60'
        }`}
        title="Switch role preview dashboard"
      >
        <span className="flex items-center gap-1.5">
          {currentOption.icon}
          <span className="font-heading font-medium tracking-wide">
            {effectiveRole === 'SUPER_ADMIN' ? 'Super Admin' : `Preview: ${currentOption.title}`}
          </span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white shadow-2xl border border-slate-200/90 py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 pb-2.5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Current Role Preview
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Safe Preview
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 font-sans">
              Switch dashboards to test different role interfaces.
            </p>
          </div>

          <div className="p-2 space-y-1">
            {roleOptions.map((opt) => {
              const isSelected = effectiveRole === opt.role;
              return (
                <button
                  key={opt.role}
                  type="button"
                  onClick={() => {
                    switchPreviewRole(opt.role);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors ${
                    isSelected
                      ? 'bg-slate-100/90 ring-1 ring-slate-300'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    {opt.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-heading font-bold text-[#0F1B3D]">
                        {opt.title}
                      </span>
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#FF3D88]">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${opt.badgeClass}`}>
                          {opt.badgeText}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5 leading-snug">
                      {opt.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Security & Authentication Reassurance Footer */}
          <div className="mx-2 mt-2 pt-2 border-t border-slate-100 px-2 py-1.5 bg-slate-50 rounded-xl text-[11px] text-slate-500 font-sans flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-slate-600 font-medium leading-tight">
                Logged in as: <span className="font-mono text-[#0F1B3D]">{userProfile?.email}</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Real role: <strong className="text-purple-600">SUPER_ADMIN</strong>. Backend permissions remain server-authoritative.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

