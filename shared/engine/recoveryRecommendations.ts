
import type {
  GraphSnapshot,
  ScenarioInput,
  SimulationContext,
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
  context: SimulationContext,
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
  const seed = [
    context.simulationId,
    scenario.companyId,
    scenario.name,
    scenario.startAt,
    strategyType,
    targetId,
  ].join(":");

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
  impact: ImpactResult,
  context: SimulationContext
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
    .map((event) =>
      graph.nodes.find(
        (node) => node.id === event.targetId && node.type === "supplier"
      )
    )
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
      const bestCandidate = [...candidates].sort(
        (a, b) =>
          (getNumber(b.attributes, "reliabilityScore") ?? 0) -
          (getNumber(a.attributes, "reliabilityScore") ?? 0)
      )[0];

      const recordedSupply = getNumber(
        bestCandidate.attributes,
        "dailySupplyLitres"
      );

      recoveryPlans.push(
        createPlan(
          scenario,
          context,
          "alternate_supplier",
          bestCandidate.id,
          `Consider ${bestCandidate.name} as an alternative to ${failedSupplier.name}.`,
          "The candidate is active, has matching milk type and has recorded daily supply data. Spare capacity has not been established.",
          getRisk(scenario, failedSupplier.id),
          "conditional",
          `Verify available supply and establish a supply arrangement with ${bestCandidate.name}.`,
          [
            "Milk type compatibility is based on graph attributes.",
            `Recorded daily supply: ${recordedSupply} litres. This represents recorded supply, not verified spare capacity.`,
          ],
          [
            "Existing supply commitments, actual spare capacity, supplier willingness and transport feasibility must be verified before approval.",
          ]
        )
      );
    } else {
      warnings.push(
        `No unaffected active supplier with matching milk type and recorded daily supply data was found for ${failedSupplier.name}.`
      );
    }
  }

  // 2. Alternative transport route recommendations.
  const failedRoutes = scenario.events
    .filter(
      (event) =>
        event.targetKind === "edge" &&
        event.type === "route_closure"
    )
    .map((event) =>
      graph.edges.find(
        (edge) =>
          edge.id === event.targetId &&
          edge.relationshipType === "ships_to"
      )
    )
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
      const alternative = [...alternatives].sort(
        (a, b) =>
          (getNumber(a.attributes ?? {}, "distanceKm") ?? Infinity) -
          (getNumber(b.attributes ?? {}, "distanceKm") ?? Infinity)
      )[0];

      const distance = getNumber(
        alternative.attributes ?? {},
        "distanceKm"
      );

      recoveryPlans.push(
        createPlan(
          scenario,
          context,
          "reroute_transport",
          alternative.id,
          "Consider using an alternative active transport connection.",
          "An unaffected active transport connection exists between the same source and destination.",
          getRisk(scenario, failedRoute.id),
          "conditional",
          "Validate the alternative route and transport availability before rerouting.",
          [
            "Alternative route selection is based on graph connectivity and recorded route status.",
            distance === null
              ? "Alternative route distance is unavailable."
              : `Recorded alternative route distance: ${distance} km.`,
          ],
          [
            "Vehicle availability, road conditions, transport capacity and actual route accessibility require verification.",
          ]
        )
      );
    } else {
      warnings.push(
        `No unaffected active parallel transport route was found for disrupted route ${failedRoute.id}.`
      );
    }
  }

  // 3. Inventory replenishment recommendations.
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

    const storageHeadroom = Math.max(0, capacity - stock);

    if (storageHeadroom > 0) {
      recoveryPlans.push(
        createPlan(
          scenario,
          context,
          "increase_inventory",
          facility.id,
          `Review inventory replenishment options at ${facility.name}.`,
          `The facility has approximately ${storageHeadroom} litres of recorded unused storage capacity. This does not establish available inventory or incoming supply.`,
          getRisk(scenario, facility.id),
          "conditional",
          "Evaluate replenishment options within the facility's recorded storage headroom.",
          [
            "Storage headroom is calculated as recorded storage capacity minus current stock.",
            "Storage headroom is not equivalent to available inventory.",
          ],
          [
            "Incoming supply, procurement cost, material compatibility, supplier availability and shelf life must be verified.",
          ]
        )
      );
    }
  }

  // 4. Production rescheduling recommendations.
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
          context,
          "reschedule_production",
          plant.id,
          `Review production rescheduling options at ${plant.name}.`,
          "The affected processing facility has recorded daily processing capacity. Available spare capacity has not been established.",
          getRisk(scenario, plant.id),
          "conditional",
          "Review production schedules and investigate whether production can be shifted to unaffected time windows or facilities.",
          [
            `Recorded daily processing capacity: ${capacity} litres.`,
            "Recorded processing capacity does not establish unused or transferable capacity.",
          ],
          [
            "Spare capacity, workforce availability, equipment condition, production schedules and alternative facility compatibility require verification.",
          ]
        )
      );
    } else {
      warnings.push(
        `Production rescheduling could not be assessed for ${plant.name} because recorded processing capacity is unavailable.`
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
          context,
          "reduce_demand",
          facility.id,
          `Review essential demand prioritization at ${facility.name}.`,
          "Recorded daily demand exceeds current inventory, indicating potential supply pressure.",
          getRisk(scenario, facility.id),
          "conditional",
          "Review customer priorities and consider allocating available inventory to essential demand first.",
          [
            `Recorded daily demand: ${demand} litres.`,
            `Recorded current stock: ${stock} litres.`,
            "Demand pressure is inferred from daily demand and current stock; actual order fulfilment is not established.",
          ],
          [
            "Customer-level priorities, confirmed order quantities and acceptable service-level changes are unavailable.",
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
    "Recorded capacity, connectivity and status attributes do not independently verify operational availability or spare capacity."
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
