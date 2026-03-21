'use client';
import { useState } from 'react';
import { 
  useGetAllAuditsQuery,
  useApproveAuditMutation,
  useRejectAuditMutation,
  useGetAllUpisQuery
} from '../../../../store/api/paymentApi';
import { useGetAllUsersQuery } from '../../../../store/api/userApi';
import { toast } from 'react-hot-toast';
import { format, subMonths, startOfDay, endOfDay } from 'date-fns';
import { CheckCircleIcon, XCircleIcon, ClockIcon, FunnelIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import SelectWithSearch from '../../../../components/ui/SelectWithSearch';

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected'] as const;

export default function AdminPaymentAuditsTab() {
  const [filterStatus, setFilterStatus] = useState<typeof STATUS_TABS[number]>('all');
  const [selectedUser, setSelectedUser] = useState<{ value: string; label: string } | null>(null);
  const [upiId, setUpiId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Queries
  const queryParams = {
    ...(filterStatus !== 'all' && { status: filterStatus }),
    ...(selectedUser?.value && { userId: selectedUser.value }),
    ...(upiId && { upiId }),
    ...(startDate && { startDate: startOfDay(new Date(startDate)).toISOString() }),
    ...(endDate && { endDate: endOfDay(new Date(endDate)).toISOString() }),
  };
  
  const { data: audits = [], isLoading } = useGetAllAuditsQuery(queryParams);
  const { data: upis = [] } = useGetAllUpisQuery();

  const [approveAudit, { isLoading: isApproving }] = useApproveAuditMutation();
  const [rejectAudit, { isLoading: isRejecting }] = useRejectAuditMutation();

  const clearFilters = () => {
    setSelectedUser(null);
    setUpiId('');
    setStartDate('');
    setEndDate('');
    setFilterStatus('all');
  };

  const handleApprove = async (id: string, utr: string) => {
    if (!window.confirm(`Are you sure you want to approve UTR ${utr}? The user's subscription will be activated instantly.`)) return;
    try {
      await approveAudit(id).unwrap();
      toast.success('Payment approved and subscription activated.');
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || 'Failed to approve payment.');
    }
  };

  const handleReject = async (id: string, utr: string) => {
    const remarks = window.prompt(`Rejection reason for UTR ${utr}:`, 'Invalid UTR details or money not received.');
    if (remarks === null) return; // User cancelled prompt
    
    try {
      await rejectAudit({ id, remarks }).unwrap();
      toast.success('Payment audit rejected.');
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || 'Failed to reject payment.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20"><CheckCircleIcon className="w-4 h-4" /> Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20"><XCircleIcon className="w-4 h-4" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"><ClockIcon className="w-4 h-4" /> Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setShowFilters(!showFilters)}
             className={`p-2 rounded-lg border transition-all ${showFilters ? 'bg-red-45 border-red-45 text-white' : 'bg-dark-15 border-dark-25 text-grey-60 hover:text-white'}`}
             title="Toggle Filters"
           >
             <FunnelIcon className="w-5 h-5" />
           </button>
           <div className="flex bg-dark-15 p-1 rounded-lg">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                  filterStatus === tab
                    ? 'bg-red-45 text-white shadow'
                    : 'text-grey-60 hover:text-white hover:bg-dark-20'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
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

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-dark-20 rounded w-full mb-2"></div>
          {Array.from({ length: 5 }).map((_, i) => (
             <div key={i} className="h-16 bg-dark-20 rounded w-full"></div>
          ))}
        </div>
      ) : audits.length === 0 ? (
        <div className="text-center py-12 bg-dark-12 rounded-xl border border-dark-20">
          <p className="text-grey-60 text-lg">No payment audits found for status: {filterStatus}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-dark-20">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-dark-12 border-b border-dark-20">
                <th className="py-3 px-4 text-xs font-semibold text-grey-50 uppercase tracking-wider">User</th>
                <th className="py-3 px-4 text-xs font-semibold text-grey-50 uppercase tracking-wider">Plan / Amount</th>
                <th className="py-3 px-4 text-xs font-semibold text-grey-50 uppercase tracking-wider">UTR Output</th>
                <th className="py-3 px-4 text-xs font-semibold text-grey-50 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-grey-50 uppercase tracking-wider">Submitted</th>
                <th className="py-3 px-4 text-xs font-semibold text-grey-50 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-20 bg-dark-10">
              {audits.map((audit) => (
                <tr key={audit._id} className="hover:bg-dark-15 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{audit.userId?.name || 'Unknown'}</span>
                      <span className="text-xs text-grey-60">{audit.userId?.email || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-red-400">{audit.planId?.name}</span>
                      <span className="text-xs text-grey-60">₹{audit.amount}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-mono text-white tracking-widest">{audit.utrNumber}</span>
                      <span className="text-[11px] text-grey-60">To: {audit.upiIdUsed}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(audit.status)}
                    {audit.status === 'rejected' && audit.remarks && (
                      <div className="mt-1 text-[10px] text-red-400 max-w-[150px] truncate" title={audit.remarks}>
                        Reason: {audit.remarks}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-grey-60">
                      {format(new Date(audit.createdAt), 'MMM d, yyyy HH:mm')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {audit.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(audit._id, audit.utrNumber)}
                          disabled={isApproving || isRejecting}
                          className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg text-xs font-medium transition-colors border border-green-500/20 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(audit._id, audit.utrNumber)}
                          disabled={isApproving || isRejecting}
                          className="px-3 py-1.5 bg-dark-20 hover:bg-dark-25 text-red-400 rounded-lg text-xs font-medium transition-colors border border-dark-25 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-grey-60 italic">
                        By {audit.approvedBy?.name || 'Admin'}
                      </span>
                    )}
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
