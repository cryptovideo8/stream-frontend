'use client';

import { useAdminGetSubscriptionStatsQuery } from '../../../../store/api/subscriptionApi';
import { CurrencyDollarIcon, UsersIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function AdminStatsTab() {
    const { data: stats, isLoading } = useAdminGetSubscriptionStatsQuery(undefined, {
        // Optionally poll every 60 seconds if this was a real-time requirement
    });

    if (isLoading) return <div className="text-center py-10 text-grey-60">Loading statistics...</div>;

    if (!stats) return <div className="text-center py-10 text-grey-60">Failed to load statistics.</div>;

    const statCards = [
        {
            name: 'Total Revenue (All Time)',
            value: `INR ${stats.totalRevenue.toLocaleString()}`,
            icon: CurrencyDollarIcon,
            bgColor: 'bg-green-500/10',
            textColor: 'text-green-500',
        },
        {
            name: 'Monthly Recurring Revenue (Active)',
            value: `INR ${stats.mrr.toLocaleString()}`,
            icon: ArrowTrendingUpIcon,
            bgColor: 'bg-blue-500/10',
            textColor: 'text-blue-500',
        },
        {
            name: 'Current Active Subscribers',
            value: stats.activeSubscribers.toLocaleString(),
            icon: UsersIcon,
            bgColor: 'bg-purple-500/10',
            textColor: 'text-purple-500',
        },
    ];

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">Platform Statistics</h2>
                <p className="text-sm text-grey-60">Overview of subscription revenue and active users.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {statCards.map((stat) => (
                    <div key={stat.name} className="bg-dark-12 border border-dark-25 rounded-2xl p-6 flex flex-col items-center text-center">
                        <div className={classNames('p-3 rounded-xl mb-4', stat.bgColor)}>
                            <stat.icon className={classNames('w-8 h-8', stat.textColor)} />
                        </div>
                        <p className="text-sm font-medium text-grey-60 mb-1">{stat.name}</p>
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Plans Breakdown */}
                <div className="bg-dark-12 border border-dark-25 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Active Subs by Plan</h3>
                    {stats.planBreakdown.length > 0 ? (
                        <div className="space-y-4">
                            {stats.planBreakdown.map((item: any) => (
                                <div key={item._id} className="flex items-center justify-between">
                                    <span className="text-grey-70 font-medium">{item.name}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-white font-bold">{item.count}</span>
                                        <div className="w-24 h-2 bg-dark-25 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-red-45 rounded-full"
                                                style={{ width: `${(item.count / stats.activeSubscribers) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-grey-60 text-sm">No active plans.</p>
                    )}
                </div>

                {/* Promo Usage Stats */}
                <div className="bg-dark-12 border border-dark-25 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Top Promo Campaigns</h3>
                    {stats.promoBreakdown.length > 0 ? (
                        <div className="space-y-4">
                            {stats.promoBreakdown.map((item: any) => (
                                <div key={item._id} className="flex items-center justify-between">
                                    <div>
                                        <span className="text-grey-70 font-bold uppercase">{item.code}</span>
                                        <span className="ml-2 text-[10px] text-grey-50 bg-dark-20 px-1.5 py-0.5 rounded">
                                            {item.discountType === 'percent' ? `${item.discountValue}%` : `FLAT ${item.discountValue}`}
                                        </span>
                                    </div>
                                    <span className="text-white font-medium">{item.uses} uses</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-grey-60 text-sm">No promos used yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
