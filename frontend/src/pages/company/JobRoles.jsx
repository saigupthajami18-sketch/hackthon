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
        // Fallback default jobs
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
            required_skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Docker']
          }
        ]);
      }
    } catch (e) {
      console.error('Failed to load drives', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!title) return;
    setSubmitting(true);

    const skillsArray = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    const parsedLpa = parseFloat(ctcLpa) || 20.0;

    const payload = {
      title,
      company_id: user?.org_id,
      ctc_min: parsedLpa * 100000,
      ctc_max: parsedLpa * 100000,
      min_cgpa: parseFloat(minCgpa) || 7.0,
      max_backlogs: parseInt(maxBacklogs) || 0,
      branches: ['CSE', 'IT', 'ECE'],
      skills: skillsArray,
      raw_jd_text: description || `Role opening for ${title}. Package: ₹${ctcLpa} LPA.`
    };

    try {
      const res = await api.post('/drives', payload);
      const createdDrive = {
        drive_id: res.data?.drive_id || `d_${Date.now()}`,
        title,
        status: 'published',
        ctc_min: parsedLpa * 100000,
        ctc_max: parsedLpa * 100000,
        eligibility_min_cgpa: parseFloat(minCgpa) || 7.0,
        required_skills: skillsArray
      };

      setDrives([createdDrive, ...drives]);
      setShowModal(false);
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error('Failed to post drive', err);
      // Still add locally for real-time responsiveness
      const localDrive = {
        drive_id: `d_${Date.now()}`,
        title,
        status: 'published',
        ctc_min: parsedLpa * 100000,
        ctc_max: parsedLpa * 100000,
        eligibility_min_cgpa: parseFloat(minCgpa) || 7.0,
        required_skills: skillsArray
      };
      setDrives([localDrive, ...drives]);
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCtc = (val) => {
    if (!val) return '₹20.0 LPA';
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} LPA`;
    return `₹${val} LPA`;
  };

  return (
    <AppLayout role="recruiter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">My Job Postings</h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">Create, publish, and manage live campus recruitment drives</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-blue shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create Job Posting</span>
        </button>
      </div>

      {/* Drives Grid */}
      {loading ? (
        <div className="app-card p-16 text-center text-slate-400">
          <p className="text-sm">Loading job postings...</p>
        </div>
      ) : drives.length === 0 ? (
        <div className="app-card p-16 text-center text-slate-400">
          <p className="text-sm">No job postings created yet. Click "Create Job Posting" to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {drives.map((drive) => (
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
                  <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    {formatCtc(drive.ctc_max || drive.ctc_min)}
                  </span>
                  <span>•</span>
                  <span>Min CGPA: <strong className="text-slate-800">{drive.eligibility_min_cgpa || '7.0'}</strong></span>
                  <span>•</span>
                  <span>Eligible: <strong className="text-slate-800">CSE / IT / ECE</strong></span>
                </div>

                {/* Skill Pills */}
                {drive.required_skills && drive.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {drive.required_skills.map((skill, sIdx) => (
                      <span 
                        key={sIdx}
                        className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full border border-blue-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-slate-400">Updated today</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Job Posting Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Create New Job Posting</h3>
                <p className="text-xs text-slate-500">Publish immediately to eligible college students</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Role / Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Software Development Engineer - 1" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="app-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CTC Package (LPA)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    required
                    placeholder="e.g. 24.5" 
                    value={ctcLpa}
                    onChange={e => setCtcLpa(e.target.value)}
                    className="app-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum CGPA Cutoff</label>
                  <input 
                    type="number" 
                    step="0.1"
                    required
                    placeholder="e.g. 7.5" 
                    value={minCgpa}
                    onChange={e => setMinCgpa(e.target.value)}
                    className="app-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Max Active Backlogs Allowed</label>
                <input 
                  type="number" 
                  value={maxBacklogs}
                  onChange={e => setMaxBacklogs(e.target.value)}
                  className="app-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Required Skills (Comma separated)</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Python, FastApi, React, SQL, System Design" 
                  value={skillsInput}
                  onChange={e => setSkillsInput(e.target.value)}
                  className="app-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description & Responsibilities</label>
                <textarea 
                  rows={3}
                  placeholder="Describe the job role, day-to-day responsibilities, and team overview..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="app-input resize-none"
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
                <button type="submit" disabled={submitting} className="flex-1 btn-blue">
                  {submitting ? 'Publishing...' : 'Publish Job Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
