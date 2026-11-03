import { buildSupplyChainGraph } from "../graph/graphBuilder.js";
import { validateSupplyChainData } from "../graph/graphValidator.js";

/**
 * Creates and validates a company-specific graph snapshot.
 *
 * @param {Object} params
 * @param {string} params.companyId
 * @param {Object} params.dataset
 * @returns {Object} Validated GraphSnapshot
 */
export function createGraphSnapshot({ companyId, dataset }) {
  if (!companyId || typeof companyId !== "string") {
    throw new Error("A valid companyId is required.");
  }

  if (!dataset || typeof dataset !== "object") {
    throw new Error("A valid dataset is required.");
  }

  const graph = buildSupplyChainGraph({
    companyId,
    ...dataset,
  });

  const validation = validateSupplyChainData(graph);

  if (!validation.valid) {
    throw new Error(
      `Graph validation failed: ${validation.errors.join("; ")}`
    );
  }

  return graph;
}
