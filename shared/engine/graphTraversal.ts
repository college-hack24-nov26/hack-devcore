import type {
  GraphSnapshot,
  UUID,
  GraphNode,
  GraphEdge,
} from "../types.ts";

export interface TraversalResult {
  affectedNodeIds: UUID[];
  affectedEdgeIds: UUID[];
  affectedNodes: GraphNode[];
  affectedEdges: GraphEdge[];
}

export function traverseDownstream(
  graph: GraphSnapshot,
  startNodeIds: UUID[],
  blockedEdgeIds: UUID[] = [],
): TraversalResult {
  const nodesById = new Map(
    graph.nodes.map((node) => [node.id, node]),
  );

  const blocked = new Set(blockedEdgeIds);
  const adjacency = new Map<UUID, GraphEdge[]>();

  for (const edge of graph.edges) {
    if (blocked.has(edge.id)) continue;

    const outgoing = adjacency.get(edge.sourceId) ?? [];
    outgoing.push(edge);
    adjacency.set(edge.sourceId, outgoing);
  }

  const visitedNodes = new Set<UUID>();
  const visitedEdges = new Set<UUID>();
  const queue = [...startNodeIds];

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    if (visitedNodes.has(currentId)) continue;
    visitedNodes.add(currentId);

    const outgoing = adjacency.get(currentId) ?? [];

    for (const edge of outgoing) {
      visitedEdges.add(edge.id);

      if (!visitedNodes.has(edge.targetId)) {
        queue.push(edge.targetId);
      }
    }
  }

  // Starting nodes are included in affectedNodeIds.
  // Unknown start IDs are ignored; validation handles invalid input.
  const affectedNodes = [...visitedNodes]
    .map((id) => nodesById.get(id))
    .filter((node): node is GraphNode => node !== undefined);

  const affectedEdges = graph.edges.filter((edge) =>
    visitedEdges.has(edge.id),
  );

  return {
    affectedNodeIds: affectedNodes.map((node) => node.id),
    affectedEdgeIds: affectedEdges.map((edge) => edge.id),
    affectedNodes,
    affectedEdges,
  };
}

export function getSupplierFacilities(
  graph: GraphSnapshot,
  supplierId: UUID,
): GraphNode[] {
  const facilityIds = graph.edges
    .filter(
      (edge) =>
        edge.relationshipType === "supplies" &&
        edge.sourceId === supplierId,
    )
    .map((edge) => edge.targetId);

  const facilityIdSet = new Set(facilityIds);

  return graph.nodes.filter(
    (node) => facilityIdSet.has(node.id),
  );
}
