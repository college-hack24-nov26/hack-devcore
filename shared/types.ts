
/**
 * Ripple shared integration contract v0.4.
 * Aligned with frontend, graph builder and simulation engine requirements.
 */

export type UUID = string;

export interface SimulationContext {
  simulationId: UUID;
  scenarioId: UUID;
}

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

/**
 * Supported recovery strategy types.
 * The simulation engine should use only these agreed values.
 */
export type RecoveryStrategyType =
  | "alternate_supplier"
  | "reroute_transport"
  | "increase_inventory"
  | "reschedule_production"
  | "reduce_demand"
  | "custom";

/* ---------------- GRAPH STRUCTURES ---------------- */

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
   * Capacity unit and time basis, e.g. "kg/day", "units/day".
   * Never infer a missing unit.
   */
  capacityUnit?: string;

  materialId?: UUID | null;
  leadTimeDays?: number | null;

  /**
   * Route metadata remains inside attributes:
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

/* ---------------- SCENARIO STRUCTURES ---------------- */

export interface ScenarioEvent {
  type: DisruptionType;

  /** ID of the affected graph node or edge. */
  targetId: UUID;

  /** Identifies whether targetId references a node or edge. */
  targetKind: "node" | "edge";

  /** Optional additional validation for node targets. */
  targetType?: EntityType;

  severity: Severity;
  durationHours: number;
  capacityReductionPercent?: number;
  description?: string;
}

export interface ScenarioInput {
  companyId: UUID;
  name: string;
  description?: string;

  /** ISO 8601 timestamp indicating when the scenario starts. */
  startAt: string;

  events: ScenarioEvent[];
}

/* ---------------- IMPACT STRUCTURES ---------------- */

export interface FinancialImpact {
  bestCase: number | null;
  expectedCase: number | null;
  worstCase: number | null;

  /**
   * ISO 4217 currency code, e.g. INR, USD, EUR.
   */
  currency: string;
}

export interface AffectedEntityDetail {
  id: UUID;
  name: string;
  type: EntityType | "route";
}

export interface ImpactResult {
  /** IDs of all affected graph entities. */
  affectedEntityIds: UUID[];
  affectedRouteIds: UUID[];
  affectedEntityDetails: AffectedEntityDetail[];
  affectedRoutes: number;

  /** Counts of affected entities by category. */
  affectedEntities: number;
  affectedSuppliers: number;
  affectedFacilities: number;
  affectedWarehouses: number;

  /** Number of impacted orders. Null when order data is unavailable. */
  impactedOrders: number | null;

  /**
   * Estimated inventory shortage quantity in the applicable
   * material's configured unit of measure (UOM).
   * Null when the quantity or unit is unavailable.
   */
  inventoryShortage: number | null;

  /**
   * Estimated production loss quantity in the applicable
   * production or product unit of measure (UOM).
   * Null when the quantity or unit is unavailable.
   */
  estimatedProductionLoss: number | null;

  estimatedDelayDays: number | null;

  financialImpact: FinancialImpact;

  severity: Severity;
}

/* ---------------- RECOVERY STRUCTURES ---------------- */

export interface RecoveryActionDraft {
  id: UUID;
  actionType: string;
  description: string;
  targetEntityId?: UUID;

  estimatedCost?: number | null;

  /**
   * ISO 4217 currency code, e.g. INR, USD, EUR.
   */
  currencyCode?: string | null;

  estimatedLeadTimeDays?: number | null;
  rationale: string;
}

export interface RecoveryPlanDraft {
  id: UUID;
  name: string;

  /** One of the agreed RecoveryStrategyType values. */
  strategyType: RecoveryStrategyType;

  description: string;

  estimatedCost: number | null;

  /**
   * ISO 4217 currency code, e.g. INR, USD, EUR.
   */
  currencyCode: string;

  recoveryTimeHours: number | null;
  expectedImpactReductionPercent: number | null;

  feasibility: "feasible" | "conditional" | "infeasible";
  risk: Severity;

  recommended: boolean;

  actions: RecoveryActionDraft[];

  assumptions: string[];
  warnings: string[];

  /** Recovery plans always require human approval. */
  requiresHumanApproval: true;
}

/* ---------------- SIMULATION RESULT ---------------- */

export interface SimulationResult {
  simulationId: UUID;
  scenarioId: UUID;

  status: "completed" | "failed";
  simulationMode: "hypothetical";

  impact: ImpactResult;
  recoveryPlans: RecoveryPlanDraft[];

  assumptions: string[];
  warnings: string[];
}

/* ---------------- API ERROR ---------------- */

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
