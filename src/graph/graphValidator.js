const ENTITY_TYPES = [
  "supplier",
  "facility",
  "material",
  "warehouse",
  "customer",
];

const RELATIONSHIP_TYPES = [
  "supplies",
  "ships_to",
  "produces",
  "stores",
  "uses",
  "custom",
];

export function validateSupplyChainData(data) {
  const errors = [];

  if (!data || typeof data !== "object") {
    return {
      valid: false,
      errors: ["Input must be a valid object."],
    };
  }

  const { companyId, nodes, edges } = data;

  if (!companyId || typeof companyId !== "string") {
    errors.push("A valid companyId is required.");
  }

  if (!Array.isArray(nodes)) {
    errors.push("Nodes must be an array.");
  }

  if (!Array.isArray(edges)) {
    errors.push("Edges must be an array.");
  }

  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    return { valid: false, errors };
  }

  const nodeIds = new Set();

  nodes.forEach((node, index) => {
    if (!node || typeof node !== "object") {
      errors.push(`Node at index ${index} is invalid.`);
      return;
    }

    if (!node.id || typeof node.id !== "string") {
      errors.push(`Node at index ${index} has an invalid id.`);
    } else if (nodeIds.has(node.id)) {
      errors.push(`Duplicate node id: ${node.id}`);
    } else {
      nodeIds.add(node.id);
    }

    if (node.companyId !== companyId) {
      errors.push(`Node ${node.id ?? index} has a mismatched companyId.`);
    }

    if (!ENTITY_TYPES.includes(node.type)) {
      errors.push(`Node ${node.id ?? index} has an invalid entity type.`);
    }

    if (typeof node.name !== "string" || !node.name.trim()) {
      errors.push(`Node ${node.id ?? index} must have a name.`);
    }

    if (
      !node.attributes ||
      typeof node.attributes !== "object" ||
      Array.isArray(node.attributes)
    ) {
      errors.push(`Node ${node.id ?? index} must have an attributes object.`);
    }
  });

  const edgeIds = new Set();

  edges.forEach((edge, index) => {
    if (!edge || typeof edge !== "object") {
      errors.push(`Edge at index ${index} is invalid.`);
      return;
    }

    if (!edge.id || typeof edge.id !== "string") {
      errors.push(`Edge at index ${index} has an invalid id.`);
    } else if (edgeIds.has(edge.id)) {
      errors.push(`Duplicate edge id: ${edge.id}`);
    } else {
      edgeIds.add(edge.id);
    }

    if (edge.companyId !== companyId) {
      errors.push(`Edge ${edge.id ?? index} has a mismatched companyId.`);
    }

    if (!nodeIds.has(edge.sourceId)) {
      errors.push(`Edge ${edge.id ?? index} has an unknown sourceId.`);
    }

    if (!nodeIds.has(edge.targetId)) {
      errors.push(`Edge ${edge.id ?? index} has an unknown targetId.`);
    }

    if (!RELATIONSHIP_TYPES.includes(edge.relationshipType)) {
      errors.push(`Edge ${edge.id ?? index} has an invalid relationshipType.`);
    }

    if (
      edge.capacity != null &&
      (typeof edge.capacity !== "number" ||
        !Number.isFinite(edge.capacity) ||
        edge.capacity < 0)
    ) {
      errors.push(`Edge ${edge.id ?? index} has an invalid capacity.`);
    }

    if (
      edge.leadTimeDays != null &&
      (typeof edge.leadTimeDays !== "number" ||
        !Number.isFinite(edge.leadTimeDays) ||
        edge.leadTimeDays < 0)
    ) {
      errors.push(`Edge ${edge.id ?? index} has an invalid leadTimeDays.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
