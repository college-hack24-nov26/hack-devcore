import { v5 as uuidv5 } from "uuid";

// Fixed namespace for stable, deterministic UUID generation.
const GRAPH_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

function createStableId(companyId, sourceId) {
  return uuidv5(`${companyId}:${sourceId}`, GRAPH_NAMESPACE);
}

function splitIds(value) {
  if (!value) return [];

  return String(value)
    .split(";")
    .map((id) => id.trim())
    .filter(Boolean);
}

function toNumber(value, fieldName) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new Error(`Invalid numeric value for ${fieldName}: ${value}`);
  }

  return number;
}

function createNode(companyId, sourceId, type, name, attributes) {
  if (!sourceId) {
    throw new Error("A source ID is missing while creating a graph node.");
  }

  return {
    id: createStableId(companyId, sourceId),
    companyId,
    type,
    name,
    attributes: {
      ...attributes,
      sourceId,
    },
  };
}

export function buildSupplyChainGraph({
  companyId,
  suppliers = [],
  collectionCentres = [],
  chillingCentres = [],
  processingPlants = [],
  distributionCentres = [],
  routes = [],
}) {
  if (!companyId || typeof companyId !== "string") {
    throw new Error("A valid companyId is required.");
  }

  const allRows = [
    suppliers,
    collectionCentres,
    chillingCentres,
    processingPlants,
    distributionCentres,
    routes,
  ];

  if (!allRows.every(Array.isArray)) {
    throw new Error("All dataset inputs must be arrays.");
  }

  const nodes = [];
  const edges = [];
  const sourceIdToNode = new Map();
  const edgeKeys = new Set();

  function addNode(sourceId, type, name, attributes) {
    if (sourceIdToNode.has(sourceId)) {
      throw new Error(`Duplicate source ID found: ${sourceId}`);
    }

    const node = createNode(
      companyId,
      sourceId,
      type,
      name,
      attributes
    );

    nodes.push(node);
    sourceIdToNode.set(sourceId, node);

    return node;
  }

  function addEdge(
  sourceId,
  targetId,
  relationshipType,
  attributes = {},
  uniqueKey = null
) {
    const sourceNode = sourceIdToNode.get(sourceId);
    const targetNode = sourceIdToNode.get(targetId);

    if (!sourceNode || !targetNode) {
      throw new Error(
        `Unknown edge endpoint: ${sourceId} -> ${targetId}`
      );
    }

   const edgeKey = uniqueKey
  ? `${sourceNode.id}:${targetNode.id}:${relationshipType}:${uniqueKey}`
  : `${sourceNode.id}:${targetNode.id}:${relationshipType}`;

    if (edgeKeys.has(edgeKey)) {
      return;
    }

    edgeKeys.add(edgeKey);

    edges.push({
     id: createStableId(
  companyId,
  uniqueKey
    ? `EDGE:${sourceId}:${targetId}:${relationshipType}:${uniqueKey}`
    : `EDGE:${sourceId}:${targetId}:${relationshipType}`
),
      companyId,
      sourceId: sourceNode.id,
      targetId: targetNode.id,
      relationshipType,
      ...attributes,
    });
  }

  // 1. Supplier nodes
  suppliers.forEach((row) => {
    addNode(
      row.supplier_id,
      "supplier",
      row.supplier_name,
      {
        district: row.district,
        village: row.village,
        milkType: row.milk_type,
        dailySupplyLitres: toNumber(
          row.daily_supply_litres,
          "daily_supply_litres"
        ),
        reliabilityScore: toNumber(
          row.reliability_score,
          "reliability_score"
        ),
        status: row.status,
        dataSource: row.data_source,
      }
    );
  });

  // 2. Collection centre nodes
  collectionCentres.forEach((row) => {
    addNode(
      row.centre_id,
      "facility",
      row.centre_name,
      {
        facilityType: "collection_centre",
        district: row.district,
        latitude: toNumber(row.latitude, "latitude"),
        longitude: toNumber(row.longitude, "longitude"),
        dailyCollectionCapacity: toNumber(
          row.daily_collection_capacity,
          "daily_collection_capacity"
        ),
        currentCollection: toNumber(
          row.current_collection,
          "current_collection"
        ),
        status: row.status,
        dataSource: row.data_source,
      }
    );
  });

  // 3. Chilling centre nodes
  chillingCentres.forEach((row) => {
    addNode(
      row.chilling_id,
      "facility",
      row.centre_name,
      {
        facilityType: "chilling_centre",
        district: row.district,
        storageCapacityLitres: toNumber(
          row.storage_capacity_litres,
          "storage_capacity_litres"
        ),
        currentStockLitres: toNumber(
          row.current_stock_litres,
          "current_stock_litres"
        ),
        status: row.status,
        dataSource: row.data_source,
      }
    );
  });

  // 4. Processing plant nodes
  processingPlants.forEach((row) => {
    addNode(
      row.plant_id,
      "facility",
      row.plant_name,
      {
        facilityType: "processing_plant",
        district: row.district,
        processingCapacityLitresPerDay: toNumber(
          row.processing_capacity_litres_per_day,
          "processing_capacity_litres_per_day"
        ),
        currentCapacityUtilisation: toNumber(
          row.current_capacity_utilisation,
          "current_capacity_utilisation"
        ),
        status: row.status,
        dataSource: row.data_source,
      }
    );
  });

  // 5. Distribution centre nodes
  distributionCentres.forEach((row) => {
    addNode(
      row.distribution_id,
      "facility",
      `${row.city} Distribution Centre`,
      {
        facilityType: "distribution_centre",
        city: row.city,
        district: row.district,
        dailyDemandLitres: toNumber(
          row.daily_demand_litres,
          "daily_demand_litres"
        ),
        currentStockLitres: toNumber(
          row.current_stock_litres,
          "current_stock_litres"
        ),
        priority: row.priority,
        dataSource: row.data_source,
      }
    );
  });

  // 6. Supplier -> Collection Centre relationships
  collectionCentres.forEach((row) => {
    splitIds(row.connected_supplier_ids).forEach((supplierId) => {
      addEdge(
        supplierId,
        row.centre_id,
        "supplies",
        {
          attributes: {
            dataSource: row.data_source,
          },
        }
      );
    });
  });

  // 7. Route-based relationships
  // Route CSV is the source of route attributes.
  routes.forEach((route) => {
    const travelHours = toNumber(
      route.estimated_travel_time_hours,
      "estimated_travel_time_hours"
    );

    addEdge(
      route.origin_id,
      route.destination_id,
      "ships_to",
      {
        leadTimeDays: travelHours / 24,
        attributes: {
          routeId: route.route_id,
          distanceKm: toNumber(route.distance_km, "distance_km"),
          estimatedTravelTimeHours: travelHours,
          transportCost: toNumber(
            route.transport_cost,
            "transport_cost"
          ),
          floodRiskLevel: route.flood_risk_level,
          routeStatus:
          route.route_status === "operational"
          ? "active"
          : route.route_status,
          dataSource: route.data_source,
        },
      }
    );
  });

  return {
    companyId,
    nodes,
    edges,
    generatedAt: new Date().toISOString(),
  };
}
