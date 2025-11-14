'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meterService } from '@/services/meter.service';
import { readingService } from '@/services/reading.service';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const readingSchema = z.object({
  value: z.number().positive(),
  readingDate: z.string().optional(),
  comment: z.string().optional(),
});

type ReadingFormData = z.infer<typeof readingSchema>;

export default function SubmitReadingPage() {
  const params = useParams();
  const router = useRouter();
  const meterId = params.id as string;
  const queryClient = useQueryClient();

  const { data: meterHistory, isLoading } = useQuery({
    queryKey: ['meterReadings', meterId],
    queryFn: () => readingService.getMeterReadings(meterId),
  });

  const createMutation = useMutation({
    mutationFn: (data: ReadingFormData) =>
      readingService.createReading({
        ...data,
        meterId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meterReadings', meterId] });
      queryClient.invalidateQueries({ queryKey: ['myReadings'] });
      router.push('/dashboard/reader/meters');
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReadingFormData>({
    resolver: zodResolver(readingSchema),
    defaultValues: {
      readingDate: new Date().toISOString().slice(0, 16),
    },
  });

  const onSubmit = (data: ReadingFormData) => {
    createMutation.mutate(data);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Submit Reading - {meterHistory?.meter.meterNumber}
      </h1>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Meter Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-medium">{meterHistory?.meter.location.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Type</p>
            <p className="font-medium">{meterHistory?.meter.meterType}</p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow rounded-lg p-6"
      >
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Enter Reading
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Value
            </label>
            <input
              {...register('value', { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            {errors.value && (
              <p className="text-red-600 text-sm mt-1">{errors.value.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reading Date
            </label>
            <input
              {...register('readingDate')}
              type="datetime-local"
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Comment (optional)
            </label>
            <textarea
              {...register('comment')}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Submit Reading
        </button>
      </form>

      {meterHistory && meterHistory.readings.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Reading History
          </h2>
          <div className="space-y-2">
            {meterHistory.readings.slice(0, 10).map((reading) => (
              <div
                key={reading.id}
                className="flex justify-between items-center p-3 border border-gray-200 rounded"
              >
                <div>
                  <p className="font-medium">{reading.value}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(reading.readingDate).toLocaleString()}
                  </p>
                </div>
                {reading.comment && (
                  <p className="text-sm text-gray-500">{reading.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

