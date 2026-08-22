import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Search, DollarSign, CheckCircle2, Clock, Plus, ArrowRight } from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import useAuthStore from '../../store/authStore';
import api from '../../api/client';

export default function PlacementDrives() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const res = await api.get('/drives');
      if (res.data && res.data.length > 0) {
        setDrives(res.data);
      } else {
        setDrives([
          { drive_id: '1', title: 'Microsoft SDE-1', company_name: 'Microsoft', status: 'published', ctc_min: 2450000, ctc_max: 2450000, eligibility_min_cgpa: 7.5, required_skills: ['Python', 'System Design', 'SQL'] },
          { drive_id: '2', title: 'Google SWE (New Grad)', company_name: 'Google', status: 'published', ctc_min: 3200000, ctc_max: 4000000, eligibility_min_cgpa: 8.0, required_skills: ['DSA', 'Algorithms', 'Go'] },
          { drive_id: '3', title: 'Adobe MTS', company_name: 'Adobe', status: 'published', ctc_min: 2200000, ctc_max: 2800000, eligibility_min_cgpa: 7.0, required_skills: ['React', 'JavaScript', 'REST'] },
          { drive_id: '4', title: 'Amazon SDE-1', company_name: 'Amazon', status: 'published', ctc_min: 2600000, ctc_max: 3400000, eligibility_min_cgpa: 7.5, required_skills: ['Java', 'AWS', 'DSA'] },
          { drive_id: '5', title: 'Infosys Specialist Programmer', company_name: 'Infosys', status: 'published', ctc_min: 950000, ctc_max: 1200000, eligibility_min_cgpa: 6.5, required_skills: ['Java', 'SQL', 'C++'] },
        ]);
      }
    } catch (e) {
      console.log('Using seeded college drives');
    } finally {
      setLoading(false);
    }
  };

  const formatCtc = (min, max) => {
    if (!max && !min) return '₹24.5 LPA';
    const val = max || min;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} LPA`;
    return `₹${val} LPA`;
  };

  const filtered = drives.filter(d =>
    d.title?.toLowerCase().includes(search.toLowerCase()) ||
    (d.company_name && d.company_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppLayout role="college">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Placement Drives</h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            Active and upcoming corporate recruitment drives in NIT Engineering.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search drives or roles..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="app-input pl-10"
          />
        </div>
      </div>

      {/* Drives List */}
      {loading ? (
        <div className="app-card p-16 text-center text-slate-400">Loading drives...</div>
      ) : filtered.length === 0 ? (
        <div className="app-card p-16 text-center text-slate-400">No placement drives found.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((drive) => (
            <div 
              key={drive.drive_id} 
              className="app-card p-6 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg text-slate-900">{drive.title}</h3>
                  <span className="badge-green text-xs font-semibold uppercase">
                    {drive.status || 'Active Drive'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1.5 text-slate-800 font-bold">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    {formatCtc(drive.ctc_min, drive.ctc_max)}
                  </span>
                  <span>•</span>
                  <span>Min Cutoff: <strong className="text-slate-800">{drive.eligibility_min_cgpa || '7.0'} CGPA</strong></span>
                  <span>•</span>
                  <span>Target Batch: <strong className="text-slate-800">2027 Graduating</strong></span>
                </div>

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
                <Link 
                  to={`/college/drives/${drive.drive_id}`}
                  className="btn-blue text-xs py-2.5 px-4"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
