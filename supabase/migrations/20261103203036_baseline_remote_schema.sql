SET local check_function_bodies = off;

CREATE TABLE "public"."companies" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"       text                     NOT NULL,
  "created_by" uuid                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "companies_name_check" CHECK ((length(TRIM(BOTH FROM name)) > 0)),
  CONSTRAINT "companies_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."companies"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."company_members" (
  "company_id" uuid NOT NULL,
  "user_id"    uuid NOT NULL,
  CONSTRAINT "company_members_pkey" PRIMARY KEY (company_id, user_id)
);

ALTER TABLE "public"."company_members"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."graph_edges" (
  "id"         uuid NOT NULL DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL,
  "source_id"  uuid NOT NULL,
  "target_id"  uuid NOT NULL,
  CONSTRAINT "graph_edges_company_id_id_key" UNIQUE (company_id, id),
  CONSTRAINT "graph_edges_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."graph_edges"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."graph_nodes" (
  "id"         uuid NOT NULL DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL,
  CONSTRAINT "graph_nodes_company_id_id_key" UNIQUE (company_id, id),
  CONSTRAINT "graph_nodes_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."graph_nodes"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."scenarios" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "company_id"  uuid                     NOT NULL,
  "created_by"  uuid                     NOT NULL,
  "name"        text                     NOT NULL,
  "description" text,
  "start_at"    timestamp with time zone NOT NULL,
  "events"      jsonb                    NOT NULL DEFAULT '[]'::jsonb,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "scenarios_company_id_id_key" UNIQUE (company_id, id),
  CONSTRAINT "scenarios_events_check" CHECK ((jsonb_typeof(events) = 'array'::text)),
  CONSTRAINT "scenarios_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."scenarios"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."simulations" (
  "id"              uuid                     NOT NULL,
  "company_id"      uuid                     NOT NULL,
  "scenario_id"     uuid                     NOT NULL,
  "created_by"      uuid                     NOT NULL,
  "status"          text                     NOT NULL,
  "simulation_mode" text                     NOT NULL DEFAULT 'hypothetical'::text,
  "result"          jsonb                    NOT NULL,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "simulations_pkey" PRIMARY KEY (id),
  CONSTRAINT "simulations_result_check" CHECK ((jsonb_typeof(result) = 'object'::text)),
  CONSTRAINT "simulations_simulation_mode_check" CHECK ((simulation_mode = 'hypothetical'::text)),
  CONSTRAINT "simulations_status_check" CHECK ((status = ANY (ARRAY['completed'::text, 'failed'::text])))
);

ALTER TABLE "public"."simulations"
  ENABLE ROW LEVEL SECURITY;

CREATE TYPE "public"."disruption_type" AS ENUM (
  'supplier_failure',
  'flood',
  'power_outage',
  'route_closure',
  'material_shortage',
  'custom'
);

CREATE TYPE "public"."entity_type" AS ENUM (
  'supplier',
  'facility',
  'material',
  'warehouse',
  'customer'
);

ALTER TABLE "public"."graph_nodes"
  ADD COLUMN "type" public.entity_type NOT NULL;

ALTER TABLE "public"."graph_nodes"
  ADD COLUMN "name" text NOT NULL;

ALTER TABLE "public"."graph_nodes"
  ADD COLUMN "attributes" jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE "public"."graph_nodes"
  ADD COLUMN "created_at" timestamp WITH time zone NOT NULL DEFAULT now();

CREATE TYPE "public"."membership_role" AS ENUM (
  'owner',
  'admin',
  'analyst',
  'viewer'
);

ALTER TABLE "public"."company_members"
  ADD COLUMN "role" public.membership_role NOT NULL DEFAULT 'viewer'::public.membership_role;

ALTER TABLE "public"."company_members"
  ADD COLUMN "created_at" timestamp WITH time zone NOT NULL DEFAULT now();

CREATE TYPE "public"."relationship_type" AS ENUM (
  'supplies',
  'ships_to',
  'produces',
  'stores',
  'uses',
  'custom'
);

ALTER TABLE "public"."graph_edges"
  ADD COLUMN "relationship_type" public.relationship_type NOT NULL;

ALTER TABLE "public"."graph_edges"
  ADD COLUMN "capacity" numeric;

ALTER TABLE "public"."graph_edges"
  ADD COLUMN "capacity_unit" text;

ALTER TABLE "public"."graph_edges"
  ADD COLUMN "material_id" uuid;

ALTER TABLE "public"."graph_edges"
  ADD COLUMN "lead_time_days" numeric;

ALTER TABLE "public"."graph_edges"
  ADD COLUMN "attributes" jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE "public"."graph_edges"
  ADD COLUMN "created_at" timestamp WITH time zone NOT NULL DEFAULT now();

CREATE TYPE "public"."severity" AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

CREATE OR REPLACE FUNCTION public.create_company (
  p_name text
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
DECLARE
  v_user_id UUID;
  v_company_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_name IS NULL OR length(trim(p_name)) = 0 THEN
    RAISE EXCEPTION 'Company name is required';
  END IF;

  INSERT INTO public.companies (name, created_by)
  VALUES (trim(p_name), v_user_id)
  RETURNING id INTO v_company_id;

  INSERT INTO public.company_members (
    company_id, user_id, role
  )
  VALUES (
    v_company_id, v_user_id, 'owner'
  );

  RETURN v_company_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_company_role (
  p_company_id uuid,
  p_roles      public.membership_role[]
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.company_id = p_company_id
      AND cm.user_id = (SELECT auth.uid())
      AND cm.role = ANY(p_roles)
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_company_member (
  p_company_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.company_id = p_company_id
      AND cm.user_id = (SELECT auth.uid())
  );
$function$;

ALTER TABLE "public"."companies"
  ADD CONSTRAINT "companies_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE "public"."company_members"
  ADD CONSTRAINT "company_members_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE "public"."company_members"
  ADD CONSTRAINT "company_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."graph_edges"
  ADD CONSTRAINT "graph_edges_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE "public"."graph_nodes"
  ADD CONSTRAINT "graph_nodes_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE "public"."graph_edges"
  ADD CONSTRAINT "graph_edges_company_id_material_id_fkey" FOREIGN KEY (company_id, material_id) REFERENCES public.graph_nodes(company_id, id);

ALTER TABLE "public"."graph_edges"
  ADD CONSTRAINT "graph_edges_company_id_source_id_fkey" FOREIGN KEY (company_id, source_id) REFERENCES public.graph_nodes(company_id, id) ON DELETE CASCADE;

ALTER TABLE "public"."graph_edges"
  ADD CONSTRAINT "graph_edges_company_id_target_id_fkey" FOREIGN KEY (company_id, target_id) REFERENCES public.graph_nodes(company_id, id) ON DELETE CASCADE;

ALTER TABLE "public"."scenarios"
  ADD CONSTRAINT "scenarios_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE "public"."scenarios"
  ADD CONSTRAINT "scenarios_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE "public"."simulations"
  ADD CONSTRAINT "simulations_company_id_scenario_id_fkey" FOREIGN KEY (company_id, scenario_id) REFERENCES public.scenarios(company_id, id) ON DELETE CASCADE;

ALTER TABLE "public"."simulations"
  ADD CONSTRAINT "simulations_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id);

CREATE INDEX idx_company_members_user ON public.company_members USING btree (user_id);

CREATE INDEX idx_graph_edges_company ON public.graph_edges USING btree (company_id);

CREATE INDEX idx_graph_nodes_company ON public.graph_nodes USING btree (company_id);

CREATE INDEX idx_scenarios_company ON public.scenarios USING btree (company_id);

CREATE INDEX idx_simulations_company ON public.simulations USING btree (company_id);

CREATE INDEX idx_simulations_scenario ON public.simulations USING btree (scenario_id);

CREATE POLICY "Members can view their companies" ON "public"."companies"
  FOR SELECT
  TO "authenticated"
  USING (public.is_company_member(id));

CREATE POLICY "Owners and admins can update companies" ON "public"."companies"
  FOR UPDATE
  TO "authenticated"
  USING (public.has_company_role(id, ARRAY['owner'::public.membership_role, 'admin'::public.membership_role]))
  WITH CHECK (public.has_company_role(id, ARRAY['owner'::public.membership_role, 'admin'::public.membership_role]));

CREATE POLICY "Members can view company membership" ON "public"."company_members"
  FOR SELECT
  TO "authenticated"
  USING (public.is_company_member(company_id));

CREATE POLICY "Analysts can delete graph edges" ON "public"."graph_edges"
  FOR DELETE
  TO "authenticated"
  USING (public.has_company_role(company_id, ARRAY['owner'::public.membership_role, 'admin'::public.membership_role, 'analyst'::public.membership_role]));

CREATE POLICY "Analysts can insert graph edges" ON "public"."graph_edges"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (public.has_company_role(company_id, ARRAY['owner'::public.membership_role, 'admin'::public.membership_role, 'analyst'::public.membership_role]));

CREATE POLICY "Analysts can update graph edges" ON "public"."graph_edges"
  FOR UPDATE
  TO "authenticated"
  USING (public.has_company_role(company_id, ARRAY['owner'::public.membership_role, 'admin'::public.membership_role, 'analyst'::public.membership_role]))
  WITH CHECK (public.has_company_role(company_id, ARRAY['owner'::public.membership_role, 'admin'::public.membership_role, 'analyst'::public.membership_role]));

CREATE POLICY "Members can view graph edges" ON "public"."graph_edges"
  FOR SELECT
  TO "authenticated"
  USING (public.is_company_member(company_id));

CREATE POLICY "Analysts can delete graph nodes" ON "public"."graph_nodes"
  FOR DELETE
  TO "authenticated"
  USING (public.has_company_role(company_id, ARRAY['owner'::public.membership_role, 'admin'::public.membership_role, 'analyst'::public.membership_role]));

CREATE POLICY "Analysts can insert graph nodes" ON "public"."graph_nodes"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (public.has_company_role(company_id, ARRAY['owner'::public.membership_role, 'admin'::public.membership_role, 'analyst'::public.membership_role]));

CREATE POLICY "Analysts can update graph nodes" ON "public"."graph_nodes"
  FOR UPDATE
  TO "authenticated"
  USING (public.has_company_role(company_id, ARRAY['owner'::public.membership_role, 'admin'::public.membership_role, 'analyst'::public.membership_role]))
  WITH CHECK (public.has_company_role(company_id, ARRAY['owner'::public.membership_role, 'admin'::public.membership_role, 'analyst'::public.membership_role]));

CREATE POLICY "Members can view graph nodes" ON "public"."graph_nodes"
  FOR SELECT
  TO "authenticated"
  USING (public.is_company_member(company_id));

CREATE POLICY "Analysts can create scenarios" ON "public"."scenarios"
  FOR INSERT
  TO "authenticated"
  WITH
    CHECK
    (((created_by = ( SELECT auth.uid() AS uid)) AND public.has_company_role(company_id, ARRAY['owner'::public.membership_role, 'admin'::public.membership_role,
    'analyst'::public.membership_role])));

CREATE POLICY "Analysts can delete scenarios" ON "public"."scenarios"
  FOR DELETE
  TO "authenticated"
  USING (public.has_company_role(company_id, ARRAY['owner'::public.membership_role, 'admin'::public.membership_role, 'analyst'::public.membership_role]));

CREATE POLICY "Analysts can update scenarios" ON "public"."scenarios"
  FOR UPDATE
  TO "authenticated"
  USING (public.has_company_role(company_id, ARRAY['owner'::public.membership_role, 'admin'::public.membership_role, 'analyst'::public.membership_role]))
  WITH CHECK (public.has_company_role(company_id, ARRAY['owner'::public.membership_role, 'admin'::public.membership_role, 'analyst'::public.membership_role]));

CREATE POLICY "Members can view scenarios" ON "public"."scenarios"
  FOR SELECT
  TO "authenticated"
  USING (public.is_company_member(company_id));

CREATE POLICY "Analysts can create simulations" ON "public"."simulations"
  FOR INSERT
  TO "authenticated"
  WITH
    CHECK
    (((created_by = ( SELECT auth.uid() AS uid)) AND public.has_company_role(company_id, ARRAY['owner'::public.membership_role, 'admin'::public.membership_role,
    'analyst'::public.membership_role])));

CREATE POLICY "Members can view simulations" ON "public"."simulations"
  FOR SELECT
  TO "authenticated"
  USING (public.is_company_member(company_id));

REVOKE ALL ON FUNCTION "public"."create_company"(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."create_company"(text) TO "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."create_company"(text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."create_company"(text) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."create_company"(text) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."has_company_role"(uuid, public.membership_role[]) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."has_company_role"(uuid, public.membership_role[]) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."has_company_role"(uuid, public.membership_role[]) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."has_company_role"(uuid, public.membership_role[]) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."is_company_member"(uuid) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."is_company_member"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_company_member"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_company_member"(uuid) TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."companies" TO "anon";

REVOKE ALL ("name") ON TABLE "public"."companies" FROM "authenticated";

GRANT UPDATE ("name") ON TABLE "public"."companies" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."companies" TO "authenticated";

REVOKE ALL ON TABLE "public"."companies" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."companies" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."companies" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."company_members" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."company_members" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."company_members" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."company_members" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."graph_edges" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."graph_edges" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."graph_edges" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."graph_edges" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."graph_nodes" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."graph_nodes" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."graph_nodes" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."graph_nodes" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."scenarios" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."scenarios" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."scenarios" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."scenarios" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."simulations" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."simulations" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."simulations" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."simulations" TO "service_role";
