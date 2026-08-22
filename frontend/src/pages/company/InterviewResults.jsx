import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Award, CheckCircle2, Star, Sparkles, Send, 
  Check, FileText, UserCheck, ShieldCheck, DollarSign, Clock
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/client';
import AIAssistantModal from '../../components/AIAssistantModal';

export default function InterviewResults() {
  const { user } = useAuthStore();

  const [ratings, setRatings] = useState({
    technical: 9,
    problemSolving: 9,
    communication: 8,
    cultureFit: 9
  });

  const [feedbackText, setFeedbackText] = useState(
    'Candidate demonstrated outstanding proficiency in Distributed Key-Value stores and Raft algorithm edge-cases. Strong communication, verified coding track record, and high enthusiasm. Recommend Strong Hire for SDE-1.'
  );

  const [recommendation, setRecommendation] = useState('strong_hire'); // strong_hire, hire, neutral, reject
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
      console.log('Demo fallback execution');
    }
    setTimeout(() => {
      setLoading(false);
      setOfferSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-black font-body text-champagne">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-950/20 via-black to-black"></div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-white/10 h-16">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-full">
          <div className="flex items-center gap-4">
            <Link to="/company/candidate-pipeline" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs uppercase tracking-wider font-ui">
              <ArrowLeft className="w-4 h-4" /> Candidate Pipeline
            </Link>
            <span className="text-neutral-600">/</span>
            <span className="text-white font-medium text-sm">Live Scorecard & Decision Entry</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/company/dashboard" className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-300 transition-colors border border-white/10">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono mb-3">
            <UserCheck className="w-3.5 h-3.5" /> RECRUITER EVALUATION DESK
          </div>
          <h1 className="display-title text-3xl md:text-4xl text-white font-bold tracking-tight">
            Interview Scorecard & Offer Issuance
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Submit final evaluation metrics, technical ratings, and trigger formal offer letters for selected candidates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Candidate Scorecard Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Candidate Header */}
            <div className="p-6 rounded-2xl bg-neutral-950/80 border border-white/10 shadow-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center text-xl font-bold text-amber-400">
                  AS
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Aditya Sharma (23CSE041)</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Target Role: <strong className="text-neutral-200">Software Development Engineer - 1</strong> • Tech Round 1 & 2 Completed
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-mono uppercase text-neutral-400">Package</div>
                <div className="text-lg font-bold font-mono text-amber-400">24.5 LPA</div>
              </div>
            </div>

            {/* Scorecard Matrix (1-10 Ratings) */}
            <div className="p-6 rounded-2xl bg-neutral-950/80 border border-white/10 shadow-xl space-y-6">
              <h3 className="text-sm font-bold text-white uppercase font-ui tracking-wider flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" /> Multi-Dimensional Performance Rating
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-300 font-semibold">Technical Depth & Code Quality</span>
                    <span className="font-mono font-bold text-amber-400">{ratings.technical}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={ratings.technical}
                    onChange={(e) => setRatings({ ...ratings, technical: parseInt(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-300 font-semibold">Problem Solving & Algorithms</span>
                    <span className="font-mono font-bold text-amber-400">{ratings.problemSolving}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={ratings.problemSolving}
                    onChange={(e) => setRatings({ ...ratings, problemSolving: parseInt(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-300 font-semibold">Communication & Articulation</span>
                    <span className="font-mono font-bold text-amber-400">{ratings.communication}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={ratings.communication}
                    onChange={(e) => setRatings({ ...ratings, communication: parseInt(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-300 font-semibold">Culture Fit & Ownership</span>
                    <span className="font-mono font-bold text-amber-400">{ratings.cultureFit}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={ratings.cultureFit}
                    onChange={(e) => setRatings({ ...ratings, cultureFit: parseInt(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

              </div>

              {/* Detailed Interviewer Notes */}
              <div>
                <label className="text-xs font-mono uppercase text-neutral-400 block mb-2">Detailed Interview Evaluation & Notes</label>
                <textarea
                  rows="4"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 leading-relaxed"
                />
              </div>

              {/* Final Hiring Recommendation Selector */}
              <div>
                <label className="text-xs font-mono uppercase text-neutral-400 block mb-3">Hiring Decision</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'strong_hire', label: 'Strong Hire', color: 'border-emerald-500 text-emerald-300 bg-emerald-950/30' },
                    { id: 'hire', label: 'Hire', color: 'border-teal-500 text-teal-300 bg-teal-950/30' },
                    { id: 'neutral', label: 'Hold / Backup', color: 'border-amber-500 text-amber-300 bg-amber-950/30' },
                    { id: 'reject', label: 'Reject', color: 'border-rose-500 text-rose-300 bg-rose-950/30' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setRecommendation(btn.id)}
                      className={`p-3 rounded-xl border text-xs font-bold uppercase font-ui tracking-wider transition-all ${
                        recommendation === btn.id ? btn.color : 'border-white/10 bg-neutral-900/60 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Right Col: Offer Extension & Summary */}
          <div className="space-y-6">
            
            <div className="p-6 rounded-2xl bg-neutral-950/80 border border-amber-500/30 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase font-ui tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" /> Formal Offer Extension
              </h3>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-neutral-400">Designation:</span>
                  <strong className="text-white">Software Development Engineer - 1</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-neutral-400">Total CTC:</span>
                  <strong className="text-amber-400 font-mono font-bold">24.5 LPA</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-neutral-400">Joining Date:</span>
                  <strong className="text-white">July 15, 2027</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-neutral-400">Acceptance Window:</span>
                  <strong className="text-neutral-200">14 Days from issuance</strong>
                </div>
              </div>

              {offerSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Offer Letter Extended & Notified to Student & College Placement Cell!</span>
                </div>
              ) : (
                <button
                  onClick={handleIssueOffer}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold font-ui uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Issuing Offer...' : 'Issue Formal Offer Letter'}</span>
                </button>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-neutral-950/80 border border-white/10 shadow-xl text-xs text-neutral-400 space-y-2">
              <div className="font-bold text-white uppercase font-ui tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> Human Authority Retained
              </div>
              <p className="leading-relaxed">
                As per PlacementOps AI product principles, final hiring and offer decisions require explicit recruiter submission.
              </p>
            </div>

          </div>

        </div>

      </div>

      <AIAssistantModal />
    </div>
  );
}
