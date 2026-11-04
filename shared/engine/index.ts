export { analyzeImpact } from "./impactAnalysis.ts";
export type { ImpactAnalysisResult } from "./impactAnalysis.ts";
export {
  SimulationValidationError,
  SimulationEngineError,
} from "./errors.ts";

export { validateSimulationInput } from "./validators.ts";
export {
  traverseDownstream,
  getSupplierFacilities,
} from "./graphTraversal.ts";

export type {
  TraversalResult,
} from "./graphTraversal.ts";
export {
  propagateDisruptions,
} from "./disruptionPropagation.ts";

export type {
  EventPropagation,
  DisruptionPropagationResult,
} from "./disruptionPropagation.ts";
export {
  generateRecoveryRecommendations,
} from "./recoveryRecommendations.ts";

export type {
  RecoveryRecommendationResult,
} from "./recoveryRecommendations.ts";
export { simulateScenario } from "./simulateScenario.ts";