'use client';

import { useState } from 'react';
import {
    useAdminGetPromosQuery,
    useCreatePromoMutation,
    useUpdatePromoMutation,
    useTogglePromoMutation,
    useAdminGetPlansQuery
} from '../../../../store/api/subscriptionApi';
import toast from 'react-hot-toast';
import { PlusIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

export default function AdminPromosTab() {
    const [page, setPage] = useState(1);
    const { data: plansData = [] } = useAdminGetPlansQuery();
    const { data: promosData, isLoading } = useAdminGetPromosQuery({ page, limit: 10 });
    const [createPromo] = useCreatePromoMutation();
    const [updatePromo] = useUpdatePromoMutation();
    const [togglePromo] = useTogglePromoMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<any | null>(null);

    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percent',
        discountValue: '',
        applicablePlans: [] as string[],
        validFrom: '',
        validUntil: '',
        maxUses: '0',
    });

    const handleOpenModal = (promo?: any) => {
        if (promo) {
            setEditingPromo(promo);
            setFormData({
                code: promo.code,
                discountType: promo.discountType,
                discountValue: promo.discountValue.toString(),
                applicablePlans: promo.applicablePlans.map((p: any) => typeof p === 'string' ? p : p._id),
                validFrom: new Date(promo.validFrom).toISOString().split('T')[0],
                validUntil: promo.validUntil ? new Date(promo.validUntil).toISOString().split('T')[0] : '',
                maxUses: promo.maxUses.toString(),
            });
        } else {
            setEditingPromo(null);
            setFormData({
                code: '', discountType: 'percent', discountValue: '',
                applicablePlans: [], validFrom: new Date().toISOString().split('T')[0],
                validUntil: '', maxUses: '0',
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            discountValue: parseFloat(formData.discountValue),
            maxUses: parseInt(formData.maxUses),
            applicablePlans: formData.applicablePlans.includes('all') ? [] : formData.applicablePlans
        };

        try {
            if (editingPromo) {
                await updatePromo({ id: editingPromo._id, data: payload }).unwrap();
                toast.success('Promo updated');
            } else {
                await createPromo(payload).unwrap();
                toast.success('Promo created');
            }
            setIsModalOpen(false);
        } catch (err: any) {
            toast.error(err?.data?.message || 'Operation failed');
        }
    };

    const handleToggle = async (promo: any) => {
        try {
            await togglePromo(promo._id).unwrap();
            toast.success(`Promo ${promo.isActive ? 'deactivated' : 'activated'}`);
        } catch (err: any) {
            toast.error(err?.data?.message || 'Toggle failed');
        }
    };

    if (isLoading) return <div className="text-center py-10 text-grey-60">Loading promo codes...</div>;

    const promos = promosData?.promos || [];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Promo Codes</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-red-45 hover:bg-red-55 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <PlusIcon className="w-5 h-5" /> Add Promo
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-dark-25">
                <table className="w-full text-left text-sm text-grey-70">
                    <thead className="bg-dark-15 text-xs uppercase text-grey-50">
                        <tr>
                            <th className="px-6 py-4 font-medium">Code</th>
                            <th className="px-6 py-4 font-medium">Discount</th>
                            <th className="px-6 py-4 font-medium">Usage</th>
                            <th className="px-6 py-4 font-medium">Status / Validity</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-25">
                        {promos.map((promo: any) => (
                            <tr key={promo._id} className="hover:bg-dark-12 transition-colors">
                                <td className="px-6 py-4 font-bold text-white uppercase tracking-wider">{promo.code}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-dark-25 text-white">
                                        {promo.discountType === 'percent' ? `${promo.discountValue}% OFF` : `FLAT ${promo.discountValue} OFF`}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-white font-medium">{promo.usedCount} <span className="text-grey-50 font-normal">uses</span></div>
                                    {promo.maxUses > 0 && <div className="text-xs text-grey-60">Limit: {promo.maxUses}</div>}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleToggle(promo)}
                                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${promo.isActive ? 'bg-green-500' : 'bg-dark-25'}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${promo.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </button>
                                        <div className="text-xs text-grey-60 uppercase">
                                            Ex: {promo.validUntil ? new Date(promo.validUntil).toLocaleDateString() : 'Never'}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleOpenModal(promo)} className="text-grey-50 hover:text-white transition-colors">
                                        <PencilSquareIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {promos.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-grey-50">
                                    No promo codes found. Create a campaign to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-dark-10 border border-dark-25 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-dark-25 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">{editingPromo ? 'Edit Promo Code' : 'Create Promo Code'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-grey-50 hover:text-white">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-grey-70 mb-1">Promo Code</label>
                                <input required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="w-full bg-dark-15 border border-dark-25 rounded-lg px-3 py-2 text-white uppercase" placeholder="SUMMER50" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-grey-70 mb-1">Discount Type</label>
                                    <select value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value })} className="w-full bg-dark-15 border border-dark-25 rounded-lg px-3 py-2 text-white">
                                        <option value="percent">Percentage (%)</option>
                                        <option value="flat">Flat Amount</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-grey-70 mb-1">Discount Value</label>
                                    <input required type="number" min="0" step="0.01" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })} className="w-full bg-dark-15 border border-dark-25 rounded-lg px-3 py-2 text-white" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-grey-70 mb-1">Applicable Plans</label>
                                <select multiple value={formData.applicablePlans} onChange={(e) => {
                                    const options = Array.from(e.target.options);
                                    if (options.find(o => o.value === 'all' && o.selected)) {
                                        setFormData({ ...formData, applicablePlans: ['all'] });
                                        return;
                                    }
                                    setFormData({ ...formData, applicablePlans: options.filter(o => o.selected).map(o => o.value).filter(v => v !== 'all') });
                                }} className="w-full bg-dark-15 border border-dark-25 rounded-lg px-3 py-2 text-white h-24">
                                    <option value="all">All Plans</option>
                                    {plansData.map((plan: any) => (
                                        <option key={plan._id} value={plan._id}>{plan.name} ({plan.currency} {plan.price})</option>
                                    ))}
                                </select>
                                <p className="text-xs text-grey-60 mt-1">Hold Cmd/Ctrl to select multiple</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-grey-70 mb-1">Valid From</label>
                                    <input required type="date" value={formData.validFrom} onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })} className="w-full bg-dark-15 border border-dark-25 rounded-lg px-3 py-2 text-white [&::-webkit-calendar-picker-indicator]:invert" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-grey-70 mb-1">Valid Until (Optional)</label>
                                    <input type="date" value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} className="w-full bg-dark-15 border border-dark-25 rounded-lg px-3 py-2 text-white [&::-webkit-calendar-picker-indicator]:invert" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-grey-70 mb-1">Max Uses (0 = Unlimited)</label>
                                <input required type="number" min="0" value={formData.maxUses} onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })} className="w-full bg-dark-15 border border-dark-25 rounded-lg px-3 py-2 text-white" />
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-dark-25">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-dark-20 text-white rounded-lg hover:bg-dark-25">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-red-45 text-white rounded-lg hover:bg-red-55">{editingPromo ? 'Save Changes' : 'Create Promo'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
