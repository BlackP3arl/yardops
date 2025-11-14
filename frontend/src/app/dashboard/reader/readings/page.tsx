'use client';

import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { readingService } from '@/services/reading.service';

export default function MyReadingsPage() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
  });

  const { data: readings, isLoading } = useQuery({
    queryKey: ['myReadings', user?.id],
    queryFn: () => readingService.getUserReadings(user!.id),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">My Readings</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Meter Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comment
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {readings && readings.length > 0 ? (
              readings.map((reading: any) => (
                <tr key={reading.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(reading.readingDate).toLocaleDateString()}
                    <br />
                    <span className="text-gray-500 text-xs">
                      {new Date(reading.readingDate).toLocaleTimeString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reading.meter?.meterNumber || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {reading.meter?.location?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reading.meter?.meterType || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reading.value}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                    {reading.comment || '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No readings submitted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

