import type {
  GraphSnapshot,
  ScenarioInput,
  DisruptionType,
  Severity,
  EntityType,
} from "../types.ts";

import { SimulationValidationError } from "./errors.ts";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const disruptionTypes: DisruptionType[] = [
  "supplier_failure",
  "flood",
  "power_outage",
  "route_closure",
  "material_shortage",
  "custom",
];

const severities: Severity[] = [
  "low",
  "medium",
  "high",
  "critical",
];

const entityTypes: EntityType[] = [
  "supplier",
  "facility",
  "material",
  "warehouse",
  "customer",
];

function isUUID(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function validateSimulationInput(
  graph: GraphSnapshot,
  scenario: ScenarioInput
): void {
  const errors: string[] = [];

  if (!graph || !scenario) {
    throw new SimulationValidationError(
      "Graph and scenario are required."
    );
  }

  if (!isUUID(graph.companyId)) {
    errors.push("Graph companyId must be a valid UUID.");
  }

  if (!isUUID(scenario.companyId)) {
    errors.push("Scenario companyId must be a valid UUID.");
  }

  if (graph.companyId !== scenario.companyId) {
    errors.push("Graph and scenario companyId do not match.");
  }

  if (!scenario.name?.trim()) {
    errors.push("Scenario name is required.");
  }

  if (!Number.isFinite(Date.parse(scenario.startAt))) {
    errors.push("Scenario startAt must be a valid ISO date.");
  }

  if (!Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
    errors.push("Graph nodes and edges must be arrays.");
  }

  if (!Array.isArray(scenario.events) || scenario.events.length === 0) {
    errors.push("At least one disruption event is required.");
  }

  if (errors.length > 0) {
    throw new SimulationValidationError(
      "Simulation input validation failed.",
      errors
    );
  }

  const nodeIds = new Set<string>();
  const edgeIds = new Set<string>();

  for (const node of graph.nodes) {
    if (!isUUID(node.id)) {
      errors.push(`Node has an invalid UUID: ${node.id}`);
    }

    if (node.companyId !== graph.companyId) {
      errors.push(`Node ${node.id} belongs to another company.`);
    }

    if (nodeIds.has(node.id)) {
      errors.push(`Duplicate graph node ID: ${node.id}`);
    }

    if (!entityTypes.includes(node.type)) {
      errors.push(`Node ${node.id} has an invalid entity type.`);
    }

    nodeIds.add(node.id);
  }

  for (const edge of graph.edges) {
    if (!isUUID(edge.id)) {
      errors.push(`Edge has an invalid UUID: ${edge.id}`);
    }

    if (edge.companyId !== graph.companyId) {
      errors.push(`Edge ${edge.id} belongs to another company.`);
    }

    if (edgeIds.has(edge.id)) {
      errors.push(`Duplicate graph edge ID: ${edge.id}`);
    }

    if (!nodeIds.has(edge.sourceId) || !nodeIds.has(edge.targetId)) {
      errors.push(`Edge ${edge.id} references a missing node.`);
    }

    if (
      edge.capacity != null &&
      (!Number.isFinite(edge.capacity) || edge.capacity < 0)
    ) {
      errors.push(`Edge ${edge.id} has invalid capacity.`);
    }

    if (
      edge.leadTimeDays != null &&
      (!Number.isFinite(edge.leadTimeDays) || edge.leadTimeDays < 0)
    ) {
      errors.push(`Edge ${edge.id} has invalid lead time.`);
    }

    edgeIds.add(edge.id);
  }

  for (const event of scenario.events) {
    if (!disruptionTypes.includes(event.type)) {
      errors.push(`Event has an invalid disruption type: ${event.type}`);
    }

    if (!severities.includes(event.severity)) {
      errors.push(`Event has an invalid severity: ${event.severity}`);
    }

    if (!Number.isFinite(event.durationHours) || event.durationHours <= 0) {
      errors.push("Event durationHours must be greater than zero.");
    }

    if (
      event.capacityReductionPercent !== undefined &&
      (
        !Number.isFinite(event.capacityReductionPercent) ||
        event.capacityReductionPercent < 0 ||
        event.capacityReductionPercent > 100
      )
    ) {
      errors.push("capacityReductionPercent must be between 0 and 100.");
    }

    const targetExists =
      event.targetKind === "node"
        ? nodeIds.has(event.targetId)
        : event.targetKind === "edge"
          ? edgeIds.has(event.targetId)
          : false;

    if (!targetExists) {
      errors.push(`Event target ${event.targetId} does not exist.`);
      continue;
    }

    if (event.targetKind === "node" && event.targetType) {
      const target = graph.nodes.find(
        (node) => node.id === event.targetId
      );

      if (target?.type !== event.targetType) {
        errors.push(`Event targetType does not match node ${event.targetId}.`);
      }
    }

    if (event.type === "route_closure" && event.targetKind !== "edge") {
      errors.push("A route_closure event must target a graph edge.");
    }

    if (event.type === "supplier_failure") {
      const target = graph.nodes.find(
        (node) => node.id === event.targetId
      );

      if (event.targetKind !== "node" || target?.type !== "supplier") {
        errors.push("A supplier_failure event must target a supplier node.");
      }
    }
  }

  if (errors.length > 0) {
    throw new SimulationValidationError(
      "Simulation input validation failed.",
      errors
    );
  }
}
