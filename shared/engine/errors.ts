export class SimulationValidationError extends Error {
  public readonly details: string[];

  constructor(message: string, details: string[] = []) {
    super(message);
    this.name = "SimulationValidationError";
    this.details = details;
  }
}

export class SimulationEngineError extends Error {
  public readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "SimulationEngineError";
    this.cause = cause;
  }
}
