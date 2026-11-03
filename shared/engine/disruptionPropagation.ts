import type {
  GraphSnapshot,
  ScenarioInput,
  UUID,
  DisruptionType,
} from "../types.ts";

import { traverseDownstream } from "./graphTraversal.ts";

export interface EventPropagation {
  eventIndex: number;
  eventType: DisruptionType;
  targetId: UUID;
  affectedNodeIds: UUID[];
  affectedEdgeIds: UUID[];
  warnings: string[];
}

export interface DisruptionPropagationResult {
  affectedNodeIds: UUID[];
  affectedEdgeIds: UUID[];
  events: EventPropagation[];
  warnings: string[];
}

export function propagateDisruptions(
  graph: GraphSnapshot,
  scenario: ScenarioInput,
): DisruptionPropagationResult {
  const allNodeIds = new Set<UUID>();
  const allEdgeIds = new Set<UUID>();
  const eventResults: EventPropagation[] = [];
  const warnings: string[] = [];

  scenario.events.forEach((event, eventIndex) => {
    const nodeIds = new Set<UUID>();
    const edgeIds = new Set<UUID>();
    const eventWarnings: string[] = [];

    if (event.targetKind === "node") {
      const targetExists = graph.nodes.some(
        (node) => node.id === event.targetId,
      );

      if (!targetExists) {
        eventWarnings.push(`Event ${eventIndex}: target node not found.`);
      } else {
        const result = traverseDownstream(graph, [event.targetId]);

        result.affectedNodeIds.forEach((id) => nodeIds.add(id));
        result.affectedEdgeIds.forEach((id) => edgeIds.add(id));
      }
    } else {
      const targetEdge = graph.edges.find(
        (edge) => edge.id === event.targetId,
      );

      if (!targetEdge) {
        eventWarnings.push(`Event ${eventIndex}: target edge not found.`);
      } else {
        // The disrupted connection and both endpoints are affected.
        edgeIds.add(targetEdge.id);
        nodeIds.add(targetEdge.sourceId);
        nodeIds.add(targetEdge.targetId);

        // Continue downstream from the destination of the disrupted edge.
        const result = traverseDownstream(
          graph,
          [targetEdge.targetId],
        );

        result.affectedNodeIds.forEach((id) => nodeIds.add(id));
        result.affectedEdgeIds.forEach((id) => edgeIds.add(id));
      }
    }

    nodeIds.forEach((id) => allNodeIds.add(id));
    edgeIds.forEach((id) => allEdgeIds.add(id));

    eventResults.push({
      eventIndex,
      eventType: event.type,
      targetId: event.targetId,
      affectedNodeIds: [...nodeIds],
      affectedEdgeIds: [...edgeIds],
      warnings: eventWarnings,
    });

    warnings.push(...eventWarnings);
  });

  return {
    affectedNodeIds: [...allNodeIds],
    affectedEdgeIds: [...allEdgeIds],
    events: eventResults,
    warnings,
  };
}
