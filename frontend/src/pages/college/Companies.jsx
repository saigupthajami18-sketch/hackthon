import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, Building, ShieldAlert, BarChart3, Search, Bell, LogOut, ExternalLink, CheckCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function Companies() {
  const { user, logout } = useAuthStore();
  const [companies, setCompanies] = useState([
    { id: 1, name: 'Tech Solutions Inc', industry: 'Software', status: 'Pending' },
    { id: 2, name: 'Global Finance Corp', industry: 'Fintech', status: 'Approved' },
    { id: 3, name: 'NextGen AI', industry: 'Artificial Intelligence', status: 'Approved' },
  ]);

  const approveCompany = (id) => {
    setCompanies(companies.map(c => c.id === id ? { ...c, status: 'Approved' } : c));
    alert("Company approved! They can now host job drives.");
  };

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
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg bg-burgundy/10 border-l-2 border-burgundy text-champagne transition-all" to="/college/companies">
              <Building className="w-4 h-4 text-burgundy" />
              <span className="font-ui text-[11px] tracking-widest uppercase">Companies</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-champagne/60 hover:text-champagne hover:bg-white/5 transition-all border-l-2 border-transparent" to="/college/drives">
              <BarChart3 className="w-4 h-4" />
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
              <h1 className="display-title text-4xl mb-2">Partner Companies</h1>
              <p className="font-body text-champagne/60 text-sm">Manage recruiting partners and approve new access requests.</p>
            </div>
          </header>

          <section className="glass-panel rounded-xl flex flex-col h-full border-white/5">
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="p-4 font-ui text-[10px] uppercase tracking-widest text-champagne/40 font-normal">Company Name</th>
                    <th className="p-4 font-ui text-[10px] uppercase tracking-widest text-champagne/40 font-normal">Industry</th>
                    <th className="p-4 font-ui text-[10px] uppercase tracking-widest text-champagne/40 font-normal">Status</th>
                    <th className="p-4 font-ui text-[10px] uppercase tracking-widest text-champagne/40 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr key={company.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-champagne font-display font-bold">
                            {company.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-body font-medium text-champagne">{company.name}</p>
                            <a href="#" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-0.5">
                              View Profile <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-body text-sm text-champagne/80">{company.industry}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full font-ui text-[9px] uppercase tracking-widest border ${
                          company.status === 'Approved' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-gold/10 border-gold/30 text-gold'
                        }`}>
                          {company.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {company.status === 'Pending' && (
                          <button 
                            onClick={() => approveCompany(company.id)}
                            className="flex items-center gap-1 bg-gold/10 text-gold hover:bg-gold/20 px-3 py-1.5 rounded-lg text-xs font-ui uppercase tracking-widest transition-colors ml-auto"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
