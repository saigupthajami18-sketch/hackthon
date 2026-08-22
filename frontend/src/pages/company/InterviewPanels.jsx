import React, { useState, useEffect } from 'react';
import { Plus, Users, User, Mail, Briefcase, AlertCircle, CheckCircle2, X } from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import api from '../../api/client';
import useAuthStore from '../../store/authStore';

export default function InterviewPanels() {
  const { user } = useAuthStore();
  const [panelsData, setPanelsData] = useState([
    {
      id: 'p1',
      jobTitle: 'Software Engineer',
      company: 'TechNova Solutions',
      panelists: [
        { name: 'Dr. Rajesh Kumar', role: 'Technical Lead', email: 'rajesh.kumar@technova.com' },
        { name: 'Ms. Sneha Agarwal', role: 'HR Manager', email: 'sneha.agarwal@technova.com' },
      ]
    },
    {
      id: 'p2',
      jobTitle: 'Machine Learning Engineer',
      company: 'Quantum Analytics',
      panelists: [
        { name: 'Dr. Meera Joshi', role: 'ML Research Lead', email: 'meera.joshi@quantumanalytics.com' },
      ]
    },
    {
      id: 'p3',
      jobTitle: 'Full Stack Developer',
      company: 'CloudForge Systems',
      panelists: []
    }
  ]);

  const [drives, setDrives] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState('');
  const [panelistName, setPanelistName] = useState('');
  const [panelistRole, setPanelistRole] = useState('');
  const [panelistEmail, setPanelistEmail] = useState('');
  const [activeAssignJobId, setActiveAssignJobId] = useState(null);

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const res = await api.get('/drives');
      if (res.data && res.data.length > 0) {
        setDrives(res.data);
        const mapped = res.data.map(d => ({
          id: d.drive_id,
          jobTitle: d.title,
          company: d.company_name || user?.name || 'TechNova Solutions',
          panelists: [
            { name: 'Dr. Rajesh Kumar', role: 'Technical Lead', email: 'rajesh.kumar@technova.com' },
            { name: 'Ms. Sneha Agarwal', role: 'HR Manager', email: 'sneha.agarwal@technova.com' }
          ]
        }));
        setPanelsData(mapped);
      }
    } catch (e) {
      console.log('Using seeded panels');
    }
  };

  const handleOpenAddModal = (jobId = null) => {
    setActiveAssignJobId(jobId);
    if (jobId) {
      const p = panelsData.find(x => x.id === jobId);
      if (p) setSelectedJob(p.jobTitle);
    } else if (panelsData.length > 0) {
      setSelectedJob(panelsData[0].jobTitle);
    }
    setShowModal(true);
  };

  const handleAddPanelist = (e) => {
    e.preventDefault();
    if (!panelistName || !panelistRole) return;

    setPanelsData(prev => prev.map(p => {
      if (p.jobTitle === selectedJob || p.id === activeAssignJobId) {
        return {
          ...p,
          panelists: [
            ...p.panelists,
            {
              name: panelistName,
              role: panelistRole,
              email: panelistEmail || `${panelistName.toLowerCase().replace(/\s+/g, '.')}@corporate.com`
            }
          ]
        };
      }
      return p;
    }));

    setShowModal(false);
    setPanelistName('');
    setPanelistRole('');
    setPanelistEmail('');
  };

  return (
    <AppLayout role="recruiter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#EFE5D2] tracking-tight">Interview Panels & Panelists</h1>
          <p className="text-sm text-white/50 mt-1 font-normal">
            Manage interviewer assignments, technical evaluation panels, and job role associations.
          </p>
        </div>

        <button 
          onClick={() => handleOpenAddModal()}
          className="bg-gradient-to-r from-[#A81B2B] to-[#710912] hover:brightness-110 text-[#EFE5D2] font-semibold text-xs uppercase tracking-widest py-2.5 px-5 rounded-xl border-t border-white/20 shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Panelist</span>
        </button>
      </div>

      {/* Panels List */}
      <div className="space-y-6">
        {panelsData.map((job) => (
          <div key={job.id} className="bg-[#121417]/90 border border-white/10 p-6 rounded-2xl shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#EFE5D2]">{job.jobTitle}</h3>
                <p className="text-xs text-white/40 font-medium">{job.company}</p>
              </div>

              <button 
                onClick={() => handleOpenAddModal(job.id)}
                className="bg-transparent hover:bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/50 font-bold text-xs uppercase tracking-wider py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Add Panelist</span>
              </button>
            </div>

            {/* Panelists Cards */}
            {job.panelists.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center gap-3 text-amber-300 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>No panelists assigned yet. Click "Add Panelist" to configure technical evaluation for this role.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {job.panelists.map((p, pIdx) => (
                  <div key={pIdx} className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#181A1E] text-[#D4AF37] font-bold text-xs flex items-center justify-center shrink-0 border border-white/10">
                      {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-sm text-[#EFE5D2] truncate">{p.name}</h4>
                      <p className="text-xs text-white/40 font-medium truncate">{p.role}</p>
                      <p className="text-[11px] text-white/30 truncate mt-0.5">{p.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Panelist Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#16191D] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/10">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <h3 className="text-lg font-serif font-bold text-[#EFE5D2]">Add Panelist</h3>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPanelist} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1 uppercase tracking-wider">Assign to Job Role</label>
                <select 
                  value={selectedJob} 
                  onChange={e => setSelectedJob(e.target.value)}
                  className="w-full bg-[#1A1D20] border border-white/10 rounded-xl py-2.5 px-3.5 text-[#EFE5D2] text-xs focus:outline-none focus:border-[#D4AF37]/60"
                >
                  {panelsData.map(p => (
                    <option key={p.id} value={p.jobTitle}>{p.jobTitle}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1 uppercase tracking-wider">Interviewer Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Dr. Rajesh Kumar" 
                  value={panelistName}
                  onChange={e => setPanelistName(e.target.value)}
                  className="w-full bg-[#1A1D20] border border-white/10 rounded-xl py-2.5 px-3.5 text-[#EFE5D2] text-sm focus:outline-none focus:border-[#D4AF37]/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1 uppercase tracking-wider">Designation / Role</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Technical Lead / Principal Architect" 
                  value={panelistRole}
                  onChange={e => setPanelistRole(e.target.value)}
                  className="w-full bg-[#1A1D20] border border-white/10 rounded-xl py-2.5 px-3.5 text-[#EFE5D2] text-sm focus:outline-none focus:border-[#D4AF37]/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1 uppercase tracking-wider">Corporate Email</label>
                <input 
                  type="email" 
                  placeholder="e.g. interviewer@company.com" 
                  value={panelistEmail}
                  onChange={e => setPanelistEmail(e.target.value)}
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
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-[#A81B2B] to-[#710912] hover:brightness-110 text-[#EFE5D2] font-semibold text-xs uppercase tracking-widest py-2.5 rounded-xl border-t border-white/20 shadow-lg"
                >
                  Add Panelist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
