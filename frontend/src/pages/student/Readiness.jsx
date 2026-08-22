import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, GraduationCap, Building2, BarChart2, CheckCircle2, Award } from 'lucide-react';
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
    <AppLayout role={user?.role === 'student' ? 'student' : 'college'}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Analytics & Insights</h1>
        <p className="text-sm text-slate-500 mt-1 font-normal">Skill-gap analysis and placement-readiness metrics</p>
      </div>

      {/* Top 4 Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        {/* Metric 1: Placement Rate */}
        <div className="app-card p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Placement Rate</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{stats.placementRate}</div>
            <p className="text-xs text-slate-400 font-medium mt-1">{stats.placedFraction}</p>
          </div>
        </div>

        {/* Metric 2: Readiness Score */}
        <div className="app-card p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Readiness Score</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{stats.readinessScore}</div>
            <p className="text-xs text-slate-400 font-medium mt-1">{stats.readinessSubtitle}</p>
          </div>
        </div>

        {/* Metric 3: Avg CGPA */}
        <div className="app-card p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Avg CGPA</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{stats.avgCgpa}</div>
            <p className="text-xs text-slate-400 font-medium mt-1">{stats.cgpaSubtitle}</p>
          </div>
        </div>

        {/* Metric 4: Active Recruiters */}
        <div className="app-card p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Active Recruiters</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{stats.activeRecruiters}</div>
            <p className="text-xs text-slate-400 font-medium mt-1">{stats.recruitersSubtitle}</p>
          </div>
        </div>

      </div>

      {/* 2 Bottom Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Top Skills in Pool */}
        <div className="app-card p-6">
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900">Top Skills in Pool</h3>
          </div>
          <p className="text-xs text-slate-400 mb-6 font-normal">Most common skills across all students</p>

          <div className="space-y-4">
            {skillsPool.map((skill, idx) => {
              const widthPct = Math.round((skill.count / skill.max) * 100);
              return (
                <div key={idx} className="flex items-center gap-4 text-xs font-medium">
                  <span className="w-32 text-slate-700 truncate shrink-0">{skill.name}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right font-bold text-slate-700 shrink-0">{skill.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Branch-wise Placement */}
        <div className="app-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900">Branch-wise Placement</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6 font-normal">Placement status by branch</p>

            <div className="space-y-5">
              {branchPlacements.map((b, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-900 text-sm">{b.branch}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-[11px] font-normal">CGPA {b.avgCgpa}</span>
                      <span className="badge-green text-[11px] font-semibold py-0.5 px-2">
                        {b.placed}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${b.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
