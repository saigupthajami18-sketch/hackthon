import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Clock, MapPin, Video, Users, CheckSquare, 
  Sparkles, AlertCircle, FileText, ChevronRight, ExternalLink, ShieldCheck
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import AIAssistantModal from '../../components/AIAssistantModal';

export default function InterviewCenter() {
  const { user } = useAuthStore();

  const [activeSlot, setActiveSlot] = useState({
    id: 'slot_901',
    company: 'Microsoft',
    role: 'Software Development Engineer - 1',
    roundName: 'Technical Round 1 (Algorithms & System Architecture)',
    roundNumber: 1,
    date: '2026-03-24',
    time: '10:30 AM – 11:15 AM (45 Mins)',
    venue: 'Academic Block B — Room 302 (Physical)',
    panel: 'Panel 3: Cloud & Backend Core',
    interviewers: ['Siddharth Rao (Principal SDE, Microsoft)', 'Neha Sharma (Engineering Lead, Microsoft)'],
    status: 'Scheduled',
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
    <div className="min-h-screen bg-black font-body text-champagne">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-black to-black"></div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-white/10 h-16">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-full">
          <div className="flex items-center gap-4">
            <Link to="/student/dashboard" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs uppercase tracking-wider font-ui">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <span className="text-neutral-600">/</span>
            <span className="text-white font-medium text-sm">Interview Coordination Center</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/student/opportunities" className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-300 transition-colors border border-white/10">
              Live Drives
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono mb-3">
            <Calendar className="w-3.5 h-3.5" /> OR-TOOLS OPTIMIZED SCHEDULE
          </div>
          <h1 className="display-title text-3xl md:text-4xl text-white font-bold tracking-tight">
            Interview Coordination Center
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Confirmed slots, physical & virtual room coordinates, panel roster, and real-time conflict protection.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Interview Card (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Live Upcoming Slot Banner */}
            <div className="rounded-2xl bg-gradient-to-b from-amber-950/30 to-neutral-950/90 border border-amber-500/30 p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider">
                    Next Upcoming Round
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-2">{activeSlot.roundName}</h2>
                  <p className="text-neutral-300 text-sm mt-0.5">{activeSlot.company} — <strong className="text-amber-400">{activeSlot.role}</strong></p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Conflict-Free Slot
                </div>
              </div>

              {/* Slot Details Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 my-2 border-y border-white/10">
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center text-amber-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-neutral-400 text-[10px] uppercase font-mono">Date & Duration</div>
                    <div className="text-white font-semibold">{activeSlot.date}</div>
                    <div className="text-neutral-400">{activeSlot.time}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center text-amber-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-neutral-400 text-[10px] uppercase font-mono">Venue Coordinates</div>
                    <div className="text-white font-semibold">{activeSlot.venue}</div>
                    <div className="text-neutral-400">{activeSlot.panel}</div>
                  </div>
                </div>
              </div>

              {/* Panel Interviewers Roster */}
              <div className="my-4">
                <div className="text-xs font-ui uppercase tracking-wider text-neutral-400 mb-2">Assigned Interview Panel</div>
                <div className="space-y-1.5">
                  {activeSlot.interviewers.map((name, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-neutral-200 bg-black/40 px-3 py-2 rounded-lg border border-white/5">
                      <Users className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a 
                  href={activeSlot.meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase font-ui tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all"
                >
                  <Video className="w-4 h-4" /> Join Virtual Backup Room
                </a>
                <button className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold border border-white/10 transition-colors">
                  Download Pass / Admit Card
                </button>
              </div>
            </div>

            {/* AI Grounded Preparation Insights */}
            <div className="rounded-2xl bg-neutral-950/80 border border-white/10 p-6 shadow-xl">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-4">
                <Sparkles className="w-4 h-4" /> Grounded Round Preparation Insights
              </div>
              <div className="space-y-3">
                {activeSlot.aiPrepInsights.map((insight, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-neutral-900/90 border border-white/10 text-xs text-neutral-300 leading-relaxed">
                    {insight}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Sidebar: Pre-Interview Checklist & Rules */}
          <div className="space-y-6">
            
            {/* Checklist */}
            <div className="rounded-2xl bg-neutral-950/80 border border-white/10 p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase font-ui tracking-wider mb-4 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-amber-400" /> Day-of-Interview Checklist
              </h3>
              <div className="space-y-3">
                {activeSlot.checklist.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs flex items-start gap-3 transition-all ${
                      item.done 
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-neutral-300' 
                        : 'bg-neutral-900/60 border-white/10 text-neutral-400 hover:border-amber-500/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => {}}
                      className="mt-0.5 accent-amber-500 rounded cursor-pointer"
                    />
                    <span className={item.done ? 'line-through opacity-70' : ''}>{item.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Placement Cell Guidelines */}
            <div className="rounded-2xl bg-neutral-950/80 border border-white/10 p-6 shadow-xl text-xs text-neutral-400 leading-relaxed space-y-3">
              <h4 className="text-xs font-bold text-white uppercase font-ui tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400" /> Institutional Protocols
              </h4>
              <p>• Formal dress code is mandatory for all physical and virtual interview rounds.</p>
              <p>• Please report to Academic Block B at least 15 minutes prior to the designated slot.</p>
              <p>• In case of overlapping slots with another drive, the OR-Tools dynamic replanner will trigger an automated resolution notification.</p>
            </div>

          </div>

        </div>

      </div>

      <AIAssistantModal />
    </div>
  );
}
