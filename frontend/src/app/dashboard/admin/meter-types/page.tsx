'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meterTypeService } from '@/services/meter-type.service';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const meterTypeSchema = z.object({
  name: z.string().min(1, 'Meter type name is required'),
  description: z.string().optional(),
});

type MeterTypeFormData = z.infer<typeof meterTypeSchema>;

export default function MeterTypesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingMeterType, setEditingMeterType] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: meterTypes, isLoading } = useQuery({
    queryKey: ['meterTypes'],
    queryFn: () => meterTypeService.getAllMeterTypes(),
  });

  const createMutation = useMutation({
    mutationFn: (data: MeterTypeFormData) => meterTypeService.createMeterType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meterTypes'] });
      setShowForm(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MeterTypeFormData }) =>
      meterTypeService.updateMeterType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meterTypes'] });
      setEditingMeterType(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => meterTypeService.deleteMeterType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meterTypes'] });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<MeterTypeFormData>({
    resolver: zodResolver(meterTypeSchema),
  });

  const onSubmit = (data: MeterTypeFormData) => {
    if (editingMeterType) {
      updateMutation.mutate({ id: editingMeterType, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (meterType: any) => {
    setEditingMeterType(meterType.id);
    setShowForm(true);
    setValue('name', meterType.name);
    setValue('description', meterType.description || '');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMeterType(null);
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
        <h1 className="text-2xl font-bold text-gray-900">Meter Types</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingMeterType(null);
            reset();
          }}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          {showForm ? 'Cancel' : 'Add Meter Type'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingMeterType ? 'Edit Meter Type' : 'Add New Meter Type'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Meter Type Name *
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
              {editingMeterType ? 'Update' : 'Create'} Meter Type
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
            {meterTypes && meterTypes.length > 0 ? (
              meterTypes.map((meterType) => (
                <tr key={meterType.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {meterType.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {meterType.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(meterType)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this meter type?')) {
                          deleteMutation.mutate(meterType.id);
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
                  No meter types found. Create your first meter type above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

