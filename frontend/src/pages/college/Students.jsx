import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, LogOut, LayoutDashboard, Users, Building, ShieldAlert, BarChart3, CheckCircle, XCircle, Filter, Sparkles, GraduationCap } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/client';

export default function Students() {
  const { user, logout } = useAuthStore();
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
      alert("Student approved successfully!");
    } catch (error) {
      console.error("Failed to approve student", error);
      alert("Failed to approve student.");
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
    <div className="flex h-screen bg-black font-body text-champagne overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-burgundy/10 via-black to-black opacity-80"></div>
      </div>

      {/* Top Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b-0 border-white/5 h-[72px]">
        <div className="max-w-[1440px] mx-auto px-8 flex justify-between items-center h-full">
          <Link className="display-title text-2xl" to="/college/dashboard">Campus Connect <span className="font-ui text-sm text-gold ml-2 uppercase tracking-widest">Admin</span></Link>
          
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-champagne/40 w-4 h-4" />
              <input 
                className="input-glass pl-10 py-2 h-10 w-full"
                placeholder="Search students by name, roll no, email..." 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6 ml-auto md:ml-0">
            <button className="text-champagne/60 hover:text-gold transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button onClick={logout} className="text-champagne/60 hover:text-gold transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
            <div className="h-9 w-9 rounded-full border border-gold/30 overflow-hidden cursor-pointer hover:border-gold transition-colors">
              <img alt="Profile" className="w-full h-full object-cover" src={`https://ui-avatars.com/api/?name=${user?.name || 'A'}&background=362822&color=EFE5D2`} />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 pt-[72px] max-w-[1440px] w-full mx-auto relative z-10">
        
        {/* Sidebar */}
        <aside className="w-64 fixed left-0 top-[72px] bottom-0 border-r border-white/5 hidden md:flex flex-col bg-black/20 backdrop-blur-sm">
          <nav className="flex-1 py-8 flex flex-col gap-2 px-4">
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-champagne/60 hover:text-champagne hover:bg-white/5 transition-all border-l-2 border-transparent" to="/college/dashboard">
              <LayoutDashboard className="w-4 h-4" />
              <span className="font-ui text-[11px] tracking-widest uppercase">Dashboard</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg bg-burgundy/10 border-l-2 border-burgundy text-champagne transition-all" to="/college/students">
              <Users className="w-4 h-4 text-burgundy" />
              <span className="font-ui text-[11px] tracking-widest uppercase">Students</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-champagne/60 hover:text-champagne hover:bg-white/5 transition-all border-l-2 border-transparent" to="/college/companies">
              <Building className="w-4 h-4" />
              <span className="font-ui text-[11px] tracking-widest uppercase">Companies</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-champagne/60 hover:text-champagne hover:bg-white/5 transition-all border-l-2 border-transparent" to="/college/drives">
              <BarChart3 className="w-4 h-4" />
              <span className="font-ui text-[11px] tracking-widest uppercase">Drives</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-champagne/60 hover:text-champagne hover:bg-white/5 transition-all border-l-2 border-transparent" to="/college/venues">
              <ShieldAlert className="w-4 h-4" />
              <span className="font-ui text-[11px] tracking-widest uppercase">Venues</span>
            </Link>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 md:ml-64 p-8 overflow-y-auto w-full">
          <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="display-title text-4xl mb-2">Student Directory</h1>
              <p className="font-body text-champagne/60 text-sm">Verified student profiles, academic records, and pending registrations.</p>
            </div>
            
            {/* Tabs & Filter */}
            <div className="flex items-center gap-3">
              <select
                value={branchFilter}
                onChange={e => setBranchFilter(e.target.value)}
                className="bg-black/60 border border-white/10 text-champagne text-xs px-3 py-2 rounded-lg focus:outline-none"
              >
                <option value="">All Branches</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
              </select>

              <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-1.5 text-xs font-ui uppercase tracking-widest rounded-md transition-colors ${
                    activeTab === 'all' ? 'bg-white/10 text-champagne' : 'text-champagne/40 hover:text-champagne'
                  }`}
                >
                  Enrolled ({students.length})
                </button>
                <button 
                  onClick={() => setActiveTab('pending')}
                  className={`px-4 py-1.5 text-xs font-ui uppercase tracking-widest rounded-md transition-colors ${
                    activeTab === 'pending' ? 'bg-gold/20 text-gold font-bold' : 'text-champagne/40 hover:text-champagne'
                  }`}
                >
                  Pending ({pendingStudents.length})
                </button>
              </div>
            </div>
          </header>

          <section className="glass-panel rounded-xl flex flex-col h-full border-white/5 shadow-2xl">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-display font-semibold text-xl">
                {activeTab === 'all' ? 'Enrolled Engineering Candidates' : 'Pending Registrations'}
              </h3>
              <span className="font-ui text-[10px] uppercase tracking-widest text-gold bg-gold/10 px-3 py-1 rounded-full">
                {activeTab === 'all' ? `${filteredStudents.length} Students Listed` : `${pendingStudents.length} Pending`}
              </span>
            </div>
            
            <div className="p-0 overflow-x-auto">
              {loading ? (
                <div className="p-10 text-center text-champagne/60 font-ui text-xs uppercase tracking-widest">Loading student records...</div>
              ) : activeTab === 'all' ? (
                filteredStudents.length === 0 ? (
                  <div className="p-10 text-center text-champagne/60 font-ui text-xs uppercase tracking-widest">No matching students found.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/5">
                        <th className="p-4 font-ui text-[10px] uppercase tracking-widest text-champagne/40 font-normal">Candidate</th>
                        <th className="p-4 font-ui text-[10px] uppercase tracking-widest text-champagne/40 font-normal">Roll No</th>
                        <th className="p-4 font-ui text-[10px] uppercase tracking-widest text-champagne/40 font-normal">Branch</th>
                        <th className="p-4 font-ui text-[10px] uppercase tracking-widest text-champagne/40 font-normal">CGPA</th>
                        <th className="p-4 font-ui text-[10px] uppercase tracking-widest text-champagne/40 font-normal">Backlogs</th>
                        <th className="p-4 font-ui text-[10px] uppercase tracking-widest text-champagne/40 font-normal text-right">Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((s) => (
                        <tr key={s.student_id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                                {(s.name || 'S').charAt(0)}
                              </div>
                              <div>
                                <p className="font-body font-medium text-champagne group-hover:text-gold transition-colors">{s.name}</p>
                                <p className="text-xs text-champagne/50">{s.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-xs text-champagne/80">{s.roll_no}</td>
                          <td className="p-4 font-mono text-xs text-amber-400">{s.branch}</td>
                          <td className="p-4">
                            <span className="font-mono font-bold text-sm text-emerald-400">{s.cgpa || 'N/A'}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-mono ${s.active_backlogs === 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                              {s.active_backlogs}
                            </span>
                          </td>
                          <td className="p-4 text-right font-mono text-xs text-champagne/70">
                            {s.attendance_pct ? `${s.attendance_pct}%` : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              ) : (
                pendingStudents.length === 0 ? (
                  <div className="p-10 text-center text-champagne/60 font-ui text-xs uppercase tracking-widest">No pending students. All caught up!</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/5">
                        <th className="p-4 font-ui text-[10px] uppercase tracking-widest text-champagne/40 font-normal">Student Info</th>
                        <th className="p-4 font-ui text-[10px] uppercase tracking-widest text-champagne/40 font-normal">Roll No</th>
                        <th className="p-4 font-ui text-[10px] uppercase tracking-widest text-champagne/40 font-normal">Branch</th>
                        <th className="p-4 font-ui text-[10px] uppercase tracking-widest text-champagne/40 font-normal text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingStudents.map((student) => (
                        <tr key={student.user_id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-burgundy/20 flex items-center justify-center text-burgundy font-display font-bold">
                                {student.name?.charAt(0) || 'S'}
                              </div>
                              <div>
                                <p className="font-body font-medium text-champagne group-hover:text-gold transition-colors">{student.name}</p>
                                <p className="text-xs text-champagne/50">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-ui tracking-wider text-sm text-champagne/80">{student.roll_no}</td>
                          <td className="p-4 font-body text-sm text-champagne/80">{student.branch}</td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => approveStudent(student.user_id)}
                                className="flex items-center gap-1 bg-gold/10 text-gold hover:bg-gold/20 px-3 py-1.5 rounded-lg text-xs font-ui uppercase tracking-widest transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
