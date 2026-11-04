import { loadGokulDataset } from "./csvLoader.js";
import { createGraphSnapshot } from "../services/graphService.js";

const companyId = "11111111-1111-4111-8111-111111111111";

try {
  const dataset = loadGokulDataset();

  const graph = createGraphSnapshot({
    companyId,
    dataset,
  });

  console.log("GRAPH SERVICE TEST PASSED");
  console.log("Company ID:", graph.companyId);
  console.log("Total nodes:", graph.nodes.length);
  console.log("Total edges:", graph.edges.length);
  console.log("Generated at:", graph.generatedAt);
} catch (error) {
  console.error("GRAPH SERVICE TEST FAILED:");
  console.error(error.message);
  process.exitCode = 1;
}
