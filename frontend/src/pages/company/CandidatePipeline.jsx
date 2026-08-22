import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Users, Sparkles, CheckCircle2, ChevronRight, 
  ExternalLink, Search, Filter, Award, Code, CheckSquare, Clock
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import AIAssistantModal from '../../components/AIAssistantModal';

export default function CandidatePipeline() {
  const { user } = useAuthStore();
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [candidates, setCandidates] = useState([
    {
      id: 'c1',
      name: 'Aditya Sharma',
      rollNo: '23CSE041',
      branch: 'CSE',
      cgpa: 9.12,
      matchScore: 94,
      stage: 'interviewing',
      skills: ['Python', 'FastAPI', 'React', 'PostgreSQL', 'Docker'],
      leetcode: { rating: 1840, solved: 280 },
      github: 'https://github.com/aditya-dev',
      project: 'Distributed Key-Value Store with Raft Consensus',
      aiSummary: 'Top 2% algorithmic problem solver in batch. Built production-grade Raft distributed engine matching our Cloud infrastructure requirements.'
    },
    {
      id: 'c2',
      name: 'Pooja Iyer',
      rollNo: '23IT019',
      branch: 'IT',
      cgpa: 8.84,
      matchScore: 90,
      stage: 'shortlisted',
      skills: ['Java', 'Spring Boot', 'Kafka', 'SQL', 'AWS'],
      leetcode: { rating: 1720, solved: 210 },
      github: 'https://github.com/pooja-iyer',
      project: 'Real-time Event Streaming Analytics Engine',
      aiSummary: 'Strong event-driven architecture expertise. Excellent communication and demonstrated leadership in college open-source club.'
    },
    {
      id: 'c3',
      name: 'Vikram Mehta',
      rollNo: '23ECE052',
      branch: 'ECE',
      cgpa: 8.65,
      matchScore: 88,
      stage: 'interviewing',
      skills: ['C++', 'Python', 'Computer Vision', 'CUDA', 'REST'],
      leetcode: { rating: 1790, solved: 245 },
      github: 'https://github.com/vikram-m',
      project: 'Low-latency Video Inference Pipeline',
      aiSummary: 'Deep systems engineering and memory optimization skills. Highly recommended for Core Systems & Performance Optimization.'
    },
    {
      id: 'c4',
      name: 'Sneha Kulkarni',
      rollNo: '23CSE088',
      branch: 'CSE',
      cgpa: 8.95,
      matchScore: 92,
      stage: 'selected',
      skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Docker'],
      leetcode: { rating: 1750, solved: 195 },
      github: 'https://github.com/sneha-k',
      project: 'Collaborative Real-time Canvas Tool',
      aiSummary: 'Flawless performance in Technical Round 1 & 2. Strong UI architecture fundamentals. Formal offer letter recommended.'
    }
  ]);

  const stages = [
    { id: 'applied', label: 'Applied Pool', count: 38 },
    { id: 'shortlisted', label: 'AI Shortlisted', count: 18 },
    { id: 'interviewing', label: 'Interviewing', count: 12 },
    { id: 'selected', label: 'Selected & Offered', count: 4 }
  ];

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
            <span className="text-white font-medium text-sm">Candidate Funnel & Pipeline</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/company/interview-results" className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-xs text-amber-400 transition-colors border border-amber-500/30">
              Live Scorecards & Offers
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono mb-3">
              <Users className="w-3.5 h-3.5" /> AUTHORIZED TALENT PIPELINE
            </div>
            <h1 className="display-title text-3xl md:text-4xl text-white font-bold tracking-tight">
              Candidate Pipeline: Software Development Engineer - 1
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              AI-ranked candidates filtered by hard college eligibility and verified external coding profiles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-mono">Drive Status: <strong className="text-emerald-400">Interviews Active</strong></span>
          </div>
        </div>

        {/* Stage Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stages.map((st) => (
            <div key={st.id} className="p-4 rounded-xl bg-neutral-950/80 border border-white/10 text-center">
              <div className="text-[10px] uppercase font-mono text-neutral-400">{st.label}</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">{st.count}</div>
            </div>
          ))}
        </div>

        {/* Candidates Pipeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {candidates.map((c) => (
            <div 
              key={c.id}
              className="rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-amber-500/40 transition-all p-6 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center font-bold text-base text-amber-400">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{c.name}</h3>
                      <p className="text-xs text-neutral-400">{c.rollNo} • <strong className="text-neutral-200">{c.branch}</strong> • CGPA: <strong className="text-amber-400 font-mono">{c.cgpa}</strong></p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
                      {c.matchScore}% Match
                    </div>
                  </div>
                </div>

                {/* Verified Coding Badges */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-neutral-900 border border-white/5 text-[11px] flex items-center justify-between">
                    <span className="text-neutral-400 flex items-center gap-1.5"><Code className="w-3.5 h-3.5 text-amber-400" /> LeetCode:</span>
                    <strong className="text-white font-mono">{c.leetcode.rating} ({c.leetcode.solved} solved)</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-900 border border-white/5 text-[11px] flex items-center justify-between">
                    <span className="text-neutral-400">Stage:</span>
                    <strong className="text-emerald-400 uppercase font-mono text-[10px]">{c.stage}</strong>
                  </div>
                </div>

                {/* AI Candidate Synthesis */}
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-neutral-300 leading-relaxed mb-4">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> AI Candidate Synthesis
                  </div>
                  {c.aiSummary}
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {c.skills.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-neutral-900 border border-white/10 text-[10px] text-neutral-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-neutral-400 truncate max-w-[220px]">
                  Project: <strong className="text-neutral-200">{c.project}</strong>
                </span>
                <Link
                  to="/company/interview-results"
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold font-ui uppercase tracking-wider flex items-center gap-1"
                >
                  Scorecard <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>

      <AIAssistantModal />
    </div>
  );
}
