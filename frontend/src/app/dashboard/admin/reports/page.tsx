'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/report.service';
import { locationService } from '@/services/location.service';
import { userService } from '@/services/user.service';

export default function ReportsPage() {
  const [filters, setFilters] = useState({
    locationId: '',
    readerId: '',
    meterType: '',
    frequency: '',
    startDate: '',
    endDate: '',
  });

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationService.getAllLocations(),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers(1, 100),
  });

  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['report', filters],
    queryFn: () => reportService.generateReport(filters),
    enabled: false, // Don't auto-fetch, wait for user to click "Generate Report"
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerateReport = () => {
    refetch();
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const blob = await reportService.exportReport(filters, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `yardops-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Failed to export report. Please try again.');
    }
  };

  const clearFilters = () => {
    setFilters({
      locationId: '',
      readerId: '',
      meterType: '',
      frequency: '',
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Report Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <label className="block text-sm font-medium text-gray-700">Reader</label>
            <select
              value={filters.readerId}
              onChange={(e) => handleFilterChange('readerId', e.target.value)}
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
            <label className="block text-sm font-medium text-gray-700">Frequency</label>
            <select
              value={filters.frequency}
              onChange={(e) => handleFilterChange('frequency', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Frequencies</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="AD_HOC">Ad-hoc</option>
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
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleGenerateReport}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Generate Report
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Report Results */}
      {isLoading && (
        <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {reportData && !isLoading && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Report Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Readings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.summary.totalReadings}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Meters</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.summary.totalMeters}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Locations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.summary.totalLocations}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date Range</p>
                <p className="text-sm font-medium text-gray-900">
                  {reportData.summary.dateRange.start !== 'N/A'
                    ? new Date(reportData.summary.dateRange.start).toLocaleDateString()
                    : 'N/A'}{' '}
                  -{' '}
                  {reportData.summary.dateRange.end !== 'N/A'
                    ? new Date(reportData.summary.dateRange.end).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleExport('csv')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Export as CSV
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Export as PDF
              </button>
            </div>
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
                    Meter Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reader
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
                {reportData.readings.length > 0 ? (
                  reportData.readings.map((reading: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(reading.readingDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {reading.meterNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reading.meterType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{reading.location}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{reading.reader}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {reading.value}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {reading.comment || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No readings found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!reportData && !isLoading && (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">
            Configure filters above and click "Generate Report" to view readings.
          </p>
        </div>
      )}
    </div>
  );
}

