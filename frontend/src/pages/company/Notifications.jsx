import React, { useState, useEffect } from 'react';
import { Bell, Send, CheckCircle2, AlertCircle, X, Clock, User, Plus } from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import api from '../../api/client';
import useAuthStore from '../../store/authStore';

export default function Notifications() {
  const { user } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [recipient, setRecipient] = useState('Karthik Iyer');
  const [category, setCategory] = useState('Eligibility');
  const [messageText, setMessageText] = useState('');

  const [notifications, setNotifications] = useState([
    {
      id: 'notif_1',
      recipient: 'Karthik Iyer',
      category: 'Alert',
      message: 'Urgent: Please confirm your interview availability for Microsoft Technical Round 1.',
      timestamp: 'Aug 21, 2026 • 12:03 PM',
      unread: false,
    },
    {
      id: 'notif_2',
      recipient: 'Diya Patel',
      category: 'Eligibility',
      message: 'You are eligible for Machine Learning Engineer at Quantum Analytics. Matching initiated.',
      timestamp: 'Aug 20, 2026 • 10:41 AM',
      unread: false,
    },
    {
      id: 'notif_3',
      recipient: 'Aarav Sharma',
      category: 'Eligibility',
      message: 'You are eligible for Software Engineer at TechNova Solutions. Check your dashboard for details.',
      timestamp: 'Aug 19, 2026 • 10:41 AM',
      unread: false,
    }
  ]);

  useEffect(() => {
    fetchBackendNotifications();
  }, []);

  const fetchBackendNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data && res.data.length > 0) {
        const mapped = res.data.map(n => ({
          id: n.notification_id,
          recipient: 'All Candidates',
          category: n.type || 'Eligibility',
          message: n.message,
          timestamp: new Date(n.sent_at || Date.now()).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
          }),
          unread: false
        }));
        setNotifications([...mapped, ...notifications.slice(0, 2)]);
      }
    } catch (e) {
      console.log('Using seeded notifications');
    }
  };

  const handleSendNotification = (e) => {
    e.preventDefault();
    if (!messageText) return;

    const newNotif = {
      id: `notif_${Date.now()}`,
      recipient,
      category,
      message: messageText,
      timestamp: 'Just now',
      unread: false
    };

    setNotifications([newNotif, ...notifications]);
    setShowModal(false);
    setMessageText('');
  };

  return (
    <AppLayout role="recruiter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#EFE5D2] tracking-tight">Notification Center</h1>
          <p className="text-sm text-white/50 mt-1 font-normal">
            Review and dispatch automated SMS, Email, and Push alerts to candidates and panels.
          </p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-[#A81B2B] to-[#710912] hover:brightness-110 text-[#EFE5D2] font-semibold text-xs uppercase tracking-widest py-2.5 px-5 rounded-xl border-t border-white/20 shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Send Notification</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-4 mb-6">
        <button 
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeFilter === 'all'
              ? 'bg-[#710912]/20 border border-[#A81B2B]/40 text-[#EFE5D2]'
              : 'text-white/40 hover:text-white'
          }`}
        >
          <span>All</span>
          <span className="bg-[#D4AF37] text-black font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
            {notifications.length}
          </span>
        </button>
        <button 
          onClick={() => setActiveFilter('unread')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeFilter === 'unread'
              ? 'bg-[#710912]/20 border border-[#A81B2B]/40 text-[#EFE5D2]'
              : 'text-white/40 hover:text-white'
          }`}
        >
          <span>Unread</span>
          <span className="bg-white/10 text-white/60 font-semibold text-[10px] px-1.5 py-0.2 rounded-full">
            0
          </span>
        </button>
      </div>

      {/* Notification Cards */}
      <div className="space-y-4">
        {notifications.map((notif) => (
          <div 
            key={notif.id} 
            className="bg-[#121417]/90 border border-white/10 p-6 rounded-2xl shadow-xl flex items-start gap-4 hover:border-white/20 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-[#181A1E] text-[#D4AF37] font-bold text-xs flex items-center justify-center shrink-0 border border-white/10">
              {notif.recipient.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>

            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <h4 className="font-bold text-sm text-[#EFE5D2]">{notif.recipient}</h4>
                  <span className={`text-[10px] uppercase font-bold tracking-widest py-0.5 px-2.5 rounded-full ${
                    notif.category === 'Alert'
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                      : 'bg-blue-950/40 text-blue-300 border border-blue-500/30'
                  }`}>
                    {notif.category}
                  </span>
                </div>
                <span className="text-[11px] text-white/40 shrink-0 font-medium">{notif.timestamp}</span>
              </div>

              <p className="text-xs text-white/70 leading-relaxed font-normal">{notif.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Dispatch Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#16191D] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/10">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <h3 className="text-lg font-serif font-bold text-[#EFE5D2]">Dispatch Notification</h3>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1 uppercase tracking-wider">Recipient Candidate / Group</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Karthik Iyer or All Shortlisted Candidates" 
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  className="w-full bg-[#1A1D20] border border-white/10 rounded-xl py-2.5 px-3.5 text-[#EFE5D2] text-sm focus:outline-none focus:border-[#D4AF37]/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1 uppercase tracking-wider">Notification Type</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-[#1A1D20] border border-white/10 rounded-xl py-2.5 px-3.5 text-[#EFE5D2] text-xs focus:outline-none focus:border-[#D4AF37]/60"
                >
                  <option value="Eligibility">Eligibility Update</option>
                  <option value="Alert">Urgent Alert</option>
                  <option value="Interview">Interview Coordination</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1 uppercase tracking-wider">Message Content</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Type message to broadcast..." 
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  className="w-full bg-[#1A1D20] border border-white/10 rounded-xl py-2.5 px-3.5 text-[#EFE5D2] text-xs focus:outline-none focus:border-[#D4AF37]/60 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 font-medium text-xs uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-[#A81B2B] to-[#710912] hover:brightness-110 text-[#EFE5D2] font-semibold text-xs uppercase tracking-widest py-2.5 rounded-xl border-t border-white/20 shadow-lg"
                >
                  Send Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
