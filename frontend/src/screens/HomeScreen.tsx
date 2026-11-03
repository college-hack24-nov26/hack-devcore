import React, { useState } from 'react';
import {
  HeartPulse,
  AlertTriangle,
  ShoppingBag,
  ShieldCheck,
  Building2,
  Factory,
  Warehouse,
  Users,
  ArrowRight,
  PlayCircle,
  PlusCircle,
  Clock,
  ChevronDown,
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
  const [selectedCompany, setSelectedCompany] = useState<string>('Apex Global Multi-Industry Operations');

  const activeDisruptions = disruptions.filter((d) => d.status !== 'Resolved');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Welcome Message & Company Selector + Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enterprise Workspace</span>
            <div className="relative inline-block">
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg pl-3 pr-7 py-1 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="Apex Global Multi-Industry Operations">Apex Global Multi-Industry Operations</option>
                <option value="Apex Electronics & High-Tech Division">Apex Electronics & High-Tech Division</option>
                <option value="Apex Consumer & Retail Logistics">Apex Consumer & Retail Logistics</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, Alex
          </h2>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl">
            Here is what is happening across your supply chain today. Everything is running smoothly with 2 active alerts under review.
          </p>
        </div>

        {/* 2 Prominent Quick Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('what-if')}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4 text-blue-600" />
            <span>Run What-If Scenario</span>
          </button>
          <button
            onClick={onOpenReportModal}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Disruption</span>
          </button>
        </div>
      </div>

      {/* 2. Four Simple KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Supply Chain Health */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Supply Chain Health
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <HeartPulse className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight flex items-baseline gap-2">
              <span>94%</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Nominal
              </span>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Stable across all primary supply corridors
          </div>
        </div>

        {/* KPI 2: Active Disruptions */}
        <div
          onClick={() => onNavigate('disruptions')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Disruptions
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight flex items-baseline gap-2">
              <span>{activeDisruptions.length}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Active Alerts
              </span>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
            <span>1 moderate maritime, 1 low materials</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </div>

        {/* KPI 3: Affected Orders */}
        <div
          onClick={() => onNavigate('impact-analysis')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Affected Orders
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight flex items-baseline gap-2">
              <span>18</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                In Transit
              </span>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
            <span>Average delay under 3.4 days</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </div>

        {/* KPI 4: Recovery Plans */}
        <div
          onClick={() => onNavigate('recovery-planning')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Recovery Plans
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight flex items-baseline gap-2">
              <span>1</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                Ready for Review
              </span>
            </div>
          </div>
          <div className="mt-3 text-xs text-blue-600 font-semibold flex items-center gap-1 group-hover:underline">
            <span>Review Strategy A ($342k saved)</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* 3. Simple Visual Flow: Suppliers → Factories → Warehouses → Customers */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Supply Chain Flow</h3>
            <p className="text-xs text-slate-500">
              Overview of the 4 structural stages from raw materials to final customers
            </p>
          </div>
          <button
            onClick={() => onNavigate('supply-chain')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View Full Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Node 1: Suppliers */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between hover:bg-white hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500">Stage 1</span>
              <div className="text-base font-bold text-slate-900">Suppliers (42)</div>
              <p className="text-xs text-slate-500 mt-1">Microchips, resins & alloys</p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs text-emerald-600 font-medium">
              Optimal • 98% on-time
            </div>
          </div>

          {/* Node 2: Factories */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between hover:bg-white hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                <Factory className="w-4 h-4" />
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500">Stage 2</span>
              <div className="text-base font-bold text-slate-900">Factories (8)</div>
              <p className="text-xs text-slate-500 mt-1">Austin, Munich & Regional sites</p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs text-emerald-600 font-medium">
              Active • 94% output
            </div>
          </div>

          {/* Node 3: Warehouses */}
          <div className="bg-slate-50 border border-amber-200/80 rounded-xl p-4 flex flex-col justify-between bg-amber-50/20 hover:bg-white hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Warehouse className="w-4 h-4" />
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500">Stage 3</span>
              <div className="text-base font-bold text-slate-900">Warehouses (18)</div>
              <p className="text-xs text-slate-500 mt-1">Chicago Central & Rotterdam Hub</p>
            </div>
            <div className="mt-3 pt-3 border-t border-amber-200/40 text-xs text-amber-600 font-medium">
              Notice • 1 minor delay
            </div>
          </div>

          {/* Node 4: Customers */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between hover:bg-white hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500">Stage 4</span>
              <div className="text-base font-bold text-slate-900">Customers (80)</div>
              <p className="text-xs text-slate-500 mt-1">Retailers & corporate distributors</p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs text-emerald-600 font-medium">
              Satisfied • 96% fulfilled
            </div>
          </div>
        </div>
      </div>

      {/* 4. Small Recent Disruptions Section (Latest 3 Issues Only) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Disruptions</h3>
            <p className="text-xs text-slate-500">Latest 3 incidents requiring team attention or review</p>
          </div>
          <button
            onClick={() => onNavigate('disruptions')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Disruptions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {disruptions.slice(0, 3).map((incident) => {
            const isResolved = incident.status === 'Resolved';
            return (
              <div
                key={incident.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/50 hover:bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
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
                          ? 'bg-blue-100 text-blue-800'
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
                      ? 'View Impact'
                      : incident.status === 'Recovery Plan Ready'
                      ? 'Review Plan'
                      : 'View Details'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
