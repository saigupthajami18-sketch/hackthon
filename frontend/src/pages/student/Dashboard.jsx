import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Calendar, Target, Award, ArrowRight, 
  CheckCircle2, Clock, Sparkles, AlertCircle, TrendingUp, Building2
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
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] || 'Student'} 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-normal">
          Track your campus placement opportunities, eligibility match scores, and scheduled interview rounds.
        </p>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        <div className="app-card p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Readiness Score</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">88%</div>
            <p className="text-xs text-blue-600 font-medium mt-1">Top 5% in Batch</p>
          </div>
        </div>

        <div className="app-card p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Eligible Drives</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{drives.length || 5}</div>
            <p className="text-xs text-slate-400 font-medium mt-1">Open for applications</p>
          </div>
        </div>

        <div className="app-card p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Active Applications</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{applications.length || 1}</div>
            <p className="text-xs text-purple-600 font-medium mt-1">1 Interview Scheduled</p>
          </div>
        </div>

        <div className="app-card p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Verified Offers</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">1</div>
            <p className="text-xs text-amber-600 font-medium mt-1">₹24.5 LPA (Microsoft)</p>
          </div>
        </div>

      </div>

      {/* 2 Column Layout: Eligible Drives & Interview Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Recommended Opportunities */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-900">Recommended Opportunities</h2>
            <Link to="/student/opportunities" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Browse all jobs →
            </Link>
          </div>

          <div className="space-y-3">
            {(drives.length > 0 ? drives.slice(0, 3) : [
              { title: 'Software Engineer', company_name: 'Microsoft', ctc_max: 2450000, eligibility_min_cgpa: 7.5, required_skills: ['Python', 'System Design', 'SQL'] },
              { title: 'Software Engineer (New Grad)', company_name: 'Google', ctc_max: 3800000, eligibility_min_cgpa: 8.0, required_skills: ['DSA', 'Algorithms', 'Go'] },
              { title: 'Member of Technical Staff', company_name: 'Adobe', ctc_max: 2800000, eligibility_min_cgpa: 7.0, required_skills: ['React', 'JavaScript', 'REST'] },
            ]).map((job, idx) => (
              <div key={idx} className="app-card p-5 hover:border-slate-300 transition-all flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-base text-slate-900">{job.title}</h3>
                    <span className="badge-green text-[11px] font-semibold py-0.5 px-2">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Eligible
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {job.company_name || 'Tech Partner'} • {formatCtc(job.ctc_max || job.ctc_min)} • Min CGPA: {job.eligibility_min_cgpa || '7.0'}
                  </p>
                </div>

                <Link 
                  to="/student/opportunities"
                  className="btn-blue text-xs py-2 px-4 shrink-0"
                >
                  <span>Apply Now</span>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right 4 Cols: Upcoming Interview Slot */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="font-bold text-base text-slate-900">Upcoming Interview</h2>
          
          <div className="app-card p-5 border-blue-200 bg-blue-50/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="badge-blue text-xs font-semibold">Technical Round 1</span>
              <span className="text-[11px] text-slate-400 font-medium">Confirmed</span>
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900">Microsoft SDE-1</h3>
              <p className="text-xs text-slate-500 mt-0.5">Algorithms & System Architecture</p>
            </div>

            <div className="space-y-2 text-xs text-slate-600 border-t border-blue-100 pt-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-medium">Aug 24, 2026 • 10:30 AM</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-medium">Academic Block B — Room 302</span>
              </div>
            </div>

            <Link 
              to="/student/interview-center"
              className="w-full btn-blue text-xs py-2 block text-center"
            >
              Open Interview Center
            </Link>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
