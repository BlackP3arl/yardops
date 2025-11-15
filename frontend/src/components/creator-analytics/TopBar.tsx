'use client';

export default function TopBar() {
  return (
    <header className="w-full bg-base-surface rounded-full shadow-soft py-2.5 px-[18px] flex items-center gap-4">
      {/* Search */}
      <div className="flex-1">
        <div className="relative max-w-md">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
            🔍
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-10 pl-10 pr-4 bg-base-surfaceMuted rounded-full text-body text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>
      </div>

      {/* Summary Pills */}
      <div className="flex items-center gap-3">
        <div className="bg-base-surface rounded-full px-4 py-2 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary-500"></span>
          <span className="text-body text-neutral-700">$12,450</span>
        </div>
        <div className="bg-base-surface rounded-full px-4 py-2 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-secondary-500"></span>
          <span className="text-body text-neutral-700">1.2K Views</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-full bg-base-surfaceMuted flex items-center justify-center text-neutral-600 hover:bg-base-surface transition-colors relative">
          <span className="text-base">📧</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
        </button>
        <button className="w-9 h-9 rounded-full bg-base-surfaceMuted flex items-center justify-center text-neutral-600 hover:bg-base-surface transition-colors relative">
          <span className="text-base">🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2 ml-2">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-base">👤</span>
          </div>
          <span className="text-subtitle text-neutral-700">Alex</span>
        </div>
      </div>
    </header>
  );
}

