import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, LogOut, LayoutDashboard, Building2, Briefcase, FileText, CheckSquare, Clock, Users, UserCheck } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/client';
import AIAssistantModal from '../../components/AIAssistantModal';

export default function CompanyDashboard() {
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState({ activeDrives: 0, pendingReviews: 0, interviewsToday: 0 });
  const [recentDrives, setRecentDrives] = useState([]);

  useEffect(() => {
    // Mock Data for now
    setStats({ activeDrives: 2, pendingReviews: 45, interviewsToday: 12 });
    setRecentDrives([
      { role: 'Software Development Engineer', applicants: 120, status: 'Matching Phase' },
      { role: 'Data Analyst Intern', applicants: 85, status: 'Interviewing' },
    ]);
  }, []);

  return (
    <div className="flex h-screen bg-black font-body text-champagne overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-gold/10 via-black to-black opacity-80"></div>
      </div>

      {/* Top Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b-0 border-white/5 h-[72px]">
        <div className="max-w-[1440px] mx-auto px-8 flex justify-between items-center h-full">
          <a className="display-title text-2xl" href="#">Campus Connect <span className="font-ui text-sm text-burgundy ml-2 uppercase tracking-widest">Corporate</span></a>
          
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-champagne/40 w-4 h-4" />
              <input 
                className="input-glass pl-10 py-2 h-10"
                placeholder="Search candidates, drives..." 
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
              <img alt="Profile" className="w-full h-full object-cover" src={`https://ui-avatars.com/api/?name=${user?.name || 'C'}&background=362822&color=EFE5D2`} />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 pt-[72px] max-w-[1440px] w-full mx-auto relative z-10">
        
        {/* Sidebar */}
        <aside className="w-64 fixed left-0 top-[72px] bottom-0 border-r border-white/5 hidden md:flex flex-col bg-black/20 backdrop-blur-sm">
          <nav className="flex-1 py-8 flex flex-col gap-2 px-4">
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-500/10 border-l-2 border-amber-500 text-amber-300 transition-all" to="/company/dashboard">
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span className="font-ui text-[11px] tracking-widest uppercase">Dashboard</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-champagne/60 hover:text-champagne hover:bg-white/5 transition-all border-l-2 border-transparent" to="/company/job-roles">
              <Briefcase className="w-4 h-4" />
              <span className="font-ui text-[11px] tracking-widest uppercase">Job Roles & JDs</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-champagne/60 hover:text-champagne hover:bg-white/5 transition-all border-l-2 border-transparent" to="/company/candidate-pipeline">
              <Users className="w-4 h-4" />
              <span className="font-ui text-[11px] tracking-widest uppercase">Candidate Funnel</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-champagne/60 hover:text-champagne hover:bg-white/5 transition-all border-l-2 border-transparent" to="/company/interview-results">
              <UserCheck className="w-4 h-4" />
              <span className="font-ui text-[11px] tracking-widest uppercase">Scorecards & Offers</span>
            </Link>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 md:ml-64 p-8 overflow-y-auto w-full">
          <header className="mb-10">
            <h1 className="display-title text-4xl mb-2">Corporate Dashboard</h1>
            <p className="font-body text-champagne/60 text-sm">Monitor your hiring pipeline and scheduled interviews.</p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Active Drives */}
            <div className="glass-panel rounded-xl p-6 relative group overflow-hidden border-burgundy/30 hover:border-burgundy/60 transition-colors">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h4 className="font-ui text-[10px] uppercase tracking-widest text-champagne/60">Active Drives</h4>
                <Briefcase className="text-burgundy w-5 h-5" />
              </div>
              <div className="relative z-10">
                <span className="font-display font-bold text-5xl">{stats.activeDrives}</span>
              </div>
            </div>

            {/* Pending Reviews */}
            <div className="glass-panel rounded-xl p-6 relative group overflow-hidden border-gold/20 hover:border-gold/50 transition-colors">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h4 className="font-ui text-[10px] uppercase tracking-widest text-champagne/60">Shortlists to Review</h4>
                <CheckSquare className="text-gold w-5 h-5" />
              </div>
              <div className="relative z-10">
                <span className="font-display font-bold text-5xl">{stats.pendingReviews}</span>
              </div>
            </div>

            {/* Interviews Today */}
            <div className="glass-panel rounded-xl p-6 relative group overflow-hidden border-espresso hover:border-champagne/30 transition-colors">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h4 className="font-ui text-[10px] uppercase tracking-widest text-champagne/60">Interviews Today</h4>
                <Clock className="text-champagne/40 w-5 h-5" />
              </div>
              <div className="relative z-10 flex items-end gap-3">
                <span className="font-display font-bold text-5xl text-champagne/80">{stats.interviewsToday}</span>
                <span className="font-ui text-[10px] text-burgundy mb-2">Needs Action</span>
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-xl flex flex-col h-full border-white/5">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-display font-semibold text-xl">Recent Drives Pipeline</h3>
              <button className="font-ui text-[10px] uppercase tracking-widest text-gold hover:text-champagne transition-colors">View All</button>
            </div>
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="p-4 font-ui text-[10px] uppercase tracking-widest text-champagne/40 font-normal">Role</th>
                    <th className="p-4 font-ui text-[10px] uppercase tracking-widest text-champagne/40 font-normal">Applicants</th>
                    <th className="p-4 font-ui text-[10px] uppercase tracking-widest text-champagne/40 font-normal text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDrives.map((drive, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer">
                      <td className="p-4 font-body text-sm text-champagne font-medium">{drive.role}</td>
                      <td className="p-4 font-body text-sm text-champagne/80">{drive.applicants} <span className="text-xs text-champagne/40">Total</span></td>
                      <td className="p-4 text-right">
                        <span className={`px-3 py-1 rounded-full font-ui text-[9px] uppercase tracking-widest border ${
                          drive.status === 'Interviewing' 
                            ? 'bg-burgundy/10 border-burgundy/30 text-champagne' 
                            : 'bg-gold/10 border-gold/30 text-gold'
                        }`}>
                          {drive.status}
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
