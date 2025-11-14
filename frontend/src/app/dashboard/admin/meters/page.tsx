'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meterService } from '@/services/meter.service';
import { locationService } from '@/services/location.service';
import { userService } from '@/services/user.service';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MeterType, ReadingFrequency } from '../../../../../../common/types/meter.types';

const meterSchema = z.object({
  meterNumber: z.string().min(1, 'Meter number is required'),
  meterType: z.enum(['WATER', 'ELECTRIC']),
  locationId: z.string().uuid('Please select a location'),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'AD_HOC']),
});

const assignSchema = z.object({
  userId: z.string().uuid('Please select a user'),
});

type MeterFormData = z.infer<typeof meterSchema>;
type AssignFormData = z.infer<typeof assignSchema>;

export default function MetersPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingMeter, setEditingMeter] = useState<string | null>(null);
  const [assigningMeter, setAssigningMeter] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: metersData, isLoading } = useQuery({
    queryKey: ['meters'],
    queryFn: () => meterService.getAllMeters(1, 100),
  });

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationService.getAllLocations(),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers(1, 100),
  });

  const createMutation = useMutation({
    mutationFn: (data: MeterFormData) => meterService.createMeter({
      meterNumber: data.meterNumber,
      meterType: data.meterType as MeterType,
      locationId: data.locationId,
      frequency: data.frequency as ReadingFrequency,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meters'] });
      setShowForm(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MeterFormData }) =>
      meterService.updateMeter(id, {
        meterNumber: data.meterNumber,
        meterType: data.meterType as MeterType,
        locationId: data.locationId,
        frequency: data.frequency as ReadingFrequency,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meters'] });
      setEditingMeter(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => meterService.deleteMeter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meters'] });
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ meterId, userId }: { meterId: string; userId: string }) =>
      meterService.assignMeter({ meterId, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meters'] });
      setAssigningMeter(null);
      assignReset();
    },
  });

  const unassignMutation = useMutation({
    mutationFn: ({ meterId, userId }: { meterId: string; userId: string }) =>
      meterService.unassignMeter(meterId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meters'] });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<MeterFormData>({
    resolver: zodResolver(meterSchema),
  });

  const {
    register: assignRegister,
    handleSubmit: assignHandleSubmit,
    formState: { errors: assignErrors },
    reset: assignReset,
  } = useForm<AssignFormData>({
    resolver: zodResolver(assignSchema),
  });

  const onSubmit = (data: MeterFormData) => {
    if (editingMeter) {
      updateMutation.mutate({ 
        id: editingMeter, 
        data
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const onAssignSubmit = (data: AssignFormData) => {
    if (assigningMeter) {
      assignMutation.mutate({ meterId: assigningMeter, userId: data.userId });
    }
  };

  const handleEdit = (meter: any) => {
    setEditingMeter(meter.id);
    setShowForm(true);
    setValue('meterNumber', meter.meterNumber);
    setValue('meterType', meter.meterType);
    setValue('locationId', meter.locationId);
    setValue('frequency', meter.frequency);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMeter(null);
    reset();
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
        <h1 className="text-2xl font-bold text-gray-900">Meters</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingMeter(null);
            reset();
          }}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          {showForm ? 'Cancel' : 'Add Meter'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingMeter ? 'Edit Meter' : 'Add New Meter'}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Meter Number *
              </label>
              <input
                {...register('meterNumber')}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              {errors.meterNumber && (
                <p className="text-red-600 text-sm mt-1">{errors.meterNumber.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Meter Type *
              </label>
              <select
                {...register('meterType')}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Select type</option>
                <option value="WATER">Water</option>
                <option value="ELECTRIC">Electric</option>
              </select>
              {errors.meterType && (
                <p className="text-red-600 text-sm mt-1">{errors.meterType.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location *
              </label>
              <select
                {...register('locationId')}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Select location</option>
                {locations?.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
              {errors.locationId && (
                <p className="text-red-600 text-sm mt-1">{errors.locationId.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Reading Frequency *
              </label>
              <select
                {...register('frequency')}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Select frequency</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="AD_HOC">Ad-hoc</option>
              </select>
              {errors.frequency && (
                <p className="text-red-600 text-sm mt-1">{errors.frequency.message}</p>
              )}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              {editingMeter ? 'Update' : 'Create'} Meter
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {assigningMeter && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Assign Meter to User</h2>
          <form onSubmit={assignHandleSubmit(onAssignSubmit)}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select User *
              </label>
              <select
                {...assignRegister('userId')}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Select user</option>
                {usersData?.data
                  ?.filter((u) => u.role === 'READER')
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
              </select>
              {assignErrors.userId && (
                <p className="text-red-600 text-sm mt-1">{assignErrors.userId.message}</p>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Assign
              </button>
              <button
                type="button"
                onClick={() => {
                  setAssigningMeter(null);
                  assignReset();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
                Frequency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {metersData?.data && metersData.data.length > 0 ? (
              metersData.data.map((meter: any) => (
                <tr key={meter.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {meter.meterNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {meter.meterType}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {meter.location?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {meter.frequency}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {meter.assignments && meter.assignments.length > 0 ? (
                      <div className="space-y-1">
                        {meter.assignments.map((assignment: any) => (
                          <div key={assignment.id} className="flex items-center gap-2">
                            <span>
                              {assignment.user.firstName} {assignment.user.lastName}
                            </span>
                            <button
                              onClick={() => {
                                if (confirm('Unassign this meter from this user?')) {
                                  unassignMutation.mutate({
                                    meterId: meter.id,
                                    userId: assignment.userId,
                                  });
                                }
                              }}
                              className="text-red-600 hover:text-red-900 text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setAssigningMeter(meter.id);
                        assignReset();
                      }}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => handleEdit(meter)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this meter?')) {
                          deleteMutation.mutate(meter.id);
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
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No meters found. Create your first meter above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

