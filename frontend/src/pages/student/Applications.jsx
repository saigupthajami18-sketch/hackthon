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
          // Merge with detailed view
          const mapped = res.data.map((a, idx) => ({
            id: a.application_id || `app_${idx}`,
            role: 'Software Development Engineer - 1',
            company: 'Microsoft',
            ctc: '₹24.5 LPA',
            matchScore: a.match_score || 94,
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
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">My Interviews & Applications</h1>
        <p className="text-sm text-slate-500 mt-1 font-normal">
          Real-time status tracking across eligibility verification, AI matching, interview schedules, and offers.
        </p>
      </div>

      {/* Applications List */}
      <div className="space-y-6">
        {applications.map((app) => (
          <div key={app.id} className="app-card p-6 border-slate-200 space-y-6">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900">{app.role}</h3>
                  <span className="badge-green text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {app.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{app.company} • {app.ctc}</p>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <div className="text-2xl font-black text-emerald-600">{app.matchScore}%</div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">AI Match Score</div>
                </div>
              </div>
            </div>

            {/* Stage Progress Steps */}
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {stages.map((stageName, sIdx) => {
                  const isDone = sIdx <= app.currentStageIndex;
                  const isCurrent = sIdx === app.currentStageIndex;
                  return (
                    <div 
                      key={sIdx} 
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isCurrent
                          ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-xs'
                          : isDone
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                          : 'bg-slate-50 border-slate-100 text-slate-400'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full mx-auto mb-1.5 flex items-center justify-center text-xs font-bold">
                        {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-slate-400" />}
                      </div>
                      <p className="text-xs font-bold truncate">{stageName}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Confirmed Slot Details Card */}
            {app.slotDetails && (
              <div className="p-5 rounded-2xl bg-blue-50/30 border border-blue-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="badge-blue text-xs font-semibold">Confirmed Slot</span>
                    <h4 className="font-bold text-sm text-slate-900">{app.slotDetails.round}</h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      {app.slotDetails.date} ({app.slotDetails.time})
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      {app.slotDetails.room}
                    </span>
                  </div>
                </div>

                <Link 
                  to="/student/interview-center"
                  className="btn-blue text-xs py-2 px-4 shrink-0"
                >
                  <span>Open Prep Center</span>
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
