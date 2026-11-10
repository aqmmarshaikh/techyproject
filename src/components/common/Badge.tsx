import React from 'react';
import { cn } from '../../utils/cn';
import { ProjectStatus, ApprovalStatus, UserRole, AccountStatus } from '../../types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'pink' | 'navy' | 'success' | 'warning' | 'danger' | 'neutral' | 'tech';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    pink: 'bg-[#FF3D88]/10 text-[#FF3D88] border-[#FF3D88]/20 font-medium',
    navy: 'bg-[#0F1B3D]/10 text-[#0F1B3D] border-[#0F1B3D]/20 font-medium',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
    tech: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/80 font-mono text-[11px] font-medium tracking-wide',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border transition-colors',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export const ProjectStatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  switch (status) {
    case 'LIVE':
      return (
        <Badge variant="success">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </Badge>
      );
    case 'IN_DEVELOPMENT':
      return (
        <Badge variant="pink">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF3D88]" />
          In Development
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="navy">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0F1B3D]" />
          Completed
        </Badge>
      );
    case 'ON_HOLD':
      return (
        <Badge variant="warning">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          On Hold
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

export const ApprovalStatusBadge: React.FC<{ status: ApprovalStatus }> = ({ status }) => {
  switch (status) {
    case 'APPROVED':
      return <Badge variant="success">Approved</Badge>;
    case 'PENDING_REVIEW':
      return <Badge variant="warning">Pending Review</Badge>;
    case 'CHANGES_REQUESTED':
      return <Badge variant="pink">Changes Requested</Badge>;
    case 'REJECTED':
      return <Badge variant="danger">Rejected</Badge>;
    case 'DRAFT':
      return <Badge variant="neutral">Draft</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  switch (role) {
    case 'SUPER_ADMIN':
      return <Badge variant="pink" className="font-semibold uppercase tracking-wider text-[10px]">Super Admin</Badge>;
    case 'ADMIN':
      return <Badge variant="navy" className="font-semibold uppercase tracking-wider text-[10px]">Admin</Badge>;
    case 'EMPLOYEE':
      return <Badge variant="neutral" className="text-[10px]">Employee</Badge>;
    default:
      return <Badge>{role}</Badge>;
  }
};

export const AccountStatusBadge: React.FC<{ status: AccountStatus }> = ({ status }) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="success">Active</Badge>;
    case 'SUSPENDED':
      return <Badge variant="danger">Suspended</Badge>;
    case 'INVITED':
      return <Badge variant="warning">Invited</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

