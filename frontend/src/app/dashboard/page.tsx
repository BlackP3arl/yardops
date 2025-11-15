'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';

export default function DashboardPage() {
  const router = useRouter();
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect based on user role
      if (user.role === 'ADMIN') {
        router.replace('/dashboard/admin');
      } else {
        router.replace('/dashboard/reader');
      }
    } else if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-body text-neutral-600">Loading dashboard...</p>
      </div>
    </div>
  );
}

