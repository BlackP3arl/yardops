'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { readingService } from '@/services/reading.service';
import { locationService } from '@/services/location.service';
import { userService } from '@/services/user.service';
import { meterService } from '@/services/meter.service';

export default function ReadingsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    locationId: '',
    meterType: '',
    userId: '',
    startDate: '',
    endDate: '',
  });
  const queryClient = useQueryClient();

  const { data: readingsData, isLoading } = useQuery({
    queryKey: ['readings', page, filters],
    queryFn: () =>
      readingService.getAllReadings(page, 20, {
        ...(filters.locationId && { locationId: filters.locationId }),
        ...(filters.meterType && { meterType: filters.meterType }),
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      }),
  });

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationService.getAllLocations(),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers(1, 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => readingService.deleteReading(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readings'] });
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      locationId: '',
      meterType: '',
      userId: '',
      startDate: '',
      endDate: '',
    });
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Readings</h1>
        <div className="text-sm text-gray-500">
          Total: {readingsData?.total || 0} readings
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <select
              value={filters.locationId}
              onChange={(e) => handleFilterChange('locationId', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Locations</option>
              {locations?.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Meter Type</label>
            <select
              value={filters.meterType}
              onChange={(e) => handleFilterChange('meterType', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Types</option>
              <option value="WATER">Water</option>
              <option value="ELECTRIC">Electric</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Reader</label>
            <select
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Readers</option>
              {usersData?.data
                ?.filter((u) => u.role === 'READER')
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
        <button
          onClick={clearFilters}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
        >
          Clear Filters
        </button>
      </div>

      {/* Readings Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Meter
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
                Reader
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {readingsData?.data && readingsData.data.length > 0 ? (
              readingsData.data.map((reading: any) => (
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
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {reading.user
                      ? `${reading.user.firstName} ${reading.user.lastName}`
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {reading.comment || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this reading?')) {
                          deleteMutation.mutate(reading.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                  No readings found. Try adjusting your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {readingsData && readingsData.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow">
          <div className="text-sm text-gray-700">
            Showing page {readingsData.page} of {readingsData.totalPages} (
            {readingsData.total} total readings)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(readingsData.totalPages, p + 1))}
              disabled={page === readingsData.totalPages}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

