'use client';

import { useState, useMemo, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
    CurrencyDollarIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    FunnelIcon,
    XMarkIcon,
    ShieldExclamationIcon,
    Cog6ToothIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';
import {
    useAdminGetAllPayoutRequestsQuery,
    useAdminGetPayoutStatsQuery,
    useAdminSettlePayoutRequestMutation,
    useAdminRejectPayoutRequestMutation,
    useGetPayoutRateQuery,
    useUpdatePayoutRateMutation,
    PayoutRequest,
} from '../../../store/api/payoutApi';
import { API_BASE_URL } from '../../../config/env';
import { useAppSelector } from '../../../store/hooks';
import { selectCurrentUser } from '../../../store/slices/authSlice';

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-900 text-yellow-300',
    settled: 'bg-green-900 text-green-300',
    rejected: 'bg-red-900 text-red-300',
};

const rejectSchema = Yup.object({
    adminNote: Yup.string().min(5, 'Please explain the rejection reason').required('Rejection note is required'),
});

export default function AdminPayoutsPage() {
    const [mounted, setMounted] = useState(false);
    const currentUser = useAppSelector(selectCurrentUser);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [activeTab, setActiveTab] = useState<'requests' | 'insights' | 'rate'>('requests');


    // Filters
    const [statusFilter, setStatusFilter] = useState('pending');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [creatorEmailFilter, setCreatorEmailFilter] = useState('');
    const [minAmountFilter, setMinAmountFilter] = useState('');
    const [page, setPage] = useState(1);

    // Modal state
    const [detailModal, setDetailModal] = useState<PayoutRequest | null>(null);
    const [rejectModal, setRejectModal] = useState<PayoutRequest | null>(null);

    const { data: requests, isLoading, refetch } = useAdminGetAllPayoutRequestsQuery({
        status: statusFilter || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
        creatorEmail: creatorEmailFilter.trim() || undefined,
        minAmount: minAmountFilter.trim() || undefined,
        page,
        limit: 15,
    });
    const [exportLoading, setExportLoading] = useState(false);
    const { data: stats } = useAdminGetPayoutStatsQuery();
    const { data: rate, refetch: refetchRate } = useGetPayoutRateQuery();
    const [settle] = useAdminSettlePayoutRequestMutation();
    const [reject] = useAdminRejectPayoutRequestMutation();
    const [updateRate] = useUpdatePayoutRateMutation();

    const handleSettle = async (r: PayoutRequest) => {
        if (!confirm(`Settle payout of ₹${r.totalAmount.toFixed(2)} for ${r.creatorId?.name}?`)) return;
        try {
            await settle({ id: r._id }).unwrap();
            toast.success('Payout settled!');
            refetch();
        } catch (err: unknown) {
            const error = err as { data?: { message?: string }; status?: number };
            const msg =
                error?.data?.message ||
                (error?.status === 409
                    ? 'Watch data no longer matches this request. Review in Detail.'
                    : 'Failed to settle');
            toast.error(msg);
        }
    };

    const handleExportCsv = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
            toast.error('Not authenticated');
            return;
        }
        setExportLoading(true);
        try {
            const qs = new URLSearchParams();
            if (statusFilter) qs.set('status', statusFilter);
            if (fromDate) qs.set('from', fromDate);
            if (toDate) qs.set('to', toDate);
            if (creatorEmailFilter.trim()) qs.set('creatorEmail', creatorEmailFilter.trim());
            if (minAmountFilter.trim()) qs.set('minAmount', minAmountFilter.trim());
            const res = await fetch(`${API_BASE_URL}/payout/admin/export?${qs.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('export failed');
            const csv = await res.text();
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payout-requests-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Export downloaded');
        } catch {
            toast.error('Export failed');
        } finally {
            setExportLoading(false);
        }
    };

    const handleReject = async (values: { adminNote: string }, { setSubmitting, resetForm }: { setSubmitting: (s: boolean) => void; resetForm: () => void }) => {
        if (!rejectModal) return;
        try {
            await reject({ id: rejectModal._id, adminNote: values.adminNote }).unwrap();
            toast.success('Payout rejected');
            setRejectModal(null);
            resetForm();
            refetch();
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            toast.error(error?.data?.message || 'Failed to reject');
        } finally {
            setSubmitting(false);
        }
    };

    const monthlyChart = useMemo(() => {
        return (stats?.monthlyVolume ?? []).map((m: { _id: string; amount: number; count: number }) => ({
            month: m._id,
            amount: m.amount,
            count: m.count,
        }));
    }, [stats]);

    const topCreatorsChart = useMemo(() => {
        return (stats?.topCreators ?? []).map((c: { creator: { name: string }; totalEarned: number }) => ({
            name: c.creator?.name ?? 'Unknown',
            earned: c.totalEarned,
        }));
    }, [stats]);

    const tabs = [
        { id: 'requests' as const, label: 'Payout Requests', icon: <CurrencyDollarIcon className="h-4 w-4" /> },
        { id: 'insights' as const, label: 'Insights', icon: <ChartBarIcon className="h-4 w-4" /> },
        { id: 'rate' as const, label: 'Payout Rate', icon: <Cog6ToothIcon className="h-4 w-4" /> },
    ];

    // ── Guard: show loading until mounted, then block non-superadmins ──────────
    if (!mounted) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-dark-10 rounded-lg border border-dark-20" />
                ))}
            </div>
        );
    }

    if (currentUser?.role !== 'superadmin') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <ShieldExclamationIcon className="h-16 w-16 text-red-45 mb-4 opacity-60" />
                <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                <p className="text-grey-70 text-sm max-w-md">
                    This page is restricted to super admins only.<br />
                    Contact your platform administrator if you believe this is an error.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Payout Settlement</h1>
                <p className="text-grey-70 text-sm mt-0.5">Super admin settlement screen for creator payouts</p>
            </div>


            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Pending Requests', value: stats?.counts?.pending ?? 0, color: 'text-yellow-400', icon: ClockIcon },
                    { label: 'Settled', value: stats?.counts?.settled ?? 0, color: 'text-green-400', icon: CheckCircleIcon },
                    { label: 'Rejected', value: stats?.counts?.rejected ?? 0, color: 'text-red-400', icon: XCircleIcon },
                    { label: 'Pending Amount', value: `₹${(stats?.amounts?.pending ?? 0).toFixed(2)}`, color: 'text-blue-400', icon: CurrencyDollarIcon },
                ].map(({ label, value, color, icon: Icon }) => (
                    <div key={label} className="bg-dark-10 rounded-lg p-4 border border-dark-20">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-grey-70 text-xs">{label}</p>
                            <Icon className={`h-4 w-4 ${color}`} />
                        </div>
                        <p className={`text-xl font-bold ${color}`}>{value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="border-b border-dark-20">
                <div className="flex space-x-1">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'text-red-45 border-b-2 border-red-45'
                                : 'text-grey-70 hover:text-white'
                                }`}>
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Requests Tab ── */}
            {activeTab === 'requests' && (
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="bg-dark-10 rounded-lg p-4 border border-dark-20 flex flex-wrap items-end gap-3">
                        <FunnelIcon className="h-4 w-4 text-grey-70 self-center" />
                        <div>
                            <label className="text-xs text-grey-70 mb-1 block">Status</label>
                            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                className="bg-dark-15 text-white px-3 py-2 rounded text-sm border border-dark-20 focus:outline-none focus:ring-1 focus:ring-red-45">
                                <option value="">All</option>
                                <option value="pending">Pending</option>
                                <option value="settled">Settled</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-grey-70 mb-1 block">Creator email</label>
                            <input type="text" value={creatorEmailFilter} placeholder="exact match"
                                onChange={(e) => { setCreatorEmailFilter(e.target.value); setPage(1); }}
                                className="bg-dark-15 text-white px-3 py-2 rounded text-sm border border-dark-20 w-48 focus:outline-none focus:ring-1 focus:ring-red-45" />
                        </div>
                        <div>
                            <label className="text-xs text-grey-70 mb-1 block">Min amount (₹)</label>
                            <input type="number" min={0} step={0.01} value={minAmountFilter} placeholder="0"
                                onChange={(e) => { setMinAmountFilter(e.target.value); setPage(1); }}
                                className="bg-dark-15 text-white px-3 py-2 rounded text-sm border border-dark-20 w-28 focus:outline-none focus:ring-1 focus:ring-red-45" />
                        </div>
                        <div>
                            <label className="text-xs text-grey-70 mb-1 block">From</label>
                            <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                                className="bg-dark-15 text-white px-3 py-2 rounded text-sm border border-dark-20 focus:outline-none focus:ring-1 focus:ring-red-45" />
                        </div>
                        <div>
                            <label className="text-xs text-grey-70 mb-1 block">To</label>
                            <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                                className="bg-dark-15 text-white px-3 py-2 rounded text-sm border border-dark-20 focus:outline-none focus:ring-1 focus:ring-red-45" />
                        </div>
                        <button type="button" onClick={handleExportCsv} disabled={exportLoading}
                            className="text-sm border border-dark-20 px-3 py-2 rounded hover:border-green-500 text-green-400 disabled:opacity-50">
                            {exportLoading ? 'Exporting…' : 'Export CSV'}
                        </button>
                        {(statusFilter || fromDate || toDate || creatorEmailFilter || minAmountFilter) && (
                            <button onClick={() => {
                                setStatusFilter('');
                                setFromDate('');
                                setToDate('');
                                setCreatorEmailFilter('');
                                setMinAmountFilter('');
                                setPage(1);
                            }}
                                className="text-grey-70 hover:text-white text-sm flex items-center space-x-1 border border-dark-20 px-3 py-2 rounded hover:border-red-45">
                                <XMarkIcon className="h-4 w-4" /><span>Clear</span>
                            </button>
                        )}
                    </div>

                    {/* Table */}
                    <div className="bg-dark-10 rounded-lg overflow-hidden border border-dark-20">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-800">
                                        {['Creator', 'Period', 'Watch Time', 'Amount', 'Method', 'Status', 'Requested', 'Actions'].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading
                                        ? Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="border-b border-gray-800">
                                                {Array.from({ length: 8 }).map((_, j) => (
                                                    <td key={j} className="px-4 py-3"><div className="h-4 bg-dark-20 rounded animate-pulse" /></td>
                                                ))}
                                            </tr>
                                        ))
                                        : !requests?.requests?.length
                                            ? (
                                                <tr>
                                                    <td colSpan={8} className="text-center py-10 text-grey-70">
                                                        <CurrencyDollarIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                                        <p>No requests found</p>
                                                    </td>
                                                </tr>
                                            )
                                            : requests.requests.map((r: any) => (
                                                <tr key={r._id} className="border-b border-gray-800 hover:bg-gray-800/20 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <p className="text-white font-medium text-xs">{r.creatorId?.name ?? 'Unknown'}</p>
                                                            <p className="text-grey-70 text-xs">{r.creatorId?.email}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-grey-70 text-xs whitespace-nowrap">
                                                        {new Date(r.periodStart).toLocaleDateString()} –<br />{new Date(r.periodEnd).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-grey-70">{r.totalWatchMinutes.toFixed(1)} min</td>
                                                    <td className="px-4 py-3 text-white font-semibold">₹{r.totalAmount.toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-grey-70 capitalize">{r.paymentMethod}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-grey-70 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1">
                                                            <button onClick={() => setDetailModal(r)}
                                                                className="text-xs bg-dark-15 text-grey-70 hover:text-white px-2 py-1 rounded border border-dark-20">
                                                                Detail
                                                            </button>
                                                            {r.status === 'pending' && (
                                                                <>
                                                                    <button onClick={() => handleSettle(r)}
                                                                        className="text-xs bg-green-900/50 text-green-300 hover:bg-green-900 px-2 py-1 rounded border border-green-800">
                                                                        Settle
                                                                    </button>
                                                                    <button onClick={() => setRejectModal(r)}
                                                                        className="text-xs bg-red-900/50 text-red-300 hover:bg-red-900 px-2 py-1 rounded border border-red-800">
                                                                        Reject
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="px-4 py-3 flex items-center justify-between border-t border-dark-20">
                            <span className="text-xs text-grey-70">
                                Page {page} of {requests?.totalPages ?? 1} · {requests?.total ?? 0} requests
                            </span>
                            <div className="flex gap-2">
                                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                                    className="px-3 py-1 text-sm text-grey-70 hover:text-white disabled:opacity-40 bg-dark-15 rounded">← Prev</button>
                                <button onClick={() => setPage((p) => Math.min(requests?.totalPages ?? 1, p + 1))} disabled={page >= (requests?.totalPages ?? 1)}
                                    className="px-3 py-1 text-sm text-grey-70 hover:text-white disabled:opacity-40 bg-dark-15 rounded">Next →</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Insights Tab ── */}
            {activeTab === 'insights' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Monthly settled amount */}
                        <div className="bg-dark-10 rounded-lg p-5 border border-dark-20">
                            <h3 className="text-white font-semibold mb-4 text-sm">Monthly Settled Payouts (₹)</h3>
                            {!monthlyChart.length ? (
                                <div className="h-48 flex items-center justify-center text-grey-60 text-sm">No settlement data yet</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={monthlyChart}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                        <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 10 }} />
                                        <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '8px' }}
                                            formatter={(v: number) => [`₹${v.toFixed(2)}`, 'Amount']} />
                                        <Bar dataKey="amount" fill="#22c55e" radius={[3, 3, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Top creators */}
                        <div className="bg-dark-10 rounded-lg p-5 border border-dark-20">
                            <h3 className="text-white font-semibold mb-4 text-sm">Top Creators by Earnings</h3>
                            {!topCreatorsChart.length ? (
                                <div className="h-48 flex items-center justify-center text-grey-60 text-sm">No data yet</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={topCreatorsChart} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                        <XAxis type="number" tick={{ fill: '#888', fontSize: 10 }} />
                                        <YAxis dataKey="name" type="category" tick={{ fill: '#888', fontSize: 10 }} width={90} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '8px' }}
                                            formatter={(v: number) => [`₹${v.toFixed(2)}`, 'Earned']} />
                                        <Bar dataKey="earned" fill="#e53e3e" radius={[0, 3, 3, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Summary figures */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-dark-10 rounded-lg p-4 border border-dark-20">
                            <p className="text-grey-70 text-sm mb-1">Total Settled to Date</p>
                            <p className="text-3xl font-bold text-green-400">₹{(stats?.amounts?.settled ?? 0).toFixed(2)}</p>
                        </div>
                        <div className="bg-dark-10 rounded-lg p-4 border border-dark-20">
                            <p className="text-grey-70 text-sm mb-1">Pending Payout Liability</p>
                            <p className="text-3xl font-bold text-yellow-400">₹{(stats?.amounts?.pending ?? 0).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Payout Rate Tab ── */}
            {activeTab === 'rate' && (
                <div className="max-w-md">
                    <div className="bg-dark-10 rounded-lg p-5 border border-dark-20">
                        <h3 className="text-white font-semibold mb-1">Current Payout Rate</h3>
                        <p className="text-grey-70 text-sm mb-4">
                            This rate applies to all future payout requests. Existing requests use the rate at time of submission.
                        </p>
                        <div className="bg-dark-8 rounded-lg p-4 border border-dark-20 mb-5">
                            <p className="text-xs text-grey-70 mb-1">Active Rate</p>
                            <p className="text-3xl font-bold text-green-400">₹{rate?.ratePerMinute ?? '—'}<span className="text-grey-70 text-base font-normal"> / min</span></p>
                            <p className="text-grey-60 text-xs mt-1">{rate?.currency ?? 'INR'} · Last updated: {rate?.updatedAt ? new Date(rate.updatedAt).toLocaleDateString() : '—'}</p>
                        </div>

                        <Formik
                            initialValues={{ ratePerMinute: rate?.ratePerMinute ?? 0.1, currency: rate?.currency ?? 'INR' }}
                            enableReinitialize
                            validationSchema={Yup.object({
                                ratePerMinute: Yup.number().min(0, 'Must be ≥ 0').required('Required'),
                            })}
                            onSubmit={async (values, { setSubmitting }) => {
                                try {
                                    await updateRate(values).unwrap();
                                    toast.success('Payout rate updated!');
                                    refetchRate();
                                } catch (err: unknown) {
                                    const error = err as { data?: { message?: string } };
                                    toast.error(error?.data?.message || 'Failed to update rate');
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                        >
                            {({ errors, touched, isSubmitting }) => (
                                <Form className="space-y-4">
                                    <div>
                                        <label className="text-grey-70 text-sm mb-1 block">New Rate (₹ per minute)</label>
                                        <div className="flex items-center space-x-2 bg-dark-15 border border-dark-20 rounded-lg px-3 py-2">
                                            <span className="text-grey-70">₹</span>
                                            <Field name="ratePerMinute" type="number" min="0" step="0.01"
                                                className="flex-1 bg-transparent text-white text-sm focus:outline-none" />
                                            <span className="text-grey-70 text-xs">/ min</span>
                                        </div>
                                        {errors.ratePerMinute && touched.ratePerMinute && (
                                            <p className="text-red-400 text-xs mt-1">{errors.ratePerMinute as string}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-grey-70 text-sm mb-1 block">Currency</label>
                                        <Field as="select" name="currency"
                                            className="w-full bg-dark-15 text-white px-3 py-2 rounded-lg text-sm border border-dark-20 focus:outline-none focus:ring-1 focus:ring-red-45">
                                            <option value="INR">INR</option>
                                            <option value="USD">USD</option>
                                        </Field>
                                    </div>
                                    <button type="submit" disabled={isSubmitting}
                                        className="w-full bg-red-45 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-60 disabled:opacity-60">
                                        {isSubmitting ? 'Saving...' : 'Update Rate'}
                                    </button>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {detailModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-8 rounded-xl p-6 max-w-lg w-full border border-dark-20 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-white">Request Detail</h2>
                            <button onClick={() => setDetailModal(null)} className="text-grey-70 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    ['Creator', detailModal.creatorId?.name],
                                    ['Email', detailModal.creatorId?.email],
                                    ['Status', detailModal.status],
                                    ['Amount', `₹${detailModal.totalAmount?.toFixed(2)}`],
                                    ['Watch Time', `${detailModal.totalWatchMinutes?.toFixed(1)} min`],
                                    ['Rate Used', `₹${detailModal.ratePerMinute}/min`],
                                    ['Method', detailModal.paymentMethod],
                                    ['Payment Details', detailModal.paymentDetails],
                                ].map(([label, val]) => (
                                    <div key={label}>
                                        <p className="text-grey-70 text-xs">{label}</p>
                                        <p className="text-white">{val}</p>
                                    </div>
                                ))}
                            </div>
                            {detailModal.adminNote && (
                                <div className="bg-dark-10 rounded p-3 border border-dark-20">
                                    <p className="text-xs text-grey-70 mb-1">Admin Note</p>
                                    <p className="text-white text-sm">{detailModal.adminNote}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-grey-70 text-xs mb-2">Video Breakdown (paid/rent only)</p>
                                <div className="space-y-1">
                                    {detailModal.videoBreakdown?.map((v: { videoId: string; title: string; watchMinutes: number }) => (
                                        <div key={String(v.videoId)} className="flex justify-between bg-dark-10 rounded px-3 py-2">
                                            <span className="text-white text-xs">{v.title}</span>
                                            <span className="text-grey-70 text-xs">{v.watchMinutes.toFixed(1)} min</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-8 rounded-xl p-6 max-w-md w-full border border-dark-20">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-white">Reject Payout</h2>
                            <button onClick={() => setRejectModal(null)} className="text-grey-70 hover:text-white">✕</button>
                        </div>
                        <p className="text-grey-70 text-sm mb-4">
                            Rejecting ₹{rejectModal.totalAmount?.toFixed(2)} for <span className="text-white">{rejectModal.creatorId?.name}</span>.
                            The creator will see your note.
                        </p>
                        <Formik
                            initialValues={{ adminNote: '' }}
                            validationSchema={rejectSchema}
                            onSubmit={handleReject}
                        >
                            {({ errors, touched, isSubmitting }) => (
                                <Form className="space-y-4">
                                    <div>
                                        <label className="text-grey-70 text-sm mb-1 block">Rejection Reason</label>
                                        <Field as="textarea" name="adminNote" rows={3} placeholder="e.g. Watch time could not be verified..."
                                            className="w-full bg-dark-10 text-white px-3 py-2 rounded-lg text-sm border border-dark-20 focus:outline-none focus:ring-1 focus:ring-red-45" />
                                        {errors.adminNote && touched.adminNote && (
                                            <p className="text-red-400 text-xs mt-1">{errors.adminNote}</p>
                                        )}
                                    </div>
                                    <div className="flex space-x-3">
                                        <button type="button" onClick={() => setRejectModal(null)}
                                            className="flex-1 bg-dark-15 text-grey-70 px-4 py-2 rounded-lg text-sm hover:text-white">Cancel</button>
                                        <button type="submit" disabled={isSubmitting}
                                            className="flex-1 bg-red-45 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-60 disabled:opacity-60">
                                            {isSubmitting ? 'Rejecting...' : 'Reject Payout'}
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            )}
        </div>
    );
}
