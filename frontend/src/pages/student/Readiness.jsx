import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, GraduationCap, Building2, BarChart2, CheckCircle2, Award, Users } from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import api from '../../api/client';
import useAuthStore from '../../store/authStore';

export default function AnalyticsInsights() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    placementRate: '30%',
    placedFraction: '3 of 10 placed',
    readinessScore: '88%',
    readinessSubtitle: 'Eligibility match coverage',
    avgCgpa: '8.21',
    cgpaSubtitle: 'Across all students',
    activeRecruiters: '3',
    recruitersSubtitle: '0 open positions'
  });

  const skillsPool = [
    { name: 'Python', count: 7, max: 8 },
    { name: 'SQL', count: 5, max: 8 },
    { name: 'Data Structures', count: 4, max: 8 },
    { name: 'DBMS', count: 4, max: 8 },
    { name: 'Machine Learning', count: 4, max: 8 },
    { name: 'Java', count: 3, max: 8 },
    { name: 'Algorithms', count: 3, max: 8 },
    { name: 'React', count: 3, max: 8 },
    { name: 'Data Analysis', count: 3, max: 8 },
  ];

  const branchPlacements = [
    { branch: 'CSE', avgCgpa: '8.55', placed: '2/6 placed', pct: 33 },
    { branch: 'IT', avgCgpa: '7.65', placed: '1/2 placed', pct: 50 },
    { branch: 'Mechanical', avgCgpa: '7.50', placed: '0/1 placed', pct: 0 },
    { branch: 'ECE', avgCgpa: '7.95', placed: '0/1 placed', pct: 0 },
  ];

  useEffect(() => {
    fetchLiveStats();
  }, []);

  const fetchLiveStats = async () => {
    try {
      if (user?.org_id) {
        const res = await api.get(`/college/${user.org_id}/dashboard-stats`);
        if (res.data) {
          setStats(prev => ({
            ...prev,
            placementRate: `${res.data.placement_rate || 30}%`,
            avgCgpa: `${res.data.avg_cgpa || '8.21'}`,
            activeRecruiters: `${res.data.partner_companies || 5}`
          }));
        }
      }
    } catch (e) {
      console.log('Using seeded analytics metrics');
    }
  };

  return (
    <AppLayout role="student">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#EFE5D2] tracking-tight">Analytics & Insights</h1>
        <p className="text-sm text-white/50 mt-1 font-normal">
          Key placement metrics and insights for your campus.
        </p>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        <div className="bg-[#121417]/90 border border-white/10 p-5 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Placement Rate</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#EFE5D2]">{stats.placementRate}</div>
          <p className="text-xs text-white/40 font-medium">{stats.placedFraction}</p>
        </div>

        <div className="bg-[#121417]/90 border border-white/10 p-5 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Readiness Score</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#10B981]">{stats.readinessScore}</div>
          <p className="text-xs text-white/40 font-medium">{stats.readinessSubtitle}</p>
        </div>

        <div className="bg-[#121417]/90 border border-white/10 p-5 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Avg CGPA</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#D4AF37]">{stats.avgCgpa}</div>
          <p className="text-xs text-white/40 font-medium">{stats.cgpaSubtitle}</p>
        </div>

        <div className="bg-[#121417]/90 border border-white/10 p-5 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Active Recruiters</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#EFE5D2]">{stats.activeRecruiters}</div>
          <p className="text-xs text-white/40 font-medium">{stats.recruitersSubtitle}</p>
        </div>

      </div>

      {/* 2-Column Progress Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Top Skills in Pool */}
        <div className="bg-[#121417]/90 border border-white/10 p-6 rounded-2xl shadow-xl space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="font-serif font-bold text-base text-[#EFE5D2]">Top Skills in Pool</h3>
            </div>
            <p className="text-xs text-white/40 font-normal">Most common skills among candidates</p>
          </div>

          <div className="space-y-4">
            {skillsPool.map((skill, idx) => {
              const widthPct = Math.round((skill.count / skill.max) * 100);
              return (
                <div key={idx} className="flex items-center gap-4 text-xs font-medium">
                  <span className="w-32 text-white/70 truncate shrink-0">{skill.name}</span>
                  <div className="flex-1 bg-black/40 rounded-full h-3 overflow-hidden border border-white/5">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-[#A81B2B] to-[#D4AF37] transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right font-bold text-[#EFE5D2] shrink-0">{skill.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Branch-wise Placement */}
        <div className="bg-[#121417]/90 border border-white/10 p-6 rounded-2xl shadow-xl space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-[#10B981]" />
              <h3 className="font-serif font-bold text-base text-[#EFE5D2]">Branch-wise Placement</h3>
            </div>
            <p className="text-xs text-white/40 font-normal">Placement status by branch</p>
          </div>

          <div className="space-y-4">
            {branchPlacements.map((b, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-white/5 bg-black/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#EFE5D2] text-sm font-serif">{b.branch}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white/40 text-[11px] font-normal">CGPA {b.avgCgpa}</span>
                    <span className="bg-[#064E3B]/20 text-[#10B981] border border-[#10B981]/30 text-[10px] font-bold uppercase tracking-wider py-0.5 px-2 rounded">
                      {b.placed}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/5">
                  <div 
                    className="bg-[#10B981] h-full rounded-full transition-all duration-500"
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
