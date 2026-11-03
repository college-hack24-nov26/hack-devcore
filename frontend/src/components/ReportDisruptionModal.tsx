import React, { useState } from 'react';
import { X, AlertTriangle, PlusCircle, CheckCircle } from 'lucide-react';
import type { DisruptionIncident, DisruptionSeverity } from '../types';
import { mockEntities } from '../data/mockData';

interface ReportDisruptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (incident: DisruptionIncident) => void;
}

export const ReportDisruptionModal: React.FC<ReportDisruptionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [entityId, setEntityId] = useState(mockEntities[0].id);
  const [category, setCategory] = useState<DisruptionIncident['category']>('Maritime Logistics');
  const [severity, setSeverity] = useState<DisruptionSeverity>('moderate');
  const [delayDays, setDelayDays] = useState(3);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entity = mockEntities.find((e) => e.id === entityId) || mockEntities[0];

    const newIncident: DisruptionIncident = {
      id: `DIS-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title || 'Operational Disruption Event',
      affectedEntityId: entity.id,
      affectedEntityName: `${entity.name} (${entity.location})`,
      category,
      severity,
      reportedDate: 'Today, Just Now',
      reportedTimeAgo: 'Just now',
      status: 'Analyzing Impact',
      delayDays: Number(delayDays),
      financialExposure: Number(delayDays) * 75000,
      description: description || 'Reported through incident intake portal.',
    };

    setSubmitted(true);
    setTimeout(() => {
      onSubmit(newIncident);
      setSubmitted(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Report Disruption Incident</h3>
              <p className="text-xs text-slate-500">Log an active event to trigger automated impact analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        {submitted ? (
          <div className="p-10 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-slate-900">Incident Successfully Logged!</h4>
            <p className="text-xs text-slate-500">
              Ripple graph propagation engine is computing downstream ripple effects and recovery playbooks.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Incident Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Panama Canal Drought Restriction"
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Affected Entity
                </label>
                <select
                  value={entityId}
                  onChange={(e) => setEntityId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {mockEntities.map((ent) => (
                    <option key={ent.id} value={ent.id}>
                      {ent.name} ({ent.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Maritime Logistics">Maritime Logistics</option>
                  <option value="Raw Materials">Raw Materials</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Distribution">Distribution</option>
                  <option value="Rail Transit">Rail Transit</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Severity Level
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as DisruptionSeverity)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="low">Low (Buffer absorption)</option>
                  <option value="moderate">Moderate (Potential slip)</option>
                  <option value="severe">Severe (Total shutdown)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estimated Delay (Days)
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="60"
                  step="0.5"
                  value={delayDays}
                  onChange={(e) => setDelayDays(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Operational Notes / Cause
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe bottlenecks, weather conditions, supplier communications..."
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Submit & Compute Impact</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
