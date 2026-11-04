
import type {
  GraphSnapshot,
  ScenarioInput,
  SimulationContext,
  SimulationResult,
} from "../types.ts";

import { validateSimulationInput } from "./validators.ts";
import { propagateDisruptions } from "./disruptionPropagation.ts";
import { analyzeImpact } from "./impactAnalysis.ts";
import {
  generateRecoveryRecommendations,
} from "./recoveryRecommendations.ts";

export function simulateScenario(
  graph: GraphSnapshot,
  scenario: ScenarioInput,
  context: SimulationContext
): SimulationResult {
  // Step 1: Validate graph and scenario.
  validateSimulationInput(graph, scenario);

  if (!context?.simulationId || !context?.scenarioId) {
    throw new Error(
      "Simulation context must contain simulationId and scenarioId."
    );
  }

  // Step 2: Propagate disruptions through the supply-chain graph.
  const propagation = propagateDisruptions(graph, scenario);

  // Step 3: Calculate the operational impact.
  const impactAnalysis = analyzeImpact(
    graph,
    scenario,
    propagation
  );

  // Step 4: Generate recovery recommendations.
    const recovery = generateRecoveryRecommendations(
    graph,
    scenario,
    propagation,
    impactAnalysis.impact,
    context
    );
  // Step 5: Combine assumptions and warnings.
  const assumptions = [
    ...impactAnalysis.assumptions,
    ...recovery.assumptions,
  ];

  const warnings = [
    ...impactAnalysis.warnings,
    ...recovery.warnings,
  ];

  return {
    simulationId: context.simulationId,
    scenarioId: context.scenarioId,
    status: "completed",
    simulationMode: "hypothetical",
    impact: impactAnalysis.impact,
    recoveryPlans: recovery.recoveryPlans,
    assumptions: [...new Set(assumptions)],
    warnings: [...new Set(warnings)],
  };
}
