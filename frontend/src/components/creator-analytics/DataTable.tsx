'use client';

interface TableRow {
  id: string;
  name: string;
  type: string;
  views: string;
  revenue: string;
  status: 'active' | 'inactive';
}

const data: TableRow[] = [
  { id: '1', name: 'Summer Collection 2024', type: 'Video', views: '12.5K', revenue: '$1,240', status: 'active' },
  { id: '2', name: 'Product Review Series', type: 'Live', views: '8.2K', revenue: '$890', status: 'active' },
  { id: '3', name: 'Quick Tips #15', type: 'Shorts', views: '45.3K', revenue: '$320', status: 'active' },
  { id: '4', name: 'Behind the Scenes', type: 'Video', views: '5.1K', revenue: '$180', status: 'inactive' },
  { id: '5', name: 'Q&A Session', type: 'Live', views: '15.8K', revenue: '$1,100', status: 'active' },
];

export default function DataTable() {
  return (
    <div className="bg-base-surface rounded-xl shadow-soft p-4">
      <div className="mb-4">
        <h3 className="text-subtitle text-neutral-800">Top Content</h3>
        <p className="text-caption text-neutral-500">Last 30 days</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-base-surfaceMuted">
              <th className="text-left py-2 px-4 text-caption text-neutral-500 font-medium">
                Content
              </th>
              <th className="text-left py-2 px-4 text-caption text-neutral-500 font-medium">
                Type
              </th>
              <th className="text-right py-2 px-4 text-caption text-neutral-500 font-medium">
                Views
              </th>
              <th className="text-right py-2 px-4 text-caption text-neutral-500 font-medium">
                Revenue
              </th>
              <th className="text-center py-2 px-4 text-caption text-neutral-500 font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.id}
                className="border-b border-base-divider hover:bg-base-surfaceMuted transition-colors"
              >
                <td className="py-2 px-4 text-body text-neutral-700">{row.name}</td>
                <td className="py-2 px-4 text-body text-neutral-700">{row.type}</td>
                <td className="py-2 px-4 text-body text-neutral-700 text-right">
                  {row.views}
                </td>
                <td className="py-2 px-4 text-body text-neutral-700 text-right">
                  {row.revenue}
                </td>
                <td className="py-2 px-4 text-center">
                  <span
                    className={`inline-flex items-center h-6 px-2.5 rounded-full text-caption ${
                      row.status === 'active'
                        ? 'bg-tags-availableBg text-tags-availableText'
                        : 'bg-tags-outOfStockBg text-tags-outOfStockText'
                    }`}
                  >
                    {row.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

