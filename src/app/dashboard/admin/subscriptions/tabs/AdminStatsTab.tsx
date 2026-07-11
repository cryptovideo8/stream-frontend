'use client';

import { useAdminGetSubscriptionStatsQuery } from '../../../../store/api/subscriptionApi';
import { CurrencyDollarIcon, UsersIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

function money(n: unknown) {
  const v = typeof n === 'number' && Number.isFinite(n) ? n : 0;
  return `INR ${v.toLocaleString()}`;
}

function num(n: unknown) {
  const v = typeof n === 'number' && Number.isFinite(n) ? n : 0;
  return v.toLocaleString();
}

type RevenueByPlan = {
  _id?: string;
  count?: number;
  revenue?: number;
  plan?: { name?: string; price?: number };
};

export default function AdminStatsTab() {
  const { data: stats, isLoading, isError } = useAdminGetSubscriptionStatsQuery();

  if (isLoading) {
    return <div className="text-center py-10 text-grey-60">Loading statistics...</div>;
  }

  if (isError || !stats) {
    return <div className="text-center py-10 text-grey-60">Failed to load statistics.</div>;
  }

  const active = stats.counts?.active ?? 0;
  const expired = stats.counts?.expired ?? 0;
  const cancelled = stats.counts?.cancelled ?? 0;
  const monthly = Array.isArray(stats.monthlyRevenue) ? stats.monthlyRevenue : [];
  const lastMonthRevenue = monthly.length ? Number(monthly[monthly.length - 1]?.revenue ?? 0) : 0;
  const planRows: RevenueByPlan[] = Array.isArray(stats.revenueByPlan) ? stats.revenueByPlan : [];
  const maxPlanCount = Math.max(1, ...planRows.map((p) => Number(p.count ?? 0)));

  const statCards = [
    {
      name: 'Total Revenue (All Time)',
      value: money(stats.totalRevenue),
      icon: CurrencyDollarIcon,
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-500',
    },
    {
      name: 'Latest Month Revenue',
      value: money(lastMonthRevenue),
      icon: ArrowTrendingUpIcon,
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-500',
    },
    {
      name: 'Current Active Subscribers',
      value: num(active),
      icon: UsersIcon,
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-500',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-primary mb-1">Platform Statistics</h2>
        <p className="text-sm text-grey-60">Overview of subscription revenue and active users.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-dark-12 border border-dark-25 rounded-2xl p-6 flex flex-col items-center text-center"
          >
            <div className={classNames('p-3 rounded-xl mb-4', stat.bgColor)}>
              <stat.icon className={classNames('w-8 h-8', stat.textColor)} />
            </div>
            <p className="text-sm font-medium text-grey-60 mb-1">{stat.name}</p>
            <p className="text-3xl font-bold text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Active', value: active },
          { label: 'Expired', value: expired },
          { label: 'Cancelled', value: cancelled },
        ].map((c) => (
          <div key={c.label} className="bg-dark-12 border border-dark-25 rounded-xl px-4 py-3 flex justify-between">
            <span className="text-grey-60 text-sm">{c.label}</span>
            <span className="text-primary font-bold">{num(c.value)}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-12 border border-dark-25 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-primary mb-4">Revenue by Plan</h3>
          {planRows.length > 0 ? (
            <div className="space-y-4">
              {planRows.map((item, idx) => {
                const count = Number(item.count ?? 0);
                const name = item.plan?.name || 'Unknown plan';
                const key = String(item._id ?? idx);
                return (
                  <div key={key} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-grey-70 font-medium block truncate">{name}</span>
                      <span className="text-[11px] text-grey-50">{money(item.revenue)}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-primary font-bold">{count}</span>
                      <div className="w-24 h-2 bg-dark-25 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-45 rounded-full"
                          style={{ width: `${(count / maxPlanCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-grey-60 text-sm">No subscription revenue yet.</p>
          )}
        </div>

        <div className="bg-dark-12 border border-dark-25 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-primary mb-4">Monthly Revenue (last 12)</h3>
          {monthly.length > 0 ? (
            <div className="space-y-3">
              {monthly.map((row: { _id?: string; revenue?: number; count?: number }) => (
                <div key={row._id || 'm'} className="flex items-center justify-between text-sm">
                  <span className="text-grey-70 font-medium">{row._id}</span>
                  <span className="text-primary font-bold">
                    {money(row.revenue)}
                    <span className="text-grey-50 font-normal ml-2">({num(row.count)} subs)</span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-grey-60 text-sm">No monthly data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
