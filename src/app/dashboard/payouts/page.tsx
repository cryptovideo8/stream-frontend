'use client';

import { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpTrayIcon,
  LockClosedIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import {
  useGetEarningsQuery,
  useRequestPayoutMutation,
  useGetMyPayoutRequestsQuery,
} from '../../store/api/payoutApi';

const payoutSchema = Yup.object({
  paymentMethod: Yup.string().required('Required'),
  paymentDetails: Yup.string().required('Payment details are required'),
});

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-900 text-yellow-300',
  settled: 'bg-green-900 text-green-300',
  rejected: 'bg-red-900 text-red-300',
};

export default function CreatorPayoutsPage() {
  const [showModal, setShowModal] = useState(false);
  const [myRequestsPage, setMyRequestsPage] = useState(1);

  const { data: earnings, isLoading: loadingEarnings, refetch: refetchEarnings } = useGetEarningsQuery();
  const { data: myRequests, isLoading: loadingRequests, refetch: refetchRequests } = useGetMyPayoutRequestsQuery({ page: myRequestsPage });
  const [requestPayout] = useRequestPayoutMutation();

  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      await requestPayout(values).unwrap();
      toast.success('Payout request submitted!');
      setShowModal(false);
      resetForm();
      refetchEarnings();
      refetchRequests();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to submit payout request');
    } finally {
      setSubmitting(false);
    }
  };

  const e = earnings;
  const fmt = (n: number) => `₹${n?.toFixed(2) ?? '0.00'}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Payouts</h1>
          <p className="text-grey-70 text-sm mt-0.5">
            Earnings are calculated on <span className="text-yellow-400 font-medium">paid &amp; rent videos only</span>
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={loadingEarnings || (e?.totalAmount ?? 0) <= 0}
          className="bg-red-45 text-white px-4 py-2 rounded-lg hover:bg-red-60 disabled:opacity-50 text-sm flex items-center space-x-2"
        >
          <ArrowUpTrayIcon className="h-4 w-4" />
          <span>Request Payout</span>
        </button>
      </div>

      {/* Period Info */}
      {!loadingEarnings && e && (
        <div className="text-sm text-grey-70 bg-dark-10 border border-dark-20 rounded-lg px-4 py-2 flex items-center space-x-2">
          <InformationCircleIcon className="h-4 w-4 text-blue-400 flex-shrink-0" />
          <span>
            Current period:{' '}
            <span className="text-white">
              {e.periodStart ? new Date(e.periodStart).toLocaleDateString() : 'Account start'}
            </span>{' '}
            →{' '}
            <span className="text-white">{new Date(e.periodEnd).toLocaleDateString()}</span>
          </span>
          <span className="ml-4">
            Rate: <span className="text-green-400 font-medium">₹{e.ratePerMinute}/min</span>
          </span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: 'Eligible Watch Time',
            value: loadingEarnings ? '—' : `${e?.totalWatchMinutes?.toFixed(1) ?? 0} min`,
            icon: ClockIcon,
            color: 'text-blue-400',
          },
          {
            label: 'Current Period Earnings',
            value: loadingEarnings ? '—' : fmt(e?.totalAmount),
            icon: CurrencyDollarIcon,
            color: 'text-green-400',
          },
          {
            label: 'Eligible Videos',
            value: loadingEarnings ? '—' : `${e?.breakdown?.length ?? 0}`,
            icon: CheckCircleIcon,
            color: 'text-yellow-400',
          },
        ].map((card) => (
          <div key={card.label} className="bg-dark-10 rounded-lg p-4 border border-dark-20">
            <div className="flex items-center justify-between mb-1">
              <p className="text-grey-70 text-sm">{card.label}</p>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            {loadingEarnings ? (
              <div className="h-7 bg-dark-20 rounded animate-pulse w-24 mt-1" />
            ) : (
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Eligible Video Breakdown */}
      <div className="bg-dark-10 rounded-lg border border-dark-20">
        <div className="px-4 py-3 border-b border-dark-20">
          <h3 className="text-white font-semibold text-sm">Paid/Rent Video Breakdown</h3>
          <p className="text-grey-70 text-xs">Only these videos contribute to earnings</p>
        </div>
        <div className="overflow-x-auto">
          {loadingEarnings ? (
            <div className="p-6 space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-8 bg-dark-20 rounded animate-pulse" />)}
            </div>
          ) : !e?.breakdown?.length ? (
            <div className="text-center py-10 text-grey-70">
              <LockClosedIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No paid/rent videos yet. Upload a paid or rent video to start earning.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-2 text-left text-xs text-grey-70 uppercase">Video</th>
                  <th className="px-4 py-2 text-left text-xs text-grey-70 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs text-grey-70 uppercase">Watch Time</th>
                  <th className="px-4 py-2 text-left text-xs text-grey-70 uppercase">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {e.breakdown.map((v: any) => (
                  <tr key={String(v.videoId)} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                    <td className="px-4 py-3 text-white font-medium">{v.title}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${v.monetizationType === 'rent' ? 'bg-orange-900 text-orange-300' : 'bg-blue-900 text-blue-300'}`}>
                        {v.monetizationType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-grey-70">{v.watchMinutes.toFixed(1)} min</td>
                    <td className="px-4 py-3 text-green-400 font-semibold">
                      {fmt(v.watchMinutes * (e.ratePerMinute ?? 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Not Eligible */}
        {!!e?.notEligible?.length && (
          <div className="border-t border-dark-20">
            <div className="px-4 py-2 bg-dark-8">
              <p className="text-grey-60 text-xs uppercase tracking-wide">Not Eligible (Free videos)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm opacity-50">
                <tbody>
                  {e.notEligible.map((v: any) => (
                    <tr key={String(v.videoId)} className="border-b border-gray-800/30">
                      <td className="px-4 py-2 text-grey-70">{v.title}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-400">free</span>
                      </td>
                      <td className="px-4 py-2 text-grey-70">{v.watchMinutes.toFixed(1)} min</td>
                      <td className="px-4 py-2 text-grey-60">₹0.00</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Request History */}
      <div className="bg-dark-10 rounded-lg border border-dark-20">
        <div className="px-4 py-3 border-b border-dark-20 flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">My Payout Requests</h3>
          <span className="text-grey-70 text-xs">{myRequests?.total ?? 0} total</span>
        </div>
        <div className="overflow-x-auto">
          {loadingRequests ? (
            <div className="p-6 space-y-2">
              {[1, 2].map((i) => <div key={i} className="h-8 bg-dark-20 rounded animate-pulse" />)}
            </div>
          ) : !myRequests?.requests?.length ? (
            <div className="text-center py-8 text-grey-70 text-sm">No requests yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Requested', 'Period', 'Watch Time', 'Amount', 'Method', 'Status', 'Note'].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-xs text-grey-70 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myRequests.requests.map((r: any) => (
                  <tr key={r._id} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                    <td className="px-4 py-3 text-grey-70 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-grey-70 text-xs">
                      {new Date(r.periodStart).toLocaleDateString()} – {new Date(r.periodEnd).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-grey-70">{r.totalWatchMinutes.toFixed(1)} min</td>
                    <td className="px-4 py-3 text-white font-semibold">₹{r.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-grey-70 capitalize">{r.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-grey-60 text-xs max-w-[160px] truncate">{r.adminNote || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Pagination */}
        {(myRequests?.totalPages ?? 1) > 1 && (
          <div className="px-4 py-3 flex justify-end gap-2 border-t border-dark-20">
            <button onClick={() => setMyRequestsPage((p) => Math.max(1, p - 1))} disabled={myRequestsPage === 1}
              className="px-3 py-1 text-sm text-grey-70 hover:text-white disabled:opacity-40 bg-dark-15 rounded">← Prev</button>
            <button onClick={() => setMyRequestsPage((p) => Math.min(myRequests?.totalPages, p + 1))} disabled={myRequestsPage >= myRequests?.totalPages}
              className="px-3 py-1 text-sm text-grey-70 hover:text-white disabled:opacity-40 bg-dark-15 rounded">Next →</button>
          </div>
        )}
      </div>

      {/* Request Payout Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-8 rounded-xl p-6 max-w-md w-full border border-dark-20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Request Payout</h2>
              <button onClick={() => setShowModal(false)} className="text-grey-70 hover:text-white">✕</button>
            </div>

            <div className="bg-dark-10 rounded-lg p-3 mb-4 border border-dark-20 flex justify-between">
              <div>
                <p className="text-xs text-grey-70">You will receive</p>
                <p className="text-2xl font-bold text-green-400">{fmt(e?.totalAmount)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-grey-70">Watch time</p>
                <p className="text-white font-semibold">{e?.totalWatchMinutes?.toFixed(1)} min</p>
              </div>
            </div>

            <Formik
              initialValues={{ paymentMethod: 'bank', paymentDetails: '' }}
              validationSchema={payoutSchema}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label className="text-grey-70 text-sm mb-1 block">Payment Method</label>
                    <Field as="select" name="paymentMethod"
                      className="w-full bg-dark-10 text-white px-3 py-2 rounded-lg text-sm border border-dark-20 focus:outline-none focus:ring-1 focus:ring-red-45">
                      <option value="bank">Bank Transfer</option>
                      <option value="upi">UPI</option>
                    </Field>
                  </div>
                  <div>
                    <label className="text-grey-70 text-sm mb-1 block">
                      {values.paymentMethod === 'upi' ? 'UPI ID' : 'Account Details (Bank, A/C No, IFSC)'}
                    </label>
                    <Field as="textarea" name="paymentDetails" rows={3}
                      placeholder={values.paymentMethod === 'upi' ? 'username@upi' : 'Bank name, Account number, IFSC code...'}
                      className="w-full bg-dark-10 text-white px-3 py-2 rounded-lg text-sm border border-dark-20 focus:outline-none focus:ring-1 focus:ring-red-45" />
                    {errors.paymentDetails && touched.paymentDetails && (
                      <p className="text-red-400 text-xs mt-1">{errors.paymentDetails}</p>
                    )}
                  </div>
                  <div className="flex space-x-3 pt-1">
                    <button type="button" onClick={() => setShowModal(false)}
                      className="flex-1 bg-dark-15 text-grey-70 px-4 py-2 rounded-lg text-sm hover:text-white">Cancel</button>
                    <button type="submit" disabled={isSubmitting}
                      className="flex-1 bg-red-45 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-60 disabled:opacity-60">
                      {isSubmitting ? 'Submitting...' : 'Submit Request'}
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