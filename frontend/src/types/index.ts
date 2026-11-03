export type NavigationSection =
  | 'home'
  | 'supply-chain'
  | 'what-if'
  | 'disruptions'
  | 'impact-analysis'
  | 'recovery-planning';

export type EntityType = 'supplier' | 'factory' | 'warehouse' | 'customer';

export interface SupplyChainEntity {
  id: string;
  name: string;
  type: EntityType;
  category: string;
  location: string;
  country: string;
  status: 'optimal' | 'warning' | 'disrupted';
  capacityUtilization: number; // e.g. 94%
  inventoryBufferDays: number;
  flowThroughput: string; // e.g. "850 units/day"
  upstreamDependencies: string[];
  downstreamOutlets: string[];
  resilienceScore: number;
}

export type DisruptionSeverity = 'low' | 'moderate' | 'severe' | 'resolved';

export interface DisruptionIncident {
  id: string;
  title: string;
  affectedEntityId: string;
  affectedEntityName: string;
  category: 'Maritime Logistics' | 'Raw Materials' | 'Manufacturing' | 'Distribution' | 'Rail Transit';
  severity: DisruptionSeverity;
  reportedDate: string;
  reportedTimeAgo: string;
  status: 'Analyzing Impact' | 'Recovery Plan Ready' | 'Mitigation Active' | 'Resolved';
  delayDays: number;
  financialExposure: number;
  description: string;
}

export interface ScenarioTemplate {
  id: string;
  title: string;
  description: string;
  iconName: string;
  defaultDowntime: number; // in days
  defaultSeverity: 'low' | 'moderate' | 'severe';
  badgeLabel: string;
  badgeColor: string;
}

export interface RecoveryStrategy {
  id: 'strategy-a' | 'strategy-b' | 'strategy-c';
  title: string;
  typeBadge: string;
  isRecommended: boolean;
  description: string;
  estimatedCost: number;
  netSavings: number;
  recoveryDelayDays: number;
  delayReductionPct: number;
  feasibilityScore: number;
  ordersProtected: string;
  badgeStyle: 'teal' | 'slate' | 'amber';
}

export interface CustomerOrderAtRisk {
  orderId: string;
  customerName: string;
  orderValue: number;
  originalEta: string;
  projectedEta: string;
  delayDays: number;
  riskTier: 'High' | 'Moderate' | 'Low';
}
