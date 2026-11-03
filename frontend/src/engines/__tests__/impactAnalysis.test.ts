
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

import type {
  GraphSnapshot,
  ScenarioInput,
} from "../../../../shared/types";

import { propagateDisruptions } from "../../../../shared/engine/disruptionPropagation.ts";
import { analyzeImpact } from "../../../../shared/engine/impactAnalysis.ts";

const graph = JSON.parse(
  readFileSync(
    new URL("../__fixtures__/graph_snapshot.json", import.meta.url),
    "utf-8"
  )
) as GraphSnapshot;

function makeScenario(
  targetId: string,
  targetKind: "node" | "edge",
  type: ScenarioInput["events"][number]["type"],
  durationHours = 24
): ScenarioInput {
  return {
    companyId: graph.companyId,
    name: "Impact analysis test",
    startAt: "2026-11-04T00:00:00.000Z",
    events: [
      {
        type,
        targetId,
        targetKind,
        severity: "high",
        durationHours,
      },
    ],
  };
}

function runImpact(scenario: ScenarioInput) {
  const propagation = propagateDisruptions(graph, scenario);
  return analyzeImpact(graph, scenario, propagation);
}

describe("impact analysis", () => {
  it("counts affected suppliers and facilities correctly", () => {
    const supplier = graph.nodes.find(
      (node) => node.type === "supplier"
    )!;

    const result = runImpact(
      makeScenario(supplier.id, "node", "supplier_failure")
    );

    expect(result.impact.affectedEntities).toBeGreaterThan(0);
    expect(result.impact.affectedSuppliers).toBeGreaterThan(0);
    expect(result.impact.affectedFacilities).toBeGreaterThan(0);
  });

  it("returns only affected node IDs, not edge IDs", () => {
    const route = graph.edges.find(
      (edge) => edge.relationshipType === "ships_to"
    )!;

    const result = runImpact(
      makeScenario(route.id, "edge", "route_closure")
    );

    const affectedIds = result.impact.affectedEntityIds;

    expect(affectedIds).toContain(route.sourceId);
    expect(affectedIds).toContain(route.targetId);

    for (const id of affectedIds) {
      expect(graph.nodes.some((node) => node.id === id)).toBe(true);
    }

    expect(affectedIds).not.toContain(route.id);
  });

  it("calculates inventory shortage using demand, stock and duration", () => {
    const facility = graph.nodes.find(
      (node) =>
        node.type === "facility" &&
        typeof node.attributes.dailyDemandLitres === "number" &&
        typeof node.attributes.currentStockLitres === "number"
    );

    expect(facility).toBeDefined();

    const scenario = makeScenario(
      facility!.id,
      "node",
      "power_outage",
      24
    );

    const result = runImpact(scenario);

    const demand = facility!.attributes.dailyDemandLitres as number;
    const stock = facility!.attributes.currentStockLitres as number;

    expect(result.impact.inventoryShortage).toBe(
      Math.max(0, demand - stock)
    );

    expect(result.assumptions.length).toBeGreaterThan(0);
  });

  it("returns zero inventory shortage when stock covers demand", () => {
    const facility = graph.nodes.find(
      (node) =>
        node.type === "facility" &&
        typeof node.attributes.dailyDemandLitres === "number" &&
        typeof node.attributes.currentStockLitres === "number"
    )!;

    const testGraph: GraphSnapshot = {
      ...graph,
      nodes: graph.nodes.map((node) =>
        node.id === facility.id
          ? {
              ...node,
              attributes: {
                ...node.attributes,
                dailyDemandLitres: 100,
                currentStockLitres: 500,
              },
            }
          : node
      ),
    };

    const scenario = makeScenario(
      facility.id,
      "node",
      "power_outage",
      24
    );

    const propagation = propagateDisruptions(testGraph, scenario);
    const result = analyzeImpact(testGraph, scenario, propagation);

    expect(result.impact.inventoryShortage).toBe(0);
  });

  it("calculates production loss for a directly targeted processing plant", () => {
    const plant = graph.nodes.find(
      (node) =>
        node.type === "facility" &&
        node.attributes.facilityType === "processing_plant" &&
        typeof node.attributes.processingCapacityLitresPerDay === "number"
    );

    expect(plant).toBeDefined();

    const scenario = makeScenario(
      plant!.id,
      "node",
      "power_outage",
      24
    );

    scenario.events[0].targetType = "facility";
    scenario.events[0].capacityReductionPercent = 50;

    const result = runImpact(scenario);

    const capacity =
      plant!.attributes.processingCapacityLitresPerDay as number;

    expect(result.impact.estimatedProductionLoss).toBe(
      capacity * 0.5
    );
  });

  it("does not calculate production loss without an explicit reduction", () => {
    const plant = graph.nodes.find(
      (node) =>
        node.type === "facility" &&
        node.attributes.facilityType === "processing_plant"
    )!;

    const scenario = makeScenario(
      plant.id,
      "node",
      "power_outage"
    );

    scenario.events[0].targetType = "facility";

    const result = runImpact(scenario);

    expect(result.impact.estimatedProductionLoss).toBeNull();
  });

  it("keeps unavailable order and financial estimates as null", () => {
    const supplier = graph.nodes.find(
      (node) => node.type === "supplier"
    )!;

    const result = runImpact(
      makeScenario(supplier.id, "node", "supplier_failure")
    );

    expect(result.impact.impactedOrders).toBeNull();
    expect(result.impact.financialImpact.bestCase).toBeNull();
    expect(result.impact.financialImpact.expectedCase).toBeNull();
    expect(result.impact.financialImpact.worstCase).toBeNull();

    expect(
      result.warnings.some((warning) =>
        warning.includes("order-level data")
      )
    ).toBe(true);
  });

  it("uses the highest severity across scenario events", () => {
    const suppliers = graph.nodes.filter(
      (node) => node.type === "supplier"
    );

    const scenario = makeScenario(
      suppliers[0].id,
      "node",
      "supplier_failure"
    );

    scenario.events.push({
      type: "power_outage",
      targetId: suppliers[1].id,
      targetKind: "node",
      severity: "critical",
      durationHours: 12,
    });

    const result = runImpact(scenario);

    expect(result.impact.severity).toBe("critical");
  });
});
