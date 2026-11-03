
# Ripple — Integration Contract (v0.3)

**Status:** Updated shared integration contract; aligned with agreed Member 2, Member 3, and Member 4 interfaces.
**Owner:** Member 2 (Backend & Supabase)
**Purpose:** Establish a consistent contract for frontend, backend, graph services, and simulation integration.

## 1. Product vocabulary

- **Company:** A tenant/workspace that owns supply-chain data.
- **Supply-chain entity:** A supplier, facility, material, warehouse, or customer represented in the network.
- **Dependency:** A directed relationship between two entities; graph processing belongs to Member 3.
- **Incident / disruption:** An actual event that has happened and is recorded.
- **What-if scenario:** A hypothetical event or set of events; it is not an incident and must not be inserted into incident history.
- **Simulation run:** An execution of a what-if scenario; computation belongs to Member 4.
- **Impact analysis:** The output and interpretation of a simulation.
- **Recovery plan:** Proposed actions; the system does not execute them automatically. Human approval is required.

## 2. Shared identifiers and data conventions

- Database identifiers use UUIDs.
- JSON and TypeScript property naming uses `camelCase`.
- PostgreSQL columns use `snake_case`.
- Dates and times use ISO 8601 strings in API payloads; database timestamps use `timestamptz`.
- Percentage values use the range 0–100.
- Monetary values include an amount and ISO currency code; never assume one company-wide currency.
- `companyId` must be derived or validated against authenticated membership on the server.
- Tenant-owned records must be protected using PostgreSQL Row Level Security (RLS), not merely frontend filtering.

## 3. Agreed graph contract

### 3.1 Entity types

The following five node types are retained:

- `supplier`
- `facility`
- `material`
- `warehouse`
- `customer`

### 3.2 Relationship types

The following six relationship types are retained:

- `supplies`
- `ships_to`
- `produces`
- `stores`
- `uses`
- `custom`

### 3.3 GraphNode

```ts
export interface GraphNode {
  id: UUID;
  companyId: UUID;
  type: EntityType;
  name: string;
  attributes: Record<string, unknown>;
}
```

### 3.4 GraphEdge

```ts
export interface GraphEdge {
  id: UUID;
  companyId: UUID;
  sourceId: UUID;
  targetId: UUID;
  relationshipType: RelationshipType;
  capacity?: number | null;
  capacityUnit?: string;
  materialId?: UUID | null;
  leadTimeDays?: number | null;
  attributes?: Record<string, unknown>;
}
```

Capacity units may include examples such as `kg/day`, `units/day`, or `tonnes/day`.

- `capacity` represents the numeric capacity.
- `capacityUnit` is optional.
- The engine must not assume or infer a unit when it is missing.
- Route-specific metadata must remain inside `GraphEdge.attributes`.

Examples of route metadata include:

- `routeId`
- `distanceKm`
- `estimatedTravelTimeHours`
- `transportCost`
- `floodRiskLevel`
- `routeStatus`

These properties must not be moved into separate top-level GraphEdge fields without team agreement.

### 3.5 GraphSnapshot

```ts
export interface GraphSnapshot {
  companyId: UUID;
  nodes: GraphNode[];
  edges: GraphEdge[];
  generatedAt: string;
}
```

**Integration agreement:** Member 4's simulation engine consumes Member 3's `GraphSnapshot` directly. The agreed GraphSnapshot structure must be preserved across the integration boundary.

## 4. Scenario and simulation contract

### 4.1 ScenarioEvent

```ts
export interface ScenarioEvent {
  eventType: DisruptionType;
  targetId: UUID;
  targetKind: "node" | "edge";
  targetType?: EntityType;
  severity: Severity;
  durationDays: number;
  capacityReductionPercent?: number;
  description?: string;
}
```

Agreed targeting rules:

- `targetId` consistently identifies the affected graph object.
- `targetKind` is required and identifies whether the target is a node or edge.
- `targetType` is optional and provides additional validation for node targets.
- For edge targets, `targetId` references the corresponding `GraphEdge.id`.
- A `route_closure` event must target an edge ID (`targetKind: "edge"`).
- Consumers must validate that the target exists in the supplied GraphSnapshot.
- `capacityReductionPercent`, when supplied, represents a percentage from 0 to 100.

### 4.2 ScenarioInput

```ts
export interface ScenarioInput {
  companyId: UUID;
  name: string;
  description?: string;
  events: ScenarioEvent[];
}
```

### 4.3 SimulationResult

```ts
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
```

Member 4 owns simulation algorithms, calculations, and assumptions. Member 2 owns authorization, persistence, and the secure invocation boundary.

## 5. Recovery contract

### RecoveryActionDraft

```ts
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
```

### RecoveryPlanDraft

```ts
export interface RecoveryPlanDraft {
  simulationId: UUID;
  actions: RecoveryActionDraft[];
  requiresHumanApproval: true;
}
```

Recovery suggestions are drafts only. The system must not execute recovery actions automatically. Human approval is required.

## 6. Proposed integration boundaries

| Member | Responsibility | Integration |
|---|---|---|
| Member 1 | UI/UX and React | Uses shared types and calls backend functions |
| Member 2 | Backend and Supabase | Auth, tenant membership, schema, RLS, storage policies, secure function boundary |
| Member 3 | Supply-chain graph | Validates entities and dependencies; builds and supplies GraphSnapshot |
| Member 4 | Simulation and recovery | Consumes GraphSnapshot and ScenarioInput; returns SimulationResult and recovery suggestions |

## 7. Proposed function contracts

Function names are integration proposals and may be finalized by the team.

### `get-supply-chain-graph`

Input: `{ companyId: string }`

Output: `GraphSnapshot`

Authenticated tenant membership must be verified server-side.

### `run-simulation`

Input: `ScenarioInput` and the corresponding `GraphSnapshot`.

Output: `SimulationResult`

Member 4 owns the simulation engine. The engine consumes Member 3's GraphSnapshot directly.

### `generate-recovery-options`

Input: `{ simulationId: string }`

Output: `RecoveryPlanDraft`

Outputs are suggestions only; no automatic execution.

### `approve-recovery-plan`

Input: `{ recoveryPlanId: string }`

Output: `{ recoveryPlanId: string; status: "approved" }`

Only an authorized company role may approve. Approval must be recorded as a human action.

## 8. Error contract

```ts
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
```

- `code` is a stable machine-readable error code.
- `message` is a safe user-facing summary.
- `details` may contain validation information but must never expose secrets.

## 9. Security and tenant isolation

- Company ownership and membership must be verified server-side.
- Frontend-supplied `companyId` must not be trusted without validation.
- Supabase Row Level Security must protect tenant-owned data.
- Sensitive credentials and service-role keys must never be exposed to the frontend.
- Simulation and recovery operations must respect company-level authorization.

## 10. Decisions still open for team discussion

The following items are not finalized by this integration contract:

1. Detailed role permissions for `owner`, `admin`, `analyst`, and `viewer`.
2. Inventory modeling by material and facility, including units-of-measure handling beyond the optional graph capacity unit.
3. Final simulation metrics, confidence calculations, and assumptions.
4. Which company roles may approve recovery plans and whether approval requires a comment.
5. Whether file imports are in MVP scope, including supported formats and upload limits.
6. Whether the MVP requires full orders/customer workflows or a smaller demonstration dataset.
7. Final function names and whether calls are synchronous for the demo.
8. Whether company setup automatically creates an owner membership.

---

**Contract version:** v0.3
**Maintained by:** Member 2 — Backend & Supabase
**Integration status:** Updated to reflect the agreed graph, scenario-targeting, and simulation interface decisions.
