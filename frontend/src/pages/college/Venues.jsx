import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, Building, ShieldAlert, BarChart3, Plus, MapPin, Search, Bell, LogOut } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function Venues() {
  const { user, logout } = useAuthStore();
  const [venues, setVenues] = useState([
    { id: 1, name: 'Main Auditorium', capacity: 500, status: 'Available' },
    { id: 2, name: 'Interview Room A1', capacity: 5, status: 'Occupied' },
    { id: 3, name: 'Interview Room A2', capacity: 5, status: 'Available' },
    { id: 4, name: 'Computer Lab 3', capacity: 60, status: 'Maintenance' },
  ]);

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
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-champagne/60 hover:text-champagne hover:bg-white/5 transition-all border-l-2 border-transparent" to="/college/drives">
              <BarChart3 className="w-4 h-4" />
              <span className="font-ui text-[11px] tracking-widest uppercase">Drives</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg bg-burgundy/10 border-l-2 border-burgundy text-champagne transition-all" to="/college/venues">
              <ShieldAlert className="w-4 h-4 text-burgundy" />
              <span className="font-ui text-[11px] tracking-widest uppercase">Venues</span>
            </Link>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 md:ml-64 p-8 overflow-y-auto w-full">
          <header className="mb-10 flex justify-between items-end">
            <div>
              <h1 className="display-title text-4xl mb-2">Venue Management</h1>
              <p className="font-body text-champagne/60 text-sm">Manage physical rooms and capacities for interviews.</p>
            </div>
            
            <button className="flex items-center gap-2 bg-gold/10 text-gold hover:bg-gold/20 px-4 py-2 rounded-lg text-xs font-ui uppercase tracking-widest transition-colors border border-gold/30">
              <Plus className="w-4 h-4" /> Add Venue
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <div key={venue.id} className="glass-panel rounded-xl p-6 border-white/5 hover:border-gold/30 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-champagne group-hover:text-gold transition-colors">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-ui uppercase tracking-widest ${
                    venue.status === 'Available' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    venue.status === 'Occupied' ? 'bg-burgundy/20 text-burgundy border border-burgundy/20' :
                    'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                  }`}>
                    {venue.status}
                  </span>
                </div>
                
                <h3 className="font-display font-semibold text-xl mb-1 group-hover:text-gold transition-colors">{venue.name}</h3>
                <p className="text-sm text-champagne/50">Capacity: {venue.capacity} people</p>
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
}
