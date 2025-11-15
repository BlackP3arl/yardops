'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from 'recharts';

const data = [
  { name: 'Jan', views: 1200, revenue: 800 },
  { name: 'Feb', views: 1900, revenue: 1200 },
  { name: 'Mar', views: 3000, revenue: 1800 },
  { name: 'Apr', views: 2780, revenue: 1900 },
  { name: 'May', views: 1890, revenue: 1300 },
  { name: 'Jun', views: 2390, revenue: 2100 },
  { name: 'Jul', views: 3490, revenue: 2800 },
];

export default function ChartLine() {
  return (
    <div className="bg-base-surface rounded-xl shadow-soft p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-subtitle text-neutral-800">Performance Overview</h3>
          <p className="text-caption text-neutral-500">Last 7 months</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary-500"></div>
            <span className="text-caption text-neutral-500">Views</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-secondary-500"></div>
            <span className="text-caption text-neutral-500">Revenue</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ECEDEF" />
          <XAxis
            dataKey="name"
            stroke="#9A9AAA"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis stroke="#9A9AAA" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 10px rgba(15, 23, 42, 0.06)',
              fontSize: '11px',
            }}
          />
          <Line
            type="monotone"
            dataKey="views"
            stroke="#E9557B"
            strokeWidth={2.5}
            dot={{ fill: '#E9557B', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#22A45D"
            strokeWidth={2.5}
            dot={{ fill: '#22A45D', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

