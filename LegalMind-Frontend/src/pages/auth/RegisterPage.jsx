import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter';
import { useAuth } from '../../context/AuthContext';

const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Name must be at least 2 characters'),
    email: z
      .string()
      .min(1, 'Email address is required')
      .email('Please enter a valid work email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'You must accept the Terms of Service & Privacy Policy',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
    },
  });

  const passwordValue = watch('password', '');

  const onSubmit = async (data) => {
    setRegisterError('');
    setIsLoading(true);

    try {
      await registerAuth({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      setRegisterSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      setRegisterError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-elevated p-6 sm:p-8 space-y-6 bg-[#0b1021]/90 border-slate-800 shadow-2xl">
      {/* Header */}
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
          Create Counsel Account
        </h2>
        <p className="text-xs text-slate-400">
          Set up institutional access for LegalMind AI document intelligence.
        </p>
      </div>

      {registerError && (
        <div className="alert alert-error animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="text-xs">{registerError}</span>
        </div>
      )}

      {registerSuccess && (
        <div className="alert alert-success animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span className="text-xs font-medium">Account created! Redirecting to Home...</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Name Field */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-xs font-medium text-slate-300">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              id="name"
              type="text"
              placeholder="Jane Doe"
              className={`input-base pl-9 ${errors.name ? 'input-error' : ''}`}
              {...register('name')}
              disabled={isLoading || registerSuccess}
            />
          </div>
          {errors.name && (
            <p className="text-[11px] text-rose-400 font-mono mt-1">{errors.name.message}</p>
          )}
        </div>

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
              placeholder="jane.doe@company.com"
              className={`input-base pl-9 ${errors.email ? 'input-error' : ''}`}
              {...register('email')}
              disabled={isLoading || registerSuccess}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-400 font-mono mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-xs font-medium text-slate-300">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              className={`input-base pl-9 pr-10 ${errors.password ? 'input-error' : ''}`}
              {...register('password')}
              disabled={isLoading || registerSuccess}
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
          {/* Password Strength Meter */}
          <PasswordStrengthMeter password={passwordValue} />
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-300">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              className={`input-base pl-9 pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
              {...register('confirmPassword')}
              disabled={isLoading || registerSuccess}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[11px] text-rose-400 font-mono mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms Acceptance Checkbox */}
        <div className="space-y-1 pt-1">
          <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400 focus:ring-offset-slate-950 shrink-0"
              {...register('termsAccepted')}
              disabled={isLoading || registerSuccess}
            />
            <span className="leading-snug">
              I agree to the <span className="text-cyan-400 font-medium">Terms of Service</span> and{' '}
              <span className="text-cyan-400 font-medium">Privacy Policy</span>.
            </span>
          </label>
          {errors.termsAccepted && (
            <p className="text-[11px] text-rose-400 font-mono">{errors.termsAccepted.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || registerSuccess}
          className="btn btn-primary btn-md w-full justify-center shadow-lg shadow-cyan-500/20 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : registerSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Redirecting...</span>
            </>
          ) : (
            <>
              <span>Create Enterprise Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer Link */}
      <div className="text-center pt-2 border-t border-slate-800/80">
        <p className="text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
