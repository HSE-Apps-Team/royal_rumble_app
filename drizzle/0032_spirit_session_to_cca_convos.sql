-- Rename "SPIRIT SESSION" job/data to "CCA CONVOS" and update associated site content key
UPDATE "mentor_data" SET "job" = 'CCA CONVOS' WHERE "job" = 'SPIRIT SESSION';
UPDATE "events_data" SET "job" = 'CCA CONVOS' WHERE "job" = 'SPIRIT SESSION';
UPDATE "site_content" SET "key" = 'cca_convos_more_details' WHERE "key" = 'spirit_session_more_details';
