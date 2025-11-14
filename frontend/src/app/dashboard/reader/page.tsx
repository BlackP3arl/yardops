'use client';

import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { meterService } from '@/services/meter.service';
import { readingService } from '@/services/reading.service';
import Link from 'next/link';

export default function ReaderDashboardPage() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
  });

  const { data: meters, isLoading: metersLoading, error: metersError } = useQuery({
    queryKey: ['myMeters', user?.id],
    queryFn: () => meterService.getMetersByUser(user!.id),
    enabled: !!user,
    retry: 1,
  });

  const { data: readings, isLoading: readingsLoading, error: readingsError } = useQuery({
    queryKey: ['myReadings', user?.id],
    queryFn: () => readingService.getUserReadings(user!.id),
    enabled: !!user,
    retry: 1,
  });

  // Calculate to-do meters (meters needing readings)
  const todoMeters = meters?.filter((meter: any) => {
    if (!meter.lastReading) return true;
    const lastReadingDate = new Date(meter.lastReading.readingDate);
    const now = new Date();
    const daysSinceLastReading = Math.floor(
      (now.getTime() - lastReadingDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let expectedInterval = 0;
    switch (meter.frequency) {
      case 'DAILY':
        expectedInterval = 1;
        break;
      case 'WEEKLY':
        expectedInterval = 7;
        break;
      case 'MONTHLY':
        expectedInterval = 30;
        break;
      default:
        return false;
    }

    return daysSinceLastReading >= expectedInterval;
  }) || [];

  if (metersLoading || readingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Show error message if any query failed
  const hasError = metersError || readingsError;
  if (hasError && !metersLoading && !readingsLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Reader Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Failed to load dashboard data. Please refresh the page.
          </p>
          {(metersError || readingsError) && (
            <p className="text-red-600 text-sm mt-2">
              {metersError?.message || readingsError?.message}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reader Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl">📋</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    To-Do Meters
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {todoMeters.length}
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
                <div className="text-3xl">🔢</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Assigned Meters
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {meters?.length || 0}
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
                    {readings?.length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* To-Do Meters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">To-Do Meters</h2>
        </div>
        <div className="p-6">
          {todoMeters.length === 0 ? (
            <p className="text-gray-500">No meters need readings at this time.</p>
          ) : (
            <div className="space-y-4">
              {todoMeters.map((meter) => (
                <div
                  key={meter.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {meter.meterNumber}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {meter.location?.name || 'Unknown'} • {meter.meterType} • {meter.frequency}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/reader/meters/${meter.id}`}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                  >
                    Submit Reading
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Readings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Readings</h2>
        </div>
        <div className="p-6">
          {readings && readings.length === 0 ? (
            <p className="text-gray-500">No readings submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {readings?.slice(0, 5).map((reading) => (
                <div
                  key={reading.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {reading.meter?.meterNumber}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Value: {reading.value} •{' '}
                      {new Date(reading.readingDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

