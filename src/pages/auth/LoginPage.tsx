import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { loginSchema, LoginFormData } from '../../schemas/authSchemas';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

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

  const handlePostLoginRedirect = (role: string) => {
    try {
      sessionStorage.setItem('projecthub_entry_completed', 'true');
    } catch {}

    const intended = 
      (location.state as any)?.from?.pathname || 
      sessionStorage.getItem('projecthub_intended_destination');

    if (intended && intended !== '/' && intended !== '/welcome') {
      sessionStorage.removeItem('projecthub_intended_destination');
      navigate(intended);
      return;
    }

    if (role === 'SUPER_ADMIN') {
      navigate('/super-admin');
    } else if (role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    try {
      const profile = await login(data.email, data.password);
      toastSuccess('Authenticated', 'Welcome back to Project Hub.');
      handlePostLoginRedirect(profile.role);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials';
      setAuthError(msg);
      toastError('Login Failed', msg);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsGoogleSubmitting(true);
    try {
      const profile = await loginWithGoogle();
      toastSuccess('Authenticated', 'Signed in successfully with your Google account.');
      handlePostLoginRedirect(profile.role);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed. Please try again.';
      setAuthError(msg);
      toastError('Login Failed', msg);
    } finally {
      setIsGoogleSubmitting(false);
    }
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

      {/* Google Sign-In Provider Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleSubmitting || isSubmitting}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700 font-sans font-medium text-sm rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{isGoogleSubmitting ? 'Connecting with Google...' : 'Continue with Google'}</span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-3">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-3 text-[11px] font-mono uppercase tracking-wider text-slate-400">
          or continue with email
        </span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

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
    </div>
  );
};

