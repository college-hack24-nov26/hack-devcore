# Ripple — Integration Contract (Draft v0.1)

**Status:** Proposal for team review. Not a finalized API or database contract.
**Owner:** Member 2 (Backend & Supabase)
**Goal:** Keep Members 1, 3, and 4 aligned before schema migrations or feature implementation.

## Product vocabulary

- **Company:** A tenant/workspace that owns supply-chain data.
- **Supply-chain entity:** A supplier, facility, material, warehouse, or customer represented in the network.
- **Dependency:** A directed relationship between two entities; graph processing belongs to Member 3.
- **Incident / disruption:** An actual event that has happened and is recorded.
- **What-if scenario:** A hypothetical event or set of events; it is not an incident and must not be inserted into incident history.
- **Simulation run:** An execution of a what-if scenario; computation belongs to Member 4.
- **Impact analysis:** The output/interpretation of a simulation.
- **Recovery plan:** Proposed actions; the system does not execute them automatically. Human approval is required.

## Shared identifier and data conventions

- Database identifiers: UUID.
- JSON and TypeScript property naming: `camelCase`.
- PostgreSQL columns: `snake_case`.
- Dates/times: ISO 8601 strings in API payloads; database timestamps use `timestamptz`.
- Percent values: `0–100` unless team agrees otherwise.
- Monetary values: amount plus ISO currency code; never assume one company-wide currency.
- `companyId` must be derived/validated against authenticated membership on the server. Do not trust a frontend-supplied company ID.
- Tenant-owned records are protected with PostgreSQL Row Level Security (RLS), not merely frontend filtering.

## Proposed integration boundary

| Member | Owns | Supplies / consumes |
|---|---|---|
| 1 — UI/UX + React | Screens, components, user flows | Uses shared types and calls the backend client/functions; no direct cross-tenant access |
| 2 — Backend + Supabase | Auth, tenant membership, schema, RLS, Storage policies, secure function boundary | Persists and validates shared records; documents API contracts |
| 3 — Supply-chain graph | Entity/dependency validation and graph assembly | Reads normalized entity/dependency records; returns `GraphSnapshot` |
| 4 — Simulation + recovery | Scenario execution, impact estimates, recovery options | Accepts `ScenarioInput` + `GraphSnapshot`; returns `SimulationResult` and draft recovery suggestions |

## Proposed function contracts (names are placeholders)

These names and payloads need team agreement before implementation.

### `get-supply-chain-graph`
Input: `{ companyId: string }` (authenticated tenant membership is still verified server-side).
Output: `GraphSnapshot`.

### `run-simulation`
Input: `ScenarioInput`.
Output: `SimulationResult`.
Member 4 owns algorithm and assumptions; Member 2 owns authorization, persistence, and invocation boundary.

### `generate-recovery-options`
Input: `{ simulationId: string }`.
Output: `RecoveryPlanDraft`.
Outputs are suggestions only; no automatic execution.

### `approve-recovery-plan`
Input: `{ recoveryPlanId: string }`.
Output: `{ recoveryPlanId: string; status: "approved" }`.
Only a permitted company role may approve. Approval is a recorded human action.

## Error shape (proposal)

```ts
interface ApiError {
  code: string;       // stable machine-readable code
  message: string;    // safe user-facing summary
  details?: unknown;  // validation details; never expose secrets
}
```

## Open decisions (must be agreed)

1. Role names and permissions: proposed `owner | admin | analyst | viewer`.
2. Graph entity types and edge direction/relationship vocabulary.
3. Whether inventory is keyed by material + facility, and units-of-measure handling.
4. Scenario input shape, severity scale, and capacity reduction semantics.
5. Simulation output metrics, currency handling, confidence/assumptions.
6. Who may approve recovery plans and whether approval requires a comment.
7. Whether file imports are MVP scope; if yes, supported formats and upload limits.
8. Whether the MVP needs orders/customers or can demo only suppliers, facilities, materials, inventory, dependencies.
9. Function names and whether each call is synchronous for the demo.
10. Whether company setup creates an owner membership automatically.
