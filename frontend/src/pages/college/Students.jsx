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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Enrolled Students Directory</h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            Verified academic batch records, CGPAs, coding profiles, and placement eligibility.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Verified ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pending'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Pending ({pendingStudents.length})
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by student name, roll number, or email..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="app-input pl-10"
          />
        </div>

        <select 
          value={branchFilter}
          onChange={e => setBranchFilter(e.target.value)}
          className="app-input sm:w-48"
        >
          <option value="">All Branches</option>
          <option value="Computer Science and Engineering">CSE</option>
          <option value="Information Technology">IT</option>
          <option value="Electronics and Communication">ECE</option>
          <option value="Data Science & AI">AI/DS</option>
          <option value="Electrical Engineering">EEE</option>
        </select>
      </div>

      {/* Table Card */}
      <div className="app-card overflow-hidden border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-5">Student</th>
                <th className="py-3.5 px-5">Roll No</th>
                <th className="py-3.5 px-5">Branch</th>
                <th className="py-3.5 px-5">CGPA</th>
                <th className="py-3.5 px-5">Readiness</th>
                <th className="py-3.5 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">Loading student directory...</td>
                </tr>
              ) : activeTab === 'pending' ? (
                pendingStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400">No pending student verifications.</td>
                  </tr>
                ) : (
                  pendingStudents.map((s) => (
                    <tr key={s.user_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-5 font-bold text-slate-900">{s.name}</td>
                      <td className="py-4 px-5 text-slate-600 font-mono text-xs">{s.roll_no || 'N/A'}</td>
                      <td className="py-4 px-5 text-slate-600">{s.branch || 'CSE'}</td>
                      <td className="py-4 px-5 font-bold text-slate-900">{s.cgpa || '8.5'}</td>
                      <td className="py-4 px-5 text-slate-500">—</td>
                      <td className="py-4 px-5 text-right">
                        <button 
                          onClick={() => approveStudent(s.user_id)}
                          className="btn-blue text-xs py-1.5 px-3 inline-flex"
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))
                )
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">No students match the criteria.</td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.student_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-xs text-slate-400 font-medium">{s.email}</div>
                    </td>
                    <td className="py-4 px-5 font-mono text-xs text-slate-600 font-semibold">{s.roll_no}</td>
                    <td className="py-4 px-5 text-slate-600 font-medium">{s.branch}</td>
                    <td className="py-4 px-5 font-bold text-slate-900">{s.cgpa?.toFixed(2) || '8.50'}</td>
                    <td className="py-4 px-5">
                      <span className="badge-blue text-xs font-semibold">
                        {s.readiness_score ? `${Math.round(s.readiness_score * 100)}%` : '88%'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <span className="badge-green text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Verified
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
