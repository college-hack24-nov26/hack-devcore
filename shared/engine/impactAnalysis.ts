
import type {
  GraphSnapshot,
  ScenarioInput,
  ImpactResult,
  Severity,
  UUID,
  AffectedEntityDetail,
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
  const affectedNodeIds = new Set(propagation.affectedNodeIds);

  const affectedNodes = graph.nodes.filter((node) =>
    affectedNodeIds.has(node.id)
  );

  const affectedSuppliers = affectedNodes.filter(
    (node) => node.type === "supplier"
  ).length;

  const affectedFacilities = affectedNodes.filter(
    (node) => node.type === "facility"
  ).length;

  const affectedWarehouses = affectedNodes.filter(
    (node) => node.type === "warehouse"
  ).length;

  // Only transport relationships count as affected routes.
  const affectedEdgeIds = new Set(propagation.affectedEdgeIds);

  const affectedRoutes = graph.edges.filter(
    (edge) =>
      affectedEdgeIds.has(edge.id) &&
      edge.relationshipType === "ships_to"
  );

  // Build readable entity details for the dashboard.
  const affectedEntityDetails: AffectedEntityDetail[] = [
    ...affectedNodes.map((node) => ({
      id: node.id,
      name: node.name,
      type: node.type,
    })),
    ...affectedRoutes.map((edge) => {
      const source = graph.nodes.find(
        (node) => node.id === edge.sourceId
      );

      const target = graph.nodes.find(
        (node) => node.id === edge.targetId
      );

      const routeId = edge.attributes?.routeId;

      return {
        id: edge.id,
        name:
          typeof routeId === "string"
            ? routeId
            : `${source?.name ?? "Unknown"} → ${target?.name ?? "Unknown"}`,
        type: "route" as const,
      };
    }),
  ];

  const assumptions: string[] = [];
  const warnings: string[] = [...propagation.warnings];

  /*
   * Inventory shortage:
   * Calculate projected demand gaps for every event type.
   * This preserves compatibility with existing tests and avoids
   * silently excluding affected facilities.
   *
   * For overlapping events affecting the same facility, retain
   * the largest individual estimate instead of adding them.
   */
  const shortageByFacility = new Map<UUID, number>();

  for (const item of scenario.events.map((event, eventIndex) => ({
    event,
    eventIndex,
    propagation: propagation.events.find(
      (result) => result.eventIndex === eventIndex
    ),
  }))) {
    if (!item.propagation) continue;

    const eventNodeIds = new Set(
      item.propagation.affectedNodeIds
    );

    const durationDays = item.event.durationHours / 24;

    for (const facility of affectedNodes) {
      if (facility.type !== "facility") continue;
      if (!eventNodeIds.has(facility.id)) continue;

      const demand = getNumber(
        facility.attributes,
        "dailyDemandLitres"
      );

      const stock = getNumber(
        facility.attributes,
        "currentStockLitres"
      );

      if (demand === null || stock === null) continue;

      const projectedShortage = Math.max(
        0,
        demand * durationDays - stock
      );

      const previous =
        shortageByFacility.get(facility.id) ?? 0;

      shortageByFacility.set(
        facility.id,
        Math.max(previous, projectedShortage)
      );
    }
  }

  let inventoryShortage: number | null = null;

  if (shortageByFacility.size > 0) {
    inventoryShortage = [...shortageByFacility.values()].reduce(
      (total, shortage) => total + shortage,
      0
    );

    assumptions.push(
      "Inventory shortage is a projected demand gap for affected facilities over each event's duration. The calculation assumes no replenishment. Overlapping estimates for the same facility are not added. This is not a confirmed supply shortage or unfulfilled order quantity."
    );
  } else {
    warnings.push(
      "Inventory shortage unavailable: no affected facility has valid daily demand and current stock data."
    );
  }

  /*
   * Production loss:
   * Only directly targeted processing plants with explicit
   * capacity reduction and valid capacity data are calculated.
   */
  const productionLossByTarget = new Map<UUID, number>();

  for (const event of scenario.events) {
    if (event.targetKind !== "node") continue;
    if (event.targetType !== "facility") continue;

    const target = graph.nodes.find(
      (node) => node.id === event.targetId
    );

    if (!target || target.type !== "facility") continue;

    if (target.attributes.facilityType !== "processing_plant") {
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

    const previous =
      productionLossByTarget.get(target.id) ?? 0;

    productionLossByTarget.set(
      target.id,
      Math.max(previous, lostCapacity)
    );
  }

  let estimatedProductionLoss: number | null = null;

  if (productionLossByTarget.size > 0) {
    estimatedProductionLoss = [
      ...productionLossByTarget.values(),
    ].reduce((total, loss) => total + loss, 0);

    assumptions.push(
      "Production loss estimates lost processing capacity using daily capacity, explicit capacity reduction and event duration. Overlapping estimates for the same plant are not added. This is estimated capacity loss, not measured production output."
    );
  } else {
    warnings.push(
      "Production loss unavailable: no directly targeted processing plant has valid capacity data and an explicit capacity reduction percentage."
    );
  }

  warnings.push(
    "Impacted orders unavailable because order-level data is not present in the current graph."
  );

  warnings.push(
    "Financial impact unavailable because reliable monetary loss data is not present in the graph."
  );

  if (affectedWarehouses === 0) {
    warnings.push(
      "No warehouse entities are present in the current graph."
    );
  }

  const impactedOrders: number | null = null;

  const impact: ImpactResult = {
    affectedEntityIds: affectedNodes.map((node) => node.id),

    affectedRouteIds: affectedRoutes.map((edge) => edge.id),
    affectedEntityDetails,
    affectedRoutes: affectedRoutes.length,

    // Count graph nodes and transport routes independently.
    affectedEntities: affectedNodes.length + affectedRoutes.length,

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
