'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  useAdminGetReportsQuery,
  useAdminUpdateReportMutation,
} from '../../../store/api/interactionApi';

export default function AdminModerationPage() {
  const [status, setStatus] = useState('open');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const { data, isLoading, refetch } = useAdminGetReportsQuery({ status, page: 1, limit: 50 });
  const [updateReport, { isLoading: updating }] = useAdminUpdateReportMutation();

  const handleUpdate = async (
    id: string,
    body: { status?: string; adminNotes?: string; deactivateVideo?: boolean }
  ) => {
    try {
      await updateReport({ id, adminNotes: notes[id], ...body }).unwrap();
      toast.success('Report updated');
      refetch();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Content moderation</h1>
          <p className="text-sm text-grey-60 mt-1">Review user reports and deactivate violating videos.</p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-dark-12 border border-dark-25 rounded-lg px-3 py-2 text-sm text-primary"
        >
          <option value="open">Open</option>
          <option value="actioned">Actioned</option>
          <option value="dismissed">Dismissed</option>
          <option value="all">All</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-grey-60 py-20 text-center">Loading reports…</div>
      ) : !data?.reports?.length ? (
        <div className="text-grey-60 py-20 text-center border border-dark-25 rounded-xl bg-dark-10">
          No reports in this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {data.reports.map((r) => (
            <div key={r._id} className="bg-dark-10 border border-dark-25 rounded-xl p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {r.videoId?.thumbnailPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.videoId.thumbnailPath}
                    alt=""
                    className="w-full md:w-40 aspect-video object-cover rounded-lg bg-dark-15"
                  />
                ) : (
                  <div className="w-full md:w-40 aspect-video rounded-lg bg-dark-15" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-primary font-semibold truncate">
                      {r.videoId?.title || 'Deleted / unknown video'}
                    </h2>
                    <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-dark-20 text-grey-60">
                      {r.status}
                    </span>
                    {r.videoId?.isActive === false && (
                      <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-red-45/20 text-red-45">
                        Deactivated
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-grey-60 mb-2">
                    Reason: <span className="text-primary">{r.reason}</span>
                    {r.details ? ` — ${r.details}` : ''}
                  </p>
                  <p className="text-xs text-grey-60 mb-3">
                    Reporter: {r.reporterUserId?.email || r.reporterUserId?.name || '—'} · Creator:{' '}
                    {r.creatorId?.email || r.creatorId?.name || '—'} ·{' '}
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                  {r.videoId?._id && (
                    <Link
                      href={`/watch/${r.videoId._id}`}
                      className="text-xs text-red-45 hover:underline"
                      target="_blank"
                    >
                      Open video
                    </Link>
                  )}
                  <textarea
                    className="mt-3 w-full bg-dark-15 border border-dark-25 rounded-lg px-3 py-2 text-sm text-primary"
                    rows={2}
                    placeholder="Admin notes"
                    value={notes[r._id] ?? r.adminNotes ?? ''}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [r._id]: e.target.value }))}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      disabled={updating}
                      onClick={() => handleUpdate(r._id, { status: 'dismissed' })}
                      className="px-3 py-1.5 text-xs rounded-lg border border-dark-25 text-grey-70 hover:text-primary"
                    >
                      Dismiss
                    </button>
                    <button
                      disabled={updating}
                      onClick={() => handleUpdate(r._id, { status: 'actioned', deactivateVideo: true })}
                      className="px-3 py-1.5 text-xs rounded-lg bg-red-45 text-white hover:bg-red-55"
                    >
                      Deactivate video
                    </button>
                    <button
                      disabled={updating}
                      onClick={() => handleUpdate(r._id, { deactivateVideo: false, status: 'actioned' })}
                      className="px-3 py-1.5 text-xs rounded-lg border border-dark-25 text-grey-70 hover:text-primary"
                    >
                      Reactivate video
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
