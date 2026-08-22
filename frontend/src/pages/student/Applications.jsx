import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, Clock, Calendar, Building, Sparkles, 
  ChevronRight, AlertCircle, Award, FileText, Check
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/client';
import AIAssistantModal from '../../components/AIAssistantModal';

const STATUS_STAGES = {
  applied:              ['Applied', '', '', '', '', ''],
  eligible:            ['Applied', 'Eligible', '', '', '', ''],
  matched:             ['Applied', 'Eligible', 'AI Matched', '', '', ''],
  shortlisted:         ['Applied', 'Eligible', 'AI Matched', 'Shortlisted', '', ''],
  interview_scheduled: ['Applied', 'Eligible', 'Shortlisted', 'Interview', '', ''],
  interview_completed: ['Applied', 'Eligible', 'Shortlisted', 'Interview', 'Review', ''],
  selected:            ['Applied', 'Eligible', 'Shortlisted', 'Interview', 'Selected', ''],
  offer_issued:        ['Applied', 'Eligible', 'Shortlisted', 'Interview', 'Selected', 'Offer Issued'],
  offer_accepted:      ['Applied', 'Eligible', 'Shortlisted', 'Interview', 'Selected', 'Offer Accepted'],
  rejected:            ['Applied', 'Eligible', 'Shortlisted', 'Rejected', '', ''],
};

function buildStages(status) {
  const labels = STATUS_STAGES[status] || STATUS_STAGES['applied'];
  const statusOrder = Object.keys(STATUS_STAGES);
  const currentIdx = statusOrder.indexOf(status);
  return labels.filter(Boolean).map((name, i) => ({
    name,
    completed: i < labels.filter(Boolean).length - 1 || ['offer_accepted', 'selected', 'offer_issued'].includes(status),
    current: i === labels.filter(Boolean).length - 1 && !['offer_accepted', 'selected', 'offer_issued'].includes(status),
  }));
}

export default function Applications() {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.user_id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [appsRes, drivesRes] = await Promise.all([
          api.get(`/students/${user.user_id}/applications`),
          api.get('/drives'),
        ]);
        const apps = appsRes.data || [];
        const driveMap = {};
        (drivesRes.data || []).forEach(d => { driveMap[d.drive_id] = d; });
        setDrives(driveMap);
        setApplications(apps);
      } catch {
        // Fallback demo data
        setApplications([
          { application_id: 'demo1', drive_id: 'demo', eligibility_status: 'eligible', match_score: 92,
            shortlist_status: 'approved', application_status: 'interview_scheduled',
            eligibility_reason: 'Meets all criteria', match_explanation: 'Strong match on Python & System Design.' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const formatDate = (ts) => ts ? new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A';


  return (
    <div className="min-h-screen bg-black font-body text-champagne">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-black to-black"></div>
      </div>

      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-white/10 h-16">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-full">
          <div className="flex items-center gap-4">
            <Link to="/student/dashboard" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs uppercase tracking-wider font-ui">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <span className="text-neutral-600">/</span>
            <span className="text-white font-medium text-sm">Application Tracking</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/student/opportunities" className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-300 transition-colors border border-white/10">
              Browse Drives
            </Link>
            <Link to="/student/interview-center" className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-xs text-amber-400 transition-colors border border-amber-500/30">
              Interview Center
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono mb-3">
            <Clock className="w-3.5 h-3.5" /> RECRUITMENT PIPELINE
          </div>
          <h1 className="display-title text-3xl md:text-4xl text-white font-bold tracking-tight">
            My Applications & Selection Stages
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Real-time status updates from College Placement Management and Company Recruiters.
          </p>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {loading ? (
            [1, 2].map(i => (
              <div key={i} className="rounded-2xl bg-neutral-950/80 border border-white/10 p-6 animate-pulse h-64" />
            ))
          ) : applications.length === 0 ? (
            <div className="rounded-2xl bg-neutral-950/80 border border-white/10 p-12 text-center">
              <FileText className="w-10 h-10 mx-auto text-neutral-600 mb-3" />
              <p className="text-neutral-400">You haven't applied to any drives yet.</p>
              <Link to="/student/opportunities" className="mt-3 inline-block text-amber-400 text-sm hover:text-amber-300">
                Browse Opportunities →
              </Link>
            </div>
          ) : (
            applications.map((app) => {
              const drive = drives[app.drive_id] || {};
              const stages = buildStages(app.application_status);
              const isOffer = ['offer_issued', 'offer_accepted', 'selected'].includes(app.application_status);
              const matchScore = app.match_score ? Math.round(app.match_score) : null;
              const fmtCTC = (min, max) => {
                if (!min) return 'TBD';
                const l = v => (v / 100000).toFixed(1);
                return min === max ? `₹${l(min)} LPA` : `₹${l(min)}–${l(max)} LPA`;
              };
              return (
                <div key={app.application_id} className="rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-amber-500/30 transition-all p-6 shadow-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center font-bold text-lg text-amber-400">
                        {(drive.title || 'D').charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{drive.title || 'Placement Drive'}</h3>
                        <p className="text-xs text-neutral-400 mt-0.5">Package: <span className="text-amber-400 font-mono font-bold">{fmtCTC(drive.ctc_min, drive.ctc_max)}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {matchScore !== null && (
                        <div className="px-3 py-1 rounded-lg bg-neutral-900 border border-white/10 text-xs font-mono text-neutral-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Match: {matchScore}%
                        </div>
                      )}
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase font-mono border ${isOffer ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-amber-500/20 border-amber-500/40 text-amber-300'}`}>
                        {isOffer ? '🎉 ' : ''}{app.application_status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="py-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {stages.map((stage, idx) => (
                        <div key={idx} className={`p-3 rounded-xl border flex flex-col justify-between ${
                          stage.completed ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' :
                          stage.current ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]' :
                          'bg-neutral-900/40 border-white/5 text-neutral-500'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono font-bold text-neutral-400">0{idx + 1}</span>
                            {stage.completed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : stage.current ? <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" /> : <Clock className="w-3.5 h-3.5 text-neutral-600" />}
                          </div>
                          <div className="text-xs font-semibold leading-tight">{stage.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-white/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-neutral-300">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{app.eligibility_reason || `Status: ${app.eligibility_status}`}</span>
                    </div>
                    {app.application_status === 'interview_scheduled' && (
                      <Link to="/student/interview-center" className="shrink-0 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        View Slot <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      <AIAssistantModal />
    </div>
  );
}
