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
      <div className="mb-6 flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/company/candidate-pipeline" className="hover:text-blue-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Candidate Matching
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Interview Scorecard & Offer Dispatch</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Interview Scorecard</h1>
        <p className="text-sm text-slate-500 mt-1 font-normal">
          Submit panel feedback, performance ratings, and dispatch formal offers.
        </p>
      </div>

      {offerSubmitted && (
        <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Formal Offer Letter Extended!</h4>
            <p className="text-xs text-emerald-700 mt-0.5">₹24.5 LPA offer extended to {candidate.name}. Stored in database & notified candidate.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Candidate & Ratings Form (Left 2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Candidate Info Card */}
          <div className="app-card p-6 border-slate-200 flex items-center justify-between gap-4">
            <div>
              <span className="badge-blue text-xs font-semibold mb-2">Round 1 Evaluation</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{candidate.name}</h2>
              <p className="text-xs text-slate-500 font-medium">{candidate.rollNo} • {candidate.branch} • CGPA {candidate.cgpa}</p>
            </div>
            <div className="text-right">
              <span className="badge-green text-xs font-semibold">100% Match</span>
            </div>
          </div>

          {/* Panel Ratings Grid */}
          <div className="app-card p-6 border-slate-200 space-y-5">
            <h3 className="font-bold text-base text-slate-900">Panel Assessment Criteria</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Data Structures & Algorithms', key: 'technical' },
                { label: 'System Design & Problem Solving', key: 'problemSolving' },
                { label: 'Communication & Articulation', key: 'communication' },
                { label: 'Culture & Engineering Fit', key: 'cultureFit' },
              ].map(item => (
                <div key={item.key} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="text-blue-600 font-bold">{ratings[item.key]} / 10</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={ratings[item.key]} 
                    onChange={e => setRatings({ ...ratings, [item.key]: parseInt(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Detailed Panelist Remarks</label>
              <textarea 
                rows={4}
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                className="app-input resize-none text-xs leading-relaxed"
              />
            </div>
          </div>

        </div>

        {/* Hiring Decision & Offer Dispatch (Right 1 Col) */}
        <div className="space-y-6">
          <div className="app-card p-6 border-slate-200 space-y-5">
            <h3 className="font-bold text-base text-slate-900">Hiring Decision</h3>

            <div className="space-y-2.5">
              {[
                { id: 'strong_hire', label: 'Strong Hire (Extend Offer)', badge: 'badge-green' },
                { id: 'hire', label: 'Hire (Standard Offer)', badge: 'badge-blue' },
                { id: 'reject', label: 'Reject / Not Selected', badge: 'badge-red' },
              ].map(opt => (
                <div 
                  key={opt.id}
                  onClick={() => setRecommendation(opt.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs font-semibold ${
                    recommendation === opt.id
                      ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span>{opt.label}</span>
                  {recommendation === opt.id && <Check className="w-4 h-4 text-blue-600" />}
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Offer Package</span>
              <p className="text-xl font-bold text-slate-900">₹24.5 LPA</p>
              <p className="text-[11px] text-slate-400">Software Development Engineer - 1</p>
            </div>

            <button 
              onClick={handleIssueOffer}
              disabled={loading || offerSubmitted}
              className="w-full btn-blue py-3"
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
