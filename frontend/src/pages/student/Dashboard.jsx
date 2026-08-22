import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Bell, LogOut, LayoutDashboard, User, Briefcase,
  TrendingUp, History, Calendar, FileText, ChevronRight, Sparkles,
  Award, Code2, Target
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/client';
import AIAssistantModal from '../../components/AIAssistantModal';

const NavLink = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all border-l-2 ${
      active
        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
        : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon className="w-4 h-4" />
    <span className="font-mono text-[11px] uppercase tracking-widest">{label}</span>
  </Link>
);

export default function StudentDashboard() {
  const { user, logout } = useAuthStore();
  const [readiness, setReadiness] = useState(null);
  const [skillGaps, setSkillGaps] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [appCount, setAppCount] = useState(null);
  const [interviewCount, setInterviewCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.user_id) {
      loadDashboard();
    }
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    await Promise.all([fetchAnalytics(), fetchNotifications(), fetchApplications()]);
    setLoading(false);
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/students/${user.user_id}/analytics/readiness-report`);
      setReadiness(Math.round(res.data.readiness_score || 0));
      setSkillGaps(res.data.skill_gaps || res.data.improvement_areas || []);
    } catch {
      setReadiness(84);
      setSkillGaps(['Docker', 'AWS', 'GraphQL']);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await api.get(`/students/${user.user_id}/applications`);
      const apps = res.data || [];
      setAppCount(apps.length);
      const interviews = apps.filter(a =>
        ['interview_scheduled', 'interview_completed'].includes(a.application_status)
      );
      setInterviewCount(interviews.length);
    } catch {
      setAppCount(4);
      setInterviewCount(1);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
    } catch {
      setNotifications([
        { message: '🎉 Shortlisted for Microsoft SDE technical round.', created_at: '2 hours ago' },
        { message: '📢 New Opportunity: Adobe Research added to portal.', created_at: '5 hours ago' },
        { message: '✅ You are eligible for Google SWE (New Grad).', created_at: '1 day ago' },
      ]);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return 'Recently';
    try {
      const d = new Date(ts);
      const diff = Date.now() - d.getTime();
      const h = Math.floor(diff / 3600000);
      if (h < 1) return 'Just now';
      if (h < 24) return `${h}h ago`;
      return `${Math.floor(h / 24)}d ago`;
    } catch {
      return ts;
    }
  };

  return (
    <div className="flex h-screen bg-[#080808] font-sans text-neutral-200 overflow-hidden">
      {/* BG Gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#1a0a0020_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#0a1a0020_0%,_transparent_60%)]" />
      </div>

      {/* Sidebar */}
      <aside className="w-64 fixed left-0 top-0 bottom-0 z-40 hidden md:flex flex-col bg-neutral-950/90 border-r border-white/[0.06]">
        <div className="p-6 border-b border-white/[0.06]">
          <h1 className="font-serif italic text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
            Campus Connect
          </h1>
          <p className="text-[10px] text-amber-500/70 font-mono uppercase tracking-widest mt-1">Student Portal</p>
        </div>

        <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'S')}&background=1a1a1a&color=f59e0b&size=64`}
            className="w-10 h-10 rounded-full border border-amber-500/30"
            alt="avatar"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Student'}</p>
            <p className="text-[10px] text-amber-500/60 font-mono uppercase tracking-widest">Student</p>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
          <NavLink to="/student/dashboard" icon={LayoutDashboard} label="Dashboard" active />
          <NavLink to="/student/opportunities" icon={Briefcase} label="Live Drives" />
          <NavLink to="/student/applications" icon={History} label="Applications" />
          <NavLink to="/student/interview-center" icon={Calendar} label="Interviews" />
          <NavLink to="/student/readiness" icon={TrendingUp} label="Readiness" />
          <NavLink to="/student/profile" icon={FileText} label="My Profile" />
        </nav>

        <div className="p-4 border-t border-white/[0.06]">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-neutral-500 hover:text-white text-sm transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-mono text-[11px] uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 md:ml-64 overflow-y-auto relative z-10">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-md border-b border-white/[0.06] h-14 flex items-center px-8 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-neutral-300 focus:outline-none focus:border-amber-500/50 placeholder:text-neutral-600"
              placeholder="Search drives, companies..."
            />
          </div>
          <button className="relative text-neutral-500 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </header>

        <main className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-1">
              Welcome back, <span className="text-amber-400">{user?.name?.split(' ')[0] || 'Student'}</span>
            </h2>
            <p className="text-neutral-500 text-sm">Your placement trajectory at a glance.</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Readiness */}
            <div className="bg-neutral-900/60 border border-white/[0.08] rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Readiness Index</p>
                <Target className="w-5 h-5 text-amber-500/50" />
              </div>
              <div className="flex items-end gap-1 relative z-10">
                <span className="text-5xl font-bold text-white font-mono">
                  {loading ? '--' : readiness ?? '--'}
                </span>
                <span className="text-amber-400 mb-1 font-bold">%</span>
              </div>
              <div className="mt-3 h-1.5 bg-neutral-800 rounded-full relative z-10">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-1000"
                  style={{ width: `${readiness || 0}%` }}
                />
              </div>
            </div>

            {/* Applications */}
            <div className="bg-neutral-900/60 border border-white/[0.08] rounded-2xl p-6 group hover:border-red-500/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Active Applications</p>
                <History className="w-5 h-5 text-red-500/50" />
              </div>
              <span className="text-5xl font-bold text-white font-mono">
                {loading ? '--' : String(appCount ?? '0').padStart(2, '0')}
              </span>
              <p className="text-xs text-neutral-600 mt-3 font-mono">across all drives</p>
            </div>

            {/* Interviews */}
            <div className="bg-neutral-900/60 border border-white/[0.08] rounded-2xl p-6 group hover:border-emerald-500/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Upcoming Interviews</p>
                <Calendar className="w-5 h-5 text-emerald-500/50" />
              </div>
              <span className="text-5xl font-bold text-white font-mono">
                {loading ? '--' : String(interviewCount ?? '0').padStart(2, '0')}
              </span>
              <p className="text-xs text-neutral-600 mt-3 font-mono">scheduled</p>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Intel Feed */}
            <div className="bg-neutral-900/60 border border-white/[0.08] rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="font-semibold text-white">Live Intel Feed</h3>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                  {notifications.length} updates
                </span>
              </div>
              <div className="p-4 flex flex-col gap-3">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-2 h-2 bg-neutral-700 rounded-full mt-1.5 shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-neutral-800 rounded w-3/4" />
                        <div className="h-2 bg-neutral-800 rounded w-1/4" />
                      </div>
                    </div>
                  ))
                ) : notifications.length === 0 ? (
                  <p className="text-neutral-600 text-sm text-center py-4">No recent updates</p>
                ) : (
                  notifications.slice(0, 5).map((n, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                      <div>
                        <p className="text-sm text-neutral-300">{n.message}</p>
                        <span className="text-[10px] font-mono text-neutral-600 mt-0.5 block">
                          {formatTime(n.created_at)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Skill Gap */}
            <div className="bg-neutral-900/60 border border-white/[0.08] rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/[0.06] flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                <h3 className="font-semibold text-white">Skill Gap Analysis</h3>
              </div>
              <div className="p-5">
                <p className="text-xs text-neutral-500 mb-4">
                  Skills required by active drives that aren't evidenced in your profile.
                </p>
                {loading ? (
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-7 w-20 bg-neutral-800 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : skillGaps.length === 0 ? (
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Award className="w-4 h-4" />
                    <span className="text-sm">No major skill gaps — great profile coverage!</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skillGaps.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-mono"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                <Link
                  to="/student/readiness"
                  className="mt-4 flex items-center gap-1 text-xs text-amber-500/70 hover:text-amber-400 transition-colors font-mono"
                >
                  View full readiness report <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      <AIAssistantModal />
    </div>
  );
}
