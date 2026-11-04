import { simulateScenario } from '../../../shared/engine/index.ts';
import type {
  GraphSnapshot,
  GraphNode,
  GraphEdge,
  ScenarioInput,
  ScenarioEvent,
  SimulationResult,
  DisruptionType,
  Severity,
  EntityType,
  RelationshipType,
} from '../../../shared/types.ts';
import { supabase } from '../lib/supabase';

export type ScenarioTarget = {
  id: string;
  name: string;
  kind: 'node' | 'edge';
  type?: string;
};

type ActiveGraphContext = {
  graph: GraphSnapshot;
  mode: 'demo' | 'live';
  userId?: string;
};

type DatabaseNode = {
  id: string;
  company_id: string;
  type: string;
  name: string;
  attributes: Record<string, unknown> | null;
};

type DatabaseEdge = {
  id: string;
  company_id: string;
  source_id: string;
  target_id: string;
  relationship_type: string;
  capacity: number | null;
  capacity_unit: string | null;
  material_id: string | null;
  lead_time_days: number | null;
  attributes: Record<string, unknown> | null;
};

let graphPromise: Promise<GraphSnapshot> | null = null;

export async function loadDemoGraph(): Promise<GraphSnapshot> {
  if (!graphPromise) {
    graphPromise = fetch(
      new URL('../engines/__fixtures__/graph_snapshot.json', import.meta.url),
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Could not load the demo supply-chain graph.');
        }

        return response.json() as Promise<GraphSnapshot>;
      })
      .catch((error) => {
        graphPromise = null;
        throw error;
      });
  }

  return graphPromise;
}

async function loadActiveGraph(): Promise<ActiveGraphContext> {
  if (!supabase) {
    return {
      graph: await loadDemoGraph(),
      mode: 'demo',
    };
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(`Could not verify your session: ${sessionError.message}`);
  }

  // No authenticated user: retain the existing local demo experience.
  if (!session?.user) {
    return {
      graph: await loadDemoGraph(),
      mode: 'demo',
    };
  }

  const userId = session.user.id;

  const { data: memberships, error: membershipError } = await supabase
    .from('company_members')
    .select('company_id')
    .eq('user_id', userId);

  if (membershipError) {
    throw new Error(`Could not load company membership: ${membershipError.message}`);
  }

  if (!memberships?.length) {
    throw new Error(
      'Your account is not linked to a company yet. Create or join a company before running a live simulation.',
    );
  }

  const savedCompanyId = localStorage.getItem('ripple_company_id');
  const matchingMembership = memberships.find(
    (membership) => membership.company_id === savedCompanyId,
  );

  if (memberships.length > 1 && !matchingMembership) {
    throw new Error('Select a company workspace before running a live simulation.');
  }

  const companyId = matchingMembership?.company_id ?? memberships[0].company_id;

  const [nodesResponse, edgesResponse] = await Promise.all([
    supabase
      .from('graph_nodes')
      .select('id, company_id, type, name, attributes')
      .eq('company_id', companyId),

    supabase
      .from('graph_edges')
      .select(
        'id, company_id, source_id, target_id, relationship_type, capacity, capacity_unit, material_id, lead_time_days, attributes',
      )
      .eq('company_id', companyId),
  ]);

  if (nodesResponse.error) {
    throw new Error(`Could not load company graph nodes: ${nodesResponse.error.message}`);
  }

  if (edgesResponse.error) {
    throw new Error(`Could not load company graph routes: ${edgesResponse.error.message}`);
  }

  const nodes: GraphNode[] = ((nodesResponse.data ?? []) as DatabaseNode[]).map(
    (node) => ({
      id: node.id,
      companyId: node.company_id,
      type: node.type as EntityType,
      name: node.name,
      attributes: node.attributes ?? {},
    }),
  );

  const edges: GraphEdge[] = ((edgesResponse.data ?? []) as DatabaseEdge[]).map(
    (edge) => ({
      id: edge.id,
      companyId: edge.company_id,
      sourceId: edge.source_id,
      targetId: edge.target_id,
      relationshipType: edge.relationship_type as RelationshipType,
      capacity: edge.capacity,
      capacityUnit: edge.capacity_unit ?? undefined,
      materialId: edge.material_id,
      leadTimeDays: edge.lead_time_days,
      attributes: edge.attributes ?? {},
    }),
  );

  if (!nodes.length) {
    throw new Error(
      'Your company graph is empty. Add suppliers and facilities before running a live simulation.',
    );
  }

  return {
    graph: {
      companyId,
      nodes,
      edges,
      generatedAt: new Date().toISOString(),
    },
    mode: 'live',
    userId,
  };
}

export async function getScenarioTargets(
  disruptionType: DisruptionType,
): Promise<ScenarioTarget[]> {
  const { graph } = await loadActiveGraph();

  if (disruptionType === 'route_closure') {
    return graph.edges
      .filter((edge) => edge.relationshipType === 'ships_to')
      .map((edge, index) => ({
        id: edge.id,
        name: String(
          edge.attributes?.routeId ??
            `Route ${index + 1}: ${edge.sourceId.slice(0, 8)} → ${edge.targetId.slice(0, 8)}`,
        ),
        kind: 'edge' as const,
        type: edge.relationshipType,
      }));
  }

  const allowedTypes =
    disruptionType === 'supplier_failure'
      ? ['supplier']
      : disruptionType === 'flood' || disruptionType === 'power_outage'
        ? ['facility']
        : null;

  return graph.nodes
    .filter((node) => !allowedTypes || allowedTypes.includes(node.type))
    .map((node) => ({
      id: node.id,
      name: node.name,
      kind: 'node' as const,
      type: node.type,
    }));
}

export async function runLocalSimulation(input: {
  target: ScenarioTarget;
  disruptionType: DisruptionType;
  severity: Severity;
  durationDays: number;
  description?: string;
}): Promise<SimulationResult> {
  const context = await loadActiveGraph();
  const graph = context.graph;

  const simulationId = crypto.randomUUID();
  const scenarioId = crypto.randomUUID();

  const reductionBySeverity: Record<Severity, number> = {
    low: 25,
    medium: 50,
    high: 75,
    critical: 100,
  };

  const event: ScenarioEvent = {
    type: input.disruptionType,
    targetId: input.target.id,
    targetKind: input.target.kind,
    ...(input.target.kind === 'node' && input.target.type
      ? { targetType: input.target.type as ScenarioEvent['targetType'] }
      : {}),
    severity: input.severity,
    durationHours: input.durationDays * 24,
    capacityReductionPercent: reductionBySeverity[input.severity],
    description: input.description || 'Hypothetical disruption scenario',
  };

  const scenario: ScenarioInput = {
    companyId: graph.companyId,
    name: `${input.disruptionType.replaceAll('_', ' ')} simulation`,
    description: input.description,
    startAt: new Date().toISOString(),
    events: [event],
  };

  const result = simulateScenario(graph, scenario, {
    simulationId,
    scenarioId,
  });

  // Demo simulations remain local and are never presented as company records.
  if (context.mode === 'demo') {
    return result;
  }

  if (!supabase || !context.userId) {
    throw new Error('Live database connection is unavailable.');
  }

  const { error: scenarioError } = await supabase.from('scenarios').insert({
    id: scenarioId,
    company_id: graph.companyId,
    created_by: context.userId,
    name: scenario.name,
    description: scenario.description ?? null,
    start_at: scenario.startAt,
    events: scenario.events,
  });

  if (scenarioError) {
    throw new Error(`Simulation ran, but the scenario could not be saved: ${scenarioError.message}`);
  }

  const { error: simulationError } = await supabase.from('simulations').insert({
    id: simulationId,
    company_id: graph.companyId,
    scenario_id: scenarioId,
    created_by: context.userId,
    status: result.status,
    simulation_mode: 'hypothetical',
    result,
  });

  if (simulationError) {
    throw new Error(
      `The scenario was saved, but its simulation result could not be saved: ${simulationError.message}`,
    );
  }

  return result;
}
