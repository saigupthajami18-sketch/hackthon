import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Building, ShieldAlert, BarChart3, Search, Bell, LogOut, Calendar, Plus, Clock, ExternalLink } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/client';

export default function Drives() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/drives');
        setDrives(res.data || []);
      } catch {
        setDrives([
          { drive_id: '1', title: 'Microsoft SDE-1', status: 'schedule_confirmed', stats: { total_applied: 50, eligible: 34, shortlisted: 18 }, drive_date: null, ctc_min: 2450000, ctc_max: 2450000 },
          { drive_id: '2', title: 'Google SWE (New Grad)', status: 'shortlist_approved', stats: { total_applied: 45, eligible: 28, shortlisted: 10 }, drive_date: null, ctc_min: 3200000, ctc_max: 4000000 },
          { drive_id: '3', title: 'Adobe MTS', status: 'eligibility_complete', stats: { total_applied: 40, eligible: 30, shortlisted: 0 }, drive_date: null, ctc_min: 2200000, ctc_max: 2800000 },
          { drive_id: '4', title: 'Amazon SDE-1', status: 'published', stats: { total_applied: 0, eligible: 0, shortlisted: 0 }, drive_date: null, ctc_min: 2600000, ctc_max: 3400000 },
          { drive_id: '5', title: 'Infosys SE', status: 'published', stats: { total_applied: 0, eligible: 0, shortlisted: 0 }, drive_date: null, ctc_min: 360000, ctc_max: 450000 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const STATUS_COLORS = {
    schedule_confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    shortlist_approved: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    eligibility_complete: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    published: 'bg-white/5 text-neutral-400 border-white/10',
    draft: 'bg-white/5 text-neutral-600 border-white/5',
    closed: 'bg-neutral-900 text-neutral-600 border-white/5',
  };

  const formatCTC = (min, max) => {
    if (!min) return 'TBD';
    const l = v => (v / 100000).toFixed(1);
    return min === max ? `₹${l(min)} LPA` : `₹${l(min)}–${l(max)} LPA`;
  };

  const filtered = drives.filter(d =>
    d.title?.toLowerCase().includes(search.toLowerCase()) ||
    d.status?.includes(search.toLowerCase())
  );


  return (
    <div className="flex h-screen bg-black font-body text-champagne overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-burgundy/10 via-black to-black opacity-80"></div>
      </div>

      {/* Top Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b-0 border-white/5 h-[72px]">
        <div className="max-w-[1440px] mx-auto px-8 flex justify-between items-center h-full">
          <Link className="display-title text-2xl" to="/college/dashboard">Campus Connect <span className="font-ui text-sm text-gold ml-2 uppercase tracking-widest">Admin</span></Link>
          
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
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-champagne/60 hover:text-champagne hover:bg-white/5 transition-all border-l-2 border-transparent" to="/college/dashboard">
              <LayoutDashboard className="w-4 h-4" />
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
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg bg-burgundy/10 border-l-2 border-burgundy text-champagne transition-all" to="/college/drives">
              <BarChart3 className="w-4 h-4 text-burgundy" />
              <span className="font-ui text-[11px] tracking-widest uppercase">Drives</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-champagne/60 hover:text-champagne hover:bg-white/5 transition-all border-l-2 border-transparent" to="/college/venues">
              <ShieldAlert className="w-4 h-4" />
              <span className="font-ui text-[11px] tracking-widest uppercase">Venues</span>
            </Link>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 md:ml-64 p-8 overflow-y-auto w-full">
          <header className="mb-10 flex justify-between items-end">
            <div>
              <h1 className="display-title text-4xl mb-2">Job Drives</h1>
              <p className="font-body text-champagne/60 text-sm">Manage ongoing and upcoming recruitment drives.</p>
            </div>
            
            <button className="flex items-center gap-2 bg-gold/10 text-gold hover:bg-gold/20 px-4 py-2 rounded-lg text-xs font-ui uppercase tracking-widest transition-colors border border-gold/30">
              <Plus className="w-4 h-4" /> New Drive
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading ? (
              [1,2,3].map(i => (
                <div key={i} className="glass-panel rounded-xl p-6 border-white/5 h-52 animate-pulse">
                  <div className="h-4 bg-neutral-800 rounded w-24 mb-4" />
                  <div className="h-6 bg-neutral-800 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-neutral-800 rounded w-1/2" />
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="col-span-3 text-center py-16 text-champagne/40">
                <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No drives found</p>
              </div>
            ) : (
              filtered.map((drive) => (
                <div key={drive.drive_id} className="glass-panel rounded-xl p-6 border-white/5 hover:border-gold/30 transition-colors cursor-pointer group flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-ui uppercase tracking-widest border ${
                      STATUS_COLORS[drive.status] || 'bg-white/5 text-neutral-400 border-white/10'
                    }`}>
                      {drive.status?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-amber-400 font-mono text-sm font-bold">{formatCTC(drive.ctc_min, drive.ctc_max)}</span>
                  </div>
                  
                  <h3 className="font-display font-semibold text-xl mb-1 group-hover:text-gold transition-colors">{drive.title}</h3>
                  <p className="text-xs text-champagne/50 mb-4">
                    {drive.drive_date ? new Date(drive.drive_date).toLocaleDateString('en-IN') : 'Date TBD'}
                  </p>
                  
                  <div className="mt-auto space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[['Applied', drive.stats?.total_applied ?? 0], ['Eligible', drive.stats?.eligible ?? 0], ['Shortlisted', drive.stats?.shortlisted ?? 0]].map(([label, val]) => (
                        <div key={label} className="bg-white/5 rounded-lg p-2">
                          <div className="text-lg font-bold font-mono text-champagne">{val}</div>
                          <div className="text-[10px] text-champagne/40 uppercase tracking-widest">{label}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4 border-t border-white/10 flex gap-2">
                      <Link
                        to={`/college/drives/${drive.drive_id}`}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-champagne py-2 rounded text-xs font-ui uppercase tracking-widest transition-colors text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
