import React, { useState } from 'react';
import { Plus, Calendar, Clock, MapPin, Users, Video, CheckCircle2, X } from 'lucide-react';
import AppLayout from '../../components/AppLayout';
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
          <h1 className="text-3xl font-serif font-bold text-[#EFE5D2] tracking-tight">Interview Scheduling & Coordination</h1>
          <p className="text-sm text-white/50 mt-1 font-normal">
            Review automated slot allocations, physical interview rooms, and panel assignments.
          </p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-[#A81B2B] to-[#710912] hover:brightness-110 text-[#EFE5D2] font-semibold text-xs uppercase tracking-widest py-2.5 px-5 rounded-xl border-t border-white/20 shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Interview</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-4 mb-6">
        <button className="bg-[#710912]/20 border border-[#A81B2B]/40 text-[#EFE5D2] px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <span>Upcoming</span>
          <span className="bg-[#D4AF37] text-black font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
            {interviews.length}
          </span>
        </button>
      </div>

      {/* Interviews Grid */}
      <div className="space-y-4">
        {interviews.map((slot) => (
          <div 
            key={slot.id} 
            className="bg-[#121417]/90 border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-white/20 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg text-[#EFE5D2]">{slot.candidateName}</h3>
                <span className="bg-[#064E3B]/20 text-[#10B981] border border-[#10B981]/30 text-[10px] uppercase font-bold tracking-widest py-0.5 px-2 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {slot.status}
                </span>
              </div>
              <p className="text-xs text-white/50 font-medium">{slot.role}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-white/40 pt-1 font-medium">
                <span className="flex items-center gap-1 text-[#D4AF37]">
                  <Calendar className="w-3.5 h-3.5" />
                  {slot.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[#EFE5D2]">
                  <Clock className="w-3.5 h-3.5" />
                  {slot.time}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-white/60">
                  <MapPin className="w-3.5 h-3.5" />
                  {slot.room}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 shrink-0 text-xs">
              <span className="text-white/40 font-medium block">Assigned Evaluation Panel:</span>
              <strong className="text-[#EFE5D2] font-semibold">{slot.panel}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#16191D] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/10">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <h3 className="text-lg font-serif font-bold text-[#EFE5D2]">Schedule Interview Slot</h3>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSchedule} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1 uppercase tracking-wider">Candidate Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Tanvi Mehta" 
                  value={candidateName}
                  onChange={e => setCandidateName(e.target.value)}
                  className="w-full bg-[#1A1D20] border border-white/10 rounded-xl py-2.5 px-3.5 text-[#EFE5D2] text-sm focus:outline-none focus:border-[#D4AF37]/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1 uppercase tracking-wider">Time Slot</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 02:00 PM - 02:45 PM" 
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full bg-[#1A1D20] border border-white/10 rounded-xl py-2.5 px-3.5 text-[#EFE5D2] text-sm focus:outline-none focus:border-[#D4AF37]/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1 uppercase tracking-wider">Interview Room</label>
                <input 
                  type="text" 
                  required
                  value={room}
                  onChange={e => setRoom(e.target.value)}
                  className="w-full bg-[#1A1D20] border border-white/10 rounded-xl py-2.5 px-3.5 text-[#EFE5D2] text-sm focus:outline-none focus:border-[#D4AF37]/60"
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
                  Confirm Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
