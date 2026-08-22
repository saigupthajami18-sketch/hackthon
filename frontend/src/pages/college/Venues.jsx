import React, { useState } from 'react';
import { MapPin, Search, Plus, CheckCircle2, AlertCircle, Users, Check, X } from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import useAuthStore from '../../store/authStore';

export default function Venues() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [venues, setVenues] = useState([
    { id: 1, name: 'Academic Block B — Room 301', capacity: 15, currentDrive: 'Microsoft SDE-1', status: 'Occupied' },
    { id: 2, name: 'Academic Block B — Room 302', capacity: 15, currentDrive: 'Microsoft SDE-1', status: 'Occupied' },
    { id: 3, name: 'Academic Block B — Room 303', capacity: 15, currentDrive: 'None', status: 'Available' },
    { id: 4, name: 'Main Auditorium (Pre-Placement Talk)', capacity: 450, currentDrive: 'Google Campus Keynote', status: 'Occupied' },
    { id: 5, name: 'Central Computing Complex Lab 4', capacity: 80, currentDrive: 'Online Coding Assessment', status: 'Occupied' },
    { id: 6, name: 'Conference Hall A (HR Round)', capacity: 20, currentDrive: 'None', status: 'Available' },
  ]);

  const [newName, setNewName] = useState('');
  const [newCap, setNewCap] = useState('20');

  const handleAddVenue = (e) => {
    e.preventDefault();
    if (!newName) return;
    setVenues([
      ...venues,
      { id: Date.now(), name: newName, capacity: parseInt(newCap) || 20, currentDrive: 'None', status: 'Available' }
    ]);
    setShowModal(false);
    setNewName('');
  };

  const filtered = venues.filter(v => v.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppLayout role="college">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#EFE5D2] tracking-tight">Venues & Physical Rooms</h1>
          <p className="text-sm text-white/50 mt-1 font-normal">
            Physical room allocation, capacity tracking, and zero-conflict interview coordination.
          </p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-[#A81B2B] to-[#710912] hover:brightness-110 text-[#EFE5D2] font-semibold text-xs uppercase tracking-widest py-2.5 px-4 rounded-xl border-t border-white/20 shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Room / Venue</span>
        </button>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((venue) => (
          <div key={venue.id} className="bg-[#121417]/90 border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="w-9 h-9 rounded-xl bg-white/5 text-[#D4AF37] flex items-center justify-center shrink-0 border border-white/10">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full ${
                  venue.status === 'Available'
                    ? 'bg-[#064E3B]/20 text-[#10B981] border border-[#10B981]/30'
                    : 'bg-blue-950/40 text-blue-300 border border-blue-500/30'
                }`}>
                  {venue.status}
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-base text-[#EFE5D2] leading-snug">{venue.name}</h3>
                <p className="text-xs text-white/40 font-medium mt-1">
                  Capacity: <strong className="text-white/80">{venue.capacity} persons</strong>
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
              <span className="text-white/40 font-medium block">Current Activity:</span>
              <span className="font-bold text-[#D4AF37]">{venue.currentDrive}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#16191D] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/10">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <h3 className="text-lg font-serif font-bold text-[#EFE5D2]">Add New Venue / Room</h3>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVenue} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1 uppercase tracking-wider">Room Name & Block</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Academic Block C — Room 405" 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-[#1A1D20] border border-white/10 rounded-xl py-2.5 px-3.5 text-[#EFE5D2] text-sm focus:outline-none focus:border-[#D4AF37]/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1 uppercase tracking-wider">Seating Capacity</label>
                <input 
                  type="number" 
                  required
                  value={newCap}
                  onChange={e => setNewCap(e.target.value)}
                  className="w-full bg-[#1A1D20] border border-white/10 rounded-xl py-2.5 px-3.5 text-[#EFE5D2] text-sm focus:outline-none focus:border-[#D4AF37]/60"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 font-medium text-xs uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-gradient-to-r from-[#A81B2B] to-[#710912] hover:brightness-110 text-[#EFE5D2] font-semibold text-xs uppercase tracking-widest py-2.5 rounded-xl border-t border-white/20 shadow-lg">
                  Add Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
