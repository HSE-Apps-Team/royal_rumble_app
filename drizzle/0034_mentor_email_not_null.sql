-- Mentor email is required (mentors always have an @hsestudents.org address),
-- unlike freshmen where email is genuinely optional on some rosters.
ALTER TABLE "mentor_data" ALTER COLUMN "email" SET NOT NULL;
