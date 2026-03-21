'use client';

import { useState, useMemo } from 'react';
import { useGetAllAuditsQuery, useGetAllUpisQuery } from '../../../../store/api/paymentApi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { CurrencyRupeeIcon, ClockIcon, CheckCircleIcon, XCircleIcon, FunnelIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { format, subDays, isSameDay, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';
import SelectWithSearch from '../../../../components/ui/SelectWithSearch';

export default function AdminPaymentReportsTab() {
  const [selectedUser, setSelectedUser] = useState<{ value: string; label: string } | null>(null);
  const [upiId, setUpiId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const queryParams = {
    ...(selectedUser?.value && { userId: selectedUser.value }),
    ...(upiId && { upiId }),
    ...(startDate && { startDate: startOfDay(new Date(startDate)).toISOString() }),
    ...(endDate && { endDate: endOfDay(new Date(endDate)).toISOString() }),
  };

  const { data: audits = [], isLoading } = useGetAllAuditsQuery(queryParams);
  const { data: upis = [] } = useGetAllUpisQuery();

  const clearFilters = () => {
    setSelectedUser(null);
    setUpiId('');
    setStartDate('');
    setEndDate('');
  };

  const stats = useMemo(() => {
    let totalRevenue = 0;
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;

    audits.forEach((a) => {
      if (a.status === 'approved') {
        totalRevenue += a.amount;
        approvedCount++;
      } else if (a.status === 'pending') {
        pendingCount++;
      } else if (a.status === 'rejected') {
        rejectedCount++;
      }
    });

    return { totalRevenue, pendingCount, approvedCount, rejectedCount };
  }, [audits]);

  const chartData = useMemo(() => {
    let days: Date[] = [];
    
    if (startDate && endDate) {
      // If date range is selected, show days in that range
      try {
        days = eachDayOfInterval({
          start: startOfDay(new Date(startDate)),
          end: startOfDay(new Date(endDate))
        });
        // Limit to reasonable number of days for chart visibility
        if (days.length > 31) days = days.slice(-31); 
      } catch (e) {
        days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i));
      }
    } else {
      // Default to last 7 days
      days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i));
    }
    
    return days.map(day => {
      const dayAudits = audits.filter((a) => a.createdAt && isSameDay(new Date(a.createdAt), day));
      
      let approvedAmount = 0;
      let pendingAmount = 0;
      
      dayAudits.forEach((a) => {
        if (a.status === 'approved') approvedAmount += a.amount;
        if (a.status === 'pending') pendingAmount += a.amount;
      });

      return {
        name: format(day, 'MMM dd'),
        Approved: approvedAmount,
        Pending: pendingAmount
      };
    });
  }, [audits, startDate, endDate]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-dark-20 rounded-xl" />)}
        </div>
        <div className="h-80 bg-dark-20 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Payment & Revenue Report</h2>
          <p className="text-sm text-grey-60">Insights into manual UPI payments and subscription revenue.</p>
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${showFilters ? 'bg-red-45 border-red-45 text-white' : 'bg-dark-15 border-dark-25 text-grey-60 hover:text-white'}`}
        >
          <FunnelIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-dark-12 border border-dark-20 rounded-xl animate-fade-in-down">
          <div>
            <label className="block text-xs font-medium text-grey-60 uppercase tracking-wider mb-2">Search User (AJAX)</label>
            <SelectWithSearch
              endpoint="/user/search"
              placeholder="Search Name / Email"
              value={selectedUser}
              onChange={(val: { value: string; label: string } | null) => setSelectedUser(val)}
              isClearable
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-grey-60 uppercase tracking-wider mb-2">Filter by UPI ID</label>
            <select 
              value={upiId} 
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full bg-dark-20 border border-dark-25 rounded-lg px-3 py-2 text-sm text-white focus:border-red-45 outline-none transition-colors"
            >
              <option value="">All UPI IDs</option>
              {upis.map(u => (
                <option key={u._id} value={u.upiId}>{u.upiId}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-grey-60 uppercase tracking-wider mb-2">Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-dark-20 border border-dark-25 rounded-lg px-3 py-2 text-sm text-white focus:border-red-45 outline-none transition-colors [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-grey-60 uppercase tracking-wider mb-2">End Date</label>
            <div className="flex gap-2">
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-dark-20 border border-dark-25 rounded-lg px-3 py-2 text-sm text-white focus:border-red-45 outline-none transition-colors [color-scheme:dark]"
              />
              <button 
                onClick={clearFilters}
                className="p-2 bg-dark-20 hover:bg-dark-30 text-grey-60 hover:text-white rounded-lg border border-dark-25 transition-colors"
                title="Clear Filters"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-dark-12 border border-dark-20 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-lg text-green-500">
            <CurrencyRupeeIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-grey-60 font-medium uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Approved Count */}
        <div className="bg-dark-12 border border-dark-20 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-grey-60 font-medium uppercase tracking-wider">Approved</p>
            <p className="text-2xl font-bold text-white">{stats.approvedCount}</p>
          </div>
        </div>

        {/* Pending Count */}
        <div className="bg-dark-12 border border-dark-20 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-500">
            <ClockIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-grey-60 font-medium uppercase tracking-wider">Pending Audit</p>
            <p className="text-2xl font-bold text-white">{stats.pendingCount}</p>
          </div>
        </div>

        {/* Rejected Count */}
        <div className="bg-dark-12 border border-dark-20 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-lg text-red-500">
            <XCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-grey-60 font-medium uppercase tracking-wider">Rejected</p>
            <p className="text-2xl font-bold text-white">{stats.rejectedCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-dark-12 border border-dark-20 rounded-xl p-5">
        <h3 className="text-base font-semibold text-white mb-6">
          {startDate && endDate ? `Revenue Growth (${format(new Date(startDate), 'MMM d')} - ${format(new Date(endDate), 'MMM d')})` : 'Revenue Over Last 7 Days'}
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
              <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
              <RechartsTooltip 
                cursor={{ fill: '#ffffff0a' }}
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Approved" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
              <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
