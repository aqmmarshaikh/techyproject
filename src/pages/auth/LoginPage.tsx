import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NavLink, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { loginSchema, LoginFormData } from '../../schemas/authSchemas';
import { useAuth, DEMO_PROFILES } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, switchDemoRole } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    try {
      await login(data.email, data.password);
      toastSuccess('Authenticated', 'Welcome back to Project Hub.');
      navigate('/explore');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials';
      setAuthError(msg);
      toastError('Login Failed', msg);
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    await switchDemoRole(role);
    toastSuccess(
      'Demo Profile Loaded',
      `Signed in as ${role === 'SUPER_ADMIN' ? 'Super Admin (Elena)' : role === 'ADMIN' ? 'Admin (Marcus)' : 'Employee (Devon)'}`
    );
    navigate('/explore');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-heading font-bold text-[#0F1B3D]">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-sans">
          Enter your company email and password to access the showcase.
        </p>
      </div>

      {authError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{authError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider mb-1">
            Company Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              {...register('email')}
              placeholder="name@company.com"
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-[#0F1B3D] uppercase tracking-wider">
              Password
            </label>
            <NavLink
              to="/reset-password"
              className="text-xs font-medium text-[#FF3D88] hover:underline"
            >
              Forgot password?
            </NavLink>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      {/* Quick Demo Access Bar for Test Verification */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#FF3D88]" />
          <span>Frictionless Persona Sandbox:</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemo('EMPLOYEE')}
            className="px-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F1B3D] text-[11px] font-semibold transition-colors"
          >
            Employee
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('ADMIN')}
            className="px-2 py-2 rounded-xl bg-[#0F1B3D]/10 hover:bg-[#0F1B3D]/20 text-[#0F1B3D] text-[11px] font-semibold transition-colors"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('SUPER_ADMIN')}
            className="px-2 py-2 rounded-xl bg-[#FF3D88]/15 hover:bg-[#FF3D88]/25 text-[#FF3D88] text-[11px] font-semibold transition-colors"
          >
            Super Admin
          </button>
        </div>
      </div>
    </div>
  );
};

