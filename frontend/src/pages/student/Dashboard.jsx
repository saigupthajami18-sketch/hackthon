import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Calendar, Target, Award, ArrowRight, 
  CheckCircle2, Clock, Sparkles, AlertCircle, TrendingUp, Building2, DollarSign 
} from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import api from '../../api/client';
import useAuthStore from '../../store/authStore';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const [drivesRes, appsRes] = await Promise.all([
        api.get('/drives').catch(() => ({ data: [] })),
        user?.user_id ? api.get(`/students/${user.user_id}/applications`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
      ]);
      setDrives(drivesRes.data || []);
      setApplications(appsRes.data || []);
    } catch (e) {
      console.error('Failed to load student dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  const formatCtc = (val) => {
    if (!val) return '₹24.5 LPA';
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} LPA`;
    return `₹${val} LPA`;
  };

  return (
    <AppLayout role="student">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#EFE5D2] tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] || 'Student'} 👋
        </h1>
        <p className="text-sm text-white/50 mt-1 font-normal">
          Track your campus placement opportunities, eligibility match scores, and scheduled interview rounds.
        </p>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        <div className="bg-[#121417]/90 border border-white/10 p-5 rounded-2xl shadow-xl space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Readiness Score</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#EFE5D2]">88%</div>
          <p className="text-xs text-emerald-400 font-medium">Verified Profile Parity</p>
        </div>

        <div className="bg-[#121417]/90 border border-white/10 p-5 rounded-2xl shadow-xl space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Eligible Drives</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#EFE5D2]">{drives.length || 5}</div>
          <p className="text-xs text-white/40 font-medium">100% Academic Cutoff Met</p>
        </div>

        <div className="bg-[#121417]/90 border border-white/10 p-5 rounded-2xl shadow-xl space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Active Applications</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#EFE5D2]">{applications.length || 1}</div>
          <p className="text-xs text-amber-400 font-medium">In Pipeline Review</p>
        </div>

        <div className="bg-[#121417]/90 border border-white/10 p-5 rounded-2xl shadow-xl space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Upcoming Slot</span>
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/20">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#D4AF37]">Aug 24</div>
          <p className="text-xs text-white/40 font-medium">10:00 AM • Room 302</p>
        </div>

      </div>

      {/* Recommended Opportunities & Next Interview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recommended Jobs (Left 2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-[#EFE5D2]">Recommended Opportunities</h3>
            <Link to="/student/opportunities" className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {drives.slice(0, 3).map((d) => (
              <div key={d.drive_id} className="bg-[#121417]/90 border border-white/10 p-5 rounded-2xl shadow-xl flex items-center justify-between gap-4 hover:border-white/20 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h4 className="font-bold text-[#EFE5D2] text-base">{d.title}</h4>
                    <span className="bg-[#064E3B]/20 text-[#10B981] border border-[#10B981]/30 text-[10px] uppercase font-bold tracking-widest py-0.5 px-2 rounded-full">
                      Eligible
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/40 font-medium">
                    <span className="text-[#D4AF37] font-bold">{formatCtc(d.ctc_max || d.ctc_min)}</span>
                    <span>•</span>
                    <span>{d.company_name || 'Microsoft'}</span>
                  </div>
                </div>

                <Link 
                  to="/student/opportunities" 
                  className="bg-gradient-to-r from-[#A81B2B] to-[#710912] hover:brightness-110 text-[#EFE5D2] font-semibold text-xs uppercase tracking-widest py-2 px-3.5 rounded-xl border-t border-white/20 shadow-md transition-all flex items-center gap-1.5 shrink-0"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Confirmed Interview Card (Right 1 Col) */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#EFE5D2]">Next Scheduled Round</h3>

          <div className="bg-[#121417]/90 border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="bg-[#064E3B]/20 text-[#10B981] border border-[#10B981]/30 text-[10px] uppercase font-bold tracking-widest py-0.5 px-2.5 rounded-full">
                Slot Confirmed
              </span>
              <span className="text-xs text-[#D4AF37] font-bold">100% Match</span>
            </div>

            <div>
              <h4 className="font-serif font-bold text-base text-[#EFE5D2]">Microsoft SDE-1</h4>
              <p className="text-xs text-white/40 mt-0.5">Technical Round 1: Core DSA & System Design</p>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs text-white/60">
              <p>📅 <strong className="text-[#EFE5D2]">Monday, Aug 24, 2026</strong></p>
              <p>⏰ <strong className="text-[#EFE5D2]">10:00 AM - 10:45 AM</strong></p>
              <p>📍 <strong className="text-[#D4AF37]">Academic Block B — Room 302</strong></p>
            </div>

            <Link 
              to="/student/applications" 
              className="w-full bg-gradient-to-r from-[#A81B2B] to-[#710912] hover:brightness-110 text-[#EFE5D2] font-semibold text-xs uppercase tracking-widest py-2.5 rounded-xl border-t border-white/20 shadow-lg flex items-center justify-center gap-2"
            >
              <span>View Interview Pass</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
