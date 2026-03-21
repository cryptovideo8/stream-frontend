'use client';

import { useState } from 'react';
import { 
  useCreateTicketMutation, 
  useGetMyTicketsQuery, 
  CreateTicketRequest 
} from '../../../store/api/supportApi';
import { toast } from 'react-hot-toast';
import { 
  EnvelopeIcon, 
  ChatBubbleBottomCenterTextIcon, 
  TicketIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function SupportPage() {
  const [formData, setFormData] = useState<CreateTicketRequest>({ 
    subject: '', 
    message: '', 
    priority: 'medium' 
  });
  const [createTicket, { isLoading: isSubmitting }] = useCreateTicketMutation();
  const { data: tickets = [], isLoading: isHistoryLoading } = useGetMyTicketsQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await createTicket(formData).unwrap();
      toast.success('Support ticket submitted successfully!');
      setFormData({ subject: '', message: '', priority: 'medium' });
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || 'Failed to submit ticket');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-45 bg-green-45/10 px-2 py-0.5 rounded border border-green-45/20">Resolved</span>;
      case 'in-progress':
        return <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">In Progress</span>;
      default:
        return <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">Open</span>;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-dark-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">How can we <span className="text-red-45">help?</span></h1>
          <p className="text-grey-60 text-lg max-w-2xl mx-auto">
            Our support team is available 24/7. Submit a ticket and we&apos;ll get back to you within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Support Form */}
          <div className="lg:col-span-7 animate-slide-up">
            <div className="bg-dark-12 border border-dark-25 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-red-45/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
               
               <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                 <ChatBubbleBottomCenterTextIcon className="w-7 h-7 text-red-45" />
                 Submit a Request
               </h2>

               <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-grey-70 mb-2 uppercase tracking-widest text-[11px]">Subject</label>
                    <div className="relative">
                      <TicketIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-60" />
                      <input 
                        type="text" 
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        placeholder="e.g., Billing issue, Feature request..."
                        className="w-full bg-dark-15 border border-dark-25 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-red-45 transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-semibold text-grey-70 mb-2 uppercase tracking-widest text-[11px]">Priority</label>
                      <div className="flex gap-2">
                         {['low', 'medium', 'high'].map((p) => (
                           <button
                             key={p}
                             type="button"
                             onClick={() => setFormData({...formData, priority: p as CreateTicketRequest['priority']})}
                             className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${formData.priority === p ? 'bg-red-45 border-red-45 text-white shadow-lg' : 'bg-dark-15 border-dark-25 text-grey-60 hover:text-white'}`}
                           >
                             {p}
                           </button>
                         ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-grey-70 mb-2 uppercase tracking-widest text-[11px]">Describe your issue</label>
                    <textarea 
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Please provide as much detail as possible..."
                      className="w-full bg-dark-15 border border-dark-25 rounded-2xl p-4 text-white focus:outline-none focus:border-red-45 transition-all text-sm font-medium resize-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-white text-black hover:bg-white/90 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending Request...' : 'Submit Support Ticket'}
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <p className="text-[11px] text-grey-60 text-center">
                    By submitting, you agree to our Terms of Service and Privacy Policy. Your account data will be shared with the support team.
                  </p>
               </form>
            </div>
          </div>

          {/* Ticket History */}
          <div className="lg:col-span-5 space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <ClockIcon className="w-6 h-6 text-red-55" />
                Ticket History
              </h2>
              <span className="text-xs font-bold text-grey-60 bg-dark-15 border border-dark-25 px-2 py-1 rounded-lg">{tickets.length} Saved</span>
            </div>

            {isHistoryLoading ? (
              <div className="space-y-4">
                 {[...Array(3)].map((_, i) => (
                   <div key={i} className="h-32 bg-dark-15 border border-dark-25 rounded-2xl animate-pulse" />
                 ))}
              </div>
            ) : tickets.length === 0 ? (
              <div className="bg-dark-12 border border-dark-25 rounded-3xl p-10 text-center">
                 <div className="w-16 h-16 bg-dark-20 border border-dark-30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <EnvelopeIcon className="w-8 h-8 text-grey-60" />
                 </div>
                 <h3 className="text-white font-bold mb-1">No tickets yet</h3>
                 <p className="text-grey-60 text-sm">Your support history will appear here once you submit your first request.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                 {tickets.map((ticket) => (
                   <div 
                    key={ticket._id} 
                    className="bg-dark-12 border border-dark-25 hover:border-red-45/30 transition-all rounded-2xl p-5 group shadow-xl"
                   >
                     <div className="flex justify-between items-start mb-3">
                        {getStatusBadge(ticket.status)}
                        <span className="text-[11px] font-medium text-grey-60">{format(new Date(ticket.createdAt), 'MMM d, h:mm a')}</span>
                     </div>
                     <h4 className="text-white font-bold mb-2 group-hover:text-red-45 transition-colors line-clamp-1">{ticket.subject}</h4>
                     <p className="text-grey-60 text-xs mb-4 line-clamp-2 leading-relaxed">{ticket.message}</p>
                     <div className="flex items-center gap-2 pt-4 border-t border-dark-25">
                        <div className={`w-1.5 h-1.5 rounded-full ${ticket.priority === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : ticket.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-grey-60">{ticket.priority} Priority</span>
                     </div>
                   </div>
                 ))}
              </div>
            )}

            {/* Support Info */}
            <div className="bg-gradient-to-br from-red-45/20 to-transparent border border-red-45/20 rounded-3xl p-8 shadow-xl">
               <ShieldCheckIcon className="w-10 h-10 text-red-45 mb-4" />
               <h3 className="text-lg font-bold text-white mb-2">Secure & Dedicated Support</h3>
               <p className="text-grey-60 text-sm leading-relaxed mb-6">
                 All tickets are encrypted and handled by our specialized verification team. For enterprise queries, please contact <span className="text-white font-medium">business@nightking.tv</span>
               </p>
               <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                     {[1,2,3,4].map(i => (
                       <div key={i} className="w-8 h-8 rounded-full border-2 border-dark-6 bg-dark-20 flex items-center justify-center overflow-hidden">
                          <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="avatar" />
                       </div>
                     ))}
                  </div>
                  <span className="text-[11px] text-grey-60 font-medium">1.2k issues resolved this month</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
