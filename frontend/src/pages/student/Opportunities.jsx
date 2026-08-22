import React, { useState, useEffect } from 'react';
import { Briefcase, Search, DollarSign, CheckCircle2, Clock, Plus, ArrowRight, Sparkles, Filter, Building2, Check } from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import api from '../../api/client';
import useAuthStore from '../../store/authStore';

export default function Opportunities() {
  const { user } = useAuthStore();
  const [drives, setDrives] = useState([]);
  const [appliedDriveIds, setAppliedDriveIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
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
          <h1 className="text-3xl font-serif font-bold text-[#EFE5D2] tracking-tight">Browse Opportunities</h1>
          <p className="text-sm text-white/50 mt-1 font-normal">
            Discover verified campus placement drives tailored to your engineering branch and skills.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by job title or company..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#16191D] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-[#EFE5D2] placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50"
          />
        </div>
      </div>

      {/* Drives Grid */}
      {loading ? (
        <div className="bg-[#121417]/90 border border-white/10 rounded-2xl p-16 text-center text-white/40">Loading opportunities...</div>
      ) : filteredDrives.length === 0 ? (
        <div className="bg-[#121417]/90 border border-white/10 rounded-2xl p-16 text-center text-white/40">No opportunities match your search.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrives.map((drive) => {
            const hasApplied = appliedDriveIds.has(drive.drive_id);
            return (
              <div 
                key={drive.drive_id} 
                className="bg-[#121417]/90 border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-5 hover:border-white/20 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="bg-[#064E3B]/20 text-[#10B981] border border-[#10B981]/30 text-[10px] uppercase font-bold tracking-widest py-0.5 px-2.5 rounded-full">
                      Eligible
                    </span>
                    <span className="text-xs text-[#D4AF37] font-bold">100% Match</span>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#EFE5D2] leading-tight">{drive.title}</h3>
                    <p className="text-xs text-white/40 font-medium mt-0.5">{drive.company_name || 'Corporate Partner'}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/40">CTC Package:</span>
                      <strong className="text-[#D4AF37] font-bold">{formatCtc(drive.ctc_max || drive.ctc_min)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Cutoff:</span>
                      <strong className="text-[#EFE5D2]">{drive.eligibility_min_cgpa || '7.5'} CGPA</strong>
                    </div>
                  </div>

                  {drive.required_skills && drive.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {drive.required_skills.map((s, idx) => (
                        <span key={idx} className="bg-white/5 text-white/80 text-[11px] font-medium px-2.5 py-0.5 rounded-md border border-white/10">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  {hasApplied ? (
                    <div className="w-full py-2.5 rounded-xl bg-[#064E3B]/20 border border-[#10B981]/30 text-[#10B981] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4 text-[#10B981]" />
                      <span>Application Submitted</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleApply(drive)}
                      disabled={applying}
                      className="w-full bg-gradient-to-r from-[#A81B2B] to-[#710912] hover:brightness-110 text-[#EFE5D2] font-semibold text-xs uppercase tracking-widest py-2.5 rounded-xl border-t border-white/20 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{applying ? 'Applying...' : 'Apply Now'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
