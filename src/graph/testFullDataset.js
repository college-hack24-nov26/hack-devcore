import { loadGokulDataset } from "./csvLoader.js";
import { buildSupplyChainGraph } from "./graphBuilder.js";
import { validateSupplyChainData } from "./graphValidator.js";
import { exportGraphSnapshot } from "./exportGraph.js";

const companyId = "11111111-1111-4111-8111-111111111111";

try {
  const dataset = loadGokulDataset();

  const graph = buildSupplyChainGraph({
    companyId,
    ...dataset,
  });

  const validation = validateSupplyChainData(graph);

  if (!validation.valid) {
    throw new Error(JSON.stringify(validation.errors, null, 2));
  }

  const outputPath = exportGraphSnapshot(graph);

  console.log("GRAPH EXPORT SUCCESSFUL");
  console.log("Total nodes:", graph.nodes.length);
  console.log("Total edges:", graph.edges.length);
  console.log("Validation:", validation.valid);
  console.log("Exported file:", outputPath);
} catch (error) {
  console.error("GRAPH EXPORT FAILED:", error.message);
  process.exitCode = 1;
}
