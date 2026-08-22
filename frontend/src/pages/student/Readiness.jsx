import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, TrendingUp, Sparkles, Award, CheckCircle2, AlertTriangle, 
  Code, BookOpen, Layers, ArrowRight, ShieldCheck, Zap
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import AIAssistantModal from '../../components/AIAssistantModal';

export default function Readiness() {
  const { user } = useAuthStore();

  const [readinessData, setReadinessData] = useState({
    overallScore: 88,
    percentile: 'Top 5% in Batch',
    categories: [
      { name: 'Core Problem Solving (DSA)', score: 92, status: 'Strong', badge: 'LeetCode 1780+' },
      { name: 'Full-Stack Architecture', score: 86, status: 'Proficient', badge: 'React / Node / PostgreSQL' },
      { name: 'System Design & Scalability', score: 78, status: 'Moderate', badge: 'Needs Caching / Queues' },
      { name: 'DevOps & Cloud (Docker/AWS)', score: 68, status: 'Gap Identified', badge: 'Action Required' },
      { name: 'Communication & Behavioral', score: 90, status: 'Strong', badge: 'STAR Framework Ready' }
    ],
    recommendedActions: [
      {
        priority: 'High',
        title: 'Containerize Portfolio Projects with Docker',
        impact: '+6% Overall Match Score across Tier-1 Cloud Roles',
        duration: '2 Days',
        category: 'DevOps'
      },
      {
        priority: 'Medium',
        title: 'Implement Redis Caching in Distributed Task Queue',
        impact: 'Elevates System Design evaluation from Moderate to Expert',
        duration: '3 Days',
        category: 'System Design'
      },
      {
        priority: 'Low',
        title: 'Solve 15 Graph & Dynamic Programming Problems on LeetCode',
        impact: 'Solidifies technical round clearance probability',
        duration: '1 Week',
        category: 'DSA'
      }
    ]
  });

  return (
    <div className="min-h-screen bg-black font-body text-champagne">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-black to-black"></div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-white/10 h-16">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-full">
          <div className="flex items-center gap-4">
            <Link to="/student/dashboard" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs uppercase tracking-wider font-ui">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <span className="text-neutral-600">/</span>
            <span className="text-white font-medium text-sm">Placement Readiness Analytics</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/student/opportunities" className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-xs text-amber-400 transition-colors border border-amber-500/30">
              Check Opportunities
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono mb-3">
            <TrendingUp className="w-3.5 h-3.5" /> AI READINESS BENCHMARK
          </div>
          <h1 className="display-title text-3xl md:text-4xl text-white font-bold tracking-tight">
            Placement Readiness & Skill Gap Diagnostic
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Comprehensive diagnostic benchmarking your verified academic records, coding rating, and projects against top recruiter requirements.
          </p>
        </div>

        {/* Top Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-2xl bg-neutral-950/80 border border-amber-500/30 shadow-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-mono uppercase text-neutral-400">Readiness Score</div>
              <div className="text-4xl font-bold font-mono text-amber-400 mt-1">{readinessData.overallScore}/100</div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-1">✓ {readinessData.percentile}</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-7 h-7" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-950/80 border border-white/10 shadow-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-mono uppercase text-neutral-400">Deterministic Tier</div>
              <div className="text-2xl font-bold text-white mt-1">Tier-1 Dream Ready</div>
              <div className="text-[11px] text-neutral-400 mt-1">Eligible for &ge; 20+ LPA Drives</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-950/80 border border-white/10 shadow-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-mono uppercase text-neutral-400">High-Impact Actions</div>
              <div className="text-2xl font-bold text-white mt-1">3 Recommendations</div>
              <div className="text-[11px] text-amber-400 mt-1">Targeting Cloud & System Design</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300">
              <Sparkles className="w-7 h-7 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Diagnostic Breakdown Matrix & Action Roadmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Category Benchmarks */}
          <div className="p-6 rounded-2xl bg-neutral-950/80 border border-white/10 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase font-ui tracking-wider mb-6 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" /> Competency Breakdown
            </h3>

            <div className="space-y-5">
              {readinessData.categories.map((cat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-neutral-200">{cat.name}</span>
                    <span className="font-mono font-bold text-amber-400">{cat.score}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-900 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        cat.score >= 85 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                        cat.score >= 75 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                        'bg-gradient-to-r from-rose-500 to-amber-500'
                      }`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-neutral-500">
                    <span>Status: <strong className={cat.score >= 80 ? 'text-emerald-400' : 'text-amber-400'}>{cat.status}</strong></span>
                    <span>{cat.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Improvement Roadmap */}
          <div className="p-6 rounded-2xl bg-neutral-950/80 border border-white/10 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase font-ui tracking-wider mb-6 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Recommended Action Roadmap
            </h3>

            <div className="space-y-4">
              {readinessData.recommendedActions.map((action, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-xl bg-neutral-900/80 border border-white/10 hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      action.priority === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      action.priority === 'Medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-white/5 text-neutral-400'
                    }`}>
                      {action.priority} Priority
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">Est: {action.duration}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">{action.title}</h4>
                  <p className="text-[11px] text-neutral-400 mb-3">{action.impact}</p>
                  
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-neutral-500">Track: <strong className="text-neutral-300">{action.category}</strong></span>
                    <button className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
                      Start Task <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      <AIAssistantModal />
    </div>
  );
}
