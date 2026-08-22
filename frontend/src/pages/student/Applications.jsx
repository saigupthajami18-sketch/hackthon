import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, Clock, Calendar, MapPin, 
  ExternalLink, FileText, ArrowRight, ShieldCheck, Sparkles, Building2 
} from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import api from '../../api/client';
import useAuthStore from '../../store/authStore';

export default function MyApplications() {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState([
    {
      id: 'app_1',
      role: 'Software Development Engineer - 1',
      company: 'Microsoft',
      ctc: '₹24.5 LPA',
      matchScore: 94,
      status: 'Interview Scheduled',
      currentStageIndex: 4,
      stageDates: {
        applied: 'Aug 18, 2026',
        eligible: 'Aug 19, 2026',
        matched: 'Aug 20, 2026',
        shortlisted: 'Aug 21, 2026',
        interview: 'Aug 24, 2026',
        offer: 'Pending Round 1'
      },
      slotDetails: {
        round: 'Technical Round 1 (Algorithms & System Architecture)',
        date: 'Aug 24, 2026',
        time: '10:30 AM - 11:15 AM',
        room: 'Academic Block B — Room 302 (Physical)',
        panel: 'Panel A — Cloud & Backend Core'
      }
    }
  ]);

  const stages = ['Applied', 'Eligible', 'Matched', 'Shortlisted', 'Interview Scheduled', 'Offer Issued'];

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    try {
      if (user?.user_id) {
        const res = await api.get(`/students/${user.user_id}/applications`);
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map((a, idx) => ({
            id: a.application_id || `app_${idx}`,
            role: 'Software Development Engineer - 1',
            company: 'Microsoft',
            ctc: '₹24.5 LPA',
            matchScore: Math.round(a.match_score || 90),
            status: a.application_status === 'interview_scheduled' ? 'Interview Scheduled' : 'Eligible & Shortlisted',
            currentStageIndex: a.application_status === 'interview_scheduled' ? 4 : 3,
            stageDates: {
              applied: 'Aug 18, 2026',
              eligible: 'Aug 19, 2026',
              matched: 'Aug 20, 2026',
              shortlisted: 'Aug 21, 2026',
              interview: 'Aug 24, 2026',
              offer: 'Pending Round 1'
            },
            slotDetails: {
              round: 'Technical Round 1 (Algorithms & System Architecture)',
              date: 'Aug 24, 2026',
              time: '10:30 AM - 11:15 AM',
              room: 'Academic Block B — Room 302 (Physical)',
              panel: 'Panel A — Cloud & Backend Core'
            }
          }));
          setApplications(mapped);
        }
      }
    } catch (e) {
      console.log('Using seeded applications');
    }
  };

  return (
    <AppLayout role="student">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#EFE5D2] tracking-tight">My Active Applications</h1>
        <p className="text-sm text-white/50 mt-1 font-normal">
          Track stage-by-stage progression from deterministic eligibility to confirmed interview passes.
        </p>
      </div>

      <div className="space-y-6">
        {applications.map((app) => (
          <div key={app.id} className="bg-[#121417]/90 border border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
            
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-serif font-bold text-xl text-[#EFE5D2]">{app.role}</h3>
                  <span className="bg-[#064E3B]/20 text-[#10B981] border border-[#10B981]/30 text-[10px] uppercase font-bold tracking-widest py-0.5 px-2.5 rounded-full">
                    {app.status}
                  </span>
                </div>
                <p className="text-xs text-white/50 mt-0.5">{app.company} • {app.ctc}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-white/40 font-medium block">Match Score</span>
                <span className="text-xl font-serif font-bold text-[#10B981]">{app.matchScore}%</span>
              </div>
            </div>

            {/* 6-Stage Progress Stepper */}
            <div className="overflow-x-auto py-2">
              <div className="flex items-center justify-between min-w-[600px] relative">
                {/* Connecting Line */}
                <div className="absolute top-3.5 left-0 right-0 h-0.5 bg-white/10 -z-0" />
                
                {stages.map((stg, sIdx) => {
                  const isDone = sIdx <= app.currentStageIndex;
                  const isCurrent = sIdx === app.currentStageIndex;
                  return (
                    <div key={sIdx} className="flex flex-col items-center relative z-10 space-y-1.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-[#D4AF37] text-black shadow-lg ring-4 ring-[#D4AF37]/20'
                          : isDone
                          ? 'bg-gradient-to-r from-[#A81B2B] to-[#710912] text-[#EFE5D2] border border-white/20'
                          : 'bg-[#181A1E] text-white/30 border border-white/10'
                      }`}>
                        {isDone ? '✓' : sIdx + 1}
                      </div>
                      <span className={`text-[11px] font-semibold text-center uppercase tracking-wider ${
                        isCurrent ? 'text-[#D4AF37]' : isDone ? 'text-[#EFE5D2]' : 'text-white/30'
                      }`}>
                        {stg}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Confirmed Interview Pass Box */}
            {app.slotDetails && (
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                    <Calendar className="w-4 h-4" />
                    <span>Official Interview Pass Confirmed</span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#EFE5D2]">{app.slotDetails.round}</h4>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-white/50 font-medium pt-1">
                    <span>📅 {app.slotDetails.date}</span>
                    <span>•</span>
                    <span>⏰ {app.slotDetails.time}</span>
                    <span>•</span>
                    <span className="text-[#D4AF37] font-semibold">📍 {app.slotDetails.room}</span>
                  </div>
                </div>

                <Link 
                  to="/student/interview-center" 
                  className="bg-gradient-to-r from-[#A81B2B] to-[#710912] hover:brightness-110 text-[#EFE5D2] font-semibold text-xs uppercase tracking-widest py-2.5 px-4 rounded-xl border-t border-white/20 shadow-lg transition-all flex items-center gap-2 shrink-0"
                >
                  <span>Interview Center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

          </div>
        ))}
      </div>
    </AppLayout>
  );
}
