import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/client';

export default function Login() {
  const [email, setEmail] = useState('admin@tech.edu');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('institution');
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
      setError('Invalid email or password. Please use password123 or select a role tab above.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'student', label: 'STUDENT', email: 'student@tech.edu' },
    { id: 'institution', label: 'INSTITUTION', email: 'admin@tech.edu' },
    { id: 'corporate', label: 'CORPORATE', email: 'recruiter@microsoft.com' },
  ];

  return (
    <div 
      className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 font-body"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      <div className="relative z-10 w-full max-w-md pointer-events-auto">
        <div className="bg-[#1C1F22] p-8 sm:p-10 flex flex-col gap-6 rounded-[1.5rem] relative overflow-hidden border border-white/10 shadow-2xl">
          
          {/* Faint 'CS' Watermark background inside the box */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden select-none">
            <span className="text-[20rem] font-serif font-bold text-white tracking-tighter leading-none -ml-8">CS</span>
          </div>

          {/* Header */}
          <div className="text-center flex flex-col gap-2 relative z-10">
            <h1 className="font-serif italic text-4xl sm:text-5xl leading-[1.1] font-semibold text-transparent bg-clip-text bg-gradient-to-br from-[#FF4B4B] to-[#FF8A50]">
              Campus<br/>Connect
            </h1>
            <p className="font-ui text-[9px] tracking-[0.2em] uppercase text-[#D4AF37] font-semibold">AI-Powered Campus Placement Platform</p>
          </div>

          {/* Role Tabs */}
          <div className="flex border-b border-white/10 mt-1 relative z-10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setEmail(tab.email);
                  setPassword('password123');
                  setError('');
                }}
                className={`flex-1 font-ui text-[11px] uppercase tracking-[0.15em] py-3 border-b-[2px] font-semibold transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'text-[#D4AF37] border-[#D4AF37]' 
                    : 'text-white/40 border-transparent hover:text-white/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs relative z-10">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4 relative z-10">
            <div>
              <label className="font-ui text-[10px] uppercase tracking-[0.15em] text-white/50 block mb-1.5 font-medium">EMAIL ADDRESS</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-[#121416] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-ui text-[10px] uppercase tracking-[0.15em] text-white/50 block font-medium">PASSWORD</label>
                <span className="text-[10px] text-[#D4AF37]/60">Default: password123</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#121416] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3.5 rounded-xl font-ui text-[11px] uppercase tracking-[0.2em] font-bold text-white bg-gradient-to-r from-[#A81B2B] to-[#710912] border-t border-white/20 hover:brightness-110 shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'SIGNING IN...' : 'SIGN IN'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
