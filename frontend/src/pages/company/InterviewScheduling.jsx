import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, MapPin, Users, Video, CheckCircle2, X } from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import api from '../../api/client';
import useAuthStore from '../../store/authStore';

export default function InterviewScheduling() {
  const { user } = useAuthStore();
  const [interviews, setInterviews] = useState([
    {
      id: 'int_1',
      candidateName: 'Aarav Sharma',
      role: 'Software Development Engineer - 1',
      company: 'TechNova Solutions',
      date: 'Aug 24, 2026',
      time: '10:00 AM - 10:45 AM',
      room: 'Academic Block B — Room 302',
      panel: 'Panel A — Core Backend & DSA',
      status: 'Confirmed',
    },
    {
      id: 'int_2',
      candidateName: 'Priya Menon',
      role: 'Software Development Engineer - 1',
      company: 'TechNova Solutions',
      date: 'Aug 24, 2026',
      time: '11:00 AM - 11:45 AM',
      room: 'Academic Block B — Room 302',
      panel: 'Panel A — Core Backend & DSA',
      status: 'Confirmed',
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [role, setRole] = useState('Software Development Engineer - 1');
  const [date, setDate] = useState('2026-08-25');
  const [time, setTime] = useState('02:00 PM - 02:45 PM');
  const [room, setRoom] = useState('Academic Block B — Room 303');
  const [panel, setPanel] = useState('Panel A — Core Backend & DSA');

  const handleSchedule = (e) => {
    e.preventDefault();
    if (!candidateName) return;

    const newInterview = {
      id: `int_${Date.now()}`,
      candidateName,
      role,
      company: user?.name || 'TechNova Solutions',
      date,
      time,
      room,
      panel,
      status: 'Confirmed'
    };

    setInterviews([newInterview, ...interviews]);
    setShowModal(false);
    setCandidateName('');
  };

  return (
    <AppLayout role="recruiter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Interview Scheduling</h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">Schedule and coordinate interviews with room and panel assignment</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-blue shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Interview</span>
        </button>
      </div>

      {/* Section Title */}
      <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-slate-700">
        <Calendar className="w-4 h-4 text-slate-500" />
        <span>UPCOMING ({interviews.length})</span>
      </div>

      {/* Interview Cards List */}
      {interviews.length === 0 ? (
        <div className="app-card p-16 text-center text-slate-400">
          <p className="text-sm">No upcoming interviews. Click "Schedule Interview" to add one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((item) => (
            <div key={item.id} className="app-card p-5 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-base text-slate-900">{item.candidateName}</h3>
                  <span className="badge-green text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{item.role} • {item.company}</p>
                
                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {item.date}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {item.time}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {item.room}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-medium">
                  {item.panel}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Schedule Interview Slot</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSchedule} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Candidate Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Ananya Reddy" 
                  value={candidateName}
                  onChange={e => setCandidateName(e.target.value)}
                  className="app-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Role</label>
                <input 
                  type="text" 
                  required
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="app-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="app-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time Window</label>
                  <input 
                    type="text" 
                    required
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="app-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Venue / Physical Room</label>
                <select value={room} onChange={e => setRoom(e.target.value)} className="app-input">
                  <option value="Academic Block B — Room 301">Academic Block B — Room 301</option>
                  <option value="Academic Block B — Room 302">Academic Block B — Room 302</option>
                  <option value="Academic Block B — Room 303">Academic Block B — Room 303</option>
                  <option value="Academic Block B — Room 401">Academic Block B — Room 401</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Panel</label>
                <select value={panel} onChange={e => setPanel(e.target.value)} className="app-input">
                  <option value="Panel A — Core Backend & DSA">Panel A — Core Backend & DSA</option>
                  <option value="Panel B — Systems & Concurrency">Panel B — Systems & Concurrency</option>
                  <option value="Panel C — HR & Culture Fit">Panel C — HR & Culture Fit</option>
                </select>
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
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
