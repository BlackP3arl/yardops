'use client';

import Sidebar from '@/components/creator-analytics/Sidebar';
import TopBar from '@/components/creator-analytics/TopBar';
import KPIStat from '@/components/creator-analytics/KPIStat';
import ChartLine from '@/components/creator-analytics/ChartLine';
import ChartDonut from '@/components/creator-analytics/ChartDonut';
import DataTable from '@/components/creator-analytics/DataTable';
import InfoWidget from '@/components/creator-analytics/InfoWidget';

export default function CreatorAnalyticsPage() {
  return (
    <div className="min-h-screen bg-base-background p-6">
      <div className="max-w-container mx-auto">
        {/* Outer Container with rounded corners */}
        <div className="bg-base-surface rounded-[28px] shadow-soft-elevated p-4">
          <div className="flex gap-4">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
              {/* Top Bar */}
              <div className="mb-4">
                <TopBar />
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto pr-2">
                {/* Page Header */}
                <div className="mb-6">
                  <h1 className="text-h1 text-neutral-900 mb-1">Creator Analytics</h1>
                  <p className="text-body text-neutral-500">
                    Track your performance and grow your audience
                  </p>
                </div>

                {/* KPI Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <KPIStat
                    title="Total Revenue"
                    value="$24,580"
                    trend={{ value: '+12.5%', isPositive: true }}
                  />
                  <KPIStat
                    title="Total Views"
                    value="142.3K"
                    trend={{ value: '+8.2%', isPositive: true }}
                  />
                  <KPIStat
                    title="Subscribers"
                    value="8,450"
                    trend={{ value: '+5.1%', isPositive: true }}
                  />
                  <KPIStat
                    title="Avg. Watch Time"
                    value="4m 32s"
                    trend={{ value: '-2.3%', isPositive: false }}
                  />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                  <div className="lg:col-span-2">
                    <ChartLine />
                  </div>
                  <div>
                    <ChartDonut />
                  </div>
                </div>

                {/* Table */}
                <div className="mb-6">
                  <DataTable />
                </div>

                {/* Info Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InfoWidget
                    icon="✅"
                    title="Verification"
                    description="Verify your account to unlock premium features"
                    ctaText="Verify Now"
                    ctaVariant="primary"
                  />
                  <InfoWidget
                    icon="💰"
                    title="Go Premium"
                    description="Get advanced analytics and insights"
                    ctaText="Upgrade"
                    ctaVariant="purple"
                  />
                  <InfoWidget
                    icon="📊"
                    title="Export Report"
                    description="Download your analytics data"
                    ctaText="Export"
                    ctaVariant="primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

