import React, { useState } from 'react';
import { Building2, Search, CheckCircle2, Clock, Plus, ExternalLink, Check } from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import useAuthStore from '../../store/authStore';

export default function Companies() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [companies, setCompanies] = useState([
    { id: 1, name: 'Tech Solutions Inc', industry: 'Software', status: 'Pending' },
    { id: 2, name: 'Global Finance Corp', industry: 'Fintech', status: 'Approved' },
    { id: 3, name: 'NextGen AI', industry: 'Artificial Intelligence', status: 'Approved' },
    { id: 4, name: 'Microsoft Corporation', industry: 'Cloud & OS Platforms', status: 'Approved' },
    { id: 5, name: 'Amazon Web Services', industry: 'Cloud & Infrastructure', status: 'Approved' },
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
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#EFE5D2] tracking-tight">Partner Companies</h1>
        <p className="text-sm text-white/50 mt-1 font-normal">
          Manage recruiting partners and approve new access requests.
        </p>
      </div>

      {/* Companies List Container */}
      <div className="bg-[#121417]/90 border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/5 text-white/30 text-[11px] font-bold uppercase tracking-widest bg-black/20">
                <th className="py-4 px-6">Company Name</th>
                <th className="py-4 px-6">Industry</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((comp) => (
                <tr key={comp.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#181A1E] text-white/80 font-bold text-sm flex items-center justify-center shrink-0 border border-white/10">
                        {comp.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-[#EFE5D2]">{comp.name}</div>
                        <a href="#view" className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-normal mt-0.5">
                          <span>View Profile</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-white/60 font-medium">{comp.industry}</td>
                  <td className="py-4 px-6 text-center">
                    {comp.status === 'Approved' ? (
                      <span className="bg-[#064E3B]/20 text-[#10B981] border border-[#10B981]/30 text-[10px] uppercase font-bold tracking-widest py-1 px-3 rounded-md">
                        Approved
                      </span>
                    ) : (
                      <span className="bg-[#78350F]/20 text-[#F59E0B] border border-[#F59E0B]/30 text-[10px] uppercase font-bold tracking-widest py-1 px-3 rounded-md">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {comp.status === 'Pending' ? (
                      <button 
                        onClick={() => approveCompany(comp.id)}
                        className="bg-transparent hover:bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/50 font-bold text-xs uppercase tracking-wider py-1.5 px-3.5 rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Approve</span>
                      </button>
                    ) : (
                      <span className="text-xs text-white/30 font-medium uppercase tracking-wider">Active</span>
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
