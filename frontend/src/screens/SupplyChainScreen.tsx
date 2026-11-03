import React, { useState } from 'react';
import {
  Building2,
  Factory,
  Warehouse,
  ShoppingBag,
  ArrowRight,
  Zap,
  CheckCircle2,
  Plus,
  Search,
} from 'lucide-react';
import type { EntityType, NavigationSection } from '../types';
import { mockEntities } from '../data/mockData';

interface SupplyChainScreenProps {
  onNavigateToScenarioWithEntity?: (entityId: string) => void;
  onNavigate: (section: NavigationSection) => void;
}

export const SupplyChainScreen: React.FC<SupplyChainScreenProps> = ({
  onNavigateToScenarioWithEntity,
  onNavigate,
}) => {
  const [selectedEntityId, setSelectedEntityId] = useState<string>('ent-fac-1'); // Austin Gigaplant
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedEntity = mockEntities.find((e) => e.id === selectedEntityId) || mockEntities[0];

  const filteredEntities = mockEntities.filter((e) => {
    const matchesType = filterType === 'all' || e.type === filterType;
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getEntityIcon = (type: EntityType) => {
    switch (type) {
      case 'supplier':
        return Building2;
      case 'factory':
        return Factory;
      case 'warehouse':
        return Warehouse;
      case 'customer':
        return ShoppingBag;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Controls: Filter Pills & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Entities (148)' },
            { id: 'supplier', label: 'Suppliers (42)' },
            { id: 'factory', label: 'Factories (8)' },
            { id: 'warehouse', label: 'Warehouses (18)' },
            { id: 'customer', label: 'Customers (80)' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterType(pill.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === pill.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Search & Add */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name, region, or tier..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Node</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Multi-Stage Visual Diagram (Left ~65%) and Entity Detail Inspector (Right ~35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Flow Canvas */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Interactive Value Chain Graph</h3>
                <p className="text-xs text-slate-500">
                  Showing {filteredEntities.length} entities • Select any node below to inspect buffers and flows
                </p>
              </div>
              <div className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                4 Tier Architecture
              </div>
            </div>

            {/* Structured Stages */}
            <div className="space-y-6">
              {/* STAGE 1: SUPPLIERS */}
              {(filterType === 'all' || filterType === 'supplier') && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Tier 1 & 2 Suppliers
                    </span>
                    <span className="text-[11px] text-slate-400">Inbound Components & Raw Feedstocks</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {filteredEntities
                      .filter((e) => e.type === 'supplier')
                      .map((ent) => {
                        const isSelected = selectedEntityId === ent.id;
                        const Icon = getEntityIcon(ent.type);
                        return (
                          <div
                            key={ent.id}
                            onClick={() => setSelectedEntityId(ent.id)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="w-7 h-7 rounded-lg bg-blue-100/60 text-blue-700 flex items-center justify-center">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  ent.status === 'optimal'
                                    ? 'bg-emerald-500'
                                    : ent.status === 'warning'
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                              ></span>
                            </div>
                            <div className="font-bold text-xs text-slate-900 truncate">{ent.name}</div>
                            <div className="text-[11px] text-slate-500">{ent.location}, {ent.country}</div>
                            <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-600 flex justify-between">
                              <span>Throughput:</span>
                              <span className="font-semibold text-slate-800">{ent.flowThroughput}</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Connecting Flow Arrow */}
              {filterType === 'all' && (
                <div className="flex items-center justify-center text-slate-400">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
                    <span>Downstream Production Delivery</span>
                    <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                </div>
              )}

              {/* STAGE 2: FACTORIES */}
              {(filterType === 'all' || filterType === 'factory') && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                      Manufacturing & Assembly
                    </span>
                    <span className="text-[11px] text-slate-400">High-Capacity Production Gigaplants</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredEntities
                      .filter((e) => e.type === 'factory')
                      .map((ent) => {
                        const isSelected = selectedEntityId === ent.id;
                        const Icon = getEntityIcon(ent.type);
                        return (
                          <div
                            key={ent.id}
                            onClick={() => setSelectedEntityId(ent.id)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-teal-100/60 text-teal-700 flex items-center justify-center">
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-bold text-xs text-slate-900">{ent.name}</span>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                {ent.capacityUtilization}% Cap
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">{ent.category} • {ent.location}</div>
                            <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-[10px] text-slate-600 flex justify-between">
                              <span>Output: {ent.flowThroughput}</span>
                              <span className="font-bold text-blue-600">Buffer: {ent.inventoryBufferDays}d</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Connecting Flow Arrow */}
              {filterType === 'all' && (
                <div className="flex items-center justify-center text-slate-400">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
                    <span>Finished Goods Distribution Freight</span>
                    <ArrowRight className="w-3.5 h-3.5 text-teal-600" />
                  </div>
                </div>
              )}

              {/* STAGE 3 & 4: WAREHOUSES & CUSTOMERS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Warehouses */}
                {(filterType === 'all' || filterType === 'warehouse') && (
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded inline-block mb-3">
                      Warehouses (18)
                    </div>
                    <div className="space-y-2.5">
                      {filteredEntities
                        .filter((e) => e.type === 'warehouse')
                        .map((ent) => {
                          const isSelected = selectedEntityId === ent.id;
                          return (
                            <div
                              key={ent.id}
                              onClick={() => setSelectedEntityId(ent.id)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                            >
                              <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                                <span>{ent.name}</span>
                                <span className="text-[10px] text-slate-500 font-normal">{ent.location}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 mt-1">Buffer: {ent.inventoryBufferDays}d reserve</div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Customers */}
                {(filterType === 'all' || filterType === 'customer') && (
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block mb-3">
                      Retail & Customers (80)
                    </div>
                    <div className="space-y-2.5">
                      {filteredEntities
                        .filter((e) => e.type === 'customer')
                        .map((ent) => {
                          const isSelected = selectedEntityId === ent.id;
                          return (
                            <div
                              key={ent.id}
                              onClick={() => setSelectedEntityId(ent.id)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                            >
                              <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                                <span>{ent.name}</span>
                                <span className="text-[10px] text-emerald-600 font-semibold">99% SLA</span>
                              </div>
                              <div className="text-[10px] text-slate-500 mt-1">{ent.category}</div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Entity Details Inspector Panel */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6 sticky top-24">
            {/* Header of Inspector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {selectedEntity.type.toUpperCase()}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Operational
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{selectedEntity.name}</h3>
              <p className="text-xs text-slate-500">{selectedEntity.category} • {selectedEntity.location}, {selectedEntity.country}</p>
            </div>

            {/* 2x2 Key Specs Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Capacity Use</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">{selectedEntity.capacityUtilization}%</div>
                <div className="text-[10px] text-emerald-600">Optimal output</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Buffer Stock</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">{selectedEntity.inventoryBufferDays} Days</div>
                <div className="text-[10px] text-blue-600">Standard reserve</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Throughput</div>
                <div className="text-xs font-bold text-slate-900 mt-1 truncate">{selectedEntity.flowThroughput}</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Resilience</div>
                <div className="text-base font-bold text-emerald-600 mt-0.5">{selectedEntity.resilienceScore}/100</div>
              </div>
            </div>

            {/* Upstream Dependencies */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Connected Upstream Feeders
              </h4>
              <div className="space-y-1.5">
                {selectedEntity.upstreamDependencies.map((dep, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center justify-between"
                  >
                    <span>{dep}</span>
                    <span className="text-[10px] font-bold text-emerald-600">On Schedule</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Downstream Commitments */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Connected Downstream Hubs
              </h4>
              <div className="space-y-1.5">
                {selectedEntity.downstreamOutlets.map((outlet, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center justify-between"
                  >
                    <span>{outlet}</span>
                    <span className="text-[10px] font-bold text-blue-600">Daily Dispatch</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions for this Node */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                onClick={() => {
                  if (onNavigateToScenarioWithEntity) {
                    onNavigateToScenarioWithEntity(selectedEntity.id);
                  } else {
                    onNavigate('what-if');
                  }
                }}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-blue-200" />
                <span>Simulate Disruption on This Node</span>
              </button>
              <button
                onClick={() => onNavigate('disruptions')}
                className="w-full py-2 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                View Node Incident History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
