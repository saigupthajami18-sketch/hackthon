import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, TrendingUp, Sparkles, BookOpen, Layers, 
  ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, Users 
} from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import useAuthStore from '../../store/authStore';

export default function SkillGapAnalytics() {
  const { user } = useAuthStore();

  const [skillsData] = useState([
    { skill: 'Python / Backend APIs', demand: 94, supply: 88, gap: -6, status: 'Balanced' },
    { skill: 'React / Next.js Frontend', demand: 86, supply: 82, gap: -4, status: 'Balanced' },
    { skill: 'Docker / Kubernetes (DevOps)', demand: 82, supply: 38, gap: -44, status: 'Critical Gap' },
    { skill: 'AWS / Cloud Architecture', demand: 78, supply: 42, gap: -36, status: 'Critical Gap' },
    { skill: 'System Design & Scalability', demand: 74, supply: 46, gap: -28, status: 'Moderate Gap' },
    { skill: 'PostgreSQL / Distributed DBs', demand: 70, supply: 65, gap: -5, status: 'Balanced' }
  ]);

  const [curriculumActions] = useState([
    {
      title: 'Host Hands-on Docker & Kubernetes Bootcamps',
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
      projectedImpact: 'Elevates Technical Round 2 clearance rate by 24%',
      timeframe: 'Ongoing'
    }
  ]);

  return (
    <AppLayout role="college">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Institutional Skill-Gap Analytics</h1>
        <p className="text-sm text-slate-500 mt-1 font-normal">
          Compare recruiter skill demand vs student batch competencies and generate AI curriculum interventions.
        </p>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="app-card p-5">
          <span className="text-xs text-slate-400 font-medium">Batch Readiness Index</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">88.4%</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">+4.2% from last cycle</p>
        </div>
        <div className="app-card p-5">
          <span className="text-xs text-slate-400 font-medium">Top Deficit Area</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">Cloud & DevOps</div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">44% supply shortfall</p>
        </div>
        <div className="app-card p-5">
          <span className="text-xs text-slate-400 font-medium">Strongest Competency</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">Python & DSA</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">94% market parity</p>
        </div>
      </div>

      {/* Skill Gap Comparison Table */}
      <div className="app-card overflow-hidden border-slate-200 mb-8">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">Demand vs Supply Matrix</h3>
            <p className="text-xs text-slate-400">Recruiter requirements compared against verified student skill profiles</p>
          </div>
          <span className="badge-blue text-xs font-semibold">Real-Time Aggregation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-6">Skill Domain</th>
                <th className="py-3.5 px-6">Market Demand</th>
                <th className="py-3.5 px-6">Batch Supply</th>
                <th className="py-3.5 px-6">Gap Delta</th>
                <th className="py-3.5 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {skillsData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{row.skill}</td>
                  <td className="py-4 px-6 text-slate-600 font-semibold">{row.demand}%</td>
                  <td className="py-4 px-6 text-slate-600 font-semibold">{row.supply}%</td>
                  <td className="py-4 px-6 font-bold text-rose-600">{row.gap}%</td>
                  <td className="py-4 px-6 text-right">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      row.status === 'Balanced'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : row.status === 'Critical Gap'
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommended Interventions */}
      <div className="app-card p-6 border-slate-200 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-base text-slate-900">AI Curriculum Recommendations</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {curriculumActions.map((act, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-3">
              <div>
                <span className="badge-blue text-[10px] font-semibold">{act.timeframe}</span>
                <h4 className="font-bold text-sm text-slate-900 mt-2">{act.title}</h4>
                <p className="text-xs text-slate-500 mt-1 font-medium">{act.targetAudience}</p>
              </div>
              <p className="text-xs text-emerald-700 font-bold border-t border-slate-200/60 pt-2">{act.projectedImpact}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
