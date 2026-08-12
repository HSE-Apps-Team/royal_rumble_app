-- Manageable job catalog for mentor roles. Ambassador and Hallway Host are
-- marked protected (cannot be deleted, only renamed) since they have
-- dedicated group/hallway assignment logic and tables. The remaining
-- non-utility jobs (Utility Squad, CCA Convos, and any added later) support
-- full add/rename/delete from the admin "Manage Jobs" page.
CREATE TABLE "job_data" (
  "job_id" serial PRIMARY KEY,
  "slug" varchar(100) NOT NULL UNIQUE,
  "db_job" text NOT NULL UNIQUE,
  "label" text NOT NULL,
  "content_key" varchar(100) NOT NULL UNIQUE,
  "is_protected" boolean NOT NULL DEFAULT false,
  "is_non_utility" boolean NOT NULL DEFAULT true
);
--> statement-breakpoint
INSERT INTO "job_data" ("slug", "db_job", "label", "content_key", "is_protected", "is_non_utility") VALUES
  ('ambassador', 'AMBASSADOR', 'Ambassador', 'ambassador_more_details', true, false),
  ('hallway_host', 'HALLWAY HOST', 'Hallway Host', 'hallway_host_more_details', true, true),
  ('utility_squad', 'UTILITY SQUAD', 'Utility Squad', 'utility_squad_more_details', false, true),
  ('cca_convos', 'CCA CONVOS', 'CCA Convos', 'cca_convos_more_details', false, true);
