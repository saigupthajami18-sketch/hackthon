import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Target, Users, Calendar, ArrowRight, CheckCircle2, TrendingUp } from 'lucide-react';
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

  return (
    <AppLayout role="recruiter">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Recruiter Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1 font-normal">Monitor your live campus recruitment pipeline, matching scores, and scheduled interviews.</p>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        <div className="app-card p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Active Job Drives</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{stats.activeDrives}</div>
            <p className="text-xs text-slate-400 font-medium mt-1">Live in NIT Engineering</p>
          </div>
        </div>

        <div className="app-card p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Matched Candidates</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{stats.matchedCandidates}</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">≥ 80% Skill Match</p>
          </div>
        </div>

        <div className="app-card p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Interviews Scheduled</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{stats.scheduledInterviews}</div>
            <p className="text-xs text-slate-400 font-medium mt-1">Across 3 physical rooms</p>
          </div>
        </div>

        <div className="app-card p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Offers Extended</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{stats.offersIssued}</div>
            <p className="text-xs text-amber-600 font-medium mt-1">Average ₹24.5 LPA</p>
          </div>
        </div>

      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link 
          to="/company/candidate-pipeline"
          className="app-card p-6 hover:border-blue-300 hover:shadow-md transition-all group block"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors flex items-center justify-between">
            <span>Candidate Matching</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
            Review top ranked student candidates with real-time percentage matching and skill gaps.
          </p>
        </Link>

        <Link 
          to="/company/interview-panels"
          className="app-card p-6 hover:border-blue-300 hover:shadow-md transition-all group block"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors flex items-center justify-between">
            <span>Interview Panels</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
            Manage technical and HR panelists assigned to your open job roles.
          </p>
        </Link>

        <Link 
          to="/company/scheduling"
          className="app-card p-6 hover:border-blue-300 hover:shadow-md transition-all group block"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors flex items-center justify-between">
            <span>Interview Scheduling</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
            Coordinate interview time slots, physical room allocations, and roster confirmation.
          </p>
        </Link>
      </div>

      {/* Live Drives Table */}
      <div className="app-card p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Active Job Postings</h3>
            <p className="text-xs text-slate-400">Current open positions accepting applications</p>
          </div>
          <Link to="/company/job-roles" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            View all →
          </Link>
        </div>

        <div className="space-y-3">
          {(drives.length > 0 ? drives.slice(0, 4) : [
            { title: 'Software Engineer', ctc_max: 2450000, eligibility_min_cgpa: 7.5, status: 'Active' },
            { title: 'Machine Learning Engineer', ctc_max: 3500000, eligibility_min_cgpa: 8.0, status: 'Active' },
            { title: 'Full Stack Developer', ctc_max: 2200000, eligibility_min_cgpa: 7.0, status: 'Active' },
          ]).map((job, idx) => (
            <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{job.title}</h4>
                  <p className="text-xs text-slate-400 font-medium">Min CGPA: {job.eligibility_min_cgpa || '7.0'} • ₹{((job.ctc_max || 2000000)/100000).toFixed(1)} LPA</p>
                </div>
              </div>
              <span className="badge-green text-xs font-semibold">Active</span>
            </div>
          ))}
        </div>
      </div>

    </AppLayout>
  );
}
