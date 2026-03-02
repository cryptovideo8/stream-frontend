'use client';

import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  ChartBarIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  EyeIcon,
  UsersIcon,
  HandThumbUpIcon,
  PencilIcon,
  LinkIcon,
  CheckBadgeIcon,
  BellIcon,
  ShieldCheckIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useGetVideosQuery } from '../../store/api/videoApi';
import { useGetUserStatsQuery, useUpdateUserMutation } from '../../store/api/userApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import { useGetGenericMasterByKeyQuery } from '../../store/api/commonApi';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  description: Yup.string().required('Description is required'),
  category: Yup.string().required('Category is required'),
  website: Yup.string().url('Must be a valid URL').nullable().optional(),
  language: Yup.string().required('Language is required'),
});

export default function ChannelDetails() {
  const [activeTab, setActiveTab] = useState('overview');
  const [mounted, setMounted] = useState(false);
  const currentUser = useSelector(selectCurrentUser);
  const [updateUser] = useUpdateUserMutation();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { data: videosData, isLoading: loadingVideos } = useGetVideosQuery({ page: 1, limit: 20 });
  const { data: userStats, isLoading: loadingStats } = useGetUserStatsQuery();
  const { data: categoryList = [] } = useGetGenericMasterByKeyQuery('category');

  const videos = videosData?.videos || [];

  // Derived insights from real data
  const totalViews = videos.reduce((s: number, v: any) => s + (v.stats?.views ?? 0), 0);
  const totalLikes = videos.reduce((s: number, v: any) => s + (v.stats?.likes ?? 0), 0);
  const totalVideos = videosData?.total ?? 0;

  // Build bar chart data: videos per category
  const categoryBreakdown = videos.reduce((acc: Record<string, number>, v: any) => {
    if (v.category) acc[v.category] = (acc[v.category] || 0) + 1;
    return acc;
  }, {});
  const categoryChartData = Object.entries(categoryBreakdown)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  // Videos by month
  const monthlyData = videos.reduce((acc: Record<string, number>, v: any) => {
    const month = new Date(v.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});
  const monthlyChartData = Object.entries(monthlyData).map(([name, count]) => ({ name, count }));

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
  };

  const tabs = [
    { id: 'overview', title: 'Channel Overview', icon: <ChartBarIcon className="w-5 h-5" /> },
    { id: 'settings', title: 'Channel Settings', icon: <Cog6ToothIcon className="w-5 h-5" /> },
  ];

  const renderOverview = () => (
    <div className="space-y-6 p-6">
      {/* Channel Header */}
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 bg-red-45 rounded-xl flex items-center justify-center text-3xl text-white font-bold flex-shrink-0">
          {mounted ? (currentUser?.name?.charAt(0)?.toUpperCase() ?? 'C') : 'C'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{mounted ? (currentUser?.name ?? 'My Channel') : 'My Channel'}</h1>
          <p className="text-grey-70 text-sm capitalize">{mounted ? (currentUser?.role ?? 'Creator') : 'Creator'}</p>
          <p className="text-grey-60 text-xs mt-1">{mounted ? currentUser?.email : ''}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Videos', value: formatNumber(totalVideos), icon: <ChartBarIcon className="w-5 h-5 text-blue-400" />, loading: loadingVideos },
          { label: 'Total Views', value: formatNumber(totalViews), icon: <EyeIcon className="w-5 h-5 text-green-400" />, loading: loadingVideos },
          { label: 'Total Likes', value: formatNumber(totalLikes), icon: <HandThumbUpIcon className="w-5 h-5 text-yellow-400" />, loading: loadingVideos },
          { label: 'Total Users', value: formatNumber(userStats?.totalUsers ?? 0), icon: <UsersIcon className="w-5 h-5 text-purple-400" />, loading: loadingStats },
        ].map((stat) => (
          <div key={stat.label} className="bg-dark-10 rounded-lg p-4 border border-dark-20">
            <div className="flex items-center justify-between mb-2">
              {stat.icon}
            </div>
            {stat.loading ? (
              <div className="h-6 bg-dark-20 rounded animate-pulse w-16 mb-1" />
            ) : (
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            )}
            <p className="text-grey-70 text-xs">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-10 rounded-lg p-5 border border-dark-20">
          <h3 className="text-white font-semibold mb-4">Videos by Category</h3>
          {loadingVideos ? (
            <div className="h-48 flex items-center justify-center text-grey-60">Loading...</div>
          ) : categoryChartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-grey-60">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 10 }} />
                <YAxis tick={{ fill: '#888', fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }} itemStyle={{ color: '#aaa' }} />
                <Bar dataKey="count" fill="#e53e3e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-dark-10 rounded-lg p-5 border border-dark-20">
          <h3 className="text-white font-semibold mb-4">Upload Activity (by Month)</h3>
          {loadingVideos ? (
            <div className="h-48 flex items-center justify-center text-grey-60">Loading...</div>
          ) : monthlyChartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-grey-60">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 10 }} />
                <YAxis tick={{ fill: '#888', fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }} itemStyle={{ color: '#aaa' }} />
                <Bar dataKey="count" fill="#4f46e5" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Monetization Breakdown */}
      <div className="bg-dark-10 rounded-lg p-5 border border-dark-20">
        <h3 className="text-white font-semibold mb-4">Video Insights</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Free', value: videos.filter((v: any) => v.monetization?.type === 'free').length, color: 'text-green-400' },
            { label: 'Paid', value: videos.filter((v: any) => v.monetization?.type === 'paid').length, color: 'text-yellow-400' },
            { label: 'Rent', value: videos.filter((v: any) => v.monetization?.type === 'rent').length, color: 'text-orange-400' },
            { label: 'Public', value: videos.filter((v: any) => v.visibility === 'public').length, color: 'text-blue-400' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-grey-70 text-xs mt-1">{item.label} Videos</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderChannelSettings = () => (
    <Formik
      initialValues={{
        name: currentUser?.name ?? '',
        description: '',
        category: '',
        website: '',
        language: 'en',
      }}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values, { setSubmitting }) => {
        try {
          if (!currentUser?.id) { toast.error('Not logged in'); return; }
          await updateUser({ id: currentUser.id, name: values.name }).unwrap();
          toast.success('Profile updated successfully!');
        } catch {
          toast.error('Failed to update profile');
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form className="space-y-5 p-6">
          {/* Branding */}
          <div className="bg-dark-10 rounded-lg p-5 border border-dark-20">
            <div className="flex items-center space-x-2 mb-4">
              <PencilIcon className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">Branding</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-grey-70 text-sm mb-2">Channel Icon</p>
                <div className="w-24 h-24 bg-dark-15 rounded-lg flex items-center justify-center border-2 border-dashed border-dark-20 cursor-pointer hover:border-red-45 transition-colors">
                  <div className="text-center">
                    <PencilIcon className="w-5 h-5 text-red-45 mx-auto" />
                    <p className="text-xs text-grey-70 mt-1">Upload</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-grey-70 text-sm mb-2">Banner Image</p>
                <div className="w-full h-24 bg-dark-15 rounded-lg flex items-center justify-center border-2 border-dashed border-dark-20 cursor-pointer hover:border-red-45 transition-colors">
                  <div className="text-center">
                    <PencilIcon className="w-5 h-5 text-red-45 mx-auto" />
                    <p className="text-xs text-grey-70 mt-1">Upload Banner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-dark-10 rounded-lg p-5 border border-dark-20">
            <div className="flex items-center space-x-2 mb-4">
              <PencilIcon className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-semibold">Basic Info</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-grey-70 text-sm mb-1">Display Name</label>
                <Field name="name" type="text"
                  className="w-full bg-dark-15 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-45 border border-dark-20" />
                {errors.name && touched.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-grey-70 text-sm mb-1">Description</label>
                <Field as="textarea" name="description" rows={3}
                  className="w-full bg-dark-15 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-45 border border-dark-20" />
                {errors.description && touched.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
              </div>
              <div>
                <label className="block text-grey-70 text-sm mb-1">Category</label>
                <Field as="select" name="category"
                  className="w-full bg-dark-15 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-45 border border-dark-20">
                  <option value="">Select category</option>
                  {categoryList.map((cat: { value: string }) => (
                    <option key={cat.value} value={cat.value}>{cat.value}</option>
                  ))}
                </Field>
                {errors.category && touched.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="bg-dark-10 rounded-lg p-5 border border-dark-20">
            <div className="flex items-center space-x-2 mb-4">
              <LinkIcon className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-semibold">Website</h3>
            </div>
            <div>
              <label className="block text-grey-70 text-sm mb-1">Website URL</label>
              <Field type="url" name="website" placeholder="https://..."
                className="w-full bg-dark-15 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-45 border border-dark-20" />
              {errors.website && touched.website && <p className="text-red-400 text-xs mt-1">{errors.website}</p>}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-dark-10 rounded-lg p-5 border border-dark-20">
            <div className="flex items-center space-x-2 mb-4">
              <ShieldCheckIcon className="w-5 h-5 text-yellow-400" />
              <h3 className="text-white font-semibold">Advanced Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-dark-15">
                <div>
                  <p className="text-white text-sm">Channel Language</p>
                  <p className="text-grey-70 text-xs">Primary content language</p>
                </div>
                <Field as="select" name="language"
                  className="bg-dark-15 text-white px-3 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-red-45 border border-dark-20">
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </Field>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-dark-15">
                <div>
                  <p className="text-white text-sm">Channel Verification</p>
                  <p className="text-grey-70 text-xs">Verify to access additional features</p>
                </div>
                <button type="button"
                  className="bg-dark-15 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-dark-20 flex items-center space-x-1 border border-dark-20">
                  <CheckBadgeIcon className="w-4 h-4 text-blue-400" />
                  <span>Verify Now</span>
                </button>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-red-400 text-sm">Delete Channel</p>
                  <p className="text-grey-70 text-xs">Permanently delete all your content</p>
                </div>
                <button type="button"
                  className="bg-red-900/50 text-red-400 px-3 py-1.5 text-sm rounded-lg hover:bg-red-900 flex items-center space-x-1 border border-red-800">
                  <TrashIcon className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={isSubmitting}
              className="bg-red-45 text-white px-5 py-2 rounded-lg hover:bg-red-60 disabled:opacity-60 text-sm">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );

  return (
    <div className="flex flex-col space-y-0">
      {/* Tabs */}
      <div className="bg-dark-8 rounded-t-lg border border-dark-20 border-b-0">
        <div className="flex">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 transition-all text-sm font-medium ${activeTab === tab.id
                ? 'text-red-45 border-b-2 border-red-45 bg-dark-8'
                : 'text-grey-70 hover:text-white hover:bg-dark-15'
                }`}>
              {tab.icon}
              <span>{tab.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-dark-8 rounded-b-lg border border-dark-20">
        {activeTab === 'overview' ? renderOverview() : renderChannelSettings()}
      </div>
    </div>
  );
}