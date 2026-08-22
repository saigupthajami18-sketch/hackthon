import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, XCircle, ChevronRight, Check, X, Users, Sparkles, Briefcase } from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import api from '../../api/client';
import useAuthStore from '../../store/authStore';

export default function CandidateMatching() {
  const { user } = useAuthStore();
  const [selectedJobId, setSelectedJobId] = useState('job_1');
  const [drives, setDrives] = useState([]);
  
  const jobsList = [
    {
      id: 'job_1',
      title: 'Software Engineer',
      company: 'TechNova Solutions',
      eligibleCount: 7,
      skills: ['Python', 'Java', 'Data Structures', 'Algorithms', 'DBMS'],
      candidates: [
        {
          rank: '#1',
          name: 'Aarav Sharma',
          rollNo: 'CS21B001',
          branch: 'CSE',
          cgpa: '8.75',
          eligible: true,
          matchScore: '100%',
          skillsMatch: [
            { name: 'Python', matched: true },
            { name: 'Java', matched: true },
            { name: 'Data Structures', matched: true },
            { name: 'Algorithms', matched: true },
            { name: 'DBMS', matched: true },
          ]
        },
        {
          rank: '#2',
          name: 'Priya Menon',
          rollNo: 'CS21B019',
          branch: 'CSE',
          cgpa: '9.30',
          eligible: true,
          matchScore: '100%',
          skillsMatch: [
            { name: 'Python', matched: true },
            { name: 'Java', matched: true },
            { name: 'Data Structures', matched: true },
            { name: 'Algorithms', matched: true },
            { name: 'DBMS', matched: true },
          ]
        },
        {
          rank: '#3',
          name: 'Ananya Reddy',
          rollNo: 'CS21B015',
          branch: 'CSE',
          cgpa: '8.90',
          eligible: true,
          matchScore: '80%',
          skillsMatch: [
            { name: 'Python', matched: false },
            { name: 'Java', matched: true },
            { name: 'Data Structures', matched: true },
            { name: 'Algorithms', matched: true },
            { name: 'DBMS', matched: true },
          ]
        },
        {
          rank: '#4',
          name: 'Diya Patel',
          rollNo: 'CS21B033',
          branch: 'CSE',
          cgpa: '7.85',
          eligible: true,
          matchScore: '60%',
          skillsMatch: [
            { name: 'Python', matched: true },
            { name: 'Java', matched: false },
            { name: 'Data Structures', matched: true },
            { name: 'Algorithms', matched: false },
            { name: 'DBMS', matched: true },
          ]
        }
      ]
    },
    {
      id: 'job_2',
      title: 'Machine Learning Engineer',
      company: 'Quantum Analytics',
      eligibleCount: 6,
      skills: ['Python', 'PyTorch', 'Data Structures', 'Machine Learning', 'SQL'],
      candidates: [
        {
          rank: '#1',
          name: 'Sneha Kulkarni',
          rollNo: 'CS21B088',
          branch: 'CSE',
          cgpa: '9.45',
          eligible: true,
          matchScore: '100%',
          skillsMatch: [
            { name: 'Python', matched: true },
            { name: 'PyTorch', matched: true },
            { name: 'Data Structures', matched: true },
            { name: 'Machine Learning', matched: true },
            { name: 'SQL', matched: true },
          ]
        },
        {
          rank: '#2',
          name: 'Rohan Verma',
          rollNo: 'CS21B042',
          branch: 'CSE',
          cgpa: '8.60',
          eligible: true,
          matchScore: '80%',
          skillsMatch: [
            { name: 'Python', matched: true },
            { name: 'PyTorch', matched: false },
            { name: 'Data Structures', matched: true },
            { name: 'Machine Learning', matched: true },
            { name: 'SQL', matched: true },
          ]
        }
      ]
    },
    {
      id: 'job_3',
      title: 'Full Stack Developer',
      company: 'CloudForge Systems',
      eligibleCount: 6,
      skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Docker'],
      candidates: [
        {
          rank: '#1',
          name: 'Karthik Iyer',
          rollNo: 'IT21B012',
          branch: 'IT',
          cgpa: '8.80',
          eligible: true,
          matchScore: '100%',
          skillsMatch: [
            { name: 'React', matched: true },
            { name: 'Node.js', matched: true },
            { name: 'PostgreSQL', matched: true },
            { name: 'TypeScript', matched: true },
            { name: 'Docker', matched: true },
          ]
        }
      ]
    }
  ];

  useEffect(() => {
    fetchBackendDrives();
  }, []);

  const fetchBackendDrives = async () => {
    try {
      const res = await api.get('/drives');
      if (res.data && res.data.length > 0) {
        setDrives(res.data);
      }
    } catch (e) {
      console.log('Using seeded matching data');
    }
  };

  const currentJob = jobsList.find(j => j.id === selectedJobId) || jobsList[0];

  return (
    <AppLayout role="recruiter">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Candidate Matching</h1>
        <p className="text-sm text-slate-500 mt-1 font-normal">AI-powered skill-based matching with eligibility explanations</p>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Select Job Posting (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Select Job Posting</h2>
          
          <div className="space-y-3">
            {jobsList.map((job) => {
              const isSelected = selectedJobId === job.id;
              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-5 rounded-2xl cursor-pointer transition-all duration-150 text-left border ${
                    isSelected
                      ? 'bg-[#E8F8F0]/40 border-emerald-400/80 shadow-xs'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <h3 className="font-bold text-sm text-slate-900 leading-snug">{job.title}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{job.company}</p>
                  
                  <div className="mt-3">
                    <span className="badge-green text-[11px] font-semibold py-0.5 px-2.5">
                      {job.eligibleCount} eligible
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Ranked Candidates (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Active Job Posting Banner */}
          <div className="app-card p-6 border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{currentJob.title}</h2>
                <p className="text-xs text-slate-500 font-medium">{currentJob.company}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge-blue text-xs font-semibold px-2.5 py-1">
                  {currentJob.skills.length} skills
                </span>
                <span className="badge-green text-xs font-semibold px-2.5 py-1">
                  {currentJob.eligibleCount} eligible
                </span>
              </div>
            </div>

            {/* Required Skill Pills */}
            <div className="pt-4 flex flex-wrap gap-2">
              {currentJob.skills.map((skill, idx) => (
                <span 
                  key={idx} 
                  className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-200/60"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Candidates Ranked Cards */}
          <div className="space-y-4">
            {currentJob.candidates.map((c, idx) => (
              <div 
                key={idx} 
                className="app-card p-5 hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left rank badge + Name & info */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center shrink-0">
                      {c.rank}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h4 className="font-bold text-base text-slate-900">{c.name}</h4>
                        <span className="badge-green text-[11px] font-semibold py-0.5 px-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Eligible
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {c.rollNo} • {c.branch} • CGPA {c.cgpa}
                      </p>
                    </div>
                  </div>

                  {/* Right Match Score */}
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-black text-emerald-600 tracking-tight">{c.matchScore}</div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">match</div>
                  </div>
                </div>

                {/* Skill Matched / Gaps Pills */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex flex-wrap gap-2">
                  {c.skillsMatch.map((s, sIdx) => (
                    <span 
                      key={sIdx}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${
                        s.matched 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-rose-50 text-rose-600 border border-rose-200/60'
                      }`}
                    >
                      {s.matched ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <X className="w-3 h-3 text-rose-500" />
                      )}
                      <span>{s.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </AppLayout>
  );
}
