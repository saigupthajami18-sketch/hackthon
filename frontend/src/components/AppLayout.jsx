import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building, BarChart3, ShieldAlert, 
  MapPin, Bell, LogOut, Search, Briefcase, Target, Calendar, 
  FileText, Sparkles
} from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function AppLayout({ children, role = 'college' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Nav menus per role
  const recruiterNav = [
    { name: 'DASHBOARD', path: '/company/dashboard', icon: LayoutDashboard },
    { name: 'MY JOB POSTINGS', path: '/company/job-roles', icon: Briefcase },
    { name: 'CANDIDATE MATCHING', path: '/company/candidate-pipeline', icon: Target },
    { name: 'INTERVIEW PANELS', path: '/company/interview-panels', icon: Users },
    { name: 'SCHEDULING', path: '/company/scheduling', icon: Calendar },
    { name: 'NOTIFICATIONS', path: '/company/notifications', icon: Bell },
  ];

  const studentNav = [
    { name: 'DASHBOARD', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'BROWSE JOBS', path: '/student/opportunities', icon: Briefcase },
    { name: 'MY INTERVIEWS', path: '/student/applications', icon: Calendar },
    { name: 'NOTIFICATIONS', path: '/student/notifications', icon: Bell },
    { name: 'MY ANALYTICS', path: '/student/readiness', icon: BarChart3 },
    { name: 'MY PROFILE', path: '/student/profile', icon: FileText },
  ];

  const collegeNav = [
    { name: 'DASHBOARD', path: '/college/dashboard', icon: LayoutDashboard },
    { name: 'STUDENTS', path: '/college/students', icon: Users },
    { name: 'COMPANIES', path: '/college/companies', icon: Building },
    { name: 'DRIVES', path: '/college/drives', icon: BarChart3 },
    { name: 'VENUES', path: '/college/venues', icon: MapPin },
    { name: 'REPLANNING CENTER', path: '/college/dynamic-replanning', icon: ShieldAlert },
    { name: 'SKILL GAP HEATMAP', path: '/college/skill-gap-analytics', icon: BarChart3 },
  ];

  const currentRole = user?.role === 'student' ? 'student' : (user?.role === 'college_admin' ? 'college' : 'recruiter');
  const navItems = currentRole === 'student' ? studentNav : (currentRole === 'college' ? collegeNav : recruiterNav);

  const roleTitle = currentRole === 'student' ? 'STUDENT' : (currentRole === 'college' ? 'ADMIN' : 'RECRUITER');
  const userInitials = (user?.name || 'User').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EFE5D2] font-sans overflow-x-hidden relative flex flex-col">
      
      {/* Background Radial Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#710912]/15 via-[#0A0A0A] to-[#0A0A0A]"></div>
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0E1012]/90 backdrop-blur-md border-b border-white/10 h-18 px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="font-serif italic font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#EFE5D2] to-[#D4AF37]">
              Campus Connect
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] px-2 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/20">
              {roleTitle}
            </span>
          </Link>
        </div>

        {/* Center Search Input */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
            <input 
              className="w-full bg-[#16191D] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-[#EFE5D2] placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
              placeholder="Search students, companies, drives..." 
              type="text" 
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button className="text-white/60 hover:text-[#D4AF37] p-2 rounded-lg transition-colors">
            <Bell className="w-4 h-4" />
          </button>
          
          <button 
            onClick={handleLogout} 
            className="text-white/60 hover:text-rose-400 p-2 rounded-lg transition-colors" 
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>

          <div className="w-9 h-9 rounded-full bg-[#1A1D20] border border-[#D4AF37]/40 text-[#D4AF37] font-bold text-xs flex items-center justify-center cursor-pointer shadow-sm">
            {userInitials}
          </div>
        </div>

      </header>

      {/* Main Layout Body */}
      <div className="flex flex-1 relative z-10">
        
        {/* Left Sidebar */}
        <aside className="w-64 shrink-0 bg-[#0E1012]/80 backdrop-blur-md border-r border-white/10 hidden md:flex flex-col justify-between py-6 select-none">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-[11px] font-semibold tracking-widest uppercase transition-all duration-150 ${
                    isActive
                      ? 'bg-[#710912]/20 border-l-[3px] border-[#A81B2B] text-[#EFE5D2] shadow-xs'
                      : 'text-white/40 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-white/40'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom user badge info */}
          <div className="px-4 pt-4 border-t border-white/5 mx-3">
            <p className="text-xs font-bold text-[#EFE5D2] truncate">{user?.name || 'User'}</p>
            <p className="text-[11px] text-white/40 truncate mt-0.5">{user?.college_name || user?.company_name || 'Campus Connect'}</p>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>

      </div>

    </div>
  );
}
