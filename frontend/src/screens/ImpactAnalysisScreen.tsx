import React, { useState } from 'react';
import {
  Clock,
  PackageX,
  DollarSign,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Building2,
  Factory,
  Warehouse,
  ShoppingBag,
  AlertTriangle,
} from 'lucide-react';
import type { NavigationSection } from '../types';
import { mockCustomerOrdersAtRisk } from '../data/mockData';

interface ImpactAnalysisScreenProps {
  onNavigate: (section: NavigationSection) => void;
}

export const ImpactAnalysisScreen: React.FC<ImpactAnalysisScreenProps> = ({ onNavigate }) => {
  const [showHistoricalBaseline, setShowHistoricalBaseline] = useState<boolean>(true);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Incident Context & Navigation Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
          <div>
            <div className="text-xs font-bold text-slate-900">
              Active Disruption Analysis: Shanghai Maritime Port Congestion (#DIS-8821)
            </div>
            <div className="text-[11px] text-slate-500">
              Pacific Cargo Route → Austin Gigaplant Alpha • 14-Day Simulation Window
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('recovery-planning')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <span>Proceed to Recovery Planning</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* UX Rule Banner: Clearly Distinguish Simulated Estimates from Historical Data */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-teal-50 border border-blue-200/80 rounded-2xl p-4.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                Simulated AI Predictive Estimates
              </span>
              <span className="text-xs text-slate-500">• Confidence: 94%</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Projections are computed using multi-tier inventory buffers and carrier latency curves. 
              Historical baseline actuals (2025) are rendered in dashed gray.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto bg-white/70 px-3 py-1.5 rounded-xl border border-blue-200/60">
          <span className="text-xs font-semibold text-slate-700">Overlay 2025 Baseline</span>
          <button
            onClick={() => setShowHistoricalBaseline(!showHistoricalBaseline)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              showHistoricalBaseline ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                showHistoricalBaseline ? 'translate-x-5' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>
      </div>

      {/* 1. Three Core Headline Impact KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1: Estimated Delays */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Estimated Delays
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-2">
            <span>+3.4 Days</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              Transit Slip
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Standard arrival pushed from Nov 8 to Nov 11. 2 maritime feeder carriers queued.
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Historical normal deviation: ±0.2 days
          </div>
        </div>

        {/* KPI 2: Inventory Shortage */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Inventory Shortage
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <PackageX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-600 tracking-tight flex items-baseline gap-2">
            <span>4,200 Units</span>
            <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
              Buffer Deficit
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Austin Gigaplant buffer falls below critical threshold on Day 7.5 without intervention.
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Safety reserve limit: 3,000 units
          </div>
        </div>

        {/* KPI 3: Financial Exposure */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Financial Impact Exposure
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-2">
            <span>$420,000</span>
            <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
              At Risk
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Includes expedited logistics, temporary line idle, and delayed fulfillment penalties.
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-emerald-600 font-semibold">
            Mitigatable down to ~$78,000 via Strategy A
          </div>
        </div>
      </div>

      {/* 2. Affected Value Chain Breakdown (4 Connected Cards) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Downstream Disruption Propagation</h3>
            <p className="text-xs text-slate-500">Step-by-step cascade through multi-tier nodes</p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
            4 Nodes Impacted
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Node 1: Suppliers */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-blue-100 text-blue-700 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-900">Suppliers (2 Held)</span>
            </div>
            <div className="font-semibold text-xs text-slate-800">Silico & Pacific Components</div>
            <div className="text-[11px] text-slate-500 mt-1">Containers queued at Shanghai berth</div>
            <div className="mt-2 text-[10px] font-bold text-rose-600">Delayed: +3.4 Days</div>
          </div>

          {/* Node 2: Factories */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-teal-100 text-teal-700 flex items-center justify-center">
                <Factory className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-900">Factories (1 Impacted)</span>
            </div>
            <div className="font-semibold text-xs text-slate-800">Austin Gigaplant Alpha</div>
            <div className="text-[11px] text-slate-500 mt-1">Assembly line slows by 15% on Day 8</div>
            <div className="mt-2 text-[10px] font-bold text-amber-600">Buffer: 4 Days Left</div>
          </div>

          {/* Node 3: Warehouses */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-amber-100 text-amber-700 flex items-center justify-center">
                <Warehouse className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-900">Warehouses (1 Impacted)</span>
            </div>
            <div className="font-semibold text-xs text-slate-800">Chicago Central Depot</div>
            <div className="text-[11px] text-slate-500 mt-1">Receiving backlog pushed back +3.4d</div>
            <div className="mt-2 text-[10px] font-bold text-amber-600">Buffer Inflow Stalled</div>
          </div>

          {/* Node 4: Customers */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-900">Customer Orders (18)</span>
            </div>
            <div className="font-semibold text-xs text-slate-800">Retail & Wholesale Orders</div>
            <div className="text-[11px] text-slate-500 mt-1">2 Key Account contract SLAs threatened</div>
            <div className="mt-2 text-[10px] font-bold text-rose-600">Potential Penalties: $90k</div>
          </div>
        </div>
      </div>

      {/* 3. Visual Charts Section (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: 14-Day Stock Depletion Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Austin Gigaplant Inventory Depletion Curve
              </h3>
              <p className="text-xs text-slate-500">14-day stock trajectory without recovery intervention</p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 font-semibold text-teal-700">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                Simulated Stock
              </span>
              <span className="flex items-center gap-1 font-semibold text-rose-600">
                <span className="w-3 h-0.5 bg-rose-500 border-dashed"></span>
                Safety Limit
              </span>
              {showHistoricalBaseline && (
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-3 h-0.5 bg-slate-300"></span>
                  2025 Normal
                </span>
              )}
            </div>
          </div>

          {/* SVG Visual Depletion Curve */}
          <div className="relative pt-4 pb-2">
            <svg viewBox="0 0 500 200" className="w-full h-48 overflow-visible">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="#cbd5e1" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="5" y="24" fontSize="10" fill="#94a3b8">16k</text>
              <text x="5" y="64" fontSize="10" fill="#94a3b8">12k</text>
              <text x="5" y="104" fontSize="10" fill="#94a3b8">8k</text>
              <text x="5" y="144" fontSize="10" fill="#94a3b8">4k</text>
              <text x="5" y="174" fontSize="10" fill="#94a3b8">0</text>

              {/* Critical Safety Threshold Line at 3,000 units (y=150) */}
              <line x1="40" y1="148" x2="480" y2="148" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 4" />

              {/* 2025 Baseline Normal Curve */}
              {showHistoricalBaseline && (
                <path
                  d="M 40 45 Q 260 50 480 48"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />
              )}

              {/* Simulated Depletion Curve (Starts high, crosses at Day 7.5, drops to 800) */}
              <path
                d="M 40 35 C 160 50, 240 100, 275 148 C 310 170, 400 175, 480 180"
                fill="none"
                stroke="#0d9488"
                strokeWidth="3.5"
              />

              {/* Stockout Breach Callout Point at Day 7.5 (x=275, y=148) */}
              <circle cx="275" cy="148" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
            </svg>

            {/* Float Badge at stockout breach */}
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-xs mt-2">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Stockout Threshold Breach: Day 7.5 without recovery intervention</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Financial Cost Distribution (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Financial Exposure Breakdown</h3>
            <p className="text-xs text-slate-500">Direct costs vs customer contractual SLA penalties</p>
          </div>

          <div className="space-y-4 pt-1">
            {/* Bar 1 */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Expedited Freight & Feeder Rerouting</span>
                <span className="font-bold text-slate-900">$210,000 (50%)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '50%' }}></div>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Air charter & diverted feeder vessels</div>
            </div>

            {/* Bar 2 */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Production Line Idle & Overtime Rescheduling</span>
                <span className="font-bold text-slate-900">$120,000 (29%)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '29%' }}></div>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Austin Assembly line slowdown & shifts</div>
            </div>

            {/* Bar 3 */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Customer SLA Delay Penalties</span>
                <span className="font-bold text-slate-900">$90,000 (21%)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '21%' }}></div>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Contractual late delivery clauses</div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl mt-4 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Total Calculated Exposure:</span>
            <span className="font-extrabold text-slate-900 text-base">$420,000</span>
          </div>
        </div>
      </div>

      {/* 4. At-Risk Customer Purchase Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              High-Priority Customer Orders at Risk
            </h4>
            <p className="text-xs text-slate-500">Purchase orders requiring expedited dispatch to protect SLAs</p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
            4 Sample Orders
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">
                <th className="py-3 px-6">Order ID</th>
                <th className="py-3 px-4">Customer Account</th>
                <th className="py-3 px-4">Order Value</th>
                <th className="py-3 px-4">Original ETA</th>
                <th className="py-3 px-4">Simulated ETA</th>
                <th className="py-3 px-6 text-right">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockCustomerOrdersAtRisk.map((order) => (
                <tr key={order.orderId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-slate-900">{order.orderId}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{order.customerName}</td>
                  <td className="py-3.5 px-4 text-slate-900 font-bold">${order.orderValue.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-slate-500">{order.originalEta}</td>
                  <td className="py-3.5 px-4 text-rose-600 font-semibold">
                    {order.projectedEta} (+{order.delayDays}d)
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                        order.riskTier === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : order.riskTier === 'Moderate'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {order.riskTier} Risk
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Footer Action Card */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">Recovery Playbooks Formulated</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Ripple optimization engine has synthesized 3 actionable recovery strategies to recover 65% to 88% of delay time.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('recovery-planning')}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <span>Review Recovery Strategies (3 Options)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
