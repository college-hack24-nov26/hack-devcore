import React, { useState } from 'react';
import {
  AlertTriangle,
  Droplets,
  ZapOff,
  Anchor,
  Sliders,
  Play,
  ArrowRight,
  Info,
  CheckCircle,
  RotateCcw,
} from 'lucide-react';
import type { ScenarioTemplate, NavigationSection } from '../types';
import { mockScenarios, mockEntities } from '../data/mockData';

interface WhatIfScreenProps {
  onNavigate: (section: NavigationSection) => void;
}

export const WhatIfScreen: React.FC<WhatIfScreenProps> = ({ onNavigate }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('scen-1');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('ent-sup-1'); // Silico Microelectronics
  const [severity, setSeverity] = useState<'low' | 'moderate' | 'severe'>('severe');
  const [durationDays, setDurationDays] = useState<number>(14);
  const [operationalContext, setOperationalContext] = useState<string>(
    'Cleanroom power loss followed by automated component fabrication shutdown.'
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simulationComplete, setSimulationComplete] = useState<boolean>(false);

  const selectedEntity = mockEntities.find((e) => e.id === selectedEntityId) || mockEntities[0];

  const handleSelectTemplate = (template: ScenarioTemplate) => {
    setSelectedTemplateId(template.id);
    setDurationDays(template.defaultDowntime);
    setSeverity(template.defaultSeverity);
  };

  const handleRunSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setSimulationComplete(true);
    }, 900);
  };

  const getScenarioIcon = (iconName: string) => {
    switch (iconName) {
      case 'AlertTriangle':
        return AlertTriangle;
      case 'Droplets':
        return Droplets;
      case 'ZapOff':
        return ZapOff;
      case 'Anchor':
        return Anchor;
      case 'Sliders':
      default:
        return Sliders;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Section 1: Preset Scenario Templates */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Preset Scenario Templates</h3>
            <p className="text-xs text-slate-500">
              Load verified historical shock profiles or craft a bespoke disruption model
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">5 Scenarios Available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {mockScenarios.map((scen) => {
            const isSelected = selectedTemplateId === scen.id;
            const Icon = getScenarioIcon(scen.iconName);
            return (
              <div
                key={scen.id}
                onClick={() => handleSelectTemplate(scen)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        scen.badgeColor === 'amber'
                          ? 'bg-amber-100 text-amber-700'
                          : scen.badgeColor === 'blue'
                          ? 'bg-blue-100 text-blue-700'
                          : scen.badgeColor === 'indigo'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-teal-100 text-teal-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 leading-snug">{scen.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {scen.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100/80">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 inline-block">
                    {scen.badgeLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Interactive Simulation Configuration & Pre-Run Impact Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Builder (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Configure Stress-Test Parameters</h3>
              <p className="text-xs text-slate-500">
                Specify origin node, severity drop, and duration to model downstream ripple effects
              </p>
            </div>
            <button
              onClick={() => {
                setDurationDays(14);
                setSeverity('severe');
                setSimulationComplete(false);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Field 1: Affected Entity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Node / Point of Origin
              </label>
              <select
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {mockEntities.map((ent) => (
                  <option key={ent.id} value={ent.id}>
                    {ent.name} ({ent.location}, {ent.country}) — {ent.category}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Direct downstream dependency: Austin Gigaplant Alpha (Buffer: {selectedEntity.inventoryBufferDays} days)
              </p>
            </div>

            {/* Field 2: Disruption Severity Magnitude */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Disruption Severity Magnitude
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'low', title: 'Low', desc: '25% Output Drop', sub: 'Transit delays' },
                  { id: 'moderate', title: 'Moderate', desc: '50% Output Drop', sub: 'Single line halt' },
                  { id: 'severe', title: 'Severe', desc: '100% Total Shutdown', sub: 'Site non-operational' },
                ].map((tier) => (
                  <div
                    key={tier.id}
                    onClick={() => setSeverity(tier.id as any)}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                      severity === tier.id
                        ? tier.id === 'severe'
                          ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-500/20'
                          : tier.id === 'moderate'
                          ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20'
                          : 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900">{tier.title}</div>
                    <div className="text-[11px] font-semibold text-slate-700 mt-0.5">{tier.desc}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{tier.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Field 3: Estimated Duration (Slider + Preset Chips) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Estimated Outage Duration
                </label>
                <span className="text-sm font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  {durationDays} Days Outage
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="45"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                <span>1 Day</span>
                <span>14 Days (Standard)</span>
                <span>45 Days (Protracted)</span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 mt-2">
                {[3, 7, 14, 21, 30].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDurationDays(days)}
                    className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold transition-all cursor-pointer ${
                      durationDays === days
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            </div>

            {/* Field 4: Context / Root Cause */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Operational Context & Scenario Notes
              </label>
              <textarea
                rows={2}
                value={operationalContext}
                onChange={(e) => setOperationalContext(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Deterministic Graph Engine (Calculates 14-day ripple cascade)
            </div>
            <button
              onClick={handleRunSimulation}
              disabled={isRunning}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              {isRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Running Ripple Simulation...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Pre-Run Simulation Readiness & Cascade Scope (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Pre-Flight Cascade Scope
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Engine Ready
              </span>
            </div>

            {/* 2x2 Scope Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Impact Origin</div>
                <div className="text-sm font-bold text-slate-900 mt-1">1 Primary Supplier</div>
                <div className="text-[10px] text-rose-600 font-semibold">100% loss</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Downstream At Risk</div>
                <div className="text-sm font-bold text-slate-900 mt-1">2 Factories, 1 Depot</div>
                <div className="text-[10px] text-amber-600 font-semibold">Assembly impact</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Buffer Stock</div>
                <div className="text-sm font-bold text-slate-900 mt-1">8.5 Days Left</div>
                <div className="text-[10px] text-rose-600 font-semibold">-5.5d deficit</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Resilience Score</div>
                <div className="text-sm font-bold text-amber-600 mt-1">64 / 100</div>
                <div className="text-[10px] text-slate-500">Moderate vulnerability</div>
              </div>
            </div>

            {/* Stepped Cascade Propagation Visual */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-800">Visual Cascade Propagation:</div>
              <div className="space-y-2">
                {/* Step 1 */}
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs flex items-center justify-between">
                  <span className="font-semibold text-rose-900">01. {selectedEntity.name}</span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                    Day 1: Shutdown
                  </span>
                </div>
                {/* Arrow */}
                <div className="text-center text-slate-400 text-[10px]">↓ 5.5-day transit ripple shock</div>
                {/* Step 2 */}
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs flex items-center justify-between">
                  <span className="font-semibold text-amber-900">02. Austin Gigaplant Alpha</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    Day 7.5: Buffer Breach
                  </span>
                </div>
                {/* Arrow */}
                <div className="text-center text-slate-400 text-[10px]">↓ Finished goods delay</div>
                {/* Step 3 */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <span className="font-semibold text-slate-800">03. Chicago Depot & Customers</span>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                    Day 11: SLA Penalty Risk
                  </span>
                </div>
              </div>
            </div>

            {/* Informational Callout */}
            <div className="p-3.5 bg-blue-50 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Running this simulation will generate an estimated financial & delivery impact model, 
                and calculate optimized recovery strategies.
              </p>
            </div>

            {/* Simulation Complete Banner */}
            {simulationComplete && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Simulation Complete!</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Estimated impact: +3.4 days delay, $420,000 projected exposure. 3 recovery strategies computed.
                </p>
                <button
                  onClick={() => onNavigate('impact-analysis')}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span>View Impact Analysis Model</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
