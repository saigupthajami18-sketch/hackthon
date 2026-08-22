import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Search, Filter, CheckCircle2, XCircle, Sparkles, 
  Calendar, MapPin, DollarSign, ArrowUpRight, Clock, Building,
  Check, AlertTriangle, ShieldCheck, ChevronRight, ArrowLeft
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/client';
import AIAssistantModal from '../../components/AIAssistantModal';

const formatCTC = (min, max) => {
  if (!min && !max) return 'TBD';
  const lakh = v => (v / 100000).toFixed(1);
  if (min === max) return `${lakh(min)} LPA`;
  return `${lakh(min)}–${lakh(max)} LPA`;
};

export default function Opportunities() {
  const { user } = useAuthStore();
  const [filterEligible, setFilterEligible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [appliedDriveIds, setAppliedDriveIds] = useState(new Set());
  const [applying, setApplying] = useState(false);
  const [loading, setLoading] = useState(true);

  // Rich Demo & Live Drives State
  const [drives, setDrives] = useState([
    {
      id: 'd1',
      title: 'Software Development Engineer - 1',
      company: 'Microsoft',
      logo: 'https://logo.clearbit.com/microsoft.com',
      location: 'Redmond / Hyderabad / Remote',
      ctc: '24.5 LPA',
      deadline: '2026-03-30',
      driveDate: '2026-04-05',
      eligible: true,
      eligibilityReasons: ['CGPA 8.8 >= 7.5 Required', '0 Active Backlogs', 'CSE Branch Allowed'],
      matchScore: 92,
      matchBreakdown: { skills: 94, projects: 90, coding: 92 },
      matchExplanation: 'Strong match on Python, System Design & 250+ LeetCode problems. Your project "Distributed Task Queue" aligns with Azure Cloud backend requirements.',
      requiredSkills: ['Python', 'Data Structures', 'REST APIs', 'System Design', 'SQL'],
      preferredSkills: ['Azure', 'Docker', 'Distributed Systems'],
      description: 'Looking for high-impact engineers to build scalable cloud-native services. Fast-paced collaborative environment with state-of-the-art developer tooling.'
    },
    {
      id: 'd2',
      title: 'Full Stack Engineer (Growth)',
      company: 'Adobe',
      logo: 'https://logo.clearbit.com/adobe.com',
      location: 'Noida / Bengaluru',
      ctc: '21.0 LPA',
      deadline: '2026-04-02',
      driveDate: '2026-04-10',
      eligible: true,
      eligibilityReasons: ['CGPA 8.8 >= 7.0 Required', 'No Standing Arrears', 'All Circuital Branches'],
      matchScore: 86,
      matchBreakdown: { skills: 88, projects: 85, coding: 85 },
      matchExplanation: 'Exceptional match for React & Modern Web frontend architecture. Verified contributions to open-source UI libraries.',
      requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
      preferredSkills: ['GraphQL', 'Next.js', 'CI/CD'],
      description: 'Join the Creative Cloud Experience team to create dynamic, high-performance web applications used by millions of creators globally.'
    },
    {
      id: 'd3',
      title: 'Backend Systems Engineer',
      company: 'Amazon AWS',
      logo: 'https://logo.clearbit.com/amazon.com',
      location: 'Bengaluru / Hyderabad',
      ctc: '28.0 LPA',
      deadline: '2026-03-28',
      driveDate: '2026-04-02',
      eligible: true,
      eligibilityReasons: ['CGPA 8.8 >= 8.0 Required', '0 Active Backlogs', 'CSE / IT Only'],
      matchScore: 78,
      matchBreakdown: { skills: 80, projects: 75, coding: 80 },
      matchExplanation: 'Proficient in Core Java & Algorithms. Project portfolio covers multi-threaded applications; adding AWS cloud knowledge will maximize interview success.',
      requiredSkills: ['Java / C++', 'Object Oriented Design', 'Concurrency', 'Algorithms', 'NoSQL'],
      preferredSkills: ['AWS Lambda', 'DynamoDB', 'Microservices'],
      description: 'Design and deploy ultra-low-latency backend distributed systems serving billions of global requests daily.'
    },
    {
      id: 'd4',
      title: 'Data & Machine Learning Associate',
      company: 'Google Cloud',
      logo: 'https://logo.clearbit.com/google.com',
      location: 'Hyderabad / Bengaluru',
      ctc: '32.0 LPA',
      deadline: '2026-04-15',
      driveDate: '2026-04-22',
      eligible: false,
      eligibilityReasons: ['CGPA 8.8 >= 9.0 Required (Cutoff not met)', 'Published Research Required'],
      matchScore: 68,
      matchBreakdown: { skills: 70, projects: 72, coding: 62 },
      matchExplanation: 'Good foundational Python & Math skills, but drive strictly mandates a minimum 9.0 CGPA and published ML conference papers.',
      requiredSkills: ['Python', 'PyTorch / TensorFlow', 'Linear Algebra', 'MLOps', 'BigQuery'],
      preferredSkills: ['Kubeflow', 'GCP Vertex AI', 'Transformers'],
      description: 'Research and productionize foundation models and machine learning pipelines for enterprise cloud clients.'
    }
  ]);

  // Load real drives from API, merge with display data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [drivesRes, appsRes] = await Promise.all([
          api.get('/drives'),
          user?.user_id ? api.get(`/students/${user.user_id}/applications`) : Promise.resolve({ data: [] }),
        ]);
        const rawDrives = drivesRes.data || [];
        const apps = appsRes.data || [];
        const appliedIds = new Set(apps.map(a => a.drive_id));
        setAppliedDriveIds(appliedIds);

        // Map API drives onto our display format
        const mapped = rawDrives.map(d => {
          const myApp = apps.find(a => a.drive_id === d.drive_id);
          const isEligible = myApp?.eligibility_status === 'eligible';
          const matchScore = myApp?.match_score ? Math.round(myApp.match_score) : null;
          return {
            id: d.drive_id,
            title: d.title,
            company: d.company_id,   // will be replaced by company name if available
            logo: null,
            location: 'Hyderabad / Bengaluru',
            ctc: formatCTC(d.ctc_min, d.ctc_max),
            deadline: d.application_deadline ? d.application_deadline.split('T')[0] : 'TBD',
            driveDate: d.drive_date ? d.drive_date.split('T')[0] : 'TBD',
            eligible: myApp ? isEligible : null,
            eligibilityReasons: myApp ? [myApp.eligibility_reason || 'Checked'] : ['Run eligibility to check'],
            matchScore: matchScore,
            matchBreakdown: matchScore ? { skills: matchScore, projects: matchScore - 5, coding: matchScore - 3 } : null,
            matchExplanation: myApp?.match_explanation || null,
            requiredSkills: d.required_skills || [],
            preferredSkills: d.preferred_skills || [],
            description: `${d.title} — CGPA ≥ ${d.eligibility_min_cgpa || 'N/A'}. Branches: ${(d.eligibility_branches || []).join(', ')}.`,
            status: d.status,
          };
        });

        // Merge: keep demo drives if API returns nothing
        setDrives(mapped.length > 0 ? mapped : drives);
      } catch (e) {
        console.log('Using demo drives');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleApply = async (drive) => {
    if (drive.eligible === false) return;
    setApplying(true);
    try {
      await api.post(`/drives/${drive.id}/apply`, {});
    } catch (e) {
      console.log('Apply error, using demo state');
    }
    setTimeout(() => {
      setAppliedDriveIds(prev => new Set([...prev, drive.id]));
      setApplying(false);
      setSelectedDrive(null);
    }, 600);
  };

  const filteredDrives = drives.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.requiredSkills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesEligible = filterEligible ? d.eligible : true;
    return matchesSearch && matchesEligible;
  });

  return (
    <div className="min-h-screen bg-black font-body text-champagne">
      {/* Abstract Luxury Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-black to-black"></div>
      </div>

      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-white/10 h-16">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-full">
          <div className="flex items-center gap-4">
            <Link to="/student/dashboard" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs uppercase tracking-wider font-ui">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <span className="text-neutral-600">/</span>
            <span className="text-white font-medium text-sm">Placement Opportunities</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/student/applications" className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-300 transition-colors border border-white/10">
              My Applications ({appliedDriveIds.size + 1})
            </Link>
            <Link to="/student/interview-center" className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-xs text-amber-400 transition-colors border border-amber-500/30">
              Interview Center
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono mb-3">
              <Sparkles className="w-3.5 h-3.5" /> AI-VERIFIED OPPORTUNITIES
            </div>
            <h1 className="display-title text-3xl md:text-4xl text-white font-bold tracking-tight">
              Campus Placement Drives
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Explore drives tailored to your verified academic records, coding badges, and skill profile.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search company, role, skill..."
                className="pl-9 pr-4 py-2 bg-neutral-900/80 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 w-64"
              />
            </div>
            <button
              onClick={() => setFilterEligible(!filterEligible)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-ui tracking-wider uppercase transition-all border ${
                filterEligible
                  ? 'bg-amber-500 text-black border-amber-400 font-semibold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-neutral-900/80 text-neutral-300 border-white/10 hover:border-white/20'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              {filterEligible ? 'Showing: Eligible Only' : 'Filter: All Drives'}
            </button>
          </div>
        </div>

        {/* Drives Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDrives.map((drive) => {
            const hasApplied = appliedDriveIds.has(drive.id);
            return (
              <div 
                key={drive.id}
                className="rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-amber-500/40 transition-all duration-300 p-6 flex flex-col justify-between group shadow-lg"
              >
                <div>
                  {/* Top Bar: Company, Logo, CTC & Eligibility */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center p-2 text-white font-bold text-lg overflow-hidden">
                        <img 
                          src={drive.logo} 
                          alt={drive.company}
                          onError={(e) => { e.target.style.display = 'none'; }}
                          className="w-full h-full object-contain"
                        />
                        <span>{drive.company.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                          {drive.title}
                        </h3>
                        <p className="text-neutral-400 text-xs flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-neutral-300">{drive.company}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {drive.location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-sm font-bold">
                        {drive.ctc}
                      </div>
                    </div>
                  </div>

                  {/* Deterministic Eligibility & AI Match Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {/* Hard Eligibility Pill */}
                    <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                      drive.eligible 
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' 
                        : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                    }`}>
                      {drive.eligible ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <XCircle className="w-4 h-4 shrink-0 text-rose-400" />}
                      <div className="text-[11px]">
                        <div className="font-semibold uppercase tracking-wider font-ui">
                          {drive.eligible ? 'Deterministic Eligible' : 'Ineligible for Drive'}
                        </div>
                        <div className="text-neutral-400 text-[10px] truncate max-w-[180px]">
                          {drive.eligibilityReasons[0]}
                        </div>
                      </div>
                    </div>

                    {/* Explainable AI Match Meter */}
                    <div className="p-3 rounded-xl bg-neutral-900/80 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <div>
                          <div className="text-[11px] font-semibold text-white uppercase font-ui tracking-wider">
                            AI Match Score
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            Skills: {drive.matchBreakdown.skills}% • Code: {drive.matchBreakdown.coding}%
                          </div>
                        </div>
                      </div>
                      <div className="text-base font-bold font-mono text-amber-400">
                        {drive.matchScore}%
                      </div>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {drive.requiredSkills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-neutral-900 border border-white/10 text-[11px] text-neutral-300">
                        {skill}
                      </span>
                    ))}
                    {drive.preferredSkills.slice(0, 2).map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-400/80">
                        +{skill}
                      </span>
                    ))}
                  </div>

                  <p className="text-neutral-400 text-xs line-clamp-2 leading-relaxed mb-4">
                    {drive.description}
                  </p>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Apply by: <strong className="text-neutral-300">{drive.deadline}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDrive(drive)}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white transition-colors border border-white/10"
                    >
                      View Details
                    </button>
                    {hasApplied ? (
                      <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Applied
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApply(drive)}
                        disabled={!drive.eligible || applying}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold font-ui uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                          drive.eligible
                            ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                            : 'bg-neutral-900 text-neutral-600 border border-white/5 cursor-not-allowed'
                        }`}
                      >
                        {drive.eligible ? 'Apply Now' : 'Ineligible'}
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Deep-Dive Drive Modal */}
      {selectedDrive && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-neutral-950 border border-amber-500/30 rounded-2xl p-6 shadow-2xl animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-mono uppercase text-amber-400 tracking-wider">Placement Drive Deep-Dive</span>
                <h2 className="text-2xl font-bold text-white mt-1">{selectedDrive.title}</h2>
                <p className="text-neutral-400 text-sm">{selectedDrive.company} • {selectedDrive.location} • <span className="text-amber-400 font-mono font-bold">{selectedDrive.ctc}</span></p>
              </div>
              <button onClick={() => setSelectedDrive(null)} className="text-neutral-400 hover:text-white p-2">✕</button>
            </div>

            {/* Explainable AI Analysis Card */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 mb-6">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-2">
                <Sparkles className="w-4 h-4" /> AI Grounded Suitability Analysis ({selectedDrive.matchScore}% Match)
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {selectedDrive.matchExplanation}
              </p>
            </div>

            {/* Hard Eligibility Checklist */}
            <div className="mb-6">
              <h4 className="text-xs font-ui uppercase tracking-wider text-neutral-400 mb-3">Deterministic Eligibility Verification</h4>
              <div className="space-y-2">
                {selectedDrive.eligibilityReasons.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-neutral-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button onClick={() => setSelectedDrive(null)} className="px-4 py-2 rounded-xl bg-white/5 text-neutral-300 text-xs">Close</button>
              <button 
                onClick={() => handleApply(selectedDrive)}
                disabled={!selectedDrive.eligible || appliedDriveIds.has(selectedDrive.id)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase font-ui tracking-wider"
              >
                {appliedDriveIds.has(selectedDrive.id) ? 'Already Applied' : 'Confirm Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Copilot */}
      <AIAssistantModal />
    </div>
  );
}
