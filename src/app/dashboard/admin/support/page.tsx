'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useGetAllTicketsQuery,
  useAdminUpdateTicketMutation,
  SupportTicket,
} from '../../../store/api/supportApi';

function userLabel(t: SupportTicket) {
  if (typeof t.userId === 'object' && t.userId) {
    return t.userId.email || t.userId.name || t.userId._id;
  }
  return String(t.userId || '—');
}

export default function AdminSupportPage() {
  const [status, setStatus] = useState('open');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const { data: tickets = [], isLoading, refetch } = useGetAllTicketsQuery({ status });
  const [updateTicket, { isLoading: updating }] = useAdminUpdateTicketMutation();

  const handleUpdate = async (id: string, nextStatus: string) => {
    try {
      await updateTicket({ id, status: nextStatus, adminNotes: notes[id] }).unwrap();
      toast.success('Ticket updated');
      refetch();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Support inbox</h1>
          <p className="text-sm text-grey-60 mt-1">Review and update user support tickets.</p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-dark-12 border border-dark-25 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="open">Open</option>
          <option value="in-progress">In progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
          <option value="all">All</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-grey-60 py-20 text-center">Loading…</div>
      ) : !tickets.length ? (
        <div className="text-grey-60 py-20 text-center border border-dark-25 rounded-xl bg-dark-10">
          No tickets in this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => (
            <div key={t._id} className="bg-dark-10 border border-dark-25 rounded-xl p-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h2 className="text-white font-semibold">{t.subject}</h2>
                <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-dark-20 text-grey-60">
                  {t.status}
                </span>
                <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-dark-20 text-grey-60">
                  {t.priority}
                </span>
              </div>
              <p className="text-sm text-grey-70 whitespace-pre-wrap mb-3">{t.message}</p>
              <p className="text-xs text-grey-60 mb-3">
                From: {userLabel(t)} · {new Date(t.createdAt).toLocaleString()}
              </p>
              <textarea
                className="w-full bg-dark-15 border border-dark-25 rounded-lg px-3 py-2 text-sm text-white mb-3"
                rows={2}
                placeholder="Admin notes"
                value={notes[t._id] ?? t.adminNotes ?? ''}
                onChange={(e) => setNotes((prev) => ({ ...prev, [t._id]: e.target.value }))}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleUpdate(t._id, 'in-progress')}
                  className="px-3 py-1.5 text-xs rounded-lg border border-dark-25 text-grey-70 hover:text-white"
                >
                  In progress
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleUpdate(t._id, 'resolved')}
                  className="px-3 py-1.5 text-xs rounded-lg bg-red-45 text-white hover:bg-red-55"
                >
                  Resolve
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleUpdate(t._id, 'closed')}
                  className="px-3 py-1.5 text-xs rounded-lg border border-dark-25 text-grey-70 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
