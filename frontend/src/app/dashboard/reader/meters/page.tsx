'use client';

import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { meterService } from '@/services/meter.service';
import Link from 'next/link';

export default function MyMetersPage() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
  });

  const { data: meters, isLoading } = useQuery({
    queryKey: ['myMeters', user?.id],
    queryFn: () => meterService.getMetersByUser(user!.id),
    enabled: !!user,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Meters</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {meters?.map((meter) => (
          <div
            key={meter.id}
            className="bg-white shadow rounded-lg p-6"
          >
            <h3 className="text-lg font-medium text-gray-900">
              {meter.meterNumber}
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              {meter.location?.name || 'Unknown Location'}
            </p>
            <p className="text-sm text-gray-500">
              Type: {meter.meterType?.name || 'Unknown'} • Frequency: {meter.frequency}
            </p>
            {(meter as any).lastReading && (
              <p className="text-sm text-gray-500 mt-2">
                Last Reading: {(meter as any).lastReading.value} on{' '}
                {new Date((meter as any).lastReading.readingDate).toLocaleDateString()}
              </p>
            )}
            <Link
              href={`/dashboard/reader/meters/${meter.id}`}
              className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Submit Reading
            </Link>
          </div>
        ))}
      </div>

      {meters?.length === 0 && (
        <p className="text-gray-500 text-center py-12">
          No meters assigned to you yet.
        </p>
      )}
    </div>
  );
}

