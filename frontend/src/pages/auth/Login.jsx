import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="relative min-h-screen flex items-center justify-center p-6 font-body"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay to match the screenshot vibe */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      <div className="relative z-10 w-full max-w-md pointer-events-auto">
        <div className="bg-[#1C1F22] p-10 flex flex-col gap-8 rounded-[1.5rem] relative overflow-hidden border border-white/5 shadow-2xl">
          
          {/* Faint 'CS' Watermark background inside the box */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden select-none">
            <span className="text-[20rem] font-serif font-bold text-white tracking-tighter leading-none -ml-8">CS</span>
          </div>

          {/* Header */}
          <div className="text-center flex flex-col gap-3 relative z-10">
            <h1 className="font-serif italic text-5xl leading-[1.1] font-semibold text-transparent bg-clip-text bg-gradient-to-br from-[#FF4B4B] to-[#FF8A50]">
              Campus<br/>Connect
            </h1>
            <p className="font-ui text-[9px] tracking-[0.2em] uppercase text-[#D4AF37] font-semibold">AI-Powered Campus Placement Platform</p>
          </div>

          {/* Role Tabs */}
          <div className="flex border-b border-white/10 mt-2 relative z-10">
            {[
              { id: 'student', label: 'Student', email: 'student@tech.edu' },
              { id: 'institution', label: 'Institution', email: 'admin@tech.edu' },
              { id: 'corporate', label: 'Corporate', email: 'recruiter@microsoft.com' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setEmail(tab.email);
                  setPassword('password123');
                  setError('');
                }}
                className={`flex-1 font-ui text-[10px] uppercase tracking-[0.15em] py-3 border-b-[2px] transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'text-[#D4AF37] border-[#D4AF37]' 
                    : 'text-white/40 border-transparent hover:text-white/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-6 relative z-10">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="font-ui text-[9px] font-semibold uppercase tracking-[0.15em] text-white/70">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white text-black border-none rounded py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#D4AF37] focus:outline-none transition-shadow"
                  placeholder="name@institution.edu"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-ui text-[9px] font-semibold uppercase tracking-[0.15em] text-white/70">Password</label>
                <a href="#" className="font-ui text-[10px] text-white/40 hover:text-white transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white text-black border-none rounded py-3 pl-10 pr-10 text-sm focus:ring-2 focus:ring-[#D4AF37] focus:outline-none transition-shadow"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button 
              type="submit" 
              disabled={loading} 
              className="mt-2 bg-[#C82A2A] hover:bg-[#A81F1F] text-white font-ui text-[11px] font-bold uppercase tracking-widest py-3.5 px-6 rounded transition-colors flex justify-center items-center gap-2 shadow-lg"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Footer */}
          <div className="flex flex-col gap-4 mt-2 relative z-10">
            <p className="font-ui text-[10px] text-white/40 text-center tracking-wide">
              New to Campus Connect AI?{' '}
              <Link to="/register" className="text-white/60 hover:text-white underline decoration-white/20 hover:decoration-white/60 underline-offset-4 transition-all">
                Create an account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
