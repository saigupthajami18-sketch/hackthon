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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Venues & Physical Rooms</h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            Physical room allocation, capacity tracking, and zero-conflict interview coordination.
          </p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="btn-blue shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Room / Venue</span>
        </button>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((venue) => (
          <div key={venue.id} className="app-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  venue.status === 'Available'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {venue.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 leading-snug">{venue.name}</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Capacity: <strong className="text-slate-700">{venue.capacity} persons</strong>
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-400 font-medium block">Current Activity:</span>
              <span className="font-bold text-slate-800">{venue.currentDrive}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add New Venue / Room</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVenue} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Room Name & Block</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Academic Block C — Room 405" 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="app-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Seating Capacity</label>
                <input 
                  type="number" 
                  required
                  value={newCap}
                  onChange={e => setNewCap(e.target.value)}
                  className="app-input"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-blue">
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
