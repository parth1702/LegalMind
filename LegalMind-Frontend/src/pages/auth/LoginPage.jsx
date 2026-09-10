import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid work email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    setAuthError('');
    setIsLoading(true);

    try {
      await login({
        email: data.email,
        password: data.password,
      });

      setAuthSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 800);
    } catch (err) {
      setAuthError(err.message || 'Invalid email or password credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-elevated p-6 sm:p-8 space-y-6 bg-[#0b1021]/90 border-slate-800 shadow-2xl">
      {/* Header */}
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
          Counsel Login
        </h2>
        <p className="text-xs text-slate-400">
          Enter your corporate credentials to access LegalMind AI.
        </p>
      </div>

      {/* Auth Messages */}
      {authError && (
        <div className="alert alert-error animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="text-xs">{authError}</span>
        </div>
      )}

      {authSuccess && (
        <div className="alert alert-success animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span className="text-xs font-medium">Authentication verified. Redirecting to Home...</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email Field */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-medium text-slate-300">
            Work Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              id="email"
              type="email"
              placeholder="counsel@company.com"
              className={`input-base pl-9 ${errors.email ? 'input-error' : ''}`}
              {...register('email')}
              disabled={isLoading || authSuccess}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-400 font-mono mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-medium text-slate-300">
              Password
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              className={`input-base pl-9 pr-10 ${errors.password ? 'input-error' : ''}`}
              {...register('password')}
              disabled={isLoading || authSuccess}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-rose-400 font-mono mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400 focus:ring-offset-slate-950"
              {...register('rememberMe')}
              disabled={isLoading || authSuccess}
            />
            <span>Remember this device</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || authSuccess}
          className="btn btn-primary btn-md w-full justify-center shadow-lg shadow-cyan-500/20 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : authSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Redirecting...</span>
            </>
          ) : (
            <>
              <span>Sign In to Console</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer Link */}
      <div className="text-center pt-3 border-t border-slate-800/80 space-y-1.5">
        <p className="text-xs text-slate-400">
          Don't have an enterprise account?{' '}
          <Link to="/auth/register" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
            Register Organization
          </Link>
        </p>
        <p className="text-[11px] font-mono text-slate-500">
          Enterprise Administrator?{' '}
          <Link to="/auth/admin-login" className="text-rose-400 hover:text-rose-300 transition-colors font-bold">
            Sign In to Admin Console →
          </Link>
        </p>
      </div>
    </div>
  );
}
