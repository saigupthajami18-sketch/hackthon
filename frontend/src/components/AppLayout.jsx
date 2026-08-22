import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, Briefcase, Target, Users, Calendar, Bell, 
  BarChart2, FileText, LogOut, GraduationCap, Building2, MapPin
} from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function AppLayout({ children, role = 'recruiter' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Nav menus per role
  const recruiterNav = [
    { name: 'Dashboard', path: '/company/dashboard', icon: LayoutGrid },
    { name: 'My Job Postings', path: '/company/job-roles', icon: Briefcase },
    { name: 'Candidate Matching', path: '/company/candidate-pipeline', icon: Target },
    { name: 'Interview Panels', path: '/company/interview-panels', icon: Users },
    { name: 'Scheduling', path: '/company/scheduling', icon: Calendar },
    { name: 'Notifications', path: '/company/notifications', icon: Bell },
  ];

  const studentNav = [
    { name: 'My Dashboard', path: '/student/dashboard', icon: LayoutGrid },
    { name: 'Browse Jobs', path: '/student/opportunities', icon: Briefcase },
    { name: 'My Interviews', path: '/student/applications', icon: Calendar },
    { name: 'Notifications', path: '/student/notifications', icon: Bell },
    { name: 'My Analytics', path: '/student/readiness', icon: BarChart2 },
    { name: 'My Profile', path: '/student/profile', icon: FileText },
  ];

  const collegeNav = [
    { name: 'Dashboard', path: '/college/dashboard', icon: LayoutGrid },
    { name: 'Students Directory', path: '/college/students', icon: Users },
    { name: 'Partner Companies', path: '/college/companies', icon: Building2 },
    { name: 'Placement Drives', path: '/college/drives', icon: Briefcase },
    { name: 'Venues & Rooms', path: '/college/venues', icon: MapPin },
  ];

  const currentRole = user?.role === 'student' ? 'student' : (user?.role === 'college_admin' ? 'college' : 'recruiter');
  const navItems = currentRole === 'student' ? studentNav : (currentRole === 'college' ? collegeNav : recruiterNav);

  const roleTitle = currentRole === 'student' ? 'Student' : (currentRole === 'college' ? 'College Admin' : 'Company Recruiter');
  const themeColor = currentRole === 'student' ? 'bg-blue-600' : (currentRole === 'college' ? 'bg-indigo-600' : 'bg-emerald-600');
  const activePill = currentRole === 'student' ? 'bg-blue-50 text-blue-600' : (currentRole === 'college' ? 'bg-indigo-50 text-indigo-600' : 'bg-[#E8F8F0] text-[#0D7A53]');
  const activeIcon = currentRole === 'student' ? 'text-blue-600' : (currentRole === 'college' ? 'text-indigo-600' : 'text-[#0D7A53]');

  const orgSubtitle = user?.role === 'student' ? (user?.college_name || 'NIT Engineering') : (user?.company_name || user?.org_name || 'Campus Connect');
  const userInitials = (user?.name || 'User').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between z-20 shrink-0 select-none">
        <div>
          {/* Top Logo */}
          <div className="p-6 pb-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${themeColor} flex items-center justify-center text-white shadow-sm`}>
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg leading-tight tracking-tight">PlacementOps</h1>
              <p className="text-xs text-slate-500 font-medium">{roleTitle}</p>
            </div>
          </div>

          {/* Nav items */}
          <nav className="px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive 
                      ? `${activePill} font-semibold shadow-xs` 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? activeIcon : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Card */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                {userInitials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'User'}</p>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                  <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{orgSubtitle}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors ml-1" 
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-y-auto bg-[#F8FAFC] relative">
        <div className="max-w-6xl mx-auto p-8 pb-16">
          {children}
        </div>

        {/* Watermark badge bottom right matching screenshots */}
        <div className="fixed bottom-3 right-4 bg-white/90 backdrop-blur-xs border border-slate-200/80 shadow-xs px-2.5 py-1 rounded-md text-[11px] text-slate-600 font-medium flex items-center gap-1 pointer-events-none select-none z-50">
          <span className="font-bold text-slate-900">PlacementOps</span> AI
        </div>
      </main>

    </div>
  );
}
