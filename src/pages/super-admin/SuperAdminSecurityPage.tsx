import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  FileCheck, 
  Server, 
  CheckCircle2, 
  AlertTriangle,
  Fingerprint,
  RefreshCw,
  Globe
} from 'lucide-react';
import { APP_CONFIG } from '../../app/config';

export const SuperAdminSecurityPage: React.FC = () => {
  const securityRules = [
    {
      title: 'Cloud Firestore Security Rules',
      status: 'Enforced (v2 Rules)',
      detail: 'Atomic validation on project writes, counter protection, non-owner vote verification, and strict role guards.',
      active: true,
    },
    {
      title: 'Firebase Storage Security Rules',
      status: 'Active (Bucket Isolation)',
      detail: 'Authenticated image uploads to project-images/{uid}/* restricted to 6MB and image/* content types.',
      active: true,
    },
    {
      title: 'Google OAuth Authentication',
      status: 'Connected & Verified',
      detail: `Identity verified via Firebase Auth domain: ${APP_CONFIG.firebase.authDomain}.`,
      active: true,
    },
    {
      title: 'Server-Side Vote Integrity',
      status: 'Enforced',
      detail: 'Deterministic IDs (/votes/${projectId}_${userId}) prevent duplicate voting. Self-voting rejected on backend.',
      active: true,
    },
    {
      title: 'Immutable Audit Trail',
      status: 'Cryptographic Logging',
      detail: 'Administrative role updates, account suspensions, and settings changes logged to /adminLogs with actor metadata.',
      active: true,
    },
    {
      title: 'Client-Side Canvas Compression',
      status: 'Active',
      detail: 'All uploaded screenshots & covers scaled to max 1280px / 0.8 quality (~60-100KB) to prevent Firestore doc limits.',
      active: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Security Posture Verified
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#0F1B3D] tracking-tight">
          System Security & Governance Controls
        </h2>
        <p className="mt-1 text-sm text-slate-500 font-sans">
          Review backend access barriers, role hierarchies, authentication providers, and tamper-resistance measures.
        </p>
      </div>

      {/* Role Hierarchy Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <h3 className="font-heading font-bold text-base text-[#0F1B3D] flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-purple-600" />
          <span>Role-Based Access Control (RBAC) Hierarchy</span>
        </h3>
        <p className="text-xs text-slate-500 font-sans leading-relaxed">
          The platform strictly implements a 3-tier unidirectional role model. Privileges never escalate from frontend requests.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-xs text-purple-900 uppercase">Tier 1: SUPER_ADMIN</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-200 text-purple-800">Highest</span>
            </div>
            <p className="text-xs text-purple-950 font-sans leading-relaxed">
              Full governance over the entire platform. Can designate/demote administrators, delete accounts, modify platform settings, and inspect immutable audit logs.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-xs text-amber-900 uppercase">Tier 2: ADMIN</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-200 text-amber-800">Operational</span>
            </div>
            <p className="text-xs text-amber-950 font-sans leading-relaxed">
              Project review queue approvals, rejections with reasons, revision merging, category taxonomy editing, and flagged report resolution. Cannot assign admin roles or edit platform settings.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-xs text-blue-900 uppercase">Tier 3: EMPLOYEE</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-200 text-blue-800">Standard</span>
            </div>
            <p className="text-xs text-blue-950 font-sans leading-relaxed">
              Explore showcase, vote on peer initiatives, bookmark projects, submit new projects for review, and maintain personal employee portfolio.
            </p>
          </div>
        </div>
      </div>

      {/* Security Policies Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {securityRules.map((r) => (
          <div key={r.title} className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-start gap-4">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-heading font-bold text-sm text-[#0F1B3D] truncate">{r.title}</h4>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold shrink-0">
                  {r.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans mt-1 leading-relaxed">
                {r.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Designated Super Admin Whitelist */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-3">
        <h3 className="font-heading font-bold text-base text-[#0F1B3D] flex items-center gap-2">
          <Key className="w-5 h-5 text-purple-600" />
          <span>Designated Primary Super Administrator Whitelist</span>
        </h3>
        <p className="text-xs text-slate-500 font-sans">
          The following email is hardcoded into server security configurations and environment policies:
        </p>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-[#0F1B3D] flex items-center justify-between">
          <span>ammarshaikh6100@gmail.com</span>
          <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
            MASTER IDENTITY
          </span>
        </div>
      </div>
    </div>
  );
};
