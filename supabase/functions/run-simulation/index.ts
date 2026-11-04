
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

import type {
  GraphSnapshot,
  ScenarioInput,
} from "../../../shared/types.ts";

import { simulateScenario } from "../../../shared/engine/simulateScenario.ts";

interface RunSimulationRequest {
  companyId: string;
  scenarioId: string;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: unknown,
) {
  return Response.json(
    {
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
    },
    { status },
  );
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export default {
  fetch: withSupabase(
    { auth: "user" },
    async (req, ctx) => {
      if (req.method !== "POST") {
        return errorResponse(
          "METHOD_NOT_ALLOWED",
          "Only POST requests are supported.",
          405,
        );
      }

      let body: RunSimulationRequest;

      try {
        body = await req.json();
      } catch {
        return errorResponse(
          "INVALID_JSON",
          "Request body must contain valid JSON.",
          400,
        );
      }

      if (
        !body ||
        typeof body.companyId !== "string" ||
        typeof body.scenarioId !== "string" ||
        !UUID_PATTERN.test(body.companyId) ||
        !UUID_PATTERN.test(body.scenarioId)
      ) {
        return errorResponse(
          "INVALID_REQUEST",
          "Valid companyId and scenarioId UUIDs are required.",
          400,
        );
      }

      const userId = ctx.userClaims.id;
      const supabase = ctx.supabase;

      // 1. Verify the caller's company membership and role.
      const { data: membership, error: membershipError } =
        await supabase
          .from("company_members")
          .select("role")
          .eq("company_id", body.companyId)
          .eq("user_id", userId)
          .maybeSingle();

      if (membershipError) {
        return errorResponse(
          "MEMBERSHIP_LOOKUP_FAILED",
          "Could not verify company membership.",
          500,
        );
      }

      if (!membership) {
        return errorResponse(
          "COMPANY_ACCESS_DENIED",
          "You are not a member of this company.",
          403,
        );
      }

      if (
        !["owner", "admin", "analyst"].includes(membership.role)
      ) {
        return errorResponse(
          "INSUFFICIENT_ROLE",
          "Only owners, admins, and analysts can run simulations.",
          403,
        );
      }

      // 2. Fetch the scenario within the requested company.
      const { data: scenarioRow, error: scenarioError } =
        await supabase
          .from("scenarios")
          .select(
            "id, company_id, name, description, start_at, events",
          )
          .eq("id", body.scenarioId)
          .eq("company_id", body.companyId)
          .maybeSingle();

      if (scenarioError) {
        return errorResponse(
          "SCENARIO_LOOKUP_FAILED",
          "Could not load the requested scenario.",
          500,
        );
      }

      if (!scenarioRow) {
        return errorResponse(
          "SCENARIO_NOT_FOUND",
          "The scenario does not exist or is not accessible.",
          404,
        );
      }

      // 3. Fetch the company's graph using the user's RLS-scoped client.
      const [nodesResult, edgesResult] = await Promise.all([
        supabase
          .from("graph_nodes")
          .select("id, company_id, type, name, attributes")
          .eq("company_id", body.companyId),

        supabase
          .from("graph_edges")
          .select(
            "id, company_id, source_id, target_id, relationship_type, capacity, capacity_unit, material_id, lead_time_days, attributes",
          )
          .eq("company_id", body.companyId),
      ]);

      if (nodesResult.error || edgesResult.error) {
        return errorResponse(
          "GRAPH_LOOKUP_FAILED",
          "Could not load the company's supply-chain graph.",
          500,
        );
      }

      const graph: GraphSnapshot = {
        companyId: body.companyId,
        generatedAt: new Date().toISOString(),

        nodes: (nodesResult.data ?? []).map((node) => ({
          id: node.id,
          companyId: node.company_id,
          type: node.type,
          name: node.name,
          attributes: node.attributes ?? {},
        })),

        edges: (edgesResult.data ?? []).map((edge) => ({
          id: edge.id,
          companyId: edge.company_id,
          sourceId: edge.source_id,
          targetId: edge.target_id,
          relationshipType: edge.relationship_type,
          capacity: toNullableNumber(edge.capacity),
          capacityUnit: edge.capacity_unit ?? undefined,
          materialId: edge.material_id,
          leadTimeDays: toNullableNumber(edge.lead_time_days),
          attributes: edge.attributes ?? {},
        })),
      };

      const scenario: ScenarioInput = {
        companyId: scenarioRow.company_id,
        name: scenarioRow.name,
        description: scenarioRow.description ?? undefined,
        startAt: scenarioRow.start_at,
        events: scenarioRow.events,
      };

      // 4. Run the existing simulation engine.
      const simulationId = crypto.randomUUID();

      let result;

      try {
        result = simulateScenario(
          graph,
          scenario,
          {
            simulationId,
            scenarioId: scenarioRow.id,
          },
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Simulation execution failed.";

        const isValidationError =
          error instanceof Error &&
          error.name === "SimulationValidationError";

        return errorResponse(
          isValidationError
            ? "SIMULATION_VALIDATION_FAILED"
            : "SIMULATION_EXECUTION_FAILED",
          message,
          isValidationError ? 422 : 500,
        );
      }

      // 5. Persist the completed hypothetical simulation.
      const { error: insertError } = await supabase
        .from("simulations")
        .insert({
          id: result.simulationId,
          company_id: body.companyId,
          scenario_id: result.scenarioId,
          created_by: userId,
          status: result.status,
          simulation_mode: result.simulationMode,
          result,
        });

      if (insertError) {
        console.error(
          "Simulation persistence failed:",
          insertError,
        );

        return errorResponse(
          "SIMULATION_PERSISTENCE_FAILED",
          "The simulation ran, but its result could not be saved.",
          500,
        );
      }

      return Response.json({
        success: true,
        data: result,
      });
    },
  ),
};
