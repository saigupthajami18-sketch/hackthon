import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Target, Users, Calendar, ArrowRight, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import api from '../../api/client';
import useAuthStore from '../../store/authStore';

export default function CompanyDashboard() {
  const { user } = useAuthStore();
  const [drives, setDrives] = useState([]);
  const [stats, setStats] = useState({
    activeDrives: 3,
    matchedCandidates: 19,
    scheduledInterviews: 10,
    offersIssued: 3
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/drives');
      if (res.data && res.data.length > 0) {
        setDrives(res.data);
        setStats(prev => ({
          ...prev,
          activeDrives: res.data.length
        }));
      }
    } catch (e) {
      console.log('Using seeded dashboard stats');
    }
  };

  const formatCtc = (val) => {
    if (!val) return '₹24.5 LPA';
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} LPA`;
    return `₹${val} LPA`;
  };

  return (
    <AppLayout role="recruiter">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#EFE5D2] tracking-tight">Recruiter Dashboard</h1>
        <p className="text-sm text-white/50 mt-1 font-normal">Monitor your live campus recruitment pipeline, matching scores, and scheduled interviews.</p>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        <div className="bg-[#121417]/90 border border-white/10 p-5 rounded-2xl shadow-xl space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Active Job Drives</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#EFE5D2]">{stats.activeDrives}</div>
          <p className="text-xs text-white/40 font-medium">Live in NIT Engineering</p>
        </div>

        <div className="bg-[#121417]/90 border border-white/10 p-5 rounded-2xl shadow-xl space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Matched Candidates</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#EFE5D2]">{stats.matchedCandidates}</div>
          <p className="text-xs text-emerald-400 font-medium">≥ 75% Skill Match Score</p>
        </div>

        <div className="bg-[#121417]/90 border border-white/10 p-5 rounded-2xl shadow-xl space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Scheduled Interviews</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#EFE5D2]">{stats.scheduledInterviews}</div>
          <p className="text-xs text-white/40 font-medium">Across 4 physical panels</p>
        </div>

        <div className="bg-[#121417]/90 border border-white/10 p-5 rounded-2xl shadow-xl space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Offers Extended</span>
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#EFE5D2]">{stats.offersIssued}</div>
          <p className="text-xs text-[#D4AF37] font-medium">Avg CTC ₹24.5 LPA</p>
        </div>

      </div>

      {/* Active Drives & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Drives List (Left 2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-[#EFE5D2]">Your Active Placement Drives</h3>
            <Link to="/company/job-roles" className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider hover:underline flex items-center gap-1">
              <span>Manage Roles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {drives.length === 0 ? (
              <div className="bg-[#121417]/90 border border-white/10 p-12 rounded-2xl shadow-xl text-center text-white/40 text-sm">
                No active drives found. Create your first job posting!
              </div>
            ) : (
              drives.map((d) => (
                <div key={d.drive_id} className="bg-[#121417]/90 border border-white/10 p-5 rounded-2xl shadow-xl flex items-center justify-between gap-4 hover:border-white/20 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-bold text-[#EFE5D2] text-base">{d.title}</h4>
                      <span className="bg-[#064E3B]/20 text-[#10B981] border border-[#10B981]/30 text-[10px] uppercase font-bold tracking-widest py-0.5 px-2 rounded-full">
                        {d.status || 'Active'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/40 font-medium">
                      <span className="text-[#D4AF37] font-bold">{formatCtc(d.ctc_max || d.ctc_min)}</span>
                      <span>•</span>
                      <span>Min Cutoff: {d.eligibility_min_cgpa || '7.5'} CGPA</span>
                    </div>
                  </div>

                  <Link 
                    to="/company/candidate-pipeline" 
                    className="bg-gradient-to-r from-[#A81B2B] to-[#710912] hover:brightness-110 text-[#EFE5D2] font-semibold text-xs uppercase tracking-widest py-2 px-3.5 rounded-xl border-t border-white/20 shadow-md transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <span>View Candidates</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Launchpad (Right 1 Col) */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#EFE5D2]">Recruiter Launchpad</h3>

          <div className="bg-[#121417]/90 border border-white/10 p-5 rounded-2xl shadow-xl space-y-3">
            <Link 
              to="/company/job-roles" 
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all flex items-center justify-between group"
            >
              <div>
                <h5 className="font-bold text-xs text-[#EFE5D2] group-hover:text-[#D4AF37]">Create New Job Drive</h5>
                <p className="text-[11px] text-white/40 mt-0.5">Publish criteria, CTC package & required skills</p>
              </div>
              <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link 
              to="/company/candidate-pipeline" 
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all flex items-center justify-between group"
            >
              <div>
                <h5 className="font-bold text-xs text-[#EFE5D2] group-hover:text-[#D4AF37]">AI Candidate Matching</h5>
                <p className="text-[11px] text-white/40 mt-0.5">Rank candidates with explainable skill overlap</p>
              </div>
              <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link 
              to="/company/interview-panels" 
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all flex items-center justify-between group"
            >
              <div>
                <h5 className="font-bold text-xs text-[#EFE5D2] group-hover:text-[#D4AF37]">Interview Panel Management</h5>
                <p className="text-[11px] text-white/40 mt-0.5">Configure technical panels and room allocations</p>
              </div>
              <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
