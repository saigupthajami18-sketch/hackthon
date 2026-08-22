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
      <div className="mb-6 flex items-center gap-2 text-xs text-white/40 font-medium">
        <Link to="/student/applications" className="hover:text-[#D4AF37] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Applications
        </Link>
        <span>/</span>
        <span className="text-[#EFE5D2] font-semibold">Interview Coordination Center</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#EFE5D2] tracking-tight">Interview Coordination Center</h1>
        <p className="text-sm text-white/50 mt-1 font-normal">
          Confirmed slots, physical & virtual room coordinates, panel roster, and real-time prep checklists.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Interview Coordinates & Details */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-[#121417]/90 border border-white/10 p-6 rounded-2xl shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <span className="bg-[#064E3B]/20 text-[#10B981] border border-[#10B981]/30 text-[10px] uppercase font-bold tracking-widest py-0.5 px-2.5 rounded-full mb-1 inline-block">
                  {activeSlot.status}
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#EFE5D2]">{activeSlot.role}</h2>
                <p className="text-xs text-white/50">{activeSlot.company} • Campus Recruitment</p>
              </div>

              <a 
                href={activeSlot.meetLink}
                target="_blank"
                rel="noreferrer"
                className="bg-gradient-to-r from-[#A81B2B] to-[#710912] hover:brightness-110 text-[#EFE5D2] font-semibold text-xs uppercase tracking-widest py-2 px-3.5 rounded-xl border-t border-white/20 shadow-md flex items-center gap-1.5 shrink-0"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Join Virtual Room</span>
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-white/40 block uppercase tracking-wider font-semibold">Date & Time</span>
                <p className="font-bold text-[#EFE5D2]">{activeSlot.date}</p>
                <p className="text-[#D4AF37] font-semibold">{activeSlot.time}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-white/40 block uppercase tracking-wider font-semibold">Physical Location</span>
                <p className="font-bold text-[#EFE5D2]">{activeSlot.venue}</p>
                <p className="text-emerald-400 font-semibold">{activeSlot.panel}</p>
              </div>
            </div>

            {/* Panelists */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider block">Assigned Corporate Interviewers:</span>
              <div className="space-y-2">
                {activeSlot.interviewers.map((intv, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3 text-xs font-medium text-[#EFE5D2]">
                    <Users className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>{intv}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Prep Insights */}
          <div className="bg-[#121417]/90 border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="font-serif font-bold text-base text-[#EFE5D2]">AI Interview Prep & Key Insights</h3>
            </div>

            <div className="space-y-3">
              {activeSlot.aiPrepInsights.map((insight, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-white/70 leading-relaxed font-normal">
                  {insight}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Candidate Checklist */}
        <div className="space-y-6">
          <div className="bg-[#121417]/90 border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="font-serif font-bold text-base text-[#EFE5D2]">Candidate Action Checklist</h3>
            <p className="text-xs text-white/40">Complete these requirements prior to reporting</p>

            <div className="space-y-2.5 pt-2">
              {activeSlot.checklist.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 text-xs font-medium ${
                    item.done
                      ? 'bg-[#064E3B]/10 border-[#10B981]/30 text-white/50 line-through'
                      : 'bg-black/40 border-white/5 text-[#EFE5D2] hover:border-white/20'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                    item.done ? 'bg-[#10B981] border-[#10B981] text-black' : 'border-white/20'
                  }`}>
                    {item.done && <Check className="w-3 h-3 stroke-[3]" />}
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
