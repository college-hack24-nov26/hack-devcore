import { buildSupplyChainGraph } from "./graphBuilder.js";
import { validateSupplyChainData } from "./graphValidator.js";

const companyId = "11111111-1111-4111-8111-111111111111";

const testData = {
  companyId,

  suppliers: [
    {
      supplier_id: "SUP-01",
      supplier_name: "Test Supplier",
      district: "Kolhapur",
      village: "Kagal",
      milk_type: "Cow",
      daily_supply_litres: "5000",
      reliability_score: "0.85",
      status: "active",
      data_source: "RECONSTRUCTED_SAMPLE",
    },
  ],

  collectionCentres: [
    {
      centre_id: "CC-01",
      centre_name: "Test Collection Centre",
      district: "Kolhapur",
      latitude: "16.6428",
      longitude: "74.2953",
      daily_collection_capacity: "10000",
      current_collection: "5000",
      connected_supplier_ids: "SUP-01",
      status: "operational",
      data_source: "RECONSTRUCTED_SAMPLE",
    },
  ],

  chillingCentres: [],
  processingPlants: [],
  distributionCentres: [],

  routes: [],
};

const graph = buildSupplyChainGraph(testData);
const validation = validateSupplyChainData(graph);

console.log("Nodes:", graph.nodes.length);
console.log("Edges:", graph.edges.length);
console.log("Validation:", validation);
console.log("Generated UUID:", graph.nodes[0].id);
