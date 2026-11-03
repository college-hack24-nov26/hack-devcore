import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import type {
  GraphSnapshot,
  ScenarioInput,
} from "../../../../shared/types";

import { propagateDisruptions } from "../../../../shared/engine/disruptionPropagation.ts";

const graph = JSON.parse(
  readFileSync(
    new URL("../__fixtures__/graph_snapshot.json", import.meta.url),
    "utf-8",
  ),
) as GraphSnapshot;

function makeScenario(
  targetId: string,
  targetKind: "node" | "edge",
  type: ScenarioInput["events"][number]["type"],
): ScenarioInput {
  return {
    companyId: graph.companyId,
    name: "Propagation test",
    startAt: "2026-11-04T00:00:00.000Z",
    events: [{
      type,
      targetId,
      targetKind,
      severity: "high",
      durationHours: 24,
    }],
  };
}

describe("disruption propagation", () => {
  it("propagates supplier failure to downstream facilities", () => {
    const supplier = graph.nodes.find(
      (node) => node.type === "supplier",
    )!;

    const result = propagateDisruptions(
      graph,
      makeScenario(supplier.id, "node", "supplier_failure"),
    );

    expect(result.affectedNodeIds).toContain(supplier.id);
    expect(result.affectedNodeIds.length).toBeGreaterThan(1);
    expect(result.events[0].eventType).toBe("supplier_failure");
  });

  it("includes a closed route and its endpoints", () => {
    const route = graph.edges.find(
      (edge) => edge.relationshipType === "ships_to",
    )!;

    const result = propagateDisruptions(
      graph,
      makeScenario(route.id, "edge", "route_closure"),
    );

    expect(result.affectedEdgeIds).toContain(route.id);
    expect(result.affectedNodeIds).toContain(route.sourceId);
    expect(result.affectedNodeIds).toContain(route.targetId);
  });

  it("keeps multiple disruption results in one aggregate", () => {
    const suppliers = graph.nodes.filter(
      (node) => node.type === "supplier",
    );

    const scenario = makeScenario(
      suppliers[0].id,
      "node",
      "supplier_failure",
    );

    scenario.events.push({
      type: "power_outage",
      targetId: graph.nodes.find(
        (node) => node.type === "facility",
      )!.id,
      targetKind: "node",
      severity: "medium",
      durationHours: 12,
    });

    const result = propagateDisruptions(graph, scenario);

    expect(result.events).toHaveLength(2);
    expect(result.affectedNodeIds.length).toBeGreaterThan(1);
  });

  it("returns no warnings for valid targets", () => {
    const supplier = graph.nodes.find(
      (node) => node.type === "supplier",
    )!;

    const result = propagateDisruptions(
      graph,
      makeScenario(supplier.id, "node", "supplier_failure"),
    );

    expect(result.warnings).toEqual([]);
  });
});
