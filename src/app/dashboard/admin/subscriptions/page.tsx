'use client';

import { useState } from 'react';
import { useAppSelector } from '../../../store/hooks';
import { selectCurrentUser } from '../../../store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { Tab } from '@headlessui/react';
import {
    CurrencyDollarIcon,
    TagIcon,
    UsersIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

// Components we will create next
import AdminPlansTab from './tabs/AdminPlansTab';
import AdminPromosTab from './tabs/AdminPromosTab';
import AdminSubscribersTab from './tabs/AdminSubscribersTab';
import AdminStatsTab from './tabs/AdminStatsTab';

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function AdminSubscriptionsPage() {
    const user = useAppSelector(selectCurrentUser);
    const router = useRouter();

    // Basic guard
    if (!user || user.role !== 'superadmin') {
        if (typeof window !== 'undefined') router.push('/dashboard');
        return null;
    }

    const tabs = [
        { name: 'Plans', icon: CurrencyDollarIcon },
        { name: 'Promo Codes', icon: TagIcon },
        { name: 'Subscribers', icon: UsersIcon },
        { name: 'Statistics', icon: ChartBarIcon },
    ];

    return (
        <div className="min-h-screen bg-dark-6 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Subscription Management</h1>
                    <p className="text-grey-60">Manage plans, promo codes, and subscriber access.</p>
                </div>

                <Tab.Group>
                    <Tab.List className="flex space-x-2 rounded-xl bg-dark-10 p-1 mb-8 overflow-x-auto">
                        {tabs.map((tab) => (
                            <Tab
                                key={tab.name}
                                className={({ selected }) =>
                                    classNames(
                                        'w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium leading-5 whitespace-nowrap px-4 transition-all duration-200',
                                        'ring-white/60 ring-offset-2 ring-offset-red-45 focus:outline-none focus:ring-2',
                                        selected
                                            ? 'bg-red-45 text-white shadow'
                                            : 'text-grey-60 hover:bg-dark-15 hover:text-white'
                                    )
                                }
                            >
                                <tab.icon className="h-5 w-5" aria-hidden="true" />
                                {tab.name}
                            </Tab>
                        ))}
                    </Tab.List>

                    <Tab.Panels className="mt-2">
                        <Tab.Panel className={classNames('rounded-xl bg-dark-10 p-6', 'ring-white/60 ring-offset-2 ring-offset-red-45 focus:outline-none focus:ring-2')}>
                            <AdminPlansTab />
                        </Tab.Panel>
                        <Tab.Panel className={classNames('rounded-xl bg-dark-10 p-6', 'ring-white/60 ring-offset-2 ring-offset-red-45 focus:outline-none focus:ring-2')}>
                            <AdminPromosTab />
                        </Tab.Panel>
                        <Tab.Panel className={classNames('rounded-xl bg-dark-10 p-6', 'ring-white/60 ring-offset-2 ring-offset-red-45 focus:outline-none focus:ring-2')}>
                            <AdminSubscribersTab />
                        </Tab.Panel>
                        <Tab.Panel className={classNames('rounded-xl bg-dark-10 p-6', 'ring-white/60 ring-offset-2 ring-offset-red-45 focus:outline-none focus:ring-2')}>
                            <AdminStatsTab />
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </div>
    );
}
