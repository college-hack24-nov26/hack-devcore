import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Factory,
  Droplets,
  Play,
  RotateCcw,
  Route,
  Zap,
} from 'lucide-react';

import type { NavigationSection } from '../types';
import type {
  DisruptionType,
  Severity,
  SimulationResult,
} from '../../../shared/types';
import {
  getScenarioTargets,
  runLocalSimulation,
  type ScenarioTarget,
} from '../services/simulation.service';

interface WhatIfScreenProps {
  onNavigate: (section: NavigationSection) => void;
  onSimulationComplete: (result: SimulationResult) => void;
}

const templates: {
  id: DisruptionType;
  title: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'supplier_failure',
    title: 'Supplier Failure',
    description: 'A supplier stops delivering materials.',
    icon: Factory,
  },
  {
    id: 'flood',
    title: 'Factory Flood',
    description: 'A facility is disrupted by flooding.',
    icon: Droplets,
  },
  {
    id: 'power_outage',
    title: 'Power Outage',
    description: 'A facility loses electrical supply.',
    icon: Zap,
  },
  {
    id: 'route_closure',
    title: 'Route Closure',
    description: 'A transportation link becomes unavailable.',
    icon: Route,
  },
  {
    id: 'custom',
    title: 'Custom Disruption',
    description: 'Test a hypothetical disruption.',
    icon: AlertTriangle,
  },
];

export const WhatIfScreen: React.FC<WhatIfScreenProps> = ({
  onNavigate,
  onSimulationComplete,
}) => {
  const [type, setType] = useState<DisruptionType>('supplier_failure');
  const [severity, setSeverity] = useState<Severity>('high');
  const [durationDays, setDurationDays] = useState(14);
  const [description, setDescription] = useState('');
  const [targets, setTargets] = useState<ScenarioTarget[]>([]);
  const [targetId, setTargetId] = useState('');
  const [loadingTargets, setLoadingTargets] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    setLoadingTargets(true);
    setTargetId('');

    getScenarioTargets(type)
      .then((items) => {
        if (!active) return;
        setTargets(items);
        setTargetId(items[0]?.id ?? '');
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load graph.');
        }
      })
      .finally(() => {
        if (active) setLoadingTargets(false);
      });

    return () => {
      active = false;
    };
  }, [type]);

  const selectedTarget = useMemo(
    () => targets.find((target) => target.id === targetId),
    [targets, targetId],
  );

  const handleRun = async () => {
    if (!selectedTarget) {
      setError('Select a valid graph entity first.');
      return;
    }

    setRunning(true);
    setError('');

    try {
      const result = await runLocalSimulation({
        target: selectedTarget,
        disruptionType: type,
        severity,
        durationDays,
        description,
      });

      onSimulationComplete(result);
      onNavigate('impact-analysis');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed.');
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    setType('supplier_failure');
    setSeverity('high');
    setDurationDays(14);
    setDescription('');
    setError('');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            What-If Simulation
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Test disruptions against the sample supply-chain graph.
          </p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <section className="space-y-3">
        <h2 className="font-bold text-slate-800">1. Choose a disruption</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {templates.map((item) => {
            const Icon = item.icon;
            const selected = type === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setType(item.id)}
                className={`rounded-xl border p-4 text-left transition ${
                  selected
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                    : 'border-slate-200 bg-white hover:border-slate-400'
                }`}
              >
                <div className="mb-3 flex justify-between">
                  <Icon size={20} className={selected ? 'text-blue-600' : 'text-slate-500'} />
                  {selected && <CheckCircle2 size={17} className="text-blue-600" />}
                </div>
                <p className="text-sm font-bold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-bold text-slate-800">2. Configure the disruption</h2>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Affected entity
          </label>
          <select
            value={targetId}
            onChange={(event) => setTargetId(event.target.value)}
            disabled={loadingTargets || targets.length === 0}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-3 text-sm"
          >
            {loadingTargets && <option>Loading graph entities...</option>}
            {!loadingTargets && targets.length === 0 && (
              <option value="">No matching entities found</option>
            )}
            {targets.map((target) => (
              <option key={target.id} value={target.id}>
                {target.name} ({target.kind === 'edge' ? 'ROUTE' : target.type})
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400">
            {targets.length} matching entities from the demo graph
          </p>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Severity
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['low', 'medium', 'high', 'critical'] as const).map((value) => (
              <button
                key={value}
                onClick={() => setSeverity(value)}
                className={`rounded-lg border py-2 text-xs font-bold capitalize ${
                  severity === value
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex justify-between">
            <label className="text-xs font-semibold text-slate-600">
              Disruption duration
            </label>
            <span className="text-sm font-bold text-blue-600">
              {durationDays} days
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            value={durationDays}
            onChange={(event) => setDurationDays(Number(event.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Additional details (optional)
          </label>
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the disruption..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-400">
            Hypothetical simulation · Sample dataset
          </p>
          <button
            onClick={handleRun}
            disabled={running || loadingTargets || !selectedTarget}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play size={15} />
            {running ? 'Running engine...' : 'Run Simulation'}
            {!running && <ArrowRight size={15} />}
          </button>
        </div>
      </section>
    </div>
  );
};
