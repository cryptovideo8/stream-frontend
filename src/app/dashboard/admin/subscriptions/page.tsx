'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppSelector } from '../../../store/hooks';
import { selectCurrentUser } from '../../../store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { Tab } from '@headlessui/react';
import {
    CurrencyDollarIcon,
    TagIcon,
    UsersIcon,
    ChartBarIcon,
    QrCodeIcon,
    DocumentMagnifyingGlassIcon,
    ChartPieIcon
} from '@heroicons/react/24/outline';

import AdminPlansTab from './tabs/AdminPlansTab';
import AdminPromosTab from './tabs/AdminPromosTab';
import AdminSubscribersTab from './tabs/AdminSubscribersTab';
import AdminStatsTab from './tabs/AdminStatsTab';
import AdminUPITab from './tabs/AdminUPITab';
import AdminPaymentAuditsTab from './tabs/AdminPaymentAuditsTab';
import AdminPaymentReportsTab from './tabs/AdminPaymentReportsTab';

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

const TAB_KEYS = ['plans', 'promos', 'subscribers', 'stats', 'upi', 'audits', 'reports'] as const;

function AdminSubscriptionsContent() {
    const user = useAppSelector(selectCurrentUser);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [tabIndex, setTabIndex] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const t = searchParams.get('tab');
        if (t === 'promos') setTabIndex(1);
        else if (t === 'subscribers') setTabIndex(2);
        else if (t === 'stats') setTabIndex(3);
        else if (t === 'upi') setTabIndex(4);
        else if (t === 'audits') setTabIndex(5);
        else if (t === 'reports') setTabIndex(6);
        else setTabIndex(0);
    }, [searchParams]);

    const onTabChange = (index: number) => {
        setTabIndex(index);
        const key = TAB_KEYS[index] ?? 'plans';
        const url = `/dashboard/admin/subscriptions?tab=${key}`;
        router.replace(url, { scroll: false });
    };

    useEffect(() => {
        if (!mounted) return;
        if (!user || user.role !== 'superadmin') {
            router.replace('/dashboard');
        }
    }, [mounted, user, router]);

    if (!mounted) {
        return (
            <div className="min-h-[40vh] flex items-center justify-center bg-dark-6 text-grey-60">
                Loading…
            </div>
        );
    }

    if (!user || user.role !== 'superadmin') {
        return (
            <div className="min-h-[40vh] flex items-center justify-center bg-dark-6 text-grey-60">
                Redirecting…
            </div>
        );
    }

    const tabs = [
        { name: 'Plans', icon: CurrencyDollarIcon, key: 'plans' },
        { name: 'Promo Codes', icon: TagIcon, key: 'promos' },
        { name: 'Subscribers', icon: UsersIcon, key: 'subscribers' },
        { name: 'Statistics', icon: ChartBarIcon, key: 'stats' },
        { name: 'UPI Accounts', icon: QrCodeIcon, key: 'upi' },
        { name: 'Payment Audits', icon: DocumentMagnifyingGlassIcon, key: 'audits' },
        { name: 'Payment Reports', icon: ChartPieIcon, key: 'reports' }
    ];

    return (
        <div className="min-h-screen bg-dark-6 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2">Subscription management</h1>
                    <p className="text-grey-60">
                        Super admin: manage streaming subscription plans, promos, and subscribers. Public catalogue is at{' '}
                        <a href="/subscriptions" className="text-red-45 hover:underline">/subscriptions</a>.
                    </p>
                </div>

                <Tab.Group selectedIndex={tabIndex} onChange={onTabChange}>
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
                                            : 'text-grey-60 hover:bg-dark-15 hover:text-primary'
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
                        <Tab.Panel className={classNames('rounded-xl bg-dark-10 p-6', 'ring-white/60 ring-offset-2 ring-offset-red-45 focus:outline-none focus:ring-2')}>
                            <AdminUPITab />
                        </Tab.Panel>
                        <Tab.Panel className={classNames('rounded-xl bg-dark-10 p-6', 'ring-white/60 ring-offset-2 ring-offset-red-45 focus:outline-none focus:ring-2')}>
                            <AdminPaymentAuditsTab />
                        </Tab.Panel>
                        <Tab.Panel className={classNames('rounded-xl bg-dark-10 p-6', 'ring-white/60 ring-offset-2 ring-offset-red-45 focus:outline-none focus:ring-2')}>
                            <AdminPaymentReportsTab />
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </div>
    );
}

export default function AdminSubscriptionsPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[40vh] flex items-center justify-center bg-dark-6 text-grey-60">
                    Loading subscription admin…
                </div>
            }
        >
            <AdminSubscriptionsContent />
        </Suspense>
    );
}
