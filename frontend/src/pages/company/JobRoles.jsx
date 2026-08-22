import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Briefcase, Plus, Sparkles, DollarSign, MapPin, 
  CheckCircle2, FileText, ChevronRight, Edit3, Trash2
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import AIAssistantModal from '../../components/AIAssistantModal';

export default function JobRoles() {
  const { user } = useAuthStore();

  const [roles, setRoles] = useState([
    {
      id: 'role_1',
      title: 'Software Development Engineer - 1',
      type: 'Full Time (FTE)',
      ctc: '24.5 LPA',
      location: 'Hyderabad / Bengaluru',
      minCgpa: 7.5,
      skills: ['Python', 'System Design', 'Algorithms', 'SQL'],
      status: 'Active Drive'
    },
    {
      id: 'role_2',
      title: 'Cloud Infrastructure & DevOps Associate',
      type: '6M Intern + FTE',
      ctc: '18.0 LPA',
      location: 'Bengaluru / Remote',
      minCgpa: 7.0,
      skills: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'Go'],
      status: 'Drafting'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCtc, setNewCtc] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle) return;
    setRoles([
      ...roles,
      {
        id: `role_${Date.now()}`,
        title: newTitle,
        type: 'Full Time (FTE)',
        ctc: newCtc || '20.0 LPA',
        location: newLocation || 'Bengaluru',
        minCgpa: 7.5,
        skills: ['Python', 'Cloud', 'REST API', 'Data Structures'],
        status: 'Drafting'
      }
    ]);
    setShowModal(false);
    setNewTitle('');
    setNewCtc('');
    setNewLocation('');
  };

  return (
    <div className="min-h-screen bg-black font-body text-champagne">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-950/20 via-black to-black"></div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-white/10 h-16">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-full">
          <div className="flex items-center gap-4">
            <Link to="/company/dashboard" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs uppercase tracking-wider font-ui">
              <ArrowLeft className="w-4 h-4" /> Recruiter Hub
            </Link>
            <span className="text-neutral-600">/</span>
            <span className="text-white font-medium text-sm">Job Roles & JD Directory</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/company/candidate-pipeline" className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-300 transition-colors border border-white/10">
              Candidate Pipeline
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono mb-3">
              <Briefcase className="w-3.5 h-3.5" /> RECRUITMENT REQUIREMENTS
            </div>
            <h1 className="display-title text-3xl md:text-4xl text-white font-bold tracking-tight">
              Corporate Job Roles & JD Templates
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Manage standardized campus hiring job roles, eligibility thresholds, and compensation packages.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase font-ui tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all"
          >
            <Plus className="w-4 h-4" /> Define New Role
          </button>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((r) => (
            <div key={r.id} className="p-6 rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-amber-500/30 transition-all shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 font-mono text-xs font-semibold">
                    {r.type}
                  </span>
                  <span className="font-mono text-amber-400 font-bold text-base">{r.ctc}</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{r.title}</h3>
                <p className="text-xs text-neutral-400 mb-4 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {r.location} • Minimum CGPA: <strong className="text-neutral-200 font-mono">{r.minCgpa}</strong>
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {r.skills.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-neutral-900 border border-white/10 text-[10px] text-neutral-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400">Status: <strong className="text-emerald-400">{r.status}</strong></span>
                <Link
                  to="/company/candidate-pipeline"
                  className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white border border-white/10 flex items-center gap-1"
                >
                  View Pipeline <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="w-full max-w-md bg-neutral-950 border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Define New Campus Role</h2>
            <div>
              <label className="text-xs font-mono uppercase text-neutral-400 block mb-1">Job Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Associate Backend Engineer"
                className="w-full p-2.5 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase text-neutral-400 block mb-1">Package (CTC in LPA)</label>
              <input
                type="text"
                value={newCtc}
                onChange={(e) => setNewCtc(e.target.value)}
                placeholder="e.g. 22.0 LPA"
                className="w-full p-2.5 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase text-neutral-400 block mb-1">Location</label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="e.g. Hyderabad / Remote"
                className="w-full p-2.5 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-white/5 text-xs text-neutral-400">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold font-ui uppercase">Create Role</button>
            </div>
          </form>
        </div>
      )}

      <AIAssistantModal />
    </div>
  );
}
