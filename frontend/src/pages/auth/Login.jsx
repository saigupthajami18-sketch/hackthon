import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, AlertCircle, Sparkles } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/client';

export default function Login() {
  const [email, setEmail] = useState('recruiter@microsoft.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('corporate');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const res = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const token = res.data.access_token;
      
      const meRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const user = meRes.data;
      login(token, user);

      if (user.role === 'college_admin') navigate('/college/dashboard');
      else if (user.role === 'company_recruiter') navigate('/company/dashboard');
      else navigate('/student/dashboard');

    } catch (err) {
      console.error(err);
      setError('Invalid email or password. Please use password123 or select a demo role above.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { id: 'corporate', label: 'Company Recruiter', email: 'recruiter@microsoft.com', pass: 'password123', color: 'emerald' },
    { id: 'student', label: 'Student', email: 'student@tech.edu', pass: 'password123', color: 'blue' },
    { id: 'institution', label: 'College Admin', email: 'admin@tech.edu', pass: 'password123', color: 'indigo' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 text-slate-900 font-sans">
      
      <div className="w-full max-w-md">
        
        {/* App Logo Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mx-auto mb-3 shadow-md">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">PlacementOps</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Autonomous Campus Recruitment & Placement Platform</p>
        </div>

        {/* Login Card */}
        <div className="app-card p-7 shadow-lg border-slate-200">
          
          {/* Quick Demo Switcher Tabs */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 text-center">
              1-Click Demo Login Roles
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              {demoAccounts.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setEmail(tab.email);
                    setPassword(tab.pass);
                    setError('');
                  }}
                  className={`py-2 px-1 text-xs font-semibold rounded-lg transition-all truncate text-center ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.id === 'corporate' ? 'Recruiter' : tab.id === 'student' ? 'Student' : 'College'}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="app-input pl-10"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <span className="text-[11px] text-slate-400">Default: password123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="app-input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-blue py-3 mt-2 font-semibold shadow-xs"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to PlacementOps'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          PlacementOps AI 2.0 • Real-time Campus Placement Operating System
        </p>

      </div>
    </div>
  );
}
