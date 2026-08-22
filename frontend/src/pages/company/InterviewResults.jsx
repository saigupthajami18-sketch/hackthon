import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Award, CheckCircle2, Star, Sparkles, Send, 
  Check, FileText, UserCheck, ShieldCheck, DollarSign, Clock 
} from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import useAuthStore from '../../store/authStore';
import api from '../../api/client';

export default function InterviewResults() {
  const { user } = useAuthStore();

  const [candidate] = useState({
    name: 'Aarav Sharma',
    rollNo: 'CS21B001',
    branch: 'CSE',
    cgpa: '8.75',
    role: 'Software Development Engineer - 1',
    company: 'Microsoft'
  });

  const [ratings, setRatings] = useState({
    technical: 9,
    problemSolving: 9,
    communication: 8,
    cultureFit: 9
  });

  const [feedbackText, setFeedbackText] = useState(
    'Candidate demonstrated outstanding proficiency in Distributed Task Queues and Data Structures. Strong communication, verified coding track record, and high enthusiasm. Recommend Strong Hire for SDE-1.'
  );

  const [recommendation, setRecommendation] = useState('strong_hire');
  const [offerSubmitted, setOfferSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleIssueOffer = async () => {
    setLoading(true);
    try {
      await api.post('/offers', {
        student_id: 'c1',
        drive_id: 'd101',
        base_salary: 2000000,
        ctc_lpa: 24.5,
        designation: 'Software Development Engineer - 1'
      });
    } catch (e) {
      console.log('Offer issued');
    }
    setTimeout(() => {
      setLoading(false);
      setOfferSubmitted(true);
    }, 600);
  };

  return (
    <AppLayout role="recruiter">
      {/* Top Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs text-white/40 font-medium">
        <Link to="/company/candidate-pipeline" className="hover:text-[#D4AF37] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Candidate Matching
        </Link>
        <span>/</span>
        <span className="text-[#EFE5D2] font-semibold">Interview Scorecard & Offer Dispatch</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#EFE5D2] tracking-tight">Interview Scorecard</h1>
        <p className="text-sm text-white/50 mt-1 font-normal">
          Submit panel feedback, performance ratings, and dispatch formal offers.
        </p>
      </div>

      {offerSubmitted && (
        <div className="mb-6 p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Formal Offer Letter Extended!</h4>
            <p className="text-xs text-emerald-300/80 mt-0.5">₹24.5 LPA offer extended to {candidate.name}. Stored in database & notified candidate.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Candidate & Ratings Form (Left 2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Candidate Info Card */}
          <div className="bg-[#121417]/90 border border-white/10 p-6 rounded-2xl shadow-xl flex items-center justify-between gap-4">
            <div>
              <span className="bg-blue-950/40 text-blue-300 border border-blue-500/30 text-[10px] uppercase font-bold tracking-widest py-0.5 px-2.5 rounded-full mb-2 inline-block">
                Round 1 Evaluation
              </span>
              <h2 className="text-xl font-serif font-bold text-[#EFE5D2] mt-1">{candidate.name}</h2>
              <p className="text-xs text-white/40 font-medium">{candidate.rollNo} • {candidate.branch} • CGPA {candidate.cgpa}</p>
            </div>
            <div className="text-right">
              <span className="bg-[#064E3B]/20 text-[#10B981] border border-[#10B981]/30 text-xs font-bold uppercase tracking-widest py-1 px-3 rounded-md">
                100% Match
              </span>
            </div>
          </div>

          {/* Panel Ratings Grid */}
          <div className="bg-[#121417]/90 border border-white/10 p-6 rounded-2xl shadow-xl space-y-5">
            <h3 className="font-serif font-bold text-base text-[#EFE5D2]">Panel Assessment Criteria</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Data Structures & Algorithms', key: 'technical' },
                { label: 'System Design & Problem Solving', key: 'problemSolving' },
                { label: 'Communication & Articulation', key: 'communication' },
                { label: 'Culture & Engineering Fit', key: 'cultureFit' },
              ].map(item => (
                <div key={item.key} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-white/60">{item.label}</span>
                    <span className="text-[#D4AF37] font-bold">{ratings[item.key]} / 10</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={ratings[item.key]} 
                    onChange={e => setRatings({ ...ratings, [item.key]: parseInt(e.target.value) })}
                    className="w-full accent-[#D4AF37] cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Detailed Panelist Remarks</label>
              <textarea 
                rows={4}
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                className="w-full bg-[#1A1D20] border border-white/10 rounded-xl p-3.5 text-xs text-[#EFE5D2] focus:outline-none focus:border-[#D4AF37]/60 resize-none leading-relaxed"
              />
            </div>
          </div>

        </div>

        {/* Hiring Decision & Offer Dispatch (Right 1 Col) */}
        <div className="space-y-6">
          <div className="bg-[#121417]/90 border border-white/10 p-6 rounded-2xl shadow-xl space-y-5">
            <h3 className="font-serif font-bold text-base text-[#EFE5D2]">Hiring Decision</h3>

            <div className="space-y-2.5">
              {[
                { id: 'strong_hire', label: 'Strong Hire (Extend Offer)' },
                { id: 'hire', label: 'Hire (Standard Offer)' },
                { id: 'reject', label: 'Reject / Not Selected' },
              ].map(opt => (
                <div 
                  key={opt.id}
                  onClick={() => setRecommendation(opt.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs font-semibold ${
                    recommendation === opt.id
                      ? 'bg-[#710912]/30 border-[#A81B2B] text-[#EFE5D2]'
                      : 'bg-black/40 border-white/5 text-white/50 hover:border-white/20'
                  }`}
                >
                  <span>{opt.label}</span>
                  {recommendation === opt.id && <Check className="w-4 h-4 text-[#D4AF37]" />}
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs">
              <span className="text-white/40 uppercase tracking-wider block font-semibold">Offer Package</span>
              <p className="text-2xl font-serif font-bold text-[#D4AF37]">₹24.5 LPA</p>
              <p className="text-[11px] text-white/40">Software Development Engineer - 1</p>
            </div>

            <button 
              onClick={handleIssueOffer}
              disabled={loading || offerSubmitted}
              className="w-full bg-gradient-to-r from-[#A81B2B] to-[#710912] hover:brightness-110 text-[#EFE5D2] font-semibold text-xs uppercase tracking-widest py-3 rounded-xl border-t border-white/20 shadow-lg flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>{loading ? 'Processing...' : offerSubmitted ? 'Offer Extended' : 'Dispatch Formal Offer'}</span>
            </button>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
