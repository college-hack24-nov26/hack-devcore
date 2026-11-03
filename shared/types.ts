
/**
 * Ripple shared contract v0.3.
 * Aligned with Member 3 graph interfaces and Member 4 simulation requirements.
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

  /**
   * Capacity unit and time basis, e.g. "kg/day", "units/day",
   * or "tonnes/day". Never infer a missing unit.
   */
  capacityUnit?: string;

  materialId?: UUID | null;
  leadTimeDays?: number | null;

  /**
   * Route-specific metadata remains inside attributes:
   * routeId, distanceKm, estimatedTravelTimeHours,
   * transportCost, floodRiskLevel, routeStatus.
   */
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

  /** ID of the affected graph node or edge. */
  targetId: UUID;

  /** Identifies whether targetId references a node or edge. */
  targetKind: "node" | "edge";

  /** Optional additional validation for node targets. */
  targetType?: EntityType;

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
