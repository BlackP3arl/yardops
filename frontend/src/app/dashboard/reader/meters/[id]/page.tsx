'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    // Convert datetime-local format to ISO string if provided
    // Ensure value is a number
    const readingData = {
      meterId,
      value: Number(data.value),
      readingDate: data.readingDate 
        ? new Date(data.readingDate).toISOString() 
        : undefined,
      comment: data.comment || undefined,
    };
    createMutation.mutate(readingData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  if (!meterHistory) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-neutral-500">Meter not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-6">
      {/* Meter Information Block */}
      <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
        <div className="space-y-4">
          <div className="pb-3 border-b border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Meter Name</p>
            <p className="text-lg font-semibold text-gray-900">
              {meterHistory.meter.meterNumber}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Meter Location</p>
              <p className="text-sm font-medium text-gray-900">
                {meterHistory.meter.location.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Meter Type</p>
              <p className="text-sm font-medium text-gray-900">
                {meterHistory.meter.meterType?.name || 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Reading Value <span className="text-red-600">*</span>
          </label>
          <input
            {...register('value', { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="Enter reading value"
            className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          {errors.value && (
            <p className="text-red-600 text-xs mt-1">{errors.value.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Reading Date
          </label>
          <input
            {...register('readingDate')}
            type="datetime-local"
            className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Comment <span className="text-gray-500 text-xs font-normal">(optional)</span>
          </label>
          <textarea
            {...register('comment')}
            rows={3}
            placeholder="Add any additional notes..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex-1 h-11 px-6 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? 'Submitting...' : 'Submit Reading'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 sm:flex-initial h-11 px-6 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Previous Readings Section */}
      {meterHistory && meterHistory.readings.length > 0 && (
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Previous Readings
          </h2>
          <div className="space-y-3">
            {meterHistory.readings.map((reading) => (
              <div
                key={reading.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center border border-primary-200">
                    <span className="text-primary-600 font-semibold text-sm">
                      {reading.value}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(reading.readingDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(reading.readingDate).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                {reading.comment && (
                  <div className="sm:max-w-xs">
                    <p className="text-xs text-gray-600 italic break-words">
                      "{reading.comment}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {meterHistory && meterHistory.readings.length === 0 && (
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Previous Readings
          </h2>
          <p className="text-sm text-gray-500 text-center py-4">
            No previous readings available for this meter.
          </p>
        </div>
      )}
    </div>
  );
}

