
import type {
  GraphSnapshot,
  ScenarioInput,
  RecoveryPlanDraft,
  RecoveryActionDraft,
  RecoveryStrategyType,
  Severity,
  UUID,
  ImpactResult,
} from "../types.ts";

import type { DisruptionPropagationResult } from "./disruptionPropagation.ts";

export interface RecoveryRecommendationResult {
  recoveryPlans: RecoveryPlanDraft[];
  assumptions: string[];
  warnings: string[];
}

function getNumber(
  attributes: Record<string, unknown>,
  key: string
): number | null {
  const value = attributes[key];

  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
    ? value
    : null;
}

// Generates stable UUID-shaped identifiers for draft records.
// These identifiers are for record identity, not security.
function createStableId(seed: string): UUID {
  const hash = (input: string, initial: number): string => {
    let value = initial;

    for (let i = 0; i < input.length; i++) {
      value = Math.imul(value ^ input.charCodeAt(i), 16777619);
    }

    return (value >>> 0).toString(16).padStart(8, "0");
  };

  const a = hash(seed, 2166136261);
  const b = hash(seed, 2246822519);
  const c = hash(seed, 3266489917);
  const d = hash(seed, 668265263);

  return `${a}-${b.slice(0, 4)}-4${b.slice(4, 7)}-8${c.slice(1, 4)}-${c.slice(4)}${d}`;
}

function createPlan(
  scenario: ScenarioInput,
  strategyType: RecoveryStrategyType,
  targetId: UUID,
  description: string,
  rationale: string,
  risk: Severity,
  feasibility: "feasible" | "conditional" | "infeasible",
  actionDescription: string,
  assumptions: string[] = [],
  warnings: string[] = []
): RecoveryPlanDraft {
  const seed = `${scenario.companyId}:${scenario.name}:${scenario.startAt}:${strategyType}:${targetId}`;

  const action: RecoveryActionDraft = {
    id: createStableId(`${seed}:action`),
    actionType: strategyType,
    description: actionDescription,
    targetEntityId: targetId,
    estimatedCost: null,
    currencyCode: null,
    estimatedLeadTimeDays: null,
    rationale,
  };

  return {
    id: createStableId(`${seed}:plan`),
    name: `${strategyType.replaceAll("_", " ")} recommendation`,
    strategyType,
    description,
    estimatedCost: null,
    currencyCode: "INR",
    recoveryTimeHours: null,
    expectedImpactReductionPercent: null,
    feasibility,
    risk,
    recommended: feasibility !== "infeasible",
    actions: [action],
    assumptions,
    warnings,
    requiresHumanApproval: true,
  };
}

function getRisk(
  scenario: ScenarioInput,
  targetId: UUID
): Severity {
  const event = scenario.events.find(
    (item) => item.targetId === targetId
  );

  return event?.severity ?? "medium";
}

export function generateRecoveryRecommendations(
  graph: GraphSnapshot,
  scenario: ScenarioInput,
  propagation: DisruptionPropagationResult,
  impact: ImpactResult
): RecoveryRecommendationResult {
  const recoveryPlans: RecoveryPlanDraft[] = [];
  const assumptions: string[] = [];
  const warnings: string[] = [];

  const affectedNodes = graph.nodes.filter((node) =>
    propagation.affectedNodeIds.includes(node.id)
  );

  const affectedNodeIds = new Set(propagation.affectedNodeIds);
  const affectedEdgeIds = new Set(propagation.affectedEdgeIds);

  // 1. Alternate supplier recommendations.
  const failedSuppliers = scenario.events
    .filter(
      (event) =>
        event.targetKind === "node" &&
        event.targetType === "supplier"
    )
    .map((event) => graph.nodes.find(
      (node) => node.id === event.targetId && node.type === "supplier"
    ))
    .filter((node) => node !== undefined);

  for (const failedSupplier of failedSuppliers) {
    const milkType = failedSupplier.attributes.milkType;

    const candidates = graph.nodes.filter((node) => {
      if (node.type !== "supplier") return false;
      if (affectedNodeIds.has(node.id)) return false;
      if (node.attributes.status !== "active") return false;

      return (
        typeof milkType === "string" &&
        node.attributes.milkType === milkType &&
        getNumber(node.attributes, "dailySupplyLitres") !== null
      );
    });

    if (candidates.length > 0) {
      const bestCandidate = candidates.sort((a, b) =>
        (getNumber(b.attributes, "reliabilityScore") ?? 0) -
        (getNumber(a.attributes, "reliabilityScore") ?? 0)
      )[0];

      recoveryPlans.push(
        createPlan(
          scenario,
          "alternate_supplier",
          bestCandidate.id,
          `Consider ${bestCandidate.name} as an alternative to ${failedSupplier.name}.`,
          "The candidate is active, has matching milk type and has recorded daily supply capacity.",
          getRisk(scenario, failedSupplier.id),
          "conditional",
          `Verify available supply and establish a supply arrangement with ${bestCandidate.name}.`,
          [
            "Milk type compatibility is based on the graph attributes.",
            "Supplier availability and willingness have not been independently verified.",
          ],
          [
            "Existing capacity commitments and transport feasibility must be checked before approval.",
          ]
        )
      );
    } else {
      warnings.push(
        `No unaffected active supplier with matching milk type was found for ${failedSupplier.name}.`
      );
    }
  }

  // 2. Alternative transport route recommendations.
  const failedRoutes = scenario.events
    .filter((event) => event.targetKind === "edge")
    .map((event) => graph.edges.find(
      (edge) => edge.id === event.targetId
    ))
    .filter((edge) => edge !== undefined);

  for (const failedRoute of failedRoutes) {
    const alternatives = graph.edges.filter((edge) => {
      if (edge.id === failedRoute.id) return false;
      if (affectedEdgeIds.has(edge.id)) return false;

      return (
        edge.relationshipType === "ships_to" &&
        edge.sourceId === failedRoute.sourceId &&
        edge.targetId === failedRoute.targetId &&
        edge.attributes?.routeStatus === "active"
      );
    });

    if (alternatives.length > 0) {
      const alternative = alternatives.sort(
        (a, b) =>
          (getNumber(a.attributes ?? {}, "distanceKm") ?? Infinity) -
          (getNumber(b.attributes ?? {}, "distanceKm") ?? Infinity)
      )[0];

      recoveryPlans.push(
        createPlan(
          scenario,
          "reroute_transport",
          alternative.id,
          "Consider using an alternative active transport connection.",
          "An unaffected active transport connection exists between the same facilities.",
          "medium",
          "conditional",
          "Validate the alternative route and transport availability before rerouting.",
          [
            "Route feasibility is based on graph connectivity and route status.",
          ],
          [
            "Actual vehicle availability, road conditions and transport capacity require verification.",
          ]
        )
      );
    } else {
      warnings.push(
        `No parallel active alternative route was found for disrupted route ${failedRoute.id}.`
      );
    }
  }

  // 3. Increase inventory recommendations.
  const inventoryFacilities = affectedNodes.filter((node) => {
    if (node.type !== "facility") return false;

    return (
      getNumber(node.attributes, "storageCapacityLitres") !== null &&
      getNumber(node.attributes, "currentStockLitres") !== null
    );
  });

  for (const facility of inventoryFacilities) {
    const capacity = getNumber(
      facility.attributes,
      "storageCapacityLitres"
    )!;

    const stock = getNumber(
      facility.attributes,
      "currentStockLitres"
    )!;

    const availableSpace = Math.max(0, capacity - stock);

    if (availableSpace > 0) {
      recoveryPlans.push(
        createPlan(
          scenario,
          "increase_inventory",
          facility.id,
          `Consider increasing safety stock at ${facility.name}.`,
          `The facility has approximately ${availableSpace} litres of recorded unused storage capacity.`,
          getRisk(scenario, facility.id),
          "conditional",
          "Evaluate additional inventory procurement within the available storage capacity.",
          [
            "Available storage is calculated as storage capacity minus current stock.",
          ],
          [
            "Incoming supply, procurement cost, material compatibility and shelf life must be verified.",
          ]
        )
      );
    }
  }

  // 4. Reschedule production recommendations.
  const affectedProcessingPlants = affectedNodes.filter(
    (node) =>
      node.type === "facility" &&
      node.attributes.facilityType === "processing_plant"
  );

  for (const plant of affectedProcessingPlants) {
    const capacity = getNumber(
      plant.attributes,
      "processingCapacityLitresPerDay"
    );

    if (capacity !== null) {
      recoveryPlans.push(
        createPlan(
          scenario,
          "reschedule_production",
          plant.id,
          `Review and reschedule production at ${plant.name}.`,
          "The processing facility is affected by the simulated disruption and has recorded daily processing capacity.",
          getRisk(scenario, plant.id),
          "conditional",
          "Review production schedules and shift available production to unaffected time windows or facilities.",
          [
            `Recorded daily processing capacity: ${capacity} litres.`,
          ],
          [
            "Actual spare capacity, workforce availability and production schedules are not available in the current graph.",
          ]
        )
      );
    }
  }

  // 5. Reduce or prioritize demand.
  const demandFacilities = affectedNodes.filter((node) => {
    if (node.type !== "facility") return false;

    return (
      getNumber(node.attributes, "dailyDemandLitres") !== null &&
      getNumber(node.attributes, "currentStockLitres") !== null
    );
  });

  for (const facility of demandFacilities) {
    const demand = getNumber(
      facility.attributes,
      "dailyDemandLitres"
    )!;

    const stock = getNumber(
      facility.attributes,
      "currentStockLitres"
    )!;

    if (demand > stock) {
      recoveryPlans.push(
        createPlan(
          scenario,
          "reduce_demand",
          facility.id,
          `Prioritize essential demand at ${facility.name}.`,
          "Recorded daily demand exceeds current inventory, indicating potential supply pressure.",
          getRisk(scenario, facility.id),
          "conditional",
          "Review customer priorities and consider allocating available inventory to essential demand first.",
          [
            "Demand pressure is inferred from daily demand and current stock.",
          ],
          [
            "Customer-level priorities and confirmed order quantities are unavailable.",
          ]
        )
      );
    }
  }

  if (recoveryPlans.length === 0) {
    warnings.push(
      "No recovery recommendation could be generated from the available graph data."
    );
  }

  assumptions.push(
    "Recovery recommendations are deterministic drafts generated from graph connectivity and available entity attributes."
  );

  assumptions.push(
    "No recovery action is executed automatically. All recommendations require human approval."
  );

  if (impact.impactedOrders === null) {
    warnings.push(
      "Recovery recommendations cannot quantify order-level service improvement because order-level data is unavailable."
    );
  }

  return {
    recoveryPlans,
    assumptions,
    warnings,
  };
}
