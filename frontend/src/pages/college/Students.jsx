import React, { useEffect, useState } from 'react';
import { 
  Search, Users, CheckCircle, XCircle, Filter, 
  Sparkles, GraduationCap, CheckCircle2, Award, Clock 
} from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import useAuthStore from '../../store/authStore';
import api from '../../api/client';

export default function StudentsDirectory() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('all');
  const [students, setStudents] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user?.org_id) {
        const [allRes, pendingRes] = await Promise.all([
          api.get(`/college/${user.org_id}/students`).catch(() => ({ data: [] })),
          api.get('/admin/students/pending').catch(() => ({ data: [] })),
        ]);
        setStudents(allRes.data || []);
        setPendingStudents(pendingRes.data || []);
      }
    } catch (err) {
      console.error("Failed to load students", err);
    } finally {
      setLoading(false);
    }
  };

  const approveStudent = async (userId) => {
    try {
      await api.post(`/admin/students/${userId}/approve`);
      setPendingStudents(pendingStudents.filter(s => s.user_id !== userId));
    } catch (error) {
      console.error("Failed to approve student", error);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
                          s.roll_no?.toLowerCase().includes(search.toLowerCase()) ||
                          s.email?.toLowerCase().includes(search.toLowerCase());
    const matchesBranch = branchFilter ? s.branch === branchFilter : true;
    return matchesSearch && matchesBranch;
  });

  return (
    <AppLayout role="college">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#EFE5D2] tracking-tight">Student Roster & Verification</h1>
          <p className="text-sm text-white/50 mt-1 font-normal">
            Institutional directory of enrolled engineering students and verification workflows.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#16191D] p-1 rounded-xl border border-white/10 shrink-0">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'all' 
                ? 'bg-gradient-to-r from-[#A81B2B] to-[#710912] text-[#EFE5D2] shadow-md' 
                : 'text-white/40 hover:text-white'
            }`}
          >
            Enrolled Students ({students.length})
          </button>
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'pending' 
                ? 'bg-gradient-to-r from-[#A81B2B] to-[#710912] text-[#EFE5D2] shadow-md' 
                : 'text-white/40 hover:text-white'
            }`}
          >
            Pending Approval ({pendingStudents.length})
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by student name, roll number, or email..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#16191D] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-[#EFE5D2] placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50"
          />
        </div>

        <select 
          value={branchFilter}
          onChange={e => setBranchFilter(e.target.value)}
          className="bg-[#16191D] border border-white/10 rounded-xl py-2.5 px-4 text-xs text-[#EFE5D2] focus:outline-none focus:border-[#D4AF37]/50 font-medium"
        >
          <option value="">All Engineering Branches</option>
          <option value="CSE">Computer Science (CSE)</option>
          <option value="IT">Information Tech (IT)</option>
          <option value="ECE">Electronics (ECE)</option>
          <option value="EEE">Electrical (EEE)</option>
          <option value="Mechanical">Mechanical (ME)</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-[#121417]/90 border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-white/40">Loading directory...</div>
        ) : activeTab === 'all' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/5 text-white/30 text-[11px] font-bold uppercase tracking-widest bg-black/20">
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-6">Roll Number</th>
                  <th className="py-4 px-6">Branch & CGPA</th>
                  <th className="py-4 px-6">Backlogs</th>
                  <th className="py-4 px-6 text-right">Placement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.map((st) => (
                  <tr key={st.student_id || st.user_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#EFE5D2]">{st.name}</div>
                      <div className="text-xs text-white/40">{st.email}</div>
                    </td>
                    <td className="py-4 px-6 text-white/60 font-mono text-xs">{st.roll_no}</td>
                    <td className="py-4 px-6">
                      <div className="text-white/80 font-bold">{st.branch}</div>
                      <div className="text-xs text-[#D4AF37] font-semibold">CGPA {st.cgpa}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-[#064E3B]/20 text-[#10B981] border border-[#10B981]/30 text-[10px] uppercase font-bold tracking-widest py-0.5 px-2.5 rounded-full">
                        {st.backlogs || 0} Backlogs
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="bg-blue-950/40 text-blue-300 border border-blue-500/30 text-[10px] uppercase font-bold tracking-widest py-0.5 px-2.5 rounded-full">
                        {st.placement_status || 'Eligible'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            {pendingStudents.length === 0 ? (
              <div className="text-center py-12 text-white/40">No pending student approval requests.</div>
            ) : (
              <div className="space-y-3">
                {pendingStudents.map((st) => (
                  <div key={st.user_id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#EFE5D2]">{st.name}</h4>
                      <p className="text-xs text-white/40">{st.email} • {st.branch} • CGPA {st.cgpa}</p>
                    </div>
                    <button 
                      onClick={() => approveStudent(st.user_id)}
                      className="bg-transparent hover:bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/50 font-bold text-xs uppercase tracking-wider py-1.5 px-4 rounded-lg transition-all inline-flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify Student</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
