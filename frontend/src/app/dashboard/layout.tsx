'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
    retry: 1,
  });

  useEffect(() => {
    if (!isLoading && (!user || error)) {
      router.push('/login');
    }
  }, [user, isLoading, error, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout userRole={user.role as 'ADMIN' | 'READER'}>
      {children}
    </DashboardLayout>
  );
}

