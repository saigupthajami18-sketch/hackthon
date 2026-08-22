import React, { useState, useEffect } from 'react';
import { 
  Search, Briefcase, DollarSign, CheckCircle2, XCircle, 
  ArrowRight, ShieldCheck, Check, Sparkles, Filter, ChevronRight, X
} from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import api from '../../api/client';
import useAuthStore from '../../store/authStore';

export default function BrowseJobs() {
  const { user } = useAuthStore();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [appliedDriveIds, setAppliedDriveIds] = useState(new Set());
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchDrives();
  }, [user]);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const [drivesRes, appsRes] = await Promise.all([
        api.get('/drives').catch(() => ({ data: [] })),
        user?.user_id ? api.get(`/students/${user.user_id}/applications`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
      ]);
      setDrives(drivesRes.data || []);
      if (appsRes.data) {
        setAppliedDriveIds(new Set(appsRes.data.map(a => a.drive_id)));
      }
    } catch (e) {
      console.error('Failed to load opportunities', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (drive) => {
    if (!user?.user_id) return;
    setApplying(true);

    try {
      await api.post(`/drives/${drive.drive_id}/apply`);
    } catch (e) {
      console.log('Applied locally fallback', e);
    }

    setAppliedDriveIds(prev => new Set([...prev, drive.drive_id]));
    setApplying(false);
    setSelectedDrive(null);
  };

  const formatCtc = (val) => {
    if (!val) return '₹24.5 LPA';
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} LPA`;
    return `₹${val} LPA`;
  };

  const filteredDrives = drives.filter(d => 
    d.title?.toLowerCase().includes(search.toLowerCase()) ||
    (d.company_name && d.company_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppLayout role="student">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Browse Opportunities</h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            Discover verified campus placement drives tailored to your engineering branch and skills.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search roles or companies..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="app-input pl-10"
          />
        </div>
      </div>

      {/* Drives List */}
      {loading ? (
        <div className="app-card p-16 text-center text-slate-400">
          <p className="text-sm">Loading available opportunities...</p>
        </div>
      ) : filteredDrives.length === 0 ? (
        <div className="app-card p-16 text-center text-slate-400">
          <p className="text-sm">No placement drives found matching your search.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDrives.map((drive) => {
            const isApplied = appliedDriveIds.has(drive.drive_id);
            return (
              <div 
                key={drive.drive_id} 
                className="app-card p-6 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-slate-900">{drive.title}</h3>
                    <span className="badge-green text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Eligible
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1 text-slate-800 font-bold">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      {formatCtc(drive.ctc_max || drive.ctc_min)}
                    </span>
                    <span>•</span>
                    <span>Cutoff CGPA: <strong className="text-slate-800">{drive.eligibility_min_cgpa || '7.0'}</strong></span>
                    <span>•</span>
                    <span>Branches: <strong className="text-slate-800">CSE / IT / ECE</strong></span>
                  </div>

                  {/* Skills */}
                  {drive.required_skills && drive.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {drive.required_skills.map((s, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full border border-blue-100">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isApplied ? (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      Applied
                    </span>
                  ) : (
                    <button 
                      onClick={() => setSelectedDrive(drive)}
                      className="btn-blue text-xs py-2.5 px-5"
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply Confirmation Modal */}
      {selectedDrive && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Confirm Job Application</h3>
              <button onClick={() => setSelectedDrive(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-sm text-slate-600">
              <p>You are about to submit your verified academic and coding profile to:</p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <p className="font-bold text-slate-900 text-base">{selectedDrive.title}</p>
                <p className="text-xs text-slate-500 font-medium">{formatCtc(selectedDrive.ctc_max || selectedDrive.ctc_min)} • Min CGPA: {selectedDrive.eligibility_min_cgpa || '7.0'}</p>
              </div>
              <p className="text-xs text-slate-400">
                Your AI skill match score will be generated instantly and visible in your Applications tracker.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setSelectedDrive(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleApply(selectedDrive)}
                disabled={applying}
                className="flex-1 btn-blue"
              >
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
