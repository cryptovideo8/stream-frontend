'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useAdminGetVerificationDocsQuery,
  useAdminUpdateVerificationDocMutation,
} from '../../../store/api/verificationApi';

export default function AdminVerificationPage() {
  const [status, setStatus] = useState('pending');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const { data, isLoading, refetch } = useAdminGetVerificationDocsQuery({ status });
  const [updateDoc, { isLoading: updating }] = useAdminUpdateVerificationDocMutation();

  const handle = async (id: string, next: 'approved' | 'rejected') => {
    try {
      await updateDoc({ id, status: next, adminNotes: notes[id] }).unwrap();
      toast.success(`Marked ${next}`);
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
          <h1 className="text-2xl font-bold text-primary">Creator verification</h1>
          <p className="text-sm text-grey-60 mt-1">Review 2257 / ID documents from creators.</p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-dark-12 border border-dark-25 rounded-lg px-3 py-2 text-sm text-primary"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-grey-60 py-20 text-center">Loading…</div>
      ) : !data?.docs?.length ? (
        <div className="text-grey-60 py-20 text-center border border-dark-25 rounded-xl bg-dark-10">
          No documents in this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {data.docs.map((d) => {
            const user =
              typeof d.userId === 'object' && d.userId
                ? d.userId.email || d.userId.name
                : String(d.userId);
            return (
              <div key={d._id} className="bg-dark-10 border border-dark-25 rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-primary font-semibold">{d.docType}</span>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-dark-20 text-grey-60">
                    {d.status}
                  </span>
                </div>
                <p className="text-xs text-grey-60 mb-2">
                  Creator: {user} · {new Date(d.createdAt).toLocaleString()}
                </p>
                <a
                  href={d.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-red-45 hover:underline"
                >
                  Open document
                </a>
                <textarea
                  className="mt-3 w-full bg-dark-15 border border-dark-25 rounded-lg px-3 py-2 text-sm text-primary"
                  rows={2}
                  placeholder="Admin notes"
                  value={notes[d._id] ?? d.adminNotes ?? ''}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [d._id]: e.target.value }))}
                />
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handle(d._id, 'approved')}
                    className="px-3 py-1.5 text-xs rounded-lg bg-red-45 text-white"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handle(d._id, 'rejected')}
                    className="px-3 py-1.5 text-xs rounded-lg border border-dark-25 text-grey-70"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
