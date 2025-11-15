'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { name: 'Video', value: 45, color: '#E9557B' },
  { name: 'Live', value: 30, color: '#22A45D' },
  { name: 'Shorts', value: 15, color: '#F6A723' },
  { name: 'Other', value: 10, color: '#3B82F6' },
];

const COLORS = ['#E9557B', '#22A45D', '#F6A723', '#3B82F6'];

export default function ChartDonut() {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-base-surface rounded-xl shadow-soft p-4">
      <div className="mb-4">
        <h3 className="text-subtitle text-neutral-800">Content Distribution</h3>
        <p className="text-caption text-neutral-500">This month</p>
      </div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-caption text-neutral-500">Total</p>
            <p className="text-dataLarge text-neutral-900">{total}%</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 justify-center mt-4">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: COLORS[index] }}
            ></div>
            <span className="text-caption text-neutral-500">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

