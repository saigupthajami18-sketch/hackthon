import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, LogOut, LayoutDashboard, Users, Building, ShieldAlert, BarChart3, Clock, AlertTriangle } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/client';
import AIAssistantModal from '../../components/AIAssistantModal';

export default function CollegeDashboard() {
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState({ pendingApprovals: 0, activeDrives: 0, conflicts: 0, total_students: 0 });
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatTime = (ts) => {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      const h = Math.floor((Date.now() - d.getTime()) / 3600000);
      if (h < 1) return 'Just now';
      if (h < 24) return `${h}h ago`;
      return `${Math.floor(h / 24)}d ago`;
    } catch { return ts; }
  };

  useEffect(() => {
    if (!user?.org_id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [pendingRes, auditRes] = await Promise.all([
          api.get(`/college/${user.org_id}/dashboard/pending-actions`),
          api.get(`/audit?limit=10`).catch(() => ({ data: [] })),
        ]);
        const p = pendingRes.data;
        setStats({
          pendingApprovals: p.pending_approvals ?? 0,
          activeDrives: p.active_drives ?? 0,
          conflicts: p.conflicts ?? 0,
          total_students: p.total_students ?? 0,
        });
        setAuditLogs((auditRes.data || []).map(a => ({
          action: a.action_type?.replace(/_/g, ' ') || 'Action',
          user: a.reason || 'System',
          time: formatTime(a.created_at),
          status: 'Done',
        })));
      } catch {
        // Fallback demo data
        setStats({ pendingApprovals: 3, activeDrives: 5, conflicts: 0, total_students: 50 });
        setAuditLogs([
          { action: 'Shortlist Approved', user: 'Microsoft SDE-1 — 18 candidates', time: '2h ago', status: 'Active' },
          { action: 'Eligibility Run', user: '34 eligible / 50 evaluated', time: '4h ago', status: 'Approved' },
          { action: 'AI Matching', user: '18 candidates scored ≥ 65%', time: '5h ago', status: 'Active' },
          { action: 'Schedule Confirmed', user: '18 slots, 0 conflicts', time: '6h ago', status: 'Active' },
          { action: 'Drive Published', user: 'Microsoft SDE-1', time: '1d ago', status: 'Active' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  return (
    <div className="flex h-screen bg-black font-body text-champagne overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-burgundy/10 via-black to-black opacity-80"></div>
      </div>

      {/* Top Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b-0 border-white/5 h-[72px]">
        <div className="max-w-[1440px] mx-auto px-8 flex justify-between items-center h-full">
          <a className="display-title text-2xl" href="#">Campus Connect <span className="font-ui text-sm text-gold ml-2 uppercase tracking-widest">Admin</span></a>
          
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-champagne/40 w-4 h-4" />
              <input 
                className="input-glass pl-10 py-2 h-10"
                placeholder="Search students, companies, drives..." 
                type="text" 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6 ml-auto md:ml-0">
            <button className="text-champagne/60 hover:text-gold transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button onClick={logout} className="text-champagne/60 hover:text-gold transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
            <div className="h-9 w-9 rounded-full border border-gold/30 overflow-hidden cursor-pointer hover:border-gold transition-colors">
              <img alt="Profile" className="w-full h-full object-cover" src={`https://ui-avatars.com/api/?name=${user?.name || 'A'}&background=362822&color=EFE5D2`} />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 pt-[72px] max-w-[1440px] w-full mx-auto relative z-10">
        
        {/* Sidebar */}
        <aside className="w-64 fixed left-0 top-[72px] bottom-0 border-r border-white/5 hidden md:flex flex-col bg-black/20 backdrop-blur-sm">
          <nav className="flex-1 py-8 flex flex-col gap-2 px-4">
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg bg-burgundy/10 border-l-2 border-burgundy text-champagne transition-all" to="/college/dashboard">
              <LayoutDashboard className="w-4 h-4 text-burgundy" />
              <span className="font-ui text-[11px] tracking-widest uppercase">Dashboard</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-champagne/60 hover:text-champagne hover:bg-white/5 transition-all border-l-2 border-transparent" to="/college/students">
              <Users className="w-4 h-4" />
              <span className="font-ui text-[11px] tracking-widest uppercase">Students</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-champagne/60 hover:text-champagne hover:bg-white/5 transition-all border-l-2 border-transparent" to="/college/companies">
              <Building className="w-4 h-4" />
              <span className="font-ui text-[11px] tracking-widest uppercase">Companies</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-champagne/60 hover:text-champagne hover:bg-white/5 transition-all border-l-2 border-transparent" to="/college/drives">
              <BarChart3 className="w-4 h-4" />
              <span className="font-ui text-[11px] tracking-widest uppercase">Drives</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-rose-300/80 hover:text-rose-300 hover:bg-rose-500/10 transition-all border-l-2 border-transparent" to="/college/dynamic-replanning">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span className="font-ui text-[11px] tracking-widest uppercase">Replanning Center</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-amber-300/80 hover:text-amber-300 hover:bg-amber-500/10 transition-all border-l-2 border-transparent" to="/college/skill-gap-analytics">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span className="font-ui text-[11px] tracking-widest uppercase">Skill Gap Heatmap</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-champagne/60 hover:text-champagne hover:bg-white/5 transition-all border-l-2 border-transparent" to="/college/venues">
              <ShieldAlert className="w-4 h-4" />
              <span className="font-ui text-[11px] tracking-widest uppercase">Venues</span>
            </Link>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 md:ml-64 p-8 overflow-y-auto w-full">
          <header className="mb-10">
            <h1 className="display-title text-4xl mb-2">College Administration</h1>
            <p className="font-body text-champagne/60 text-sm">Overview of campus recruitment activities and pending tasks.</p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Pending Approvals */}
            <div className="glass-panel rounded-xl p-6 relative group overflow-hidden border-gold/20 hover:border-gold/50 transition-colors">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h4 className="font-ui text-[10px] uppercase tracking-widest text-champagne/60">Pending Approvals</h4>
                <ShieldAlert className="text-gold w-5 h-5" />
              </div>
              <div className="relative z-10">
                <span className="font-display font-bold text-5xl">{stats.pendingApprovals}</span>
              </div>
            </div>

            {/* Active Drives */}
            <div className="glass-panel rounded-xl p-6 relative group overflow-hidden border-burgundy/30 hover:border-burgundy/60 transition-colors">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h4 className="font-ui text-[10px] uppercase tracking-widest text-champagne/60">Active Drives</h4>
                <BarChart3 className="text-burgundy w-5 h-5" />
              </div>
              <div className="relative z-10">
                <span className="font-display font-bold text-5xl">{stats.activeDrives}</span>
              </div>
            </div>

            {/* Conflicts */}
            <div className="glass-panel rounded-xl p-6 relative group overflow-hidden border-espresso hover:border-champagne/30 transition-colors">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h4 className="font-ui text-[10px] uppercase tracking-widest text-champagne/60">Schedule Conflicts</h4>
                <AlertTriangle className="text-champagne/40 w-5 h-5" />
              </div>
              <div className="relative z-10">
                <span className="font-display font-bold text-5xl text-champagne/80">{stats.conflicts}</span>
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-xl flex flex-col h-full border-white/5">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-display font-semibold text-xl">Recent Audit Logs</h3>
              <button className="font-ui text-[10px] uppercase tracking-widest text-gold hover:text-champagne transition-colors">View All</button>
            </div>
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="p-4 font-ui text-[10px] uppercase tracking-widest text-champagne/40 font-normal">Action</th>
                    <th className="p-4 font-ui text-[10px] uppercase tracking-widest text-champagne/40 font-normal">Entity</th>
                    <th className="p-4 font-ui text-[10px] uppercase tracking-widest text-champagne/40 font-normal">Time</th>
                    <th className="p-4 font-ui text-[10px] uppercase tracking-widest text-champagne/40 font-normal text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="p-4 font-body text-sm text-champagne">{log.action}</td>
                      <td className="p-4 font-body text-sm text-champagne/80">{log.user}</td>
                      <td className="p-4 font-body text-sm text-champagne/60 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> {log.time}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`px-3 py-1 rounded-full font-ui text-[9px] uppercase tracking-widest border ${
                          log.status === 'Approved' || log.status === 'Active' 
                            ? 'bg-burgundy/10 border-burgundy/30 text-champagne' 
                            : 'bg-gold/10 border-gold/30 text-gold'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </main>
      </div>
      <AIAssistantModal />
    </div>
  );
}
