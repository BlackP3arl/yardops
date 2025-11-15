'use client';

import { useState } from 'react';

interface NavItem {
  icon: string;
  label: string;
  active?: boolean;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { icon: '📊', label: 'Dashboard', active: true },
  { icon: '📈', label: 'Analytics' },
  { icon: '👥', label: 'Audience' },
  { icon: '💰', label: 'Revenue' },
  { icon: '📝', label: 'Content' },
  { icon: '🔔', label: 'Notifications' },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <aside className="w-[260px] bg-base-surface rounded-xl shadow-soft p-5 flex flex-col">
      {/* Brand */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-2xl">
            🎨
          </div>
          <div>
            <h3 className="text-h3 text-neutral-900">CreatorHub</h3>
            <p className="text-caption text-neutral-500">Analytics</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <div key={item.label}>
            <button
              className={`w-full h-8 px-3 rounded-full flex items-center gap-2.5 text-body transition-colors ${
                item.active
                  ? 'bg-primary-50 text-primary-500'
                  : 'text-neutral-600 hover:bg-base-surfaceMuted'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto pt-4 border-t border-base-divider">
        <button className="w-full h-8 px-3 rounded-full flex items-center gap-2.5 text-body text-neutral-600 hover:bg-base-surfaceMuted">
          <span className="text-base">⚙️</span>
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}

