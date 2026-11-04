import fs from "node:fs";
import path from "node:path";

export function exportGraphSnapshot(
  graph,
  outputPath = path.join(
    process.cwd(),
    "datasets",
    "gokul_2019",
    "graph_snapshot.json"
  )
) {
  if (!graph || !graph.companyId || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
    throw new Error("Invalid graph snapshot.");
  }

  const directory = path.dirname(outputPath);

  fs.mkdirSync(directory, { recursive: true });

  fs.writeFileSync(
    outputPath,
    JSON.stringify(graph, null, 2),
    "utf8"
  );

  return outputPath;
}
