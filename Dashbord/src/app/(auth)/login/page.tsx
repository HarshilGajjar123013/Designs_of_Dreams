'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setCredentials } = useAdminStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Authentication failed');
      }

      // Sync Zustand store with login details
      setCredentials(result.user, result.user.role);

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[24px] p-8 shadow-luxury relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[3px] bg-[#FF6A00]" />

      <h2 className="font-marcellus text-xl text-[#1A1A1A] mb-2 uppercase tracking-wider text-center font-light">
        Staff Sign In
      </h2>
      <p className="text-xs text-[#6E6E6E] text-center mb-8 font-poppins">
        Access the Designs of Dreams artisan management board.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-[16px] flex items-start gap-3 text-xs text-red-600 animate-shake">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 font-poppins">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#1A1A1A] tracking-wide block">
            Atelier Email Address
          </label>
          <div className="relative">
            <input
              {...register('email')}
              type="email"
              placeholder="e.g. name@designsofdreams.in"
              disabled={isLoading}
              className={`w-full px-4 py-3 pl-10 bg-[#FAF9F6] border rounded-[16px] text-xs transition-all outline-none text-[#1A1A1A] ${
                errors.email
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-[rgba(0,0,0,0.06)] focus:border-[#FF6A00]'
              }`}
            />
            <Mail
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6E6E]"
            />
          </div>
          {errors.email && (
            <p className="text-[10px] text-red-500 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#1A1A1A] tracking-wide block">
              Password
            </label>
          </div>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              disabled={isLoading}
              className={`w-full px-4 py-3 pl-10 pr-10 bg-[#FAF9F6] border rounded-[16px] text-xs transition-all outline-none text-[#1A1A1A] ${
                errors.password
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-[rgba(0,0,0,0.06)] focus:border-[#FF6A00]'
              }`}
            />
            <Lock
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6E6E]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E6E6E] hover:text-[#1A1A1A] p-0.5 rounded"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[10px] text-red-500 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-[#1A1A1A] hover:bg-[#FF6A00] text-white font-semibold rounded-[16px] text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-8"
        >
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Verifying Credentials...
            </>
          ) : (
            'Sign In to command center'
          )}
        </button>
      </form>
    </div>
  );
}
