import React from 'react';
import {
  Home,
  Network,
  Sliders,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  ChevronDown,
  Waves,
  Zap,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import type { NavigationSection } from '../types';

interface SidebarProps {
  currentSection: NavigationSection;
  onNavigate: (section: NavigationSection) => void;
  activeDisruptionsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onNavigate,
  activeDisruptionsCount,
}) => {
  const navItems: { id: NavigationSection; label: string; icon: React.ElementType; badge?: string | number }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'supply-chain', label: 'My Supply Chain', icon: Network },
    { id: 'what-if', label: 'What-If Scenarios', icon: Sliders },
    { id: 'disruptions', label: 'Disruptions', icon: AlertTriangle, badge: activeDisruptionsCount },
    { id: 'impact-analysis', label: 'Impact Analysis', icon: BarChart3 },
    { id: 'recovery-planning', label: 'Recovery Planning', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 min-h-screen border-r border-slate-800 shadow-xl select-none">
      {/* Top Branding & Company Switcher */}
      <div>
        {/* Brand header */}
        <div className="px-5 pt-6 pb-4 flex items-center gap-3 border-b border-slate-800/80">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Waves className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-lg tracking-tight">Ripple</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                AI
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Supply Chain Intelligence</p>
          </div>
        </div>

        {/* Selected Company Pill */}
        <div className="px-4 py-3">
          <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-2.5 hover:border-slate-600 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
                    Apex Global Corp
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Multi-Industry • Live
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Main Operations
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white text-blue-700'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Action Button */}
        <div className="px-4 mt-3">
          <button
            onClick={() => onNavigate('what-if')}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-teal-500/10 to-blue-500/10 hover:from-teal-500/20 hover:to-blue-500/20 text-teal-300 border border-teal-500/30 transition-all shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-teal-400" />
            <span>Simulate Recovery Shock</span>
          </button>
        </div>
      </div>

      {/* Bottom User & System Status */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        {/* System Health Status Indicator */}
        <div className="flex items-center gap-2 px-1 text-xs text-slate-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-medium text-slate-300">All Systems Operational</span>
          <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-auto" />
        </div>

        {/* User Profile Card */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 border border-slate-700/40">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            AM
          </div>
          <div className="truncate flex-1">
            <div className="text-xs font-semibold text-white truncate">Alex Morgan</div>
            <div className="text-[10px] text-slate-400 truncate">Supply Chain Lead</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
