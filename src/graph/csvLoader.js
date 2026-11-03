import Papa from "papaparse";
import fs from "node:fs";
import path from "node:path";

export function loadCsv(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV file not found: ${filePath}`);
  }

  const csvContent = fs.readFileSync(filePath, "utf8");

  const result = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
    transformHeader: (header) => header.trim(),
  });

  if (result.errors.length > 0) {
    throw new Error(
      `CSV parsing failed for ${filePath}: ${result.errors[0].message}`
    );
  }

  return result.data;
}

export function loadGokulDataset(projectRoot = process.cwd()) {
  const datasetPath = path.join(
    projectRoot,
    "datasets",
    "gokul_2019"
  );

  return {
    suppliers: loadCsv(path.join(datasetPath, "suppliers.csv")),
    collectionCentres: loadCsv(
      path.join(datasetPath, "collection_centres.csv")
    ),
    chillingCentres: loadCsv(
      path.join(datasetPath, "chilling_centres.csv")
    ),
    processingPlants: loadCsv(
      path.join(datasetPath, "processing_plants.csv")
    ),
    distributionCentres: loadCsv(
      path.join(datasetPath, "distribution_centres.csv")
    ),
    routes: loadCsv(path.join(datasetPath, "transport_routes.csv")),
  };
}
