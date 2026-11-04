
import type {
  GraphSnapshot,
  ScenarioInput,
  ImpactResult,
  Severity,
  UUID,
} from "../types.ts";

import type { DisruptionPropagationResult } from "./disruptionPropagation.ts";

export interface ImpactAnalysisResult {
  impact: ImpactResult;
  assumptions: string[];
  warnings: string[];
}

const severityRank: Record<Severity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

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

function highestSeverity(events: ScenarioInput["events"]): Severity {
  return events.reduce<Severity>(
    (highest, event) =>
      severityRank[event.severity] > severityRank[highest]
        ? event.severity
        : highest,
    "low"
  );
}

export function analyzeImpact(
  graph: GraphSnapshot,
  scenario: ScenarioInput,
  propagation: DisruptionPropagationResult
): ImpactAnalysisResult {
  // Identify affected nodes only.
  const affectedIds = new Set<UUID>(propagation.affectedNodeIds);

  const affectedNodes = graph.nodes.filter((node) =>
    affectedIds.has(node.id)
  );

  // Count affected entity types.
  const affectedSuppliers = affectedNodes.filter(
    (node) => node.type === "supplier"
  ).length;

  const affectedFacilities = affectedNodes.filter(
    (node) => node.type === "facility"
  ).length;

  const affectedWarehouses = affectedNodes.filter(
    (node) => node.type === "warehouse"
  ).length;

  const assumptions: string[] = [];
  const warnings: string[] = [...propagation.warnings];

  // Calculate projected inventory shortage where valid data exists.
  const distributionCentres = affectedNodes.filter((node) => {
    if (node.type !== "facility") return false;

    return (
      getNumber(node.attributes, "dailyDemandLitres") !== null &&
      getNumber(node.attributes, "currentStockLitres") !== null
    );
  });

  let inventoryShortage: number | null = null;

  if (distributionCentres.length > 0 && scenario.events.length > 0) {
    const durationDays =
      Math.max(...scenario.events.map((event) => event.durationHours)) / 24;

    inventoryShortage = distributionCentres.reduce((total, node) => {
      const demand = getNumber(node.attributes, "dailyDemandLitres");
      const stock = getNumber(node.attributes, "currentStockLitres");

      if (demand === null || stock === null) {
        return total;
      }

      const shortage = Math.max(
        0,
        demand * durationDays - stock
      );

      return total + shortage;
    }, 0);

    assumptions.push(
      "Inventory shortage is a projected demand gap over the disruption duration, assuming no replenishment. It is not a confirmed unfulfilled order quantity."
    );
  } else {
    inventoryShortage = null;

    warnings.push(
      "Inventory shortage unavailable: no affected facility has both valid demand and stock data."
    );
  }

  // Calculate production loss only for directly targeted processing plants.
  const productionLosses: number[] = [];

  for (const event of scenario.events) {
    if (event.targetKind !== "node") continue;
    if (event.targetType !== "facility") continue;

    const target = graph.nodes.find(
      (node) => node.id === event.targetId
    );

    if (!target || target.type !== "facility") continue;

    if (
      target.attributes.facilityType !== "processing_plant"
    ) {
      continue;
    }

    const reduction = event.capacityReductionPercent;

    if (
      reduction === undefined ||
      !Number.isFinite(reduction) ||
      reduction < 0 ||
      reduction > 100
    ) {
      continue;
    }

    const dailyCapacity = getNumber(
      target.attributes,
      "processingCapacityLitresPerDay"
    );

    if (dailyCapacity === null) continue;

    const lostCapacity =
      dailyCapacity *
      (reduction / 100) *
      (event.durationHours / 24);

    productionLosses.push(lostCapacity);
  }

  let estimatedProductionLoss: number | null = null;

  if (productionLosses.length > 0) {
    estimatedProductionLoss = productionLosses.reduce(
      (total, loss) => total + loss,
      0
    );

    assumptions.push(
      "Production loss uses explicitly supplied capacity reduction percentages and processing capacity. It is an estimate, not measured output loss."
    );
  } else {
    warnings.push(
      "Production loss unavailable: no directly targeted processing plant has valid capacity data and an explicit capacity reduction percentage between 0 and 100."
    );
  }

  // The current graph has no order-level records.
  const impactedOrders: number | null = null;

  warnings.push(
    "Impacted orders unavailable because order-level data is not present in the current graph."
  );

  // Financial impact cannot be estimated reliably without monetary loss data.
  warnings.push(
    "Financial impact unavailable because reliable monetary loss data is not present in the graph."
  );

  if (affectedWarehouses === 0) {
    warnings.push(
      "No warehouse entities are present in the current graph."
    );
  }

  const impact: ImpactResult = {
    // Only graph node IDs belong here, never edge IDs.
    affectedEntityIds: affectedNodes.map((node) => node.id),

    affectedEntities: affectedNodes.length,
    affectedSuppliers,
    affectedFacilities,
    affectedWarehouses,

    impactedOrders,
    inventoryShortage,
    estimatedProductionLoss,
    estimatedDelayDays: null,

    financialImpact: {
      bestCase: null,
      expectedCase: null,
      worstCase: null,
      currency: "INR",
    },

    severity: highestSeverity(scenario.events),
  };

  return {
    impact,
    assumptions,
    warnings,
  };
}
