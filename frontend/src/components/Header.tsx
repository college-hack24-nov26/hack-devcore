import React from 'react';
import {
  Bell,
  HelpCircle,
  PlusCircle,
  PlayCircle,
  Search,
} from 'lucide-react';
import type { NavigationSection } from '../types';

interface HeaderProps {
  currentSection: NavigationSection;
  onOpenReportModal: () => void;
  onNavigateToScenario: () => void;
}

const sectionTitles: Record<NavigationSection, { title: string; subtitle: string }> = {
  home: {
    title: 'Home Dashboard',
    subtitle: 'Welcome back, Alex • Real-time overview across multi-tier global supply chains',
  },
  'supply-chain': {
    title: 'My Supply Chain',
    subtitle: 'Interactive multi-stage network topology and entity dependency graph',
  },
  'what-if': {
    title: 'What-If Scenarios',
    subtitle: 'Simulate hypothetical supplier failures, natural shocks, and test resilience',
  },
  disruptions: {
    title: 'Disruptions Log',
    subtitle: 'Live verified incidents across logistics, manufacturing, and distribution',
  },
  'impact-analysis': {
    title: 'Disruption Impact Analysis',
    subtitle: 'Deterministic cascade propagation, inventory depletion, and financial exposure',
  },
  'recovery-planning': {
    title: 'Recovery Strategy Planning',
    subtitle: 'Algorithmic mitigation playbooks with mandatory human authorization governance',
  },
};

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  onOpenReportModal,
  onNavigateToScenario,
}) => {
  const currentInfo = sectionTitles[currentSection];

  return (
    <header className="bg-white border-b border-slate-200/80 px-8 py-4.5 sticky top-0 z-20 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Title & Breadcrumbs */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Ripple</span>
            <span>/</span>
            <span className="text-blue-600 font-bold">{currentInfo.title}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            {currentInfo.title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{currentInfo.subtitle}</p>
        </div>

        {/* Right Search, Actions & Shortcuts */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative hidden lg:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search entities, lane, or orders..."
              className="w-56 text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Quick Action: Run Scenario */}
          {currentSection !== 'what-if' && (
            <button
              onClick={onNavigateToScenario}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shadow-xs"
            >
              <PlayCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Run Scenario</span>
            </button>
          )}

          {/* Primary Action: Report Disruption */}
          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all hover:shadow-blue-500/20"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Disruption</span>
          </button>

          {/* Notifications Icon */}
          <div className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
          </div>

          {/* Help Tooltip */}
          <div className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
            <HelpCircle className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
};
