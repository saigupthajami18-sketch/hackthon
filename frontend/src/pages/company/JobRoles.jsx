import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, DollarSign, MapPin, CheckCircle2, Clock, X, Search, Sparkles } from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import api from '../../api/client';
import useAuthStore from '../../store/authStore';

export default function JobRoles() {
  const { user } = useAuthStore();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modal Form State
  const [title, setTitle] = useState('');
  const [ctcLpa, setCtcLpa] = useState('24.5');
  const [minCgpa, setMinCgpa] = useState('7.5');
  const [maxBacklogs, setMaxBacklogs] = useState('0');
  const [skillsInput, setSkillsInput] = useState('Python, Data Structures, System Design, SQL');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/drives');
      if (res.data && res.data.length > 0) {
        setDrives(res.data);
      } else {
        setDrives([
          {
            drive_id: 'd1',
            title: 'Software Engineer',
            company_name: 'TechNova Solutions',
            status: 'published',
            ctc_min: 2450000,
            ctc_max: 2450000,
            eligibility_min_cgpa: 7.5,
            required_skills: ['Python', 'Java', 'Data Structures', 'Algorithms', 'DBMS']
          },
          {
            drive_id: 'd2',
            title: 'Machine Learning Engineer',
            company_name: 'Quantum Analytics',
            status: 'published',
            ctc_min: 2800000,
            ctc_max: 3500000,
            eligibility_min_cgpa: 8.0,
            required_skills: ['Python', 'PyTorch', 'Data Structures', 'Machine Learning', 'SQL']
          },
          {
            drive_id: 'd3',
            title: 'Full Stack Developer',
            company_name: 'CloudForge Systems',
            status: 'published',
            ctc_min: 1800000,
            ctc_max: 2200000,
            eligibility_min_cgpa: 7.0,
            required_skills: ['React', 'Node.js', 'SQL', 'Data Structures', 'REST']
          }
        ]);
      }
    } catch (e) {
      console.log('Using seeded jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!title) return;
    setSubmitting(true);

    const skillsArray = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    const parsedCtc = parseFloat(ctcLpa) * 100000;

    const payload = {
      title,
      company_name: user?.company_name || 'Partner Company',
      ctc_min: parsedCtc,
      ctc_max: parsedCtc,
      min_cgpa: parseFloat(minCgpa) || 7.0,
      max_backlogs: parseInt(maxBacklogs) || 0,
      skills: skillsArray,
      description: description || `Campus placement drive for ${title}`
    };

    try {
      const res = await api.post('/drives', payload);
      if (res.data) {
        setDrives(prev => [res.data, ...prev]);
      }
    } catch (err) {
      const mockJob = {
        drive_id: `d_${Date.now()}`,
        title,
        company_name: user?.company_name || 'Microsoft',
        status: 'published',
        ctc_min: parsedCtc,
        ctc_max: parsedCtc,
        eligibility_min_cgpa: parseFloat(minCgpa),
        required_skills: skillsArray
      };
      setDrives(prev => [mockJob, ...prev]);
    } finally {
      setSubmitting(false);
      setShowModal(false);
      setTitle('');
      setDescription('');
    }
  };

  const formatCtc = (min, max) => {
    if (!max && !min) return '₹24.5 LPA';
    const val = max || min;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} LPA`;
    return `₹${val} LPA`;
  };

  return (
    <AppLayout role="recruiter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#EFE5D2] tracking-tight">Job Postings & Campus Drives</h1>
          <p className="text-sm text-white/50 mt-1 font-normal">
            Configure recruitment profiles, CTC packages, cutoffs, and required technical competencies.
          </p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-[#A81B2B] to-[#710912] hover:brightness-110 text-[#EFE5D2] font-semibold text-xs uppercase tracking-widest py-2.5 px-5 rounded-xl border-t border-white/20 shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Job Posting</span>
        </button>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="bg-[#121417]/90 border border-white/10 rounded-2xl p-16 text-center text-white/40">Loading positions...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drives.map((job) => (
            <div key={job.drive_id} className="bg-[#121417]/90 border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-5 hover:border-white/20 transition-all">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="bg-[#064E3B]/20 text-[#10B981] border border-[#10B981]/30 text-[10px] uppercase font-bold tracking-widest py-0.5 px-2.5 rounded-full">
                    {job.status || 'Active & Published'}
                  </span>
                  <span className="text-xs text-white/40 font-medium">NIT Engineering</span>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-lg text-[#EFE5D2] leading-tight">{job.title}</h3>
                  <p className="text-xs text-white/40 font-medium mt-0.5">{job.company_name || 'Corporate Partner'}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/40">Compensation:</span>
                    <strong className="text-[#D4AF37] font-bold">{formatCtc(job.ctc_min, job.ctc_max)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">CGPA Cutoff:</span>
                    <strong className="text-[#EFE5D2]">{job.eligibility_min_cgpa || '7.5'} CGPA</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Active Backlogs:</span>
                    <strong className="text-[#EFE5D2]">{job.eligibility_max_backlogs ?? 0} allowed</strong>
                  </div>
                </div>

                {job.required_skills && job.required_skills.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider block mb-1.5">Required Skills:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {job.required_skills.map((s, idx) => (
                        <span key={idx} className="bg-white/5 text-white/80 text-[11px] font-medium px-2.5 py-0.5 rounded-md border border-white/10">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Job Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#16191D] rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <h3 className="text-lg font-serif font-bold text-[#EFE5D2]">Create New Campus Job Drive</h3>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1 uppercase tracking-wider">Job Role Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Software Development Engineer - 1" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[#1A1D20] border border-white/10 rounded-xl py-2.5 px-3.5 text-[#EFE5D2] text-sm focus:outline-none focus:border-[#D4AF37]/60"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1 uppercase tracking-wider">CTC (in LPA)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    required
                    value={ctcLpa}
                    onChange={e => setCtcLpa(e.target.value)}
                    className="w-full bg-[#1A1D20] border border-white/10 rounded-xl py-2.5 px-3.5 text-[#EFE5D2] text-sm focus:outline-none focus:border-[#D4AF37]/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1 uppercase tracking-wider">Min CGPA</label>
                  <input 
                    type="number" 
                    step="0.1"
                    required
                    value={minCgpa}
                    onChange={e => setMinCgpa(e.target.value)}
                    className="w-full bg-[#1A1D20] border border-white/10 rounded-xl py-2.5 px-3.5 text-[#EFE5D2] text-sm focus:outline-none focus:border-[#D4AF37]/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1 uppercase tracking-wider">Max Backlogs</label>
                  <input 
                    type="number" 
                    required
                    value={maxBacklogs}
                    onChange={e => setMaxBacklogs(e.target.value)}
                    className="w-full bg-[#1A1D20] border border-white/10 rounded-xl py-2.5 px-3.5 text-[#EFE5D2] text-sm focus:outline-none focus:border-[#D4AF37]/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1 uppercase tracking-wider">Required Skills (Comma separated)</label>
                <input 
                  type="text" 
                  required
                  placeholder="Python, React, SQL, DSA, System Design" 
                  value={skillsInput}
                  onChange={e => setSkillsInput(e.target.value)}
                  className="w-full bg-[#1A1D20] border border-white/10 rounded-xl py-2.5 px-3.5 text-[#EFE5D2] text-sm focus:outline-none focus:border-[#D4AF37]/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1 uppercase tracking-wider">Job Description & Responsibilities</label>
                <textarea 
                  rows={3}
                  placeholder="Describe key responsibilities and expectations for campus hires..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-[#1A1D20] border border-white/10 rounded-xl py-2.5 px-3.5 text-[#EFE5D2] text-xs focus:outline-none focus:border-[#D4AF37]/60 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 font-medium text-xs uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-[#A81B2B] to-[#710912] hover:brightness-110 text-[#EFE5D2] font-semibold text-xs uppercase tracking-widest py-2.5 rounded-xl border-t border-white/20 shadow-lg flex items-center justify-center gap-2"
                >
                  <span>{submitting ? 'Publishing...' : 'Publish Job Drive'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
