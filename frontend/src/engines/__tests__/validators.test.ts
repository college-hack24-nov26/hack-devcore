import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import type { GraphSnapshot, ScenarioInput } from "../../../../shared/types";
import { validateSimulationInput } from "../../../../shared/engine/validators.ts";

const graph = JSON.parse(
  readFileSync(
    new URL("../__fixtures__/graph_snapshot.json", import.meta.url),
    "utf-8",
  ),
) as GraphSnapshot;

const supplier = graph.nodes.find((node) => node.type === "supplier");

if (!supplier) {
  throw new Error("Fixture must contain at least one supplier");
}

const validScenario: ScenarioInput = {
  companyId: graph.companyId,
  name: "Supplier failure test",
  startAt: "2026-11-03T18:00:00.000Z",
  events: [
    {
      type: "supplier_failure",
      targetId: supplier.id,
      targetKind: "node",
      targetType: "supplier",
      severity: "high",
      durationHours: 24,
      description: "Simulated supplier failure",
    },
  ],
};

describe("validateSimulationInput", () => {
  it("accepts a valid supplier disruption", () => {
    expect(() => validateSimulationInput(graph, validScenario)).not.toThrow();
  });

  it("rejects a company ID mismatch", () => {
    const scenario = {
      ...validScenario,
      companyId: "22222222-2222-4222-8222-222222222222",
    };
    expect(() => validateSimulationInput(graph, scenario)).toThrow();
  });

  it("rejects a missing target", () => {
    const scenario: ScenarioInput = {
      ...validScenario,
      events: [{
        ...validScenario.events[0],
        targetId: "99999999-9999-4999-8999-999999999999",
      }],
    };
    expect(() => validateSimulationInput(graph, scenario)).toThrow();
  });

  it("rejects supplier failure targeting a facility", () => {
    const facility = graph.nodes.find((node) => node.type === "facility");
    if (!facility) throw new Error("Fixture must contain a facility");

    const scenario: ScenarioInput = {
      ...validScenario,
      events: [{
        ...validScenario.events[0],
        targetId: facility.id,
      }],
    };
    expect(() => validateSimulationInput(graph, scenario)).toThrow();
  });

  it("rejects negative disruption duration", () => {
    const scenario: ScenarioInput = {
      ...validScenario,
      events: [{
        ...validScenario.events[0],
        durationHours: -1,
      }],
    };
    expect(() => validateSimulationInput(graph, scenario)).toThrow();
  });

  it("rejects an empty event list", () => {
    const scenario: ScenarioInput = {
      ...validScenario,
      events: [],
    };
    expect(() => validateSimulationInput(graph, scenario)).toThrow();
  });
});
