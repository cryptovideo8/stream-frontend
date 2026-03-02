'use client';

import { useState, useMemo } from 'react';
import { ArrowUpIcon } from '@heroicons/react/24/solid';
import {
  ChartBarIcon,
  VideoCameraIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useGetVideosQuery } from '../store/api/videoApi';
import { useGetUserStatsQuery } from '../store/api/userApi';
import Link from 'next/link';

type DateRange = '7d' | '30d' | '90d';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: { value: string; timeframe: string; isPositive: boolean };
  icon: React.ElementType;
  loading?: boolean;
}

function StatCard({ title, value, change, icon: Icon, loading }: StatCardProps) {
  return (
    <div className="bg-dark-10 rounded-xl p-6 border border-dark-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-grey-70 text-lg font-medium">{title}</h3>
        <Icon className="h-6 w-6 text-grey-70" />
      </div>
      <div className="space-y-2">
        {loading ? (
          <div className="h-8 bg-dark-20 rounded animate-pulse w-24" />
        ) : (
          <div className="text-3xl font-bold text-white">{value}</div>
        )}
        {change && (
          <div className="flex items-center space-x-2">
            <div className={`flex items-center ${change.isPositive ? 'text-green-500' : 'text-red-45'}`}>
              <ArrowUpIcon className={`h-4 w-4 ${!change.isPositive && 'rotate-180'}`} />
              <span className="font-medium">{change.value}</span>
            </div>
            <span className="text-grey-60">{change.timeframe}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-3 border-b border-dark-20 last:border-0">
      <div className="flex items-center space-x-3">
        <div className="w-16 h-10 bg-dark-20 rounded-lg animate-pulse" />
        <div className="space-y-1">
          <div className="h-3 bg-dark-20 rounded w-32 animate-pulse" />
          <div className="h-2 bg-dark-20 rounded w-20 animate-pulse" />
        </div>
      </div>
      <div className="h-5 bg-dark-20 rounded w-16 animate-pulse" />
    </div>
  );
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  const { data: userStats, isLoading: loadingStats } = useGetUserStatsQuery();
  const { data: videosData, isLoading: loadingVideos } = useGetVideosQuery({ page: 1, limit: 5 });

  // Build simple chart data from real video count and user data
  const allVideos = videosData?.videos || [];

  const stats = [
    {
      title: 'Total Videos',
      value: loadingVideos ? '...' : (videosData?.total ?? 0),
      change: { value: `${allVideos.length} recent`, timeframe: 'page', isPositive: true },
      icon: VideoCameraIcon,
      loading: loadingVideos,
    },
    {
      title: 'Total Users',
      value: loadingStats ? '...' : (userStats?.totalUsers ?? 0),
      change: { value: `${userStats?.activeUsers ?? 0} active`, timeframe: 'now', isPositive: true },
      icon: UsersIcon,
      loading: loadingStats,
    },
    {
      title: 'Active Subscriptions',
      value: loadingStats ? '...' : (userStats?.activeSubscriptions ?? 0),
      icon: CheckCircleIcon,
      loading: loadingStats,
    },
    {
      title: 'Published Videos',
      value: loadingVideos ? '...' : (videosData?.total ?? 0),
      icon: ChartBarIcon,
      loading: loadingVideos,
    },
  ];

  // Build chart data from real videos grouped by month
  const viewsChartData = useMemo(() => {
    if (!allVideos.length) return [
      { label: 'No Data', videos: 0 }
    ];
    // group by creation month
    const grouped: Record<string, number> = {};
    allVideos.forEach((v: any) => {
      const month = new Date(v.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
      grouped[month] = (grouped[month] || 0) + 1;
    });
    return Object.entries(grouped).map(([label, videos]) => ({ label, videos }));
  }, [allVideos]);

  const recentVideos = allVideos.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Dashboard Overview</h1>
          <p className="text-grey-70">Track your platform performance and growth</p>
        </div>
        {/* Date range filter */}
        <div className="flex items-center space-x-1 bg-dark-10 border border-dark-20 rounded-lg p-1">
          {(['7d', '30d', '90d'] as DateRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${dateRange === r
                  ? 'bg-red-45 text-white'
                  : 'text-grey-70 hover:text-white'
                }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-container bg-dark-10 rounded-xl p-6 border border-dark-20">
          <h3 className="chart-title text-white font-semibold mb-4">Videos Uploaded (by Month)</h3>
          <div className="h-[280px]">
            {loadingVideos ? (
              <div className="h-full flex items-center justify-center text-grey-60">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={viewsChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVideos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e53e3e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#e53e3e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="label" tick={{ fill: '#888', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#888', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: '#aaa' }}
                  />
                  <Area type="monotone" dataKey="videos" name="Videos" stroke="#e53e3e" fill="url(#colorVideos)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="chart-container bg-dark-10 rounded-xl p-6 border border-dark-20">
          <h3 className="chart-title text-white font-semibold mb-4">User Growth</h3>
          <div className="h-[280px] flex flex-col justify-center items-center space-y-4">
            {loadingStats ? (
              <div className="text-grey-60">Loading...</div>
            ) : (
              <>
                <div className="w-full grid grid-cols-3 gap-4">
                  {[
                    { label: 'Total Users', value: userStats?.totalUsers ?? 0, color: 'text-blue-400' },
                    { label: 'Active Users', value: userStats?.activeUsers ?? 0, color: 'text-green-400' },
                    { label: 'With Subscriptions', value: userStats?.activeSubscriptions ?? 0, color: 'text-yellow-400' },
                  ].map((item) => (
                    <div key={item.label} className="bg-dark-15 rounded-lg p-4 text-center">
                      <p className={`text-2xl font-bold ${item.color}`}>{item.value.toLocaleString()}</p>
                      <p className="text-grey-70 text-xs mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={[
                    { name: 'Total', value: userStats?.totalUsers ?? 0 },
                    { name: 'Active', value: userStats?.activeUsers ?? 0 },
                    { name: 'Subscribed', value: userStats?.activeSubscriptions ?? 0 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#888', fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                      itemStyle={{ color: '#aaa' }}
                    />
                    <Bar dataKey="value" fill="#e53e3e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Videos */}
      <div className="bg-dark-10 rounded-xl p-6 border border-dark-20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-grey-70">Recent Videos</h3>
          <Link href="/dashboard/videos" className="text-red-45 hover:text-red-60 text-sm font-medium">
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {loadingVideos ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
          ) : recentVideos.length === 0 ? (
            <div className="text-center py-8 text-grey-70">
              <VideoCameraIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No videos uploaded yet.</p>
            </div>
          ) : (
            recentVideos.map((video: any) => (
              <div key={video._id} className="flex items-center justify-between py-3 border-b border-dark-20 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-10 bg-dark-15 rounded-lg overflow-hidden flex-shrink-0">
                    {video.thumbnailPath ? (
                      <img src={video.thumbnailPath} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-dark-20 flex items-center justify-center">
                        <VideoCameraIcon className="h-5 w-5 text-grey-70" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white truncate max-w-[180px]">{video.title}</div>
                    <div className="text-xs text-grey-60 flex items-center space-x-1">
                      <ClockIcon className="h-3 w-3" />
                      <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-grey-70">{(video.stats?.views ?? 0).toLocaleString()} views</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${video.visibility === 'public'
                      ? 'bg-green-500/10 text-green-500'
                      : video.visibility === 'private'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                    {video.visibility ? video.visibility.charAt(0).toUpperCase() + video.visibility.slice(1) : 'N/A'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}