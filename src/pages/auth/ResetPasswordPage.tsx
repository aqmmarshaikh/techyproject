import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NavLink } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { passwordResetSchema, PasswordResetFormData } from '../../schemas/authSchemas';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';

export const ResetPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
  });

  const onSubmit = async (data: PasswordResetFormData) => {
    setErrorMessage(null);
    try {
      await resetPassword(data.email);
      setIsSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send reset link';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <NavLink
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0F1B3D] transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
        </NavLink>
        <h2 className="text-xl font-heading font-bold text-[#0F1B3D]">
          Reset your password
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-sans">
          Enter your registered company email address and we'll send you a password reset link.
        </p>
      </div>

      {isSent ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Reset Link Dispatched</span>
          </div>
          <p>
            If an active employee account matches that address, instructions to reset your password have been sent. Check your inbox and spam folders.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

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

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isSubmitting}>
            Send Reset Instructions
          </Button>
        </form>
      )}
    </div>
  );
};

