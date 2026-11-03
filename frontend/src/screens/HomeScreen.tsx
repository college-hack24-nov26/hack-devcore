import React from 'react';
import {
  Network,
  AlertTriangle,
  HeartPulse,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  PlayCircle,
  PlusCircle,
  Clock,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Building2,
  Factory,
  Warehouse,
  ShoppingBag,
} from 'lucide-react';
import type { DisruptionIncident, NavigationSection } from '../types';

interface HomeScreenProps {
  disruptions: DisruptionIncident[];
  onNavigate: (section: NavigationSection) => void;
  onOpenReportModal: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  disruptions,
  onNavigate,
  onOpenReportModal,
}) => {
  const activeDisruptions = disruptions.filter((d) => d.status !== 'Resolved');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome Banner Card */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md border border-slate-700/60 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Autonomous Telemetry Engine Active
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Apex Global Multi-Industry Operations
            </h2>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl">
              Real-time monitoring across 148 connected suppliers, manufacturing sites, and distribution corridors. 
              2 active disruptions under automated impact assessment.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('what-if')}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-blue-400" />
              <span>Run Scenario</span>
            </button>
            <button
              onClick={onOpenReportModal}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Disruption</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Four Simple KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div 
          onClick={() => onNavigate('supply-chain')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Connected Entities</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Network className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">148</div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +4
            </span>
            <span>across 4 tiers (Suppliers & Hubs)</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div 
          onClick={() => onNavigate('disruptions')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Disruptions</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-2">
            <span>{activeDisruptions.length}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Active Alerts
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            1 Moderate Maritime • 1 Low Raw Material
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Supply Chain Health</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 tracking-tight flex items-baseline gap-2">
            <span>94%</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Nominal
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-600 font-semibold">+1.8%</span>
            <span>higher resilience vs target</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div 
          onClick={() => onNavigate('recovery-planning')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recovery Plans</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-2">
            <span>1</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Ready for Review
            </span>
          </div>
          <div className="mt-2 text-xs text-blue-600 font-semibold group-hover:underline flex items-center gap-1">
            <span>Review Strategy A ($342k savings)</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* 2. End-to-End Supply Chain Flow */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">End-to-End Value Chain Flow</h3>
            <p className="text-xs text-slate-500">
              Live transit volume and operational status across the 4 key structural stages
            </p>
          </div>
          <button
            onClick={() => onNavigate('supply-chain')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Explore Full Network Graph</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Connected Flow Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
          {/* Stage 1: Suppliers */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100/60 text-blue-700 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                98% On-Time
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">Stage 01</div>
              <div className="text-base font-bold text-slate-900">Suppliers (42)</div>
              <p className="text-xs text-slate-500 mt-1">Tier-1 chips, resins & structural alloys</p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/60 text-[11px] text-slate-600 flex items-center justify-between">
              <span>Avg lead: 5.2 days</span>
              <span className="text-emerald-600 font-semibold">● Optimal</span>
            </div>
          </div>

          {/* Stage 2: Factories */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100/60 text-teal-700 flex items-center justify-center">
                <Factory className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                94% Output
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">Stage 02</div>
              <div className="text-base font-bold text-slate-900">Factories (8)</div>
              <p className="text-xs text-slate-500 mt-1">Austin Assembly, Munich Module Works</p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/60 text-[11px] text-slate-600 flex items-center justify-between">
              <span>Buffer: 14 days</span>
              <span className="text-emerald-600 font-semibold">● Active</span>
            </div>
          </div>

          {/* Stage 3: Warehouses */}
          <div className="bg-slate-50 border border-amber-200/80 rounded-xl p-4 flex flex-col justify-between relative bg-amber-50/20">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100/60 text-amber-700 flex items-center justify-center">
                <Warehouse className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                1 Minor Delay
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">Stage 03</div>
              <div className="text-base font-bold text-slate-900">Warehouses (18)</div>
              <p className="text-xs text-slate-500 mt-1">Chicago Central & Rotterdam Hub</p>
            </div>
            <div className="mt-3 pt-3 border-t border-amber-200/40 text-[11px] text-slate-600 flex items-center justify-between">
              <span>Throughput: 83k/mo</span>
              <span className="text-amber-600 font-semibold">▲ Bottleneck Check</span>
            </div>
          </div>

          {/* Stage 4: Customers */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100/60 text-indigo-700 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                96% Fulfilled
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">Stage 04</div>
              <div className="text-base font-bold text-slate-900">Customers (80)</div>
              <p className="text-xs text-slate-500 mt-1">Retail channels & corporate distributors</p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/60 text-[11px] text-slate-600 flex items-center justify-between">
              <span>SLA Met: 99.2%</span>
              <span className="text-emerald-600 font-semibold">● High CSAT</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Lower Section: Recent Disruption Activity + Network Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Recent Disruption Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Disruption Activity</h3>
              <p className="text-xs text-slate-500">Chronological telemetry feed of incidents and impacts</p>
            </div>
            <button
              onClick={() => onNavigate('disruptions')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({disruptions.length})</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {disruptions.slice(0, 3).map((incident) => {
              const isResolved = incident.status === 'Resolved';
              return (
                <div
                  key={incident.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/50 hover:bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{incident.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          incident.severity === 'severe'
                            ? 'bg-rose-100 text-rose-800'
                            : incident.severity === 'moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : incident.severity === 'low'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {incident.severity}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span>Affected: {incident.affectedEntityName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {incident.reportedTimeAgo}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                        isResolved
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : incident.status === 'Analyzing Impact'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-teal-50 text-teal-700 border border-teal-200'
                      }`}
                    >
                      {incident.status}
                    </span>
                    <button
                      onClick={() => {
                        if (incident.status === 'Analyzing Impact') {
                          onNavigate('impact-analysis');
                        } else if (incident.status === 'Recovery Plan Ready') {
                          onNavigate('recovery-planning');
                        } else {
                          onNavigate('disruptions');
                        }
                      }}
                      className="text-xs font-semibold px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-2xs cursor-pointer"
                    >
                      {incident.status === 'Analyzing Impact'
                        ? 'Impact Model'
                        : incident.status === 'Recovery Plan Ready'
                        ? 'Review Plan'
                        : 'Audit Log'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 col): Supply Chain Health & Quick Simulation */}
        <div className="space-y-4">
          {/* Health Breakdown Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Network Health Breakdown
              </h4>
              <span className="text-xs font-bold text-emerald-600">94% Resilience</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Transit Reliability</span>
                  <span className="font-bold text-slate-900">96%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Inventory Buffer Capacity</span>
                  <span className="font-bold text-slate-900">89%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: '89%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Supplier Redundancy Index</span>
                  <span className="font-bold text-slate-900">92%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Resilience score exceeds peer benchmark by 12%. Alternate routes verified.</span>
            </div>
          </div>

          {/* Quick Simulation Banner */}
          <div className="bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Stress-Test Simulator</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Simulate Next Supply Shock</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Test how a 14-day typhoon or port shutdown cascades through Austin and Chicago hubs before it strikes.
            </p>
            <button
              onClick={() => onNavigate('what-if')}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Open What-If Sandbox</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
