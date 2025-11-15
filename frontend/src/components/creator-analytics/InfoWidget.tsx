'use client';

interface InfoWidgetProps {
  icon: string;
  title: string;
  description: string;
  ctaText?: string;
  ctaVariant?: 'primary' | 'purple';
}

export default function InfoWidget({
  icon,
  title,
  description,
  ctaText,
  ctaVariant = 'primary',
}: InfoWidgetProps) {
  return (
    <div className="bg-base-surface rounded-xl shadow-soft p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-base-surfaceMuted flex items-center justify-center">
          <span className="text-base">{icon}</span>
        </div>
        <div className="flex-1">
          <h4 className="text-subtitle text-neutral-800">{title}</h4>
          <p className="text-caption text-neutral-500">{description}</p>
        </div>
      </div>
      {ctaText && (
        <button
          className={`h-9 px-5 rounded-full text-label font-medium transition-colors ${
            ctaVariant === 'purple'
              ? 'bg-tertiary-500 text-white hover:bg-tertiary-400'
              : 'bg-primary-500 text-white hover:bg-primary-600 shadow-soft'
          }`}
        >
          {ctaText}
        </button>
      )}
    </div>
  );
}

