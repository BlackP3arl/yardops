'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { notificationService } from '@/services/notification.service';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'ADMIN' | 'READER';
}

export default function DashboardLayout({
  children,
  userRole,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
  });

  const { data: notificationStats } = useQuery({
    queryKey: ['notificationStats'],
    queryFn: () => notificationService.getNotificationStats(),
    enabled: !!user,
    retry: 1,
  });

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  const navigation = [
    ...(userRole === 'ADMIN'
      ? [
          { name: 'Dashboard', href: '/dashboard/admin', icon: '📊' },
          { name: 'Users', href: '/dashboard/admin/users', icon: '👥' },
          { name: 'Locations', href: '/dashboard/admin/locations', icon: '📍' },
          { name: 'Meter Types', href: '/dashboard/admin/meter-types', icon: '⚡' },
          { name: 'Meters', href: '/dashboard/admin/meters', icon: '🔢' },
          { name: 'Readings', href: '/dashboard/admin/readings', icon: '📖' },
          { name: 'Reports', href: '/dashboard/admin/reports', icon: '📈' },
        ]
      : [
          { name: 'Dashboard', href: '/dashboard/reader', icon: '📊' },
          { name: 'My Meters', href: '/dashboard/reader/meters', icon: '🔢' },
          { name: 'My Readings', href: '/dashboard/reader/readings', icon: '📖' },
        ]),
  ];

  return (
    <div className="min-h-screen bg-base-background flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-base-surface rounded-xl shadow-soft transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:z-auto lg:rounded-none lg:shadow-none m-4 lg:m-0`}
      >
        <div className="flex flex-col h-full p-5">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-2xl">
                📊
              </div>
              <div>
                <h3 className="text-h3 text-neutral-900">YardOps</h3>
                <p className="text-caption text-neutral-500">Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              ✕
            </button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full h-8 px-3 rounded-full flex items-center gap-2.5 text-body transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-500'
                      : 'text-neutral-600 hover:bg-base-surfaceMuted'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto pt-4 border-t border-base-divider">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-subtitle text-neutral-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-caption text-neutral-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full h-9 px-5 rounded-full text-label font-medium bg-status-danger text-white hover:opacity-90 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 bg-base-surface rounded-full shadow-soft mx-4 mt-4 mb-4 px-[18px] items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-neutral-600 hover:text-neutral-900 transition-colors mr-2"
          >
            ☰
          </button>
          <div className="flex-1 flex items-center justify-between">
            <h2 className="text-h2 text-neutral-900">
              {pathname?.startsWith('/dashboard/reader/meters/') && pathname !== '/dashboard/reader/meters'
                ? 'Submit Meter Reading'
                : navigation.find((item) => item.href === pathname)?.name || 'Dashboard'}
            </h2>
            {notificationStats && notificationStats.unreadCount > 0 && (
              <Link
                href="/dashboard/notifications"
                className="relative w-9 h-9 rounded-full bg-base-surfaceMuted flex items-center justify-center text-neutral-600 hover:bg-base-surface transition-colors"
              >
                <span className="text-base">🔔</span>
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-500"></span>
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-caption text-white">
                  {notificationStats.unreadCount}
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-6 pb-6">{children}</main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

