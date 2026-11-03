import React, { useState } from 'react';
import {
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';
import type { NavigationSection } from '../types';
import { mockRecoveryStrategies } from '../data/mockData';

interface RecoveryPlanningScreenProps {
  onNavigate: (section: NavigationSection) => void;
}

export const RecoveryPlanningScreen: React.FC<RecoveryPlanningScreenProps> = ({ onNavigate }) => {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('strategy-a');
  const [checklist, setChecklist] = useState<{ [key: string]: boolean }>({
    budget: true,
    charter: true,
    plant: true,
    crm: true,
  });
  const [auditNote, setAuditNote] = useState<string>(
    'Reviewed impact metrics. $342,000 net savings clearly justifies $78,000 air charter cost. Line shutdown at Austin Gigaplant averted.'
  );
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);

  const selectedStrategy =
    mockRecoveryStrategies.find((s) => s.id === selectedStrategyId) || mockRecoveryStrategies[0];

  const handleToggleChecklist = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checklist).every(Boolean);

  const handleAuthorize = () => {
    if (!allChecked) return;
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      setIsAuthorized(true);
    }, 900);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Incident Case Context Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-slate-900">
            Active Case Mitigation: Shanghai Maritime Port Congestion (#DIS-8821)
          </div>
          <div className="text-[11px] text-slate-500">
            Baseline Exposure: $420,000 • Initial Delay: +3.4 Days • Decision Window: 36 Hours Left
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
            3 Strategies Formulated
          </span>
          <button
            onClick={() => onNavigate('impact-analysis')}
            className="text-xs font-semibold text-slate-600 hover:text-blue-600 px-3 py-1.5 border border-slate-200 rounded-lg cursor-pointer"
          >
            Review Impact Data
          </button>
        </div>
      </div>

      {/* UX Rule Banner: Human-in-the-Loop Governance */}
      <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4.5 shadow-xs flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <Lock className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-teal-900">
            Human-in-the-Loop Governance: Explicit Manual Sign-Off Required
          </h4>
          <p className="text-xs text-teal-800 mt-1 leading-relaxed">
            Ripple calculates and ranks optimal disruption mitigations, but recovery plans{' '}
            <span className="font-bold underline">never execute automatically</span>. 
            All financial budget transfers, flight bookings, and carrier reroutes strictly require manual review and digital signature.
          </p>
        </div>
      </div>

      {/* 1. Side-by-Side Strategy Comparison Cards (3 Columns) */}
      <div>
        <div className="mb-3">
          <h3 className="text-base font-bold text-slate-900">Evaluated Recovery Playbooks</h3>
          <p className="text-xs text-slate-500">
            Multi-objective optimization balancing recovery time, operational expense, and customer SLA penalties
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {mockRecoveryStrategies.map((strat) => {
            const isSelected = selectedStrategyId === strat.id;
            return (
              <div
                key={strat.id}
                onClick={() => setSelectedStrategyId(strat.id)}
                className={`rounded-2xl p-5 border flex flex-col justify-between transition-all cursor-pointer relative ${
                  strat.isRecommended
                    ? isSelected
                      ? 'border-2 border-teal-600 bg-teal-50/20 shadow-md ring-2 ring-teal-500/20'
                      : 'border-2 border-teal-500/80 bg-white shadow-xs hover:shadow-md'
                    : isSelected
                    ? 'border-2 border-blue-600 bg-blue-50/20 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                {/* Badge Top */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 ${
                        strat.isRecommended
                          ? 'bg-teal-600 text-white shadow-xs'
                          : strat.badgeStyle === 'slate'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {strat.isRecommended && <Sparkles className="w-3 h-3" />}
                      {strat.typeBadge}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Selected
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 mt-2">{strat.title}</h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{strat.description}</p>
                </div>

                {/* Metrics 3-Col Block */}
                <div className="mt-5 pt-4 border-t border-slate-100/80 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-slate-50">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Cost</div>
                      <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                        ${strat.estimatedCost.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-emerald-600 font-bold truncate">
                        -${(strat.netSavings / 1000).toFixed(0)}k net
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Delay</div>
                      <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                        +{strat.recoveryDelayDays}d
                      </div>
                      <div className="text-[9px] text-blue-600 font-bold truncate">
                        {strat.delayReductionPct}% faster
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Feasibility</div>
                      <div className="font-extrabold text-emerald-600 text-sm mt-0.5">
                        {strat.feasibilityScore}%
                      </div>
                      <div className="text-[9px] text-slate-500 font-medium truncate">Confirmed</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/60 text-[11px] font-semibold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{strat.ordersProtected}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStrategyId(strat.id);
                    }}
                    className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? 'Ready for Authorization' : 'Select Strategy'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Human Authorization & Execution Sign-Off Panel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Sign-Off Dossier
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {isAuthorized ? 'Authorized' : 'Awaiting Human Signature'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Strategy Authorization: {selectedStrategy.title}
            </h3>
          </div>

          <div className="text-xs text-slate-500">
            Authorization Protocol: <span className="font-semibold text-slate-700">ISO-22301 Resilient Ops</span>
          </div>
        </div>

        {isAuthorized ? (
          /* Execution Success State */
          <div className="p-8 text-center bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3 animate-in fade-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-lg font-bold text-slate-900">
              Recovery Plan Authorized & Dispatched!
            </h4>
            <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
              Execution authorization signed by <span className="font-bold text-slate-800">Alex Morgan</span>. 
              $78,000 contingency logistics allocated. Charter air transit booking confirmed for Shanghai-Dallas. 
              Austin Gigaplant line leads notified of revised wafer ETA.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 font-mono text-[11px] font-semibold">
              <span>Audit Manifest ID: #AUTH-20261103-9941X</span>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => onNavigate('home')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Return to Home Dashboard
              </button>
              <button
                onClick={() => setIsAuthorized(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Modify Sign-Off
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: 4-Point Verification Checklist (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Mandatory Execution Checklist (Verify each item before signing)
              </h4>

              <div className="space-y-2">
                {[
                  {
                    key: 'budget',
                    title: `Reallocate $${selectedStrategy.estimatedCost.toLocaleString()} from Regional Contingency Budget`,
                    desc: 'Approved within Level 4 Logistics Officer spending authority.',
                  },
                  {
                    key: 'charter',
                    title: 'Issue Booking Request to Air Freight Charter Dispatch',
                    desc: 'Reserves 25% priority container slot on Shanghai-Dallas feeder route.',
                  },
                  {
                    key: 'plant',
                    title: 'Notify Austin Gigaplant Plant Manager of Revised Schedule',
                    desc: 'Automates packaging line shift adjustments to avert idle line shutdown.',
                  },
                  {
                    key: 'crm',
                    title: 'Send Proactive SLA Assurances to High-Priority Retail Accounts',
                    desc: 'Guarantees delivery for PO-9021 within contract tolerance, avoiding penalties.',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    onClick={() => handleToggleChecklist(item.key)}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all flex items-start gap-3 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={checklist[item.key]}
                      onChange={() => {}}
                      className="w-4 h-4 text-blue-600 rounded mt-0.5 accent-blue-600 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Right: Approver Credentials & Primary Authorization (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    AM
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Alex Morgan</div>
                    <div className="text-[10px] text-slate-500">Lead Supply Chain Operations • Apex Global</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">Security Clearance: Level 4 Officer</div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Audit Log Rationale Notes
                  </label>
                  <textarea
                    rows={3}
                    value={auditNote}
                    onChange={(e) => setAuditNote(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Authorize Button */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleAuthorize}
                  disabled={!allChecked || isAuthorizing}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isAuthorizing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Recording Governance Sign-Off...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Authorize & Execute Recovery Plan</span>
                    </>
                  )}
                </button>

                {!allChecked && (
                  <p className="text-[10px] text-rose-500 text-center font-medium">
                    All 4 checklist governance items must be confirmed before authorization.
                  </p>
                )}

                <div className="text-center">
                  <button
                    onClick={() => onNavigate('what-if')}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                  >
                    Request Alternative Scenario Simulation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
