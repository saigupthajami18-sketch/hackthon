import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Clock, MapPin, Video, Users, CheckSquare, 
  Sparkles, AlertCircle, FileText, ChevronRight, ExternalLink, ShieldCheck, Check
} from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import useAuthStore from '../../store/authStore';

export default function InterviewCenter() {
  const { user } = useAuthStore();

  const [activeSlot, setActiveSlot] = useState({
    id: 'slot_901',
    company: 'Microsoft',
    role: 'Software Development Engineer - 1',
    roundName: 'Technical Round 1 (Algorithms & System Architecture)',
    roundNumber: 1,
    date: 'Aug 24, 2026',
    time: '10:30 AM – 11:15 AM (45 Mins)',
    venue: 'Academic Block B — Room 302 (Physical)',
    panel: 'Panel 3: Cloud & Backend Core',
    interviewers: ['Siddharth Rao (Principal SDE, Microsoft)', 'Neha Sharma (Engineering Lead, Microsoft)'],
    status: 'Scheduled & Confirmed',
    meetLink: 'https://meet.google.com/abc-placementops-demo',
    checklist: [
      { id: 1, text: 'Carry 2 hard copies of verified resume', done: true },
      { id: 2, text: 'Keep college ID card & government photo ID ready', done: true },
      { id: 3, text: 'Revise Distributed Task Queue project system design', done: false },
      { id: 4, text: 'Review Dynamic Programming & Graph interview patterns', done: false }
    ],
    aiPrepInsights: [
      '💡 Microsoft SDE Round 1 heavily evaluates clean modular code, edge case handling, and time/space complexity tradeoffs.',
      '📌 Your project "Distributed Task Queue" matches their Azure Messaging queue concepts; be ready to explain partition strategies.'
    ]
  });

  const toggleChecklist = (id) => {
    setActiveSlot(prev => ({
      ...prev,
      checklist: prev.checklist.map(item => item.id === id ? { ...item, done: !item.done } : item)
    }));
  };

  return (
    <AppLayout role="student">
      {/* Top Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/student/applications" className="hover:text-blue-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Applications
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Interview Coordination Center</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Interview Coordination Center</h1>
        <p className="text-sm text-slate-500 mt-1 font-normal">
          Confirmed slots, physical & virtual room coordinates, panel roster, and real-time prep checklists.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Slot Banner (Left 2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="app-card p-6 border-blue-200 bg-blue-50/20 space-y-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-blue-100">
              <div>
                <span className="badge-blue text-xs font-semibold">
                  Upcoming Round
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">{activeSlot.roundName}</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{activeSlot.company} — <strong className="text-blue-700">{activeSlot.role}</strong></p>
              </div>
              <span className="badge-green text-xs font-semibold py-1 px-3">
                {activeSlot.status}
              </span>
            </div>

            {/* Coordinates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Interview Schedule</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{activeSlot.date}</p>
                <p className="text-xs text-slate-500">{activeSlot.time}</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Venue Coordinates</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{activeSlot.venue}</p>
                <p className="text-xs text-slate-500">{activeSlot.panel}</p>
              </div>
            </div>

            {/* Interviewer Roster */}
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Assigned Interviewers</h4>
              <div className="space-y-1.5">
                {activeSlot.interviewers.map((person, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{person}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Google Meet Button */}
            <a 
              href={activeSlot.meetLink} 
              target="_blank" 
              rel="noreferrer"
              className="btn-blue w-full py-3"
            >
              <Video className="w-4 h-4" />
              <span>Join Virtual Room (Google Meet Backup)</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>

          {/* AI Prep Insights Card */}
          <div className="app-card p-6 border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3>AI Round-1 Insights</h3>
            </div>
            <div className="space-y-2.5 pt-1">
              {activeSlot.aiPrepInsights.map((insight, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed font-medium">
                  {insight}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Candidate Prep Checklist */}
        <div className="space-y-6">
          <div className="app-card p-6 border-slate-200 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <CheckSquare className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900">Pre-Interview Checklist</h3>
            </div>

            <div className="space-y-3">
              {activeSlot.checklist.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 text-xs font-medium ${
                    item.done
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 line-through'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 ${
                    item.done ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                  }`}>
                    {item.done && <Check className="w-3 h-3" />}
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
