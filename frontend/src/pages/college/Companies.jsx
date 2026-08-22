import React, { useState } from 'react';
import { Building2, Search, CheckCircle2, Clock, Plus, ExternalLink, Check, Briefcase } from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import useAuthStore from '../../store/authStore';

export default function Companies() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [companies, setCompanies] = useState([
    { id: 1, name: 'Microsoft Corporation', industry: 'Cloud & Operating Systems', drives: 2, status: 'Approved' },
    { id: 2, name: 'Google LLC', industry: 'Search, AI & Distributed Systems', drives: 1, status: 'Approved' },
    { id: 3, name: 'Adobe Inc', industry: 'Digital Media & Creative Cloud', drives: 1, status: 'Approved' },
    { id: 4, name: 'Amazon Web Services', industry: 'Cloud Computing & E-Commerce', drives: 1, status: 'Approved' },
    { id: 5, name: 'NextGen AI Solutions', industry: 'Artificial Intelligence & LLMs', drives: 0, status: 'Pending' },
  ]);

  const approveCompany = (id) => {
    setCompanies(companies.map(c => c.id === id ? { ...c, status: 'Approved' } : c));
  };

  const filtered = companies.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout role="college">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Partner Companies</h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            Manage corporate recruiting partners, MOU verification, and active job drives.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search company or sector..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="app-input pl-10"
          />
        </div>
      </div>

      {/* Companies Table Card */}
      <div className="app-card overflow-hidden border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-6">Company</th>
                <th className="py-3.5 px-6">Industry Domain</th>
                <th className="py-3.5 px-6">Active Drives</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((comp) => (
                <tr key={comp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-100">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{comp.name}</div>
                        <div className="text-xs text-slate-400 font-medium">Verified Partner</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-medium">{comp.industry}</td>
                  <td className="py-4 px-6 font-bold text-slate-800">{comp.drives} live drives</td>
                  <td className="py-4 px-6">
                    {comp.status === 'Approved' ? (
                      <span className="badge-green text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Approved
                      </span>
                    ) : (
                      <span className="badge-amber text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Pending Review
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {comp.status === 'Pending' ? (
                      <button 
                        onClick={() => approveCompany(comp.id)}
                        className="btn-blue text-xs py-1.5 px-3.5 inline-flex"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve MOU</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Active Partner</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
