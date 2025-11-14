'use client';

import { useQuery } from '@tanstack/react-query';
import { readingService } from '@/services/reading.service';
import { meterService } from '@/services/meter.service';
import { userService } from '@/services/user.service';
import { locationService } from '@/services/location.service';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['readingStats'],
    queryFn: () => readingService.getReadingStats(),
    retry: 1,
  });

  const { data: metersData, error: metersError } = useQuery({
    queryKey: ['meters'],
    queryFn: () => meterService.getAllMeters(1, 1000),
    retry: 1,
  });

  const { data: usersData, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers(1, 1000),
    retry: 1,
  });

  const { data: locations, error: locationsError } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationService.getAllLocations(),
    retry: 1,
  });

  const chartData = stats
    ? [
        {
          name: 'Daily',
          count: stats.byFrequency.daily,
        },
        {
          name: 'Weekly',
          count: stats.byFrequency.weekly,
        },
        {
          name: 'Monthly',
          count: stats.byFrequency.monthly,
        },
        {
          name: 'Ad-hoc',
          count: stats.byFrequency.adHoc,
        },
      ]
    : [];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Show error message if any query failed
  const hasError = statsError || metersError || usersError || locationsError;
  if (hasError && !statsLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Failed to load dashboard data. Please refresh the page or contact support.
          </p>
          {(statsError || metersError || usersError || locationsError) && (
            <p className="text-red-600 text-sm mt-2">
              {statsError?.message || metersError?.message || usersError?.message || locationsError?.message}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl">🔢</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Meters
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {metersData?.total || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl">📖</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Readings
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.totalReadings || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl">⏰</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Readings
                  </dt>
                  <dd className="text-lg font-medium text-yellow-600">
                    {stats?.pendingReadings || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl">⚠️</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Missed Readings
                  </dt>
                  <dd className="text-lg font-medium text-red-600">
                    {stats?.missedReadings || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Meters by Frequency
        </h2>
        <div className="w-full" style={{ minHeight: '300px' }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Users</h2>
          <p className="text-3xl font-bold text-gray-900">
            {usersData?.total || 0}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Locations</h2>
          <p className="text-3xl font-bold text-gray-900">
            {locations?.length || 0}
          </p>
        </div>
      </div>
    </div>
  );
}

