/**
 * Ripple shared contract draft v0.1.
 * Team review required; these types are not a finalized API.
 */

export type UUID = string;

export type MembershipRole = "owner" | "admin" | "analyst" | "viewer";

export type EntityType =
  | "supplier"
  | "facility"
  | "material"
  | "warehouse"
  | "customer";

export type RelationshipType =
  | "supplies"
  | "ships_to"
  | "produces"
  | "stores"
  | "uses"
  | "custom";

export type DisruptionType =
  | "supplier_failure"
  | "flood"
  | "power_outage"
  | "route_closure"
  | "material_shortage"
  | "custom";

export type Severity = "low" | "medium" | "high" | "critical";

export interface GraphNode {
  id: UUID;
  companyId: UUID;
  type: EntityType;
  name: string;
  attributes: Record<string, unknown>;
}

export interface GraphEdge {
  id: UUID;
  companyId: UUID;
  sourceId: UUID;
  targetId: UUID;
  relationshipType: RelationshipType;
  capacity?: number | null;
  leadTimeDays?: number | null;
  attributes?: Record<string, unknown>;
}

export interface GraphSnapshot {
  companyId: UUID;
  nodes: GraphNode[];
  edges: GraphEdge[];
  generatedAt: string;
}

export interface ScenarioEvent {
  eventType: DisruptionType;
  affectedEntityId: UUID;
  severity: Severity;
  durationDays: number;
  capacityReductionPercent?: number;
  description?: string;
}

export interface ScenarioInput {
  companyId: UUID;
  name: string;
  description?: string;
  events: ScenarioEvent[];
}

export interface SimulationResult {
  simulationId: UUID;
  status: "completed" | "failed";
  affectedEntityIds: UUID[];
  estimatedProductionLossPercent?: number | null;
  estimatedDelayedOrders?: number | null;
  estimatedFinancialImpact?: number | null;
  currencyCode?: string | null;
  assumptions: string[];
  warnings: string[];
}

export interface RecoveryActionDraft {
  id: UUID;
  actionType: string;
  description: string;
  targetEntityId?: UUID;
  estimatedCost?: number | null;
  currencyCode?: string | null;
  estimatedLeadTimeDays?: number | null;
  rationale: string;
}

export interface RecoveryPlanDraft {
  simulationId: UUID;
  actions: RecoveryActionDraft[];
  requiresHumanApproval: true;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
