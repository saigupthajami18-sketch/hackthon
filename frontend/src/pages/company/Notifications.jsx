import React, { useState, useEffect } from 'react';
import { Bell, Send, CheckCircle2, AlertCircle, X, Clock, User } from 'lucide-react';
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

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!messageText) return;

    try {
      await api.post('/notifications', {
        user_id: user?.user_id,
        type: category.toLowerCase(),
        message: messageText,
        channel: 'in_app'
      });
    } catch (e) {
      console.log('Saved to local list');
    }

    const newNotif = {
      id: `notif_${Date.now()}`,
      recipient: recipient || 'Candidate',
      category: category,
      message: messageText,
      timestamp: 'Just now',
      unread: true
    };

    setNotifications([newNotif, ...notifications]);
    setShowModal(false);
    setMessageText('');
  };

  const filtered = activeFilter === 'unread' 
    ? notifications.filter(n => n.unread) 
    : notifications;

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <AppLayout role={user?.role === 'student' ? 'student' : 'recruiter'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Notifications & Reminders</h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            {unreadCount} unread of {notifications.length} total notifications
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-blue shrink-0 shadow-xs"
        >
          <Send className="w-4 h-4" />
          <span>Send Notification</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setActiveFilter('unread')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeFilter === 'unread'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="app-card p-16 text-center text-slate-400">
          <p className="text-sm">No notifications found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div 
              key={item.id} 
              className="app-card p-5 hover:border-slate-300 transition-all flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                <Bell className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="font-bold text-sm text-slate-900">{item.recipient}</span>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    item.category.toLowerCase() === 'alert'
                      ? 'bg-rose-50 text-rose-600 border border-rose-200/60'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  }`}>
                    {item.category}
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-normal leading-relaxed">{item.message}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-2">{item.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Send Notification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Send Notification</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Aarav Sharma or All Eligible Candidates" 
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  className="app-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notification Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="app-input">
                  <option value="Eligibility">Eligibility</option>
                  <option value="Alert">Alert</option>
                  <option value="Shortlist">Shortlist</option>
                  <option value="Interview">Interview</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message Content</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Type your notification or reminder message..."
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  className="app-input resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-blue">
                  Dispatch Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
