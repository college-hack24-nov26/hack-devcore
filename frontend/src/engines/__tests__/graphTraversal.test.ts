import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import type { GraphSnapshot } from "../../../../shared/types";
import {
  traverseDownstream,
  getSupplierFacilities,
} from "../../../../shared/engine/graphTraversal.ts";

const graph = JSON.parse(
  readFileSync(
    new URL("../__fixtures__/graph_snapshot.json", import.meta.url),
    "utf-8",
  ),
) as GraphSnapshot;

describe("graph traversal", () => {
  it("finds downstream facilities from a supplier", () => {
    const supplier = graph.nodes.find(
      (node) => node.type === "supplier",
    )!;

    const result = traverseDownstream(graph, [supplier.id]);

    expect(result.affectedNodeIds).toContain(supplier.id);
    expect(result.affectedNodes.some(
      (node) => node.type === "facility",
    )).toBe(true);
  });

  it("finds directly supplied facilities", () => {
    const supplier = graph.nodes.find(
      (node) => node.type === "supplier",
    )!;

    const facilities = getSupplierFacilities(graph, supplier.id);

    expect(facilities.length).toBeGreaterThan(0);
    expect(facilities.every(
      (node) => node.type === "facility",
    )).toBe(true);
  });

  it("does not traverse a blocked route edge", () => {
    const route = graph.edges.find(
      (edge) => edge.relationshipType === "ships_to",
    )!;

    const result = traverseDownstream(
      graph,
      [route.sourceId],
      [route.id],
    );

    expect(result.affectedEdgeIds).not.toContain(route.id);
  });

  it("does not traverse upstream from a facility", () => {
    const facility = graph.nodes.find(
      (node) => node.type === "facility",
    )!;

    const incoming = graph.edges.find(
      (edge) =>
        edge.relationshipType === "supplies" &&
        edge.targetId === facility.id,
    );

    const result = traverseDownstream(graph, [facility.id]);

    if (incoming) {
      expect(result.affectedNodeIds).not.toContain(incoming.sourceId);
    }
  });

  it("handles an empty starting node list", () => {
    const result = traverseDownstream(graph, []);

    expect(result.affectedNodeIds).toEqual([]);
    expect(result.affectedEdgeIds).toEqual([]);
  });
});
