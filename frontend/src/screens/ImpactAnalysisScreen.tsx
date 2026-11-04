
import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Factory,
  Package,
  RefreshCw,
  ShieldCheck,
  TrendingDown,
  Warehouse,
  XCircle,
  Zap,
} from 'lucide-react';

import type { NavigationSection } from '../types';
import type { SimulationResult, RecoveryPlanDraft } from '../../../shared/types';

interface ImpactAnalysisScreenProps {
  onNavigate: (section: NavigationSection) => void;
  result?: SimulationResult | null;
}

const severityStyles: Record<string, string> = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  moderate: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-rose-50 text-rose-700 border-rose-200',
};

const feasibilityStyles: Record<string, string> = {
  feasible: 'bg-emerald-50 text-emerald-700',
  conditional: 'bg-amber-50 text-amber-700',
  infeasible: 'bg-rose-50 text-rose-700',
};

const formatNumber = (value: number | null | undefined) =>
  value == null ? 'Unavailable' : value.toLocaleString();

const formatCurrency = (
  value: number | null | undefined,
  currency?: string,
) => {
  if (value == null) return 'Unavailable';

  return `${currency || ''} ${value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`.trim();
};

const MetricCard = ({
  label,
  value,
  description,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  accent: string;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <div className={`rounded-xl p-2.5 ${accent}`}>
        <Icon size={19} />
      </div>
    </div>
    <div className="text-2xl font-extrabold tracking-tight text-slate-900">
      {value}
    </div>
    <p className="mt-2 text-xs leading-relaxed text-slate-500">
      {description}
    </p>
  </div>
);

const SectionHeading = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="mb-4">
    <h3 className="text-base font-bold text-slate-900">{title}</h3>
    <p className="mt-1 text-xs text-slate-500">{description}</p>
  </div>
);

const RecoveryCard = ({ plan }: { plan: RecoveryPlanDraft }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
          <ShieldCheck size={17} />
        </div>
        <span className="text-sm font-bold text-slate-900">
          {plan.name}
        </span>
      </div>

      {plan.recommended && (
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
          RECOMMENDED
        </span>
      )}
    </div>

    <p className="mt-3 text-xs leading-relaxed text-slate-600">
      {plan.description}
    </p>

    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div className="rounded-lg bg-slate-50 p-3">
        <p className="text-[10px] font-semibold uppercase text-slate-400">
          Feasibility
        </p>
        <span
          className={`mt-1 inline-block rounded-md px-2 py-1 text-xs font-bold capitalize ${
            feasibilityStyles[plan.feasibility] || 'bg-slate-100 text-slate-600'
          }`}
        >
          {plan.feasibility}
        </span>
      </div>

      <div className="rounded-lg bg-slate-50 p-3">
        <p className="text-[10px] font-semibold uppercase text-slate-400">
          Estimated Cost
        </p>
        <p className="mt-1 text-sm font-bold text-slate-800">
          {formatCurrency(plan.estimatedCost, plan.currencyCode)}
        </p>
      </div>

      <div className="rounded-lg bg-slate-50 p-3">
        <p className="text-[10px] font-semibold uppercase text-slate-400">
          Recovery Time
        </p>
        <p className="mt-1 text-sm font-bold text-slate-800">
          {plan.recoveryTimeHours == null
            ? 'Unavailable'
            : `${plan.recoveryTimeHours} hrs`}
        </p>
      </div>
    </div>

    {plan.actions.length > 0 && (
      <div className="mt-4 border-t border-slate-100 pt-3">
        <p className="mb-2 text-xs font-bold text-slate-700">
          Proposed actions ({plan.actions.length})
        </p>
        <div className="space-y-2">
          {plan.actions.map((action) => (
            <div key={action.id} className="flex gap-2 text-xs text-slate-600">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-teal-600" />
              <div>
                <p className="font-semibold text-slate-800">
                  {action.description}
                </p>
                <p className="mt-0.5 text-slate-500">{action.rationale}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
      <span className="text-[11px] text-slate-500">
        Risk: <strong className="uppercase">{plan.risk}</strong>
      </span>
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
        <AlertTriangle size={13} />
        Human approval required
      </span>
    </div>
  </div>
);

export const ImpactAnalysisScreen: React.FC<ImpactAnalysisScreenProps> = ({
  onNavigate,
  result = null,
}) => {
  const impact = result?.impact;
  const completed = result?.status === 'completed';
  const failed = result?.status === 'failed';

  const warnings = result?.warnings ?? [];
  const assumptions = result?.assumptions ?? [];
  const plans = result?.recoveryPlans ?? [];

  const severity = impact?.severity ?? 'low';

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-blue-600 p-2.5 text-white shadow-lg shadow-blue-600/20">
              <Activity size={21} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Simulation Impact Analysis
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Supply chain disruption analysis and recovery intelligence
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('what-if')}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          <RefreshCw size={15} />
          Create New Scenario
        </button>
      </div>

      {/* Simulation status */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div
            className={`rounded-xl p-2.5 ${
              completed
                ? 'bg-emerald-50 text-emerald-600'
                : failed
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-amber-50 text-amber-600'
            }`}
          >
            {completed ? (
              <CheckCircle2 size={20} />
            ) : failed ? (
              <XCircle size={20} />
            ) : (
              <Clock3 size={20} />
            )}
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900">
              {completed
                ? 'Simulation completed'
                : failed
                  ? 'Simulation failed'
                  : 'Waiting for simulation results'}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {result
                ? `Simulation ID: ${result.simulationId}`
                : 'Run a scenario and connect the backend to populate this dashboard.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {result && (
            <>
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase text-slate-600">
                {result.simulationMode}
              </span>
              <span
                className={`rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase ${
                  severityStyles[severity] || severityStyles.low
                }`}
              >
                {severity} severity
              </span>
            </>
          )}
        </div>
      </div>

      {/* Empty / integration state */}
      {!result && (
        <div className="overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <Zap size={30} className="text-cyan-300" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                Ripple Simulation Engine
              </span>
              <h2 className="mt-2 text-xl font-extrabold">
                Your supply chain analysis starts here.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
                Once a scenario is processed by the shared simulation engine,
                this dashboard displays its actual impact, disruption
                propagation, recovery recommendations and data limitations.
              </p>
            </div>
            <button
              onClick={() => onNavigate('what-if')}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-xs font-extrabold text-slate-950 transition hover:bg-cyan-300"
            >
              Open Scenarios <ArrowRight size={15} />
            </button>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
            {[
              {
                title: 'Impact propagation',
                description: 'Identify affected suppliers and facilities.',
              },
              {
                title: 'Recovery intelligence',
                description: 'Evaluate generated mitigation strategies.',
              },
              {
                title: 'Explainable results',
                description: 'Review assumptions, warnings and evidence.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl bg-white/5 p-4">
                <p className="text-sm font-bold text-white">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Impact metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Affected Entities"
          value={impact ? formatNumber(impact.affectedEntities) : '—'}
          description="Total affected graph entities."
          icon={Activity}
          accent="bg-blue-50 text-blue-600"
        />
        <MetricCard
          label="Affected Suppliers"
          value={impact ? formatNumber(impact.affectedSuppliers) : '—'}
          description="Suppliers identified by propagation."
          icon={Building2}
          accent="bg-indigo-50 text-indigo-600"
        />
        <MetricCard
          label="Affected Facilities"
          value={impact ? formatNumber(impact.affectedFacilities) : '—'}
          description="Facilities affected by the scenario."
          icon={Factory}
          accent="bg-amber-50 text-amber-600"
        />
        <MetricCard
          label="Impacted Orders"
          value={impact ? formatNumber(impact.impactedOrders) : '—'}
          description="Unavailable when order data is missing."
          icon={Package}
          accent="bg-rose-50 text-rose-600"
        />
      </div>

      {/* Impact details */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <SectionHeading
            title="Supply Chain Impact"
            description="Impact metrics returned by the shared simulation engine."
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              {
                label: 'Affected warehouses',
                value: impact?.affectedWarehouses,
                icon: Warehouse,
              },
              {
                label: 'Inventory shortage',
                value: impact?.inventoryShortage,
                icon: Package,
              },
              {
                label: 'Estimated production loss',
                value: impact?.estimatedProductionLoss,
                icon: TrendingDown,
              },
              {
                label: 'Estimated delay',
                value: impact?.estimatedDelayDays,
                icon: Clock3,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="rounded-lg bg-white p-2 text-slate-500 shadow-sm">
                    <Icon size={17} />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {impact
                        ? formatNumber(item.value)
                        : 'Awaiting results'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-slate-700">
                Financial impact exposure
              </p>
              <span className="text-[10px] font-semibold text-slate-400">
                Engine estimate
              </span>
            </div>
            {impact ? (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  ['Best case', impact.financialImpact.bestCase],
                  ['Expected case', impact.financialImpact.expectedCase],
                  ['Worst case', impact.financialImpact.worstCase],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <p className="text-[10px] text-slate-500">{label}</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {formatCurrency(
                        value as number | null,
                        impact.financialImpact.currency,
                      )}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-400">
                Financial estimates will appear when a simulation result is available.
              </p>
            )}
          </div>
        </div>

        {/* Affected entities */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <SectionHeading
            title="Affected Entities"
            description="Graph entity IDs returned by the engine."
          />

          {impact?.affectedEntityIds.length ? (
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {impact.affectedEntityIds.map((id) => (
                <div
                  key={id}
                  className="flex items-center gap-2 rounded-lg bg-slate-50 p-3"
                >
                  <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600">
                    <Building2 size={14} />
                  </div>
                  <span className="break-all text-xs font-medium text-slate-700">
                    {id}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center">
              <Building2 className="mx-auto text-slate-300" size={25} />
              <p className="mt-2 text-xs font-semibold text-slate-600">
                {impact ? 'No affected entities' : 'No results available'}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Entity details appear after simulation.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recovery plans */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <SectionHeading
            title="Recovery Recommendations"
            description="Engine-generated recovery plans. All plans require human approval."
          />
          <button
            onClick={() => onNavigate('recovery-planning')}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
          >
            Recovery Planning <ArrowRight size={14} />
          </button>
        </div>

        {plans.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {plans.map((plan) => (
              <RecoveryCard key={plan.id} plan={plan} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-7 text-center">
            <ShieldCheck className="mx-auto text-slate-300" size={28} />
            <p className="mt-2 text-sm font-bold text-slate-700">
              {result ? 'No recovery plans generated' : 'Recovery plans will appear here'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Recommendations are populated directly from the simulation engine.
            </p>
          </div>
        )}
      </div>

      {/* Warnings and assumptions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-amber-200 bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="text-amber-600" size={18} />
            <h3 className="text-sm font-bold text-slate-900">
              Data Warnings ({warnings.length})
            </h3>
          </div>
          {warnings.length > 0 ? (
            <ul className="space-y-2">
              {warnings.map((warning, index) => (
                <li
                  key={`${index}-${warning}`}
                  className="rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-900"
                >
                  {warning}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">
              {result ? 'No warnings reported by the engine.' : 'Waiting for simulation data.'}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-blue-200 bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="text-blue-600" size={18} />
            <h3 className="text-sm font-bold text-slate-900">
              Simulation Assumptions ({assumptions.length})
            </h3>
          </div>
          {assumptions.length > 0 ? (
            <ul className="space-y-2">
              {assumptions.map((assumption, index) => (
                <li
                  key={`${index}-${assumption}`}
                  className="rounded-lg bg-blue-50 p-3 text-xs leading-relaxed text-blue-900"
                >
                  {assumption}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">
              {result ? 'No assumptions reported by the engine.' : 'Waiting for simulation data.'}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold text-slate-800">
            Ripple · Explainable Supply Chain Intelligence
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Hypothetical simulation results. Recovery actions are drafts, not automatic operations.
          </p>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Simulation Contract v0.4
        </span>
      </div>
    </div>
  );
};
