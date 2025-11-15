'use client';

interface KPIStatProps {
  title: string;
  value: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function KPIStat({ title, value, trend }: KPIStatProps) {
  return (
    <div className="bg-base-surface rounded-lg shadow-soft p-4">
      <div className="flex flex-col">
        <span className="text-caption text-neutral-500 mb-1">{title}</span>
        <span className="text-dataLarge text-neutral-900 mb-1">{value}</span>
        {trend && (
          <span
            className={`text-caption ${
              trend.isPositive ? 'text-secondary-500' : 'text-status-danger'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

