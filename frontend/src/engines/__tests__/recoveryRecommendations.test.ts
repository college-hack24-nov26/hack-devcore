
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

import type {
  GraphSnapshot,
  ScenarioInput,
  SimulationContext,
} from "../../../../shared/types.ts";

import { propagateDisruptions } from "../../../../shared/engine/disruptionPropagation.ts";
import { analyzeImpact } from "../../../../shared/engine/impactAnalysis.ts";
import { generateRecoveryRecommendations } from "../../../../shared/engine/recoveryRecommendations.ts";

const graph = JSON.parse(
  readFileSync(
    new URL("../__fixtures__/graph_snapshot.json", import.meta.url),
    "utf-8"
  )
) as GraphSnapshot;

const context: SimulationContext = {
  simulationId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  scenarioId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
};

function makeScenario(
  targetId: string,
  targetKind: "node" | "edge",
  type: ScenarioInput["events"][number]["type"]
): ScenarioInput {
  return {
    companyId: graph.companyId,
    name: "Recovery test",
    startAt: "2026-11-04T00:00:00.000Z",
    events: [
      {
        type,
        targetId,
        targetKind,
        targetType:
          targetKind === "node"
            ? graph.nodes.find((node) => node.id === targetId)?.type
            : undefined,
        severity: "high",
        durationHours: 24,
      },
    ],
  };
}

function runRecovery(
  testGraph: GraphSnapshot,
  scenario: ScenarioInput,
  simulationContext: SimulationContext = context
) {
  const propagation = propagateDisruptions(testGraph, scenario);

  const impact = analyzeImpact(
    testGraph,
    scenario,
    propagation
  );

  return generateRecoveryRecommendations(
    testGraph,
    scenario,
    propagation,
    impact.impact,
    simulationContext
  );
}

describe("recovery recommendations", () => {
  it("recommends an alternate supplier for a failed supplier", () => {
    const supplier = graph.nodes.find(
      (node) => node.type === "supplier"
    )!;

    const result = runRecovery(
      graph,
      makeScenario(supplier.id, "node", "supplier_failure")
    );

    expect(
      result.recoveryPlans.some(
        (plan) => plan.strategyType === "alternate_supplier"
      )
    ).toBe(true);
  });

  it("recommends additional inventory when storage space exists", () => {
    const facility = graph.nodes.find(
      (node) =>
        node.type === "facility" &&
        typeof node.attributes.storageCapacityLitres === "number" &&
        typeof node.attributes.currentStockLitres === "number"
    )!;

    const result = runRecovery(
      graph,
      makeScenario(facility.id, "node", "power_outage")
    );

    expect(
      result.recoveryPlans.some(
        (plan) => plan.strategyType === "increase_inventory"
      )
    ).toBe(true);
  });

  it("recommends production rescheduling for affected processing plants", () => {
    const plant = graph.nodes.find(
      (node) =>
        node.type === "facility" &&
        node.attributes.facilityType === "processing_plant"
    )!;

    const result = runRecovery(
      graph,
      makeScenario(plant.id, "node", "power_outage")
    );

    expect(
      result.recoveryPlans.some(
        (plan) => plan.strategyType === "reschedule_production"
      )
    ).toBe(true);
  });

  it("recommends demand prioritization when demand exceeds stock", () => {
    const centre = graph.nodes.find(
      (node) =>
        node.type === "facility" &&
        node.attributes.facilityType === "distribution_centre"
    )!;

    const result = runRecovery(
      graph,
      makeScenario(centre.id, "node", "power_outage")
    );

    expect(
      result.recoveryPlans.some(
        (plan) => plan.strategyType === "reduce_demand"
      )
    ).toBe(true);
  });

  it("recommends an alternative active parallel route", () => {
    const route = graph.edges.find(
      (edge) => edge.relationshipType === "ships_to"
    )!;

    const alternativeGraph: GraphSnapshot = {
      ...graph,
      edges: [
        ...graph.edges,
        {
          ...route,
          id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          attributes: {
            ...route.attributes,
            routeStatus: "active",
            distanceKm: 999999,
          },
        },
      ],
    };

    const result = runRecovery(
      alternativeGraph,
      makeScenario(route.id, "edge", "route_closure")
    );

    expect(
      result.recoveryPlans.some(
        (plan) => plan.strategyType === "reroute_transport"
      )
    ).toBe(true);
  });

  it("requires human approval for every recovery plan", () => {
    const supplier = graph.nodes.find(
      (node) => node.type === "supplier"
    )!;

    const result = runRecovery(
      graph,
      makeScenario(supplier.id, "node", "supplier_failure")
    );

    expect(result.recoveryPlans.length).toBeGreaterThan(0);

    for (const plan of result.recoveryPlans) {
      expect(plan.requiresHumanApproval).toBe(true);
      expect(plan.id).toBeTruthy();

      for (const action of plan.actions) {
        expect(action.id).toBeTruthy();
      }
    }
  });

  it("generates different plan and action IDs for different simulation runs", () => {
    const supplier = graph.nodes.find(
      (node) => node.type === "supplier"
    )!;

    const scenario = makeScenario(
      supplier.id,
      "node",
      "supplier_failure"
    );

    const first = runRecovery(graph, scenario, {
      simulationId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      scenarioId: context.scenarioId,
    });

    const second = runRecovery(graph, scenario, {
      simulationId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      scenarioId: context.scenarioId,
    });

    expect(first.recoveryPlans.length).toBeGreaterThan(0);
    expect(second.recoveryPlans.length).toBeGreaterThan(0);

    expect(first.recoveryPlans[0].id).not.toBe(
      second.recoveryPlans[0].id
    );

    expect(first.recoveryPlans[0].actions[0].id).not.toBe(
      second.recoveryPlans[0].actions[0].id
    );
  });

  it("generates stable IDs when the same simulation is repeated", () => {
    const supplier = graph.nodes.find(
      (node) => node.type === "supplier"
    )!;

    const scenario = makeScenario(
      supplier.id,
      "node",
      "supplier_failure"
    );

    const first = runRecovery(graph, scenario, context);
    const second = runRecovery(graph, scenario, context);

    expect(first.recoveryPlans.map((plan) => plan.id)).toEqual(
      second.recoveryPlans.map((plan) => plan.id)
    );
  });
});
