import React, { useState } from 'react';
import {
  Factory,
  Droplets,
  ZapOff,
  Anchor,
  Sliders,
  Play,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import type { NavigationSection } from '../types';
import { mockEntities } from '../data/mockData';

interface WhatIfScreenProps {
  onNavigate: (section: NavigationSection) => void;
}

interface ScenarioOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultSeverity: 'Low' | 'Medium' | 'High';
  defaultDays: number;
}

const scenarioTemplates: ScenarioOption[] = [
  {
    id: 'supplier-failure',
    title: 'Supplier Failure',
    description: 'Key supplier cannot deliver parts',
    icon: Factory,
    defaultSeverity: 'High',
    defaultDays: 14,
  },
  {
    id: 'factory-flood',
    title: 'Factory Flood',
    description: 'Production halted due to natural disaster',
    icon: Droplets,
    defaultSeverity: 'Medium',
    defaultDays: 10,
  },
  {
    id: 'power-outage',
    title: 'Power Outage',
    description: 'Grid failure stopping operations for days',
    icon: ZapOff,
    defaultSeverity: 'Medium',
    defaultDays: 7,
  },
  {
    id: 'route-closure',
    title: 'Shipping Route Closure',
    description: 'Port congestion or canal blockage',
    icon: Anchor,
    defaultSeverity: 'High',
    defaultDays: 21,
  },
  {
    id: 'custom-scenario',
    title: 'Custom Scenario',
    description: 'Define your own disruption parameters',
    icon: Sliders,
    defaultSeverity: 'Low',
    defaultDays: 5,
  },
];

export const WhatIfScreen: React.FC<WhatIfScreenProps> = ({ onNavigate }) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('supplier-failure');
  const [affectedEntity, setAffectedEntity] = useState<string>('Silico Microelectronics (Tokyo, Japan)');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [durationDays, setDurationDays] = useState<number>(14);
  const [notes, setNotes] = useState<string>('Secondary supplier delay under review');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [bufferStockTolerance, setBufferStockTolerance] = useState<string>('Standard (8-14 Days)');
  const [reroutingPriority, setReroutingPriority] = useState<string>('Cost Optimized');

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simulationRun, setSimulationRun] = useState<boolean>(true); // default true for immediate preview demo

  const handleSelectScenario = (scen: ScenarioOption) => {
    setSelectedScenarioId(scen.id);
    setSeverity(scen.defaultSeverity);
    setDurationDays(scen.defaultDays);
  };

  const handleRunSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setSimulationRun(true);
    }, 700);
  };

  const handleReset = () => {
    setSelectedScenarioId('supplier-failure');
    setSeverity('Medium');
    setDurationDays(14);
    setNotes('');
    setSimulationRun(false);
  };

  const currentTemplate = scenarioTemplates.find((s) => s.id === selectedScenarioId) || scenarioTemplates[0];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">What-If Scenarios</h2>
          <p className="text-slate-600 text-sm mt-1">
            Simulate supply chain disruptions in 3 simple steps to preview delivery delays and financial impact.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Form</span>
        </button>
      </div>

      {/* STEP 1: Choose a scenario */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
            1
          </span>
          <h3 className="text-base font-bold text-slate-900">Choose a scenario</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {scenarioTemplates.map((scen) => {
            const isSelected = selectedScenarioId === scen.id;
            const Icon = scen.icon;
            return (
              <div
                key={scen.id}
                onClick={() => handleSelectScenario(scen)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{scen.title}</h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{scen.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 2: Configure the scenario */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
            2
          </span>
          <h3 className="text-base font-bold text-slate-900">Configure the scenario</h3>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Affected Entity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Affected Supplier, Factory, Warehouse, or Route
              </label>
              <select
                value={affectedEntity}
                onChange={(e) => setAffectedEntity(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                {mockEntities.map((ent) => (
                  <option key={ent.id} value={`${ent.name} (${ent.location}, ${ent.country})`}>
                    {ent.name} — {ent.location} ({ent.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Severity: Low, Medium, High */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Severity Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Low', 'Medium', 'High'] as const).map((sev) => {
                  const isSevSelected = severity === sev;
                  return (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        isSevSelected
                          ? sev === 'High'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                            : sev === 'Medium'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {sev}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration: Number of Days */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Estimated Duration
                </label>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {durationDays} Days
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>1 day</span>
                <span>14 days</span>
                <span>30 days</span>
              </div>
            </div>

            {/* Optional Additional Details */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Optional Additional Details
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. secondary supplier delay, transit re-routing"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Collapsible Advanced Options */}
          <div className="border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <span>{showAdvanced ? 'Hide Advanced Options' : '+ Advanced Options'}</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvanced && (
              <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Safety Stock Buffer Tolerance
                  </label>
                  <select
                    value={bufferStockTolerance}
                    onChange={(e) => setBufferStockTolerance(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md p-1.5 text-slate-800"
                  >
                    <option value="Aggressive (1-7 Days)">Aggressive (1-7 Days)</option>
                    <option value="Standard (8-14 Days)">Standard (8-14 Days)</option>
                    <option value="Conservative (15+ Days)">Conservative (15+ Days)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rerouting Priority
                  </label>
                  <select
                    value={reroutingPriority}
                    onChange={(e) => setReroutingPriority(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md p-1.5 text-slate-800"
                  >
                    <option value="Cost Optimized">Cost Optimized</option>
                    <option value="Speed Optimized (Air Freight)">Speed Optimized (Air Freight)</option>
                    <option value="Balanced (Feeder Rail + Hub)">Balanced (Feeder Rail + Hub)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Single Clear Primary Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleRunSimulation}
              disabled={isRunning}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              {isRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Running Simulation...</span>
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
      </div>

      {/* STEP 3: Show simulation results */}
      {simulationRun && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h3 className="text-base font-bold text-slate-900">Simulation results</h3>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h4 className="font-bold text-base text-slate-900">
                  {currentTemplate.title} ({durationDays} Days Outage)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target: {affectedEntity}
                </p>
              </div>
              <div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    severity === 'High'
                      ? 'bg-rose-100 text-rose-800'
                      : severity === 'Medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {severity} Impact Disruption
                </span>
              </div>
            </div>

            {/* 4 Simple Headline Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="text-xs font-semibold text-slate-500 uppercase">Affected Entities</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">3 Facilities</div>
                <div className="text-xs text-slate-500 mt-1">Austin, Munich & Depot</div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="text-xs font-semibold text-slate-500 uppercase">Affected Orders</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">42 Orders</div>
                <div className="text-xs text-slate-500 mt-1">Commercial customer tier</div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="text-xs font-semibold text-slate-500 uppercase">Estimated Delay</span>
                <div className="text-2xl font-bold text-amber-600 mt-1">+4.5 Days</div>
                <div className="text-xs text-slate-500 mt-1">Delivery ETA slip</div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="text-xs font-semibold text-slate-500 uppercase">Estimated Loss</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">$380,000</div>
                <div className="text-xs text-slate-500 mt-1">Unmitigated baseline</div>
              </div>
            </div>

            {/* Simple friendly message */}
            <div className="p-4 bg-blue-50/70 border border-blue-200/60 rounded-xl flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900 leading-relaxed">
                Production will be paused in 2 assembly lines within 8 days unless safety stock is rerouted. Pre-approved recovery plans are ready for team review.
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Recovery plans can reduce delivery delays down to 1.2 days.
              </div>
              <button
                onClick={() => onNavigate('recovery-planning')}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Recovery Options</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
