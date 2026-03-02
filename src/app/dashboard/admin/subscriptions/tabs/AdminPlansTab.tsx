'use client';

import { useState } from 'react';
import {
    useAdminGetPlansQuery,
    useCreatePlanMutation,
    useUpdatePlanMutation,
    useTogglePlanMutation,
    useDeletePlanMutation,
    Plan
} from '../../../../store/api/subscriptionApi';
import toast from 'react-hot-toast';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function AdminPlansTab() {
    const { data: plans = [], isLoading } = useAdminGetPlansQuery();
    const [createPlan] = useCreatePlanMutation();
    const [updatePlan] = useUpdatePlanMutation();
    const [togglePlan] = useTogglePlanMutation();
    const [deletePlan] = useDeletePlanMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        currency: 'INR',
        validity: '1',
        features: '',
        highlight: false,
        sortOrder: 0,
        maxScreens: 1,
    });

    const handleOpenModal = (plan?: Plan) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData({
                name: plan.name,
                description: plan.description || '',
                price: plan.price.toString(),
                currency: plan.currency,
                validity: plan.validity.toString(),
                features: plan.features.join('\n'),
                highlight: plan.highlight,
                sortOrder: plan.sortOrder,
                maxScreens: plan.maxScreens,
            });
        } else {
            setEditingPlan(null);
            setFormData({
                name: '', description: '', price: '', currency: 'INR', validity: '1',
                features: '', highlight: false, sortOrder: 0, maxScreens: 1,
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            price: parseFloat(formData.price),
            validity: parseInt(formData.validity),
            sortOrder: parseInt(formData.sortOrder.toString()),
            maxScreens: parseInt(formData.maxScreens.toString()),
            features: formData.features.split('\n').map(f => f.trim()).filter(f => f),
        };

        try {
            if (editingPlan) {
                await updatePlan({ id: editingPlan._id, data: payload }).unwrap();
                toast.success('Plan updated');
            } else {
                await createPlan(payload).unwrap();
                toast.success('Plan created');
            }
            setIsModalOpen(false);
        } catch (err: any) {
            toast.error(err?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (plan: Plan) => {
        if (!confirm(`Delete plan ${plan.name}? This will fail if there are active subscribers.`)) return;
        try {
            await deletePlan(plan._id).unwrap();
            toast.success('Plan deleted');
        } catch (err: any) {
            toast.error(err?.data?.message || 'Deletion failed');
        }
    };

    const handleToggle = async (plan: Plan) => {
        try {
            await togglePlan(plan._id).unwrap();
            toast.success(`Plan ${plan.isActive ? 'deactivated' : 'activated'}`);
        } catch (err: any) {
            toast.error(err?.data?.message || 'Toggle failed');
        }
    };

    if (isLoading) return <div className="text-center py-10 text-grey-60">Loading plans...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Subscription Plans</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-red-45 hover:bg-red-55 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <PlusIcon className="w-5 h-5" /> Add Plan
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-dark-25">
                <table className="w-full text-left text-sm text-grey-70">
                    <thead className="bg-dark-15 text-xs uppercase text-grey-50">
                        <tr>
                            <th className="px-6 py-4 font-medium">Plan Name</th>
                            <th className="px-6 py-4 font-medium">Price</th>
                            <th className="px-6 py-4 font-medium">Validity</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-25">
                        {plans.map((plan) => (
                            <tr key={plan._id} className="hover:bg-dark-12 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-white flex items-center gap-2">
                                        {plan.name}
                                        {plan.highlight && (
                                            <span className="px-2 py-0.5 bg-red-45/20 text-red-45 text-[10px] uppercase font-bold rounded">Popular</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-grey-50 mt-1">{plan.features.length} features configured</div>
                                </td>
                                <td className="px-6 py-4 font-medium text-white">
                                    {plan.currency} {plan.price}
                                </td>
                                <td className="px-6 py-4">
                                    {plan.validity} months <span className="text-grey-50 text-xs">({plan.validityDays} days)</span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleToggle(plan)}
                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${plan.isActive ? 'bg-green-500' : 'bg-dark-25'}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${plan.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-3">
                                        <button onClick={() => handleOpenModal(plan)} className="text-grey-50 hover:text-white transition-colors">
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(plan)} className="text-grey-50 hover:text-red-45 transition-colors">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {plans.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-grey-50">
                                    No plans found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-dark-10 border border-dark-25 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-dark-25 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">{editingPlan ? 'Edit Plan' : 'Create Plan'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-grey-50 hover:text-white">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-grey-70 mb-1">Plan Name</label>
                                    <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-dark-15 border border-dark-25 rounded-lg px-3 py-2 text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-grey-70 mb-1">Price</label>
                                    <div className="flex gap-2">
                                        <input className="w-20 bg-dark-15 border border-dark-25 rounded-lg px-3 py-2 text-white" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })} />
                                        <input required type="number" min="0" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="flex-1 bg-dark-15 border border-dark-25 rounded-lg px-3 py-2 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-grey-70 mb-1">Validity (Months)</label>
                                <input required type="number" min="1" value={formData.validity} onChange={(e) => setFormData({ ...formData, validity: e.target.value })} className="w-full bg-dark-15 border border-dark-25 rounded-lg px-3 py-2 text-white" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-grey-70 mb-1">Description</label>
                                <input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-dark-15 border border-dark-25 rounded-lg px-3 py-2 text-white" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-grey-70 mb-1">Features (One per line)</label>
                                <textarea rows={4} value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} placeholder="4K Ultra HD Streaming&#10;Watch on 4 Devices&#10;Ad-Free Experience" className="w-full bg-dark-15 border border-dark-25 rounded-lg px-3 py-2 text-white whitespace-pre-wrap" />
                            </div>

                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={formData.highlight} onChange={(e) => setFormData({ ...formData, highlight: e.target.checked })} className="rounded border-dark-25 bg-dark-15 text-red-45 focus:ring-red-45" />
                                    <span className="text-sm text-grey-70">Mark as Most Popular</span>
                                </label>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-dark-25">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-dark-20 text-white rounded-lg hover:bg-dark-25">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-red-45 text-white rounded-lg hover:bg-red-55">{editingPlan ? 'Save Changes' : 'Create Plan'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
