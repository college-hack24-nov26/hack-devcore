import React, { useState } from 'react';
import {
  PlusCircle,
  Search,
  ArrowRight,
  CheckCircle2,
  Ship,
  FlaskConical,
  Zap,
  Warehouse,
  Train,
  Info,
} from 'lucide-react';
import type { DisruptionIncident, NavigationSection } from '../types';

interface DisruptionsScreenProps {
  disruptions: DisruptionIncident[];
  onOpenReportModal: () => void;
  onNavigate: (section: NavigationSection) => void;
}

export const DisruptionsScreen: React.FC<DisruptionsScreenProps> = ({
  disruptions,
  onOpenReportModal,
  onNavigate,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const totalCount = disruptions.length;
  const activeCount = disruptions.filter((d) => d.status === 'Analyzing Impact').length;
  const inRecoveryCount = disruptions.filter((d) => d.status === 'Recovery Plan Ready' || d.status === 'Mitigation Active').length;
  const resolvedCount = disruptions.filter((d) => d.status === 'Resolved').length;

  const filteredDisruptions = disruptions.filter((d) => {
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = d.status === 'Analyzing Impact';
    else if (statusFilter === 'recovery') matchesStatus = d.status === 'Recovery Plan Ready' || d.status === 'Mitigation Active';
    else if (statusFilter === 'resolved') matchesStatus = d.status === 'Resolved';

    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.affectedEntityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Maritime Logistics':
        return Ship;
      case 'Raw Materials':
        return FlaskConical;
      case 'Manufacturing':
        return Zap;
      case 'Distribution':
        return Warehouse;
      case 'Rail Transit':
      default:
        return Train;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Quick Summary Bar (4 metric tiles) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">Total Incidents</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Logged in operational registry</div>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">Active Disruptions</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1 flex items-baseline gap-2">
            <span>{activeCount}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Immediate Focus
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Requiring impact modeling</div>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">Under Recovery</div>
          <div className="text-2xl font-extrabold text-blue-600 mt-1 flex items-baseline gap-2">
            <span>{inRecoveryCount}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              In Progress
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Mitigation playbook formulated</div>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">Resolved (30d)</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1 flex items-baseline gap-2">
            <span>{resolvedCount}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Closed
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Audited with zero SLA impact</div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: `All (${totalCount})` },
            { id: 'active', label: `Active (${activeCount})` },
            { id: 'recovery', label: `Under Recovery (${inRecoveryCount})` },
            { id: 'resolved', label: `Resolved (${resolvedCount})` },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === pill.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by incident, lane, or entity..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report New Disruption</span>
          </button>
        </div>
      </div>

      {/* 3. Incident Telemetry Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Incident & Affected Entity</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Reported</th>
                <th className="py-3.5 px-4">Resolution Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredDisruptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="font-semibold text-slate-600">No disruptions found in this view.</p>
                    <p className="text-xs text-slate-400 mt-1">Try switching filters or searching another term.</p>
                  </td>
                </tr>
              ) : (
                filteredDisruptions.map((incident) => {
                  const Icon = getCategoryIcon(incident.category);
                  const isResolved = incident.status === 'Resolved';
                  return (
                    <tr
                      key={incident.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Title & Entity */}
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {incident.title}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {incident.affectedEntityName} • #{incident.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {incident.category}
                        </span>
                      </td>

                      {/* Severity */}
                      <td className="py-4 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase inline-block ${
                            incident.severity === 'severe'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : incident.severity === 'moderate'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : incident.severity === 'low'
                              ? 'bg-teal-100 text-teal-800 border border-teal-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {incident.severity}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{incident.reportedDate}</div>
                        <div className="text-[10px] text-slate-400">{incident.reportedTimeAgo}</div>
                      </td>

                      {/* Resolution Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 ${
                            isResolved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : incident.status === 'Analyzing Impact'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-teal-50 text-teal-700 border border-teal-200'
                          }`}
                        >
                          {!isResolved && (
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                          )}
                          <span>{incident.status}</span>
                        </span>
                      </td>

                      {/* Action Button */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        {incident.status === 'Analyzing Impact' ? (
                          <button
                            onClick={() => onNavigate('impact-analysis')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <span>Analyze Impact</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : incident.status === 'Recovery Plan Ready' ? (
                          <button
                            onClick={() => onNavigate('recovery-planning')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                          >
                            <span>Review Recovery</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onNavigate('impact-analysis')}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                          >
                            View Post-Mortem
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Helpful Guidance Card */}
      <div className="bg-gradient-to-r from-blue-50/80 to-teal-50/80 border border-blue-200/60 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900">Need to log a new disruption?</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Supply operations leads can report port strikes, severe weather, or factory outages to instantly compute multi-tier ripple effects.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenReportModal}
          className="px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold rounded-xl shadow-2xs shrink-0 self-start md:self-auto cursor-pointer"
        >
          Open Disruption Intake Portal
        </button>
      </div>
    </div>
  );
};
