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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:z-auto`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <h1 className="text-xl font-bold text-primary-600">YardOps</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 bg-white shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-500 lg:hidden"
          >
            ☰
          </button>
          <div className="flex-1 flex items-center justify-between px-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {navigation.find((item) => item.href === pathname)?.name || 'Dashboard'}
            </h2>
            {notificationStats && notificationStats.unreadCount > 0 && (
              <Link
                href="/dashboard/notifications"
                className="relative p-2 text-gray-500 hover:text-gray-700"
              >
                🔔
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {notificationStats.unreadCount}
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
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

