'use client';

import { useState } from 'react';
import {
    useAdminGetSubscriptionsQuery,
    useAdminGrantSubscriptionMutation,
    useAdminGetPlansQuery,
    Plan
} from '../../../../store/api/subscriptionApi';
import toast from 'react-hot-toast';
import SelectWithSearch from '../../../../components/ui/SelectWithSearch';

export default function AdminSubscribersTab() {
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState('active'); // active, expired, cancelled, all

    const { data: plansData = [] } = useAdminGetPlansQuery();
    const { data: subsData, isLoading, refetch } = useAdminGetSubscriptionsQuery({ page, limit: 15, status: filter === 'all' ? undefined : filter });
    const [grantSub, { isLoading: isGranting }] = useAdminGrantSubscriptionMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [grantForm, setGrantForm] = useState({ userId: '', planId: '' });

    const handleGrant = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!grantForm.userId || !grantForm.planId) {
            toast.error('User ID and Plan are required');
            return;
        }
        try {
            await grantSub({ userId: grantForm.userId, planId: grantForm.planId, note: 'Granted via Superadmin panel' }).unwrap();
            toast.success('Subscription granted successfully');
            setIsModalOpen(false);
            refetch();
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            toast.error(error?.data?.message || 'Failed to grant subscription');
        }
    };

    if (isLoading) return <div className="text-center py-10 text-grey-60">Loading subscriptions...</div>;

    const subscriptions = subsData?.subscriptions || [];

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-white">Subscribers List</h2>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-dark-15 border border-dark-25 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-45"
                    >
                        <option value="active">Active Only</option>
                        <option value="expired">Expired</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="all">All Subscriptions</option>
                    </select>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-dark-20 border border-dark-25 hover:bg-dark-30 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                    >
                        Grant Access Manually
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-dark-25">
                <table className="w-full text-left text-sm text-grey-70">
                    <thead className="bg-dark-15 text-xs uppercase text-grey-50">
                        <tr>
                            <th className="px-6 py-4 font-medium">User Details</th>
                            <th className="px-6 py-4 font-medium">Plan</th>
                            <th className="px-6 py-4 font-medium">Status & Dates</th>
                            <th className="px-6 py-4 font-medium">Payment</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-25">
                        {subscriptions.map((sub) => (
                            <tr key={sub._id} className="hover:bg-dark-12 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-white">{typeof sub.userId === 'object' ? sub.userId?.name : 'User'}</div>
                                    <div className="text-xs text-grey-60">{typeof sub.userId === 'object' ? sub.userId?.email : sub.userId}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-red-45/10 text-red-55 border border-red-45/20">
                                        {typeof sub.planId === 'object' ? sub.planId?.name : 'Plan'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`h-2 w-2 rounded-full ${sub.status === 'active' ? 'bg-green-500' : sub.status === 'cancelled' ? 'bg-red-500' : 'bg-grey-50'}`} />
                                        <span className="text-white capitalize">{sub.status}</span>
                                    </div>
                                    <div className="text-xs text-grey-60">
                                        {new Date(sub.startDate).toLocaleDateString()} - {new Date(sub.endDate).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-white font-medium">
                                        {typeof sub.planId === 'object' ? sub.planId?.currency : 'INR'} {sub.finalAmountPaid}
                                    </div>
                                    <div className="text-[10px] text-grey-60 uppercase mt-0.5">
                                        {sub.paymentDetails?.paymentMethod} • {sub.paymentDetails?.transactionId?.slice(-6) || 'N/A'}
                                    </div>
                                    {sub.promoCode && (
                                        <div className="text-[10px] text-green-45 mt-0.5 font-bold">PROMO: {sub.promoCode}</div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {subscriptions.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-grey-50">
                                    No subscriptions found matching the filter.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {subsData && subsData.totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-3 py-1 bg-dark-15 rounded text-white disabled:opacity-50"
                    >Prev</button>
                    <span className="px-3 py-1 text-grey-60">Page {page} of {subsData.totalPages}</span>
                    <button
                        disabled={page === subsData.totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-3 py-1 bg-dark-15 rounded text-white disabled:opacity-50"
                    >Next</button>
                </div>
            )}

            {/* Grant Access Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-dark-10 border border-dark-25 rounded-2xl w-full max-w-md">
                        <div className="p-6 border-b border-dark-25 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Manually Grant Access</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-grey-50 hover:text-white">&times;</button>
                        </div>
                        <form onSubmit={handleGrant} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-grey-70 mb-1">Select User</label>
                                <SelectWithSearch
                                    endpoint="/user/search"
                                    value={grantForm.userId ? { value: grantForm.userId, label: grantForm.userId } : null}
                                    onChange={(selected: { value: string; label: string } | null) => setGrantForm({ ...grantForm, userId: selected?.value || '' })}
                                    placeholder="Search by name or email..."
                                    className="text-black"
                                />
                                <p className="text-[10px] text-grey-60 mt-1">Search through all users in the system.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-grey-70 mb-1">Select Plan</label>
                                <select required value={grantForm.planId} onChange={(e) => setGrantForm({ ...grantForm, planId: e.target.value })} className="w-full bg-dark-15 border border-dark-25 rounded-lg px-3 py-2 text-white">
                                    <option value="" disabled>Select a plan...</option>
                                    {plansData.filter((p: Plan) => p.isActive).map((plan: Plan) => (
                                        <option key={plan._id} value={plan._id}>{plan.name} ({plan.validityDays} days)</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-dark-25">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-dark-20 text-white rounded-lg hover:bg-dark-25">Cancel</button>
                                <button type="submit" disabled={isGranting} className="px-4 py-2 bg-red-45 text-white rounded-lg hover:bg-red-55 disabled:opacity-50">
                                    {isGranting ? 'Granting...' : 'Grant Access'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
