'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  ChartBarIcon,
  VideoCameraIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAppSelector } from '../store/hooks';
import { selectCurrentUser } from '../store/slices/authSlice';

const viewsData = [
  { period: 'Q1 23', views: 150000, engagement: 25000 },
  { period: 'Q2 23', views: 350000, engagement: 45000 },
  { period: 'Q3 23', views: 550000, engagement: 75000 },
  { period: 'Q4 23', views: 750000, engagement: 95000 },
  { period: 'Q1 24', views: 950000, engagement: 125000 },
];

const revenueData = [
  { month: 'Jan', ads: 2000, sponsorships: 1000 },
  { month: 'Feb', ads: 2500, sponsorships: 1500 },
  { month: 'Mar', ads: 3000, sponsorships: 2000 },
  { month: 'Apr', ads: 3500, sponsorships: 2500 },
  { month: 'May', ads: 4000, sponsorships: 3000 },
];

const recentVideos = [
  { date: '2024-03-01', title: 'Getting Started with React', views: '12.5K', likes: '1.2K', status: 'Published' },
  { date: '2024-02-28', title: 'Advanced TypeScript Tips', views: '8.3K', likes: '950', status: 'Published' },
  { date: '2024-02-27', title: 'Web Development in 2024', views: '5.1K', likes: '620', status: 'Processing' },
];

const latestComments = [
  { id: 'CMT-001', date: '2024-02-20 14:30', user: 'Alice Johnson', video: 'Getting Started with React', comment: 'Great tutorial! Very helpful.', status: 'Approved' },
  { id: 'CMT-002', date: '2024-02-20 13:15', user: 'Bob Smith', video: 'Advanced TypeScript Tips', comment: 'Could you explain generics more?', status: 'Pending' },
  { id: 'CMT-003', date: '2024-02-20 12:45', user: 'Carol White', video: 'Web Development in 2024', comment: 'Looking forward to more!', status: 'Approved' },
];

const kpiCards = [
  { label: 'Total Views', value: '2.5M', change: '+25%', icon: ChartBarIcon, color: '#E30000', bg: 'rgba(227,0,0,0.12)' },
  { label: 'Total Videos', value: '156', change: '+3 this week', icon: VideoCameraIcon, color: '#7C3AED', bg: 'rgba(124,58,237,0.12)' },
  { label: 'Subscribers', value: '45.6K', change: '+1.2K', icon: UsersIcon, color: '#0EA5E9', bg: 'rgba(14,165,233,0.12)' },
  { label: 'Revenue', value: '$15.2K', change: '+18%', icon: CurrencyDollarIcon, color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
];

const quickActions = [
  { label: 'Upload Video', icon: CloudArrowUpIcon, href: '/dashboard/videos/upload', color: '#E30000' },
  { label: 'My Videos', icon: VideoCameraIcon, href: '/dashboard/videos', color: '#7C3AED' },
  { label: 'Settings', icon: Cog6ToothIcon, href: '/dashboard/settings', color: '#0EA5E9' },
  { label: 'Analytics', icon: ChartPieIcon, href: '/dashboard/analytics', color: '#10B981' },
];

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#1A1A1A',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '12px',
  },
  labelStyle: { color: '#B3B3B3' },
};

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const user = useAppSelector(selectCurrentUser);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userName = mounted ? (user?.name || 'Creator') : 'Creator';

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, <span className="text-red-45">{userName}</span> 👋</h1>
          <p className="text-grey-60 text-sm mt-1">Here&apos;s what&apos;s happening with your content today.</p>
        </div>
        <Link
          href="/dashboard/videos/upload"
          className="hidden sm:flex items-center gap-2 bg-red-45 hover:bg-red-55 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-red-45/20"
        >
          <CloudArrowUpIcon className="h-4 w-4" /> Upload Video
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="stats-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="stats-label">{kpi.label}</p>
                  <p className="stats-value">{kpi.value}</p>
                  <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-green-400">
                    <ArrowTrendingUpIcon className="h-3 w-3" />
                    {kpi.change}
                  </span>
                </div>
                <div className="stats-icon-wrap" style={{ background: kpi.bg }}>
                  <Icon className="h-5 w-5" style={{ color: kpi.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-dark-20/20 hover:border-dark-25 transition-all duration-300 text-center"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{ background: `${action.color}20` }}
              >
                <Icon className="h-6 w-6" style={{ color: action.color }} />
              </div>
              <span className="text-sm font-medium text-grey-70 group-hover:text-white transition-colors">{action.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <div className="chart-container">
          <h3 className="chart-title">
            <ChartBarIcon className="h-5 w-5 text-red-45" /> Growth Overview
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={viewsData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E30000" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#E30000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="period" stroke="#555" tick={{ fontSize: 11, fill: '#999' }} />
              <YAxis stroke="#555" tick={{ fontSize: 11, fill: '#999' }} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="views" stroke="#E30000" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="chart-container">
          <h3 className="chart-title">
            <CurrencyDollarIcon className="h-5 w-5 text-green-400" /> Revenue Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="month" stroke="#555" tick={{ fontSize: 11, fill: '#999' }} />
              <YAxis stroke="#555" tick={{ fontSize: 11, fill: '#999' }} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#999' }} />
              <Bar dataKey="ads" name="Ad Revenue" fill="#E30000" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sponsorships" name="Sponsorships" fill="#FF5555" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Videos */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex justify-between items-center px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-semibold text-white flex items-center gap-2">
            <VideoCameraIcon className="h-5 w-5 text-red-45" /> Recent Videos
          </h3>
          <Link href="/dashboard/videos" className="text-sm text-red-45 hover:text-red-55 transition-colors font-medium">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-grey-60 text-xs font-medium uppercase tracking-wider" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['Date', 'Title', 'Views', 'Likes', 'Status', ''].map(h => (
                  <th key={h} className="py-3 px-5 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentVideos.map((video, i) => (
                <tr
                  key={i}
                  className="transition-colors hover:bg-white/[0.02]"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <td className="py-3.5 px-5 text-grey-60 text-sm">{video.date}</td>
                  <td className="py-3.5 px-5 text-white text-sm font-medium">{video.title}</td>
                  <td className="py-3.5 px-5 text-grey-70 text-sm">{video.views}</td>
                  <td className="py-3.5 px-5 text-grey-70 text-sm">{video.likes}</td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${video.status === 'Published'
                      ? 'bg-green-400/10 text-green-400'
                      : 'bg-amber-400/10 text-amber-400'
                      }`}>
                      {video.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <button className="text-xs text-grey-60 hover:text-white border border-dark-25 hover:border-dark-30 px-3 py-1 rounded-lg transition-all">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Latest Comments */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex justify-between items-center px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-semibold text-white">💬 Latest Comments</h3>
          <button className="text-sm text-red-45 hover:text-red-55 font-medium transition-colors">View all →</button>
        </div>
        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          {latestComments.map((comment) => (
            <div key={comment.id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-white">{comment.user}</span>
                    <span className="text-xs text-grey-60">on</span>
                    <span className="text-xs text-grey-70 truncate">{comment.video}</span>
                  </div>
                  <p className="text-sm text-grey-70 line-clamp-2">{comment.comment}</p>
                  <p className="text-xs text-grey-60 mt-1">{comment.date}</p>
                </div>
                <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${comment.status === 'Approved'
                  ? 'bg-green-400/10 text-green-400'
                  : 'bg-amber-400/10 text-amber-400'
                  }`}>
                  {comment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}