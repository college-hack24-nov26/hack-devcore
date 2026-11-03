
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

import type {
  GraphSnapshot,
  ScenarioInput,
  SimulationContext,
} from "../../../../shared/types.ts";

import { simulateScenario } from "../../../../shared/engine/simulateScenario.ts";

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

function makeScenario(): ScenarioInput {
  const supplier = graph.nodes.find(
    (node) => node.type === "supplier"
  )!;

  return {
    companyId: graph.companyId,
    name: "Supplier disruption test",
    startAt: "2026-11-04T00:00:00.000Z",
    events: [
      {
        type: "supplier_failure",
        targetId: supplier.id,
        targetKind: "node",
        targetType: "supplier",
        severity: "high",
        durationHours: 24,
      },
    ],
  };
}

describe("simulateScenario", () => {
  it("returns a completed hypothetical simulation", () => {
    const result = simulateScenario(
      graph,
      makeScenario(),
      context
    );

    expect(result.status).toBe("completed");
    expect(result.simulationMode).toBe("hypothetical");
    expect(result.simulationId).toBe(context.simulationId);
    expect(result.scenarioId).toBe(context.scenarioId);
  });

  it("includes impact analysis and recovery recommendations", () => {
    const result = simulateScenario(
      graph,
      makeScenario(),
      context
    );

    expect(result.impact.affectedEntities).toBeGreaterThan(0);
    expect(Array.isArray(result.recoveryPlans)).toBe(true);
    expect(result.recoveryPlans.length).toBeGreaterThan(0);
  });

  it("requires human approval for every recovery plan", () => {
    const result = simulateScenario(
      graph,
      makeScenario(),
      context
    );

    for (const plan of result.recoveryPlans) {
      expect(plan.requiresHumanApproval).toBe(true);

      for (const action of plan.actions) {
        expect(action.id).toBeTruthy();
      }
    }
  });

  it("throws an error when the simulation context is missing", () => {
    expect(() =>
      simulateScenario(
        graph,
        makeScenario(),
        null as unknown as SimulationContext
      )
    ).toThrow("Simulation context");
  });

  it("rejects invalid scenario input", () => {
    const invalidScenario = makeScenario();
    invalidScenario.events = [];

    expect(() =>
      simulateScenario(graph, invalidScenario, context)
    ).toThrow("Simulation input validation failed.");
  });
});
