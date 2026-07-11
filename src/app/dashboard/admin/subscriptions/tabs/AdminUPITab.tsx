'use client';

import { useState } from 'react';
import { 
  useGetAllUpisQuery, 
  useCreateUpiMutation, 
  useToggleUpiMutation, 
  useDeleteUpiMutation 
} from '../../../../store/api/paymentApi';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { CheckIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function AdminUPITab() {
  const { data: upis = [], isLoading } = useGetAllUpisQuery();
  const [createUpi, { isLoading: isCreating }] = useCreateUpiMutation();
  const [toggleUpi] = useToggleUpiMutation();
  const [deleteUpi] = useDeleteUpiMutation();

  const [newUpiId, setNewUpiId] = useState('');

  const handleAddUpi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpiId.trim()) return;
    try {
      await createUpi({ upiId: newUpiId.trim() }).unwrap();
      toast.success('UPI ID added successfully!');
      setNewUpiId('');
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || 'Failed to add UPI ID');
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleUpi(id).unwrap();
      toast.success(`UPI marked as ${!currentStatus ? 'Active' : 'Inactive'}`);
    } catch (err: unknown) {
      toast.error('Failed to toggle UPI status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this UPI ID?')) return;
    try {
      await deleteUpi(id).unwrap();
      toast.success('UPI ID deleted');
    } catch (err: unknown) {
      toast.error('Failed to delete UPI ID');
    }
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-dark-20 rounded w-1/4"></div>
      <div className="h-40 bg-dark-20 rounded w-full"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary">Manage UPI Accounts</h2>
          <p className="text-sm text-grey-60">Add and manage active UPI IDs for users to send subscription payments.</p>
        </div>
        <form onSubmit={handleAddUpi} className="flex gap-2">
          <input
            type="text"
            value={newUpiId}
            onChange={(e) => setNewUpiId(e.target.value)}
            placeholder="e.g. streaming@ybl"
            className="bg-dark-15 text-primary text-sm rounded-lg px-4 py-2 border border-dark-20 focus:outline-none focus:ring-1 focus:ring-red-45"
            required
          />
          <button
            type="submit"
            disabled={isCreating}
            className="bg-red-45 hover:bg-red-55 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {isCreating ? 'Adding...' : 'Add UPI'}
          </button>
        </form>
      </div>

      {upis.length === 0 ? (
        <div className="text-center py-10 bg-dark-12 rounded-xl border border-dark-20">
          <p className="text-grey-60">No UPI accounts added yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-dark-20">
                <th className="py-3 px-4 text-xs font-medium text-grey-50 uppercase tracking-wider">UPI ID</th>
                <th className="py-3 px-4 text-xs font-medium text-grey-50 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-medium text-grey-50 uppercase tracking-wider">Added By</th>
                <th className="py-3 px-4 text-xs font-medium text-grey-50 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-xs font-medium text-grey-50 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-20">
              {upis.map((upi) => (
                <tr key={upi._id} className="hover:bg-dark-15/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="text-sm font-semibold text-primary">{upi.upiId}</span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggle(upi._id, upi.isActive)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        upi.isActive 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' 
                          : 'bg-dark-20 text-grey-60 border-dark-25 hover:bg-dark-25'
                      }`}
                    >
                      {upi.isActive ? (
                        <><CheckIcon className="w-3.5 h-3.5" /> Active</>
                      ) : (
                        <><XMarkIcon className="w-3.5 h-3.5" /> Inactive</>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-primary">{upi.createdBy?.name || 'System Admin'}</span>
                      <span className="text-xs text-grey-60">{upi.createdBy?.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-grey-60">
                      {format(new Date(upi.createdAt), 'MMM d, yyyy')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(upi._id)}
                      className="text-grey-60 hover:text-red-45 p-1.5 rounded-lg hover:bg-red-45/10 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
