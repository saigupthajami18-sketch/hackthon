import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, BarChart3, TrendingUp, Sparkles, BookOpen, Layers, 
  ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, Users
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import AIAssistantModal from '../../components/AIAssistantModal';

export default function SkillGapAnalytics() {
  const { user } = useAuthStore();

  const [skillsData, setSkillsData] = useState([
    { skill: 'Python / Backend APIs', demand: 94, supply: 88, gap: -6, status: 'Balanced' },
    { skill: 'React / Next.js Frontend', demand: 86, supply: 82, gap: -4, status: 'Balanced' },
    { skill: 'Docker / Kubernetes (DevOps)', demand: 82, supply: 38, gap: -44, status: 'Critical Gap' },
    { skill: 'AWS / Cloud Architecture', demand: 78, supply: 42, gap: -36, status: 'Critical Gap' },
    { skill: 'System Design & Scalability', demand: 74, supply: 46, gap: -28, status: 'Moderate Gap' },
    { skill: 'PostgreSQL / Distributed DBs', demand: 70, supply: 65, gap: -5, status: 'Balanced' }
  ]);

  const [curriculumActions, setCurriculumActions] = useState([
    {
      title: 'Host Hands-on Docker & Kubernetes Workshop',
      targetAudience: 'Pre-final Year (2027 Batch - CSE/IT)',
      projectedImpact: '+32% increase in Tier-1 Cloud & SDE Job Match eligibility',
      timeframe: '2 Weeks'
    },
    {
      title: 'Introduce Cloud Computing & AWS Sandbox Labs in Sem 6',
      targetAudience: 'All Circuital Engineering Branches',
      projectedImpact: 'Closes persistent 36% AWS industry demand shortfall',
      timeframe: 'Semester Elective'
    },
    {
      title: 'Mandatory System Design Mock Interview Series',
      targetAudience: 'Top 20% Shortlist Candidates',
      projectedImpact: 'Elevates Technical Round 2 clearance rate by an estimated 24%',
      timeframe: 'Ongoing'
    }
  ]);

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
            <Link to="/college/dashboard" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs uppercase tracking-wider font-ui">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <span className="text-neutral-600">/</span>
            <span className="text-white font-medium text-sm">Institutional Skill-Gap Analytics</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/college/drives" className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-300 transition-colors border border-white/10">
              Drives Roster
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono mb-3">
            <BarChart3 className="w-3.5 h-3.5" /> CORPORATE DEMAND VS STUDENT SUPPLY
          </div>
          <h1 className="display-title text-3xl md:text-4xl text-white font-bold tracking-tight">
            Institutional Skill-Gap & Curriculum Intelligence
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Real-time heatmaps analyzing corporate Job Description requirements against verified student cohort competencies.
          </p>
        </div>

        {/* Skill Gap Comparison Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          <div className="lg:col-span-2 p-6 rounded-2xl bg-neutral-950/80 border border-white/10 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase font-ui tracking-wider mb-6 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" /> Market Demand vs Batch Competency Index
            </h3>

            <div className="space-y-6">
              {skillsData.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{item.skill}</span>
                    <span className={`font-mono font-bold ${
                      item.status === 'Critical Gap' ? 'text-rose-400' :
                      item.status === 'Moderate Gap' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {item.gap}% Gap ({item.status})
                    </span>
                  </div>

                  {/* Dual Bar (Demand vs Supply) */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 text-[10px] text-neutral-400 font-mono">
                      <span className="w-20">Market Demand:</span>
                      <div className="flex-1 h-2 rounded-full bg-neutral-900 overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${item.demand}%` }}></div>
                      </div>
                      <span className="w-8 text-right text-white font-bold">{item.demand}%</span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-neutral-400 font-mono">
                      <span className="w-20">Batch Supply:</span>
                      <div className="flex-1 h-2 rounded-full bg-neutral-900 overflow-hidden">
                        <div className={`h-full rounded-full ${
                          item.supply >= 70 ? 'bg-teal-400' : 'bg-rose-400'
                        }`} style={{ width: `${item.supply}%` }}></div>
                      </div>
                      <span className="w-8 text-right text-white font-bold">{item.supply}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Insights Summary */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-950/80 border border-white/10 shadow-xl text-xs space-y-4">
              <h3 className="text-sm font-bold text-white uppercase font-ui tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> AI Executive Summary
              </h3>
              <p className="text-neutral-300 leading-relaxed">
                • <strong>Strong Core Foundation</strong>: 88% of CSE students possess solid Data Structures and Python backend fundamentals.
              </p>
              <p className="text-neutral-300 leading-relaxed">
                • <strong>Major Bottleneck (Cloud & DevOps)</strong>: 82% of visiting Tier-1 recruiters now require Docker/AWS knowledge, but only 38% of students have verified project evidence.
              </p>
              <p className="text-neutral-300 leading-relaxed">
                • <strong>Immediate Intervention</strong>: Launching targeted hands-on bootcamps will directly unlock eligibility for 14 upcoming premium drives.
              </p>
            </div>
          </div>

        </div>

        {/* Actionable Curriculum Intervention Plan */}
        <div className="p-6 rounded-2xl bg-neutral-950/80 border border-white/10 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase font-ui tracking-wider mb-6 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" /> AI Recommended Training Interventions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {curriculumActions.map((action, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-neutral-900/80 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase text-amber-400 mb-1">Timeframe: {action.timeframe}</div>
                  <h4 className="text-sm font-bold text-white mb-2">{action.title}</h4>
                  <p className="text-xs text-neutral-400 mb-3 leading-relaxed">{action.projectedImpact}</p>
                </div>
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">{action.targetAudience}</span>
                  <button className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
                    Deploy <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <AIAssistantModal />
    </div>
  );
}
