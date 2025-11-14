'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationService } from '@/services/location.service';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const locationSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  description: z.string().optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

export default function LocationsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: locations, isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationService.getAllLocations(),
  });

  const createMutation = useMutation({
    mutationFn: (data: LocationFormData) => locationService.createLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      setShowForm(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: LocationFormData }) =>
      locationService.updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      setEditingLocation(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => locationService.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
  });

  const onSubmit = (data: LocationFormData) => {
    if (editingLocation) {
      updateMutation.mutate({ id: editingLocation, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (location: any) => {
    setEditingLocation(location.id);
    setShowForm(true);
    setValue('name', location.name);
    setValue('description', location.description || '');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingLocation(null);
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
        <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingLocation(null);
            reset();
          }}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          {showForm ? 'Cancel' : 'Add Location'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingLocation ? 'Edit Location' : 'Add New Location'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location Name *
              </label>
              <input
                {...register('name')}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              {editingLocation ? 'Update' : 'Create'} Location
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

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {locations && locations.length > 0 ? (
              locations.map((location) => (
                <tr key={location.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {location.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {location.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(location)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this location?')) {
                          deleteMutation.mutate(location.id);
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
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                  No locations found. Create your first location above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

