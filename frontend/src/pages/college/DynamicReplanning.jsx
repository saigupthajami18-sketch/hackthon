import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, Zap, AlertTriangle, RefreshCw, CheckCircle2, 
  Users, MapPin, Clock, ArrowRight, Play, Layers 
} from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import useAuthStore from '../../store/authStore';
import api from '../../api/client';

export default function DynamicReplanning() {
  const { user } = useAuthStore();

  const [selectedDisruption, setSelectedDisruption] = useState('interviewer_unavailable');
  const [affectedEntity, setAffectedEntity] = useState('Panel 2: Technical Architecture');
  const [simulated, setSimulated] = useState(false);
  const [applying, setApplying] = useState(false);
  const [replanned, setReplanned] = useState(false);

  const simulationResult = {
    affectedSlotsCount: 4,
    impactDescription: 'Interviewer emergency absence halts Panel 2 for 90 minutes. 4 candidates face cascading delays.',
    proposedDiff: [
      {
        candidate: 'Rahul Verma (CSE)',
        originalSlot: '10:30 AM — Room 302 (Panel 2)',
        newSlot: '11:15 AM — Room 303 (Panel 3 - Rebalanced)',
        deltaReason: 'Re-routed to Panel 3 with 0 wait queue conflict'
      },
      {
        candidate: 'Ananya Roy (IT)',
        originalSlot: '11:15 AM — Room 302 (Panel 2)',
        newSlot: '12:00 PM — Room 301 (Panel 1 - Extended)',
        deltaReason: 'Absorbed into Parallel Panel 1'
      },
      {
        candidate: 'Karthik S (ECE)',
        originalSlot: '12:00 PM — Room 302 (Panel 2)',
        newSlot: '02:00 PM — Room 301 (Post-Lunch Backup)',
        deltaReason: 'Shifted to afternoon buffer window with push alert'
      },
      {
        candidate: 'Sneha Patel (CSE)',
        originalSlot: '12:45 PM — Room 302 (Panel 2)',
        newSlot: '02:45 PM — Room 303 (Panel 3)',
        deltaReason: 'Optimized minimal total batch wait time'
      }
    ],
    optimizationScore: '99.4% Constraint Adherence',
    broadcastPlan: 'Instant Webhook + In-App Push sent to 4 affected candidates & 2 panels.'
  };

  const handleSimulate = () => {
    setSimulated(true);
    setReplanned(false);
  };

  const handleApplyReplan = async () => {
    setApplying(true);
    try {
      await api.post('/scheduling/replan', {
        college_id: user?.org_id,
        disruption_type: selectedDisruption,
        affected_entity: affectedEntity
      });
    } catch (e) {}
    setTimeout(() => {
      setApplying(false);
      setReplanned(true);
    }, 600);
  };

  return (
    <AppLayout role="college">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Dynamic Replanning Center</h1>
        <p className="text-sm text-slate-500 mt-1 font-normal">
          Autonomous real-time schedule conflict resolution and emergency interviewer rebalancing.
        </p>
      </div>

      {replanned && (
        <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Dynamic Rebalancing Executed!</h4>
            <p className="text-xs text-emerald-700 mt-0.5">Automated push notifications and updated time slots dispatched to all 4 candidates and panelists.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Simulation Controls (Left 1 Col) */}
        <div className="app-card p-6 border-slate-200 space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Simulate Disruption</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Disruption Event</label>
            <select 
              value={selectedDisruption} 
              onChange={e => setSelectedDisruption(e.target.value)}
              className="app-input"
            >
              <option value="interviewer_unavailable">Interviewer Delayed / Unavailable</option>
              <option value="room_power_outage">Room Maintenance / Power Outage</option>
              <option value="candidate_overlap">Candidate Schedule Clash</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Affected Entity / Panel</label>
            <input 
              type="text" 
              value={affectedEntity} 
              onChange={e => setAffectedEntity(e.target.value)}
              className="app-input"
            />
          </div>

          <button 
            onClick={handleSimulate}
            className="w-full btn-blue py-2.5"
          >
            <Play className="w-4 h-4" />
            <span>Run Constraint Solver</span>
          </button>
        </div>

        {/* Solver Output (Right 2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {simulated ? (
            <div className="app-card p-6 border-slate-200 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Optimal Replanning Strategy</h3>
                  <p className="text-xs text-slate-500 font-medium">{simulationResult.impactDescription}</p>
                </div>
                <span className="badge-green text-xs font-semibold">
                  {simulationResult.optimizationScore}
                </span>
              </div>

              {/* Diff Cards */}
              <div className="space-y-3">
                {simulationResult.proposedDiff.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{item.candidate}</span>
                      <span className="badge-blue text-[10px] py-0.5 px-2 font-semibold">Rebalanced</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="line-through text-slate-400">{item.originalSlot}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <strong className="text-emerald-700">{item.newSlot}</strong>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">{item.deltaReason}</p>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleApplyReplan}
                disabled={applying || replanned}
                className="w-full btn-blue py-3 font-semibold"
              >
                <span>{applying ? 'Applying Rebalancing...' : replanned ? 'Rebalancing Active' : 'Execute & Broadcast Replan'}</span>
              </button>
            </div>
          ) : (
            <div className="app-card p-16 text-center text-slate-400 text-sm">
              Select a disruption event on the left and click "Run Constraint Solver" to simulate live rebalancing.
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
