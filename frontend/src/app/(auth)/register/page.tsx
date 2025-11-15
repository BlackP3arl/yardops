'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/services/auth.service';
import { UserRole } from '../../../../../common/types/user.types';
import Link from 'next/link';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['ADMIN', 'READER']),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'READER',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register({
        ...data,
        role: data.role as UserRole,
      });
      // Redirect based on user role
      if (response.user.role === 'ADMIN') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/reader');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-h1 text-neutral-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-body text-neutral-500">
            Or{' '}
            <Link
              href="/login"
              className="font-medium text-primary-500 hover:text-primary-600 transition-colors"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-xl bg-tags-outOfStockBg p-4 border border-base-borderSubtle">
              <div className="text-body text-status-danger">{error}</div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-label font-medium text-neutral-700 mb-1">
                First Name
              </label>
              <input
                {...register('firstName')}
                type="text"
                className="w-full h-10 px-4 bg-base-surfaceMuted rounded-full text-body text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-200 border border-base-borderSubtle"
              />
              {errors.firstName && (
                <p className="mt-1 text-caption text-status-danger">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-label font-medium text-neutral-700 mb-1">
                Last Name
              </label>
              <input
                {...register('lastName')}
                type="text"
                className="w-full h-10 px-4 bg-base-surfaceMuted rounded-full text-body text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-200 border border-base-borderSubtle"
              />
              {errors.lastName && (
                <p className="mt-1 text-caption text-status-danger">{errors.lastName.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-label font-medium text-neutral-700 mb-1">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="w-full h-10 px-4 bg-base-surfaceMuted rounded-full text-body text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-200 border border-base-borderSubtle"
              />
              {errors.email && (
                <p className="mt-1 text-caption text-status-danger">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-label font-medium text-neutral-700 mb-1">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="new-password"
                className="w-full h-10 px-4 bg-base-surfaceMuted rounded-full text-body text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-200 border border-base-borderSubtle"
              />
              {errors.password && (
                <p className="mt-1 text-caption text-status-danger">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="role" className="block text-label font-medium text-neutral-700 mb-1">
                Role
              </label>
              <select
                {...register('role')}
                className="w-full h-10 px-4 bg-base-surfaceMuted rounded-full text-body text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 border border-base-borderSubtle"
              >
                <option value="READER">Reader</option>
                <option value="ADMIN">Admin</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-caption text-status-danger">{errors.role.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 px-6 rounded-full text-subtitle font-medium text-white bg-primary-500 hover:bg-primary-600 shadow-soft focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

