import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, Badge, ArrowRight, Eye, EyeOff, Building } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/client';

export default function Register() {
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Student Fields
  const [sName, setSName] = useState('');
  const [sEmail, setSEmail] = useState('');
  const [sPhone, setSPhone] = useState('');
  const [sPassword, setSPassword] = useState('');
  const [sRollno, setSRollno] = useState('');
  const [sDomain, setSDomain] = useState('');
  const [sBranch, setSBranch] = useState('');
  const [sYear, setSYear] = useState('');

  // Company Fields
  const [cName, setCName] = useState('');
  const [cCompany, setCCompany] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cPassword, setCPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (role === 'student') {
        await api.post('/auth/register/student', {
          name: sName,
          email: sEmail,
          phone: sPhone,
          password: sPassword,
          roll_no: sRollno,
          college_domain: sDomain,
          branch: sBranch,
          graduation_year: parseInt(sYear) || 2026
        });
      } else {
        await api.post('/auth/register/company', {
          name: cName,
          company_name: cCompany,
          email: cEmail,
          phone: cPhone,
          password: cPassword
        });
      }
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-black font-body">
      {/* Background with abstract luxury feel */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-burgundy/20 via-black to-black opacity-80"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg pointer-events-auto my-12">
        <div className="glass-panel p-10 flex flex-col gap-8 rounded-2xl relative overflow-hidden">
          
          {/* Subtle gold top border highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent"></div>

          {/* Header */}
          <div className="text-center flex flex-col gap-2">
            <h1 className="display-title text-4xl">Campus Connect</h1>
            <p className="font-ui text-[10px] tracking-[0.2em] uppercase text-gold">Create Account</p>
          </div>

          {/* Role Tabs */}
          <div className="flex border-b border-white/5 mt-2">
            {['student', 'company'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setRole(tab)}
                className={`flex-1 font-ui text-[11px] uppercase tracking-[0.18em] py-3 border-b-[1.5px] transition-all duration-300 ${
                  role === tab 
                    ? 'text-gold border-gold' 
                    : 'text-champagne/40 border-transparent hover:text-champagne/70 hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {error && (
              <div className="bg-burgundy/20 border border-burgundy/50 text-champagne text-sm p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            {role === 'student' && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] uppercase tracking-[0.2em] text-champagne/60">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-champagne/40 w-[18px] h-[18px]" />
                    <input required value={sName} onChange={e => setSName(e.target.value)} type="text" className="input-glass pl-11" placeholder="e.g. Ravi Kumar" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] uppercase tracking-[0.2em] text-champagne/60">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-champagne/40 w-[18px] h-[18px]" />
                    <input required value={sEmail} onChange={e => setSEmail(e.target.value)} type="email" className="input-glass pl-11" placeholder="name@college.edu" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] uppercase tracking-[0.2em] text-champagne/60">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-champagne/40 w-[18px] h-[18px]" />
                    <input required value={sPhone} onChange={e => setSPhone(e.target.value)} type="tel" className="input-glass pl-11" placeholder="+91 98765 43210" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] uppercase tracking-[0.2em] text-champagne/60">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-champagne/40 w-[18px] h-[18px]" />
                    <input required value={sPassword} onChange={e => setSPassword(e.target.value)} type={showPassword ? "text" : "password"} className="input-glass pl-11 pr-11" placeholder="Min. 8 characters" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-champagne/40 hover:text-champagne transition-colors">
                      {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-ui text-[10px] uppercase tracking-[0.2em] text-champagne/60">Roll Number</label>
                    <div className="relative">
                      <Badge className="absolute left-3.5 top-1/2 -translate-y-1/2 text-champagne/40 w-[18px] h-[18px]" />
                      <input required value={sRollno} onChange={e => setSRollno(e.target.value)} type="text" className="input-glass pl-11" placeholder="21CS001" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-ui text-[10px] uppercase tracking-[0.2em] text-champagne/60">College Domain</label>
                    <input required value={sDomain} onChange={e => setSDomain(e.target.value)} type="text" className="input-glass" placeholder="university.edu" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-ui text-[10px] uppercase tracking-[0.2em] text-champagne/60">Branch</label>
                    <select required value={sBranch} onChange={e => setSBranch(e.target.value)} className="input-glass appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20stroke%3D%22%23C28D39%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:16px]">
                      <option value="" disabled>Select</option>
                      <option value="cse">CSE</option>
                      <option value="ece">ECE</option>
                      <option value="mech">Mechanical</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-ui text-[10px] uppercase tracking-[0.2em] text-champagne/60">Grad. Year</label>
                    <select required value={sYear} onChange={e => setSYear(e.target.value)} className="input-glass appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20stroke%3D%22%23C28D39%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:16px]">
                      <option value="" disabled>Year</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {role === 'company' && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] uppercase tracking-[0.2em] text-champagne/60">Contact Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-champagne/40 w-[18px] h-[18px]" />
                    <input required value={cName} onChange={e => setCName(e.target.value)} type="text" className="input-glass pl-11" placeholder="e.g. Priya Sharma" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] uppercase tracking-[0.2em] text-champagne/60">Company Name</label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-champagne/40 w-[18px] h-[18px]" />
                    <input required value={cCompany} onChange={e => setCCompany(e.target.value)} type="text" className="input-glass pl-11" placeholder="e.g. Infosys Ltd." />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] uppercase tracking-[0.2em] text-champagne/60">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-champagne/40 w-[18px] h-[18px]" />
                    <input required value={cEmail} onChange={e => setCEmail(e.target.value)} type="email" className="input-glass pl-11" placeholder="recruiter@company.com" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] uppercase tracking-[0.2em] text-champagne/60">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-champagne/40 w-[18px] h-[18px]" />
                    <input required value={cPhone} onChange={e => setCPhone(e.target.value)} type="tel" className="input-glass pl-11" placeholder="+91 98765 43210" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] uppercase tracking-[0.2em] text-champagne/60">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-champagne/40 w-[18px] h-[18px]" />
                    <input required value={cPassword} onChange={e => setCPassword(e.target.value)} type={showPassword ? "text" : "password"} className="input-glass pl-11 pr-11" placeholder="Min. 8 characters" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-champagne/40 hover:text-champagne transition-colors">
                      {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                </div>

                <p className="font-ui text-[10px] text-gold/80 bg-gold/10 p-3 rounded-lg border border-gold/20 mt-2 leading-relaxed">
                  ⚠ Company accounts require college verification before activation.
                </p>
              </>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary mt-4 flex justify-center items-center gap-2">
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Footer */}
          <div className="flex flex-col gap-4">
            <hr className="border-t border-white/5" />
            <p className="font-ui text-xs text-champagne/60 text-center tracking-wide">
              Already have an account?{' '}
              <Link to="/login" className="text-gold hover:text-champagne underline decoration-gold/30 hover:decoration-champagne/50 underline-offset-4 transition-all">
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
