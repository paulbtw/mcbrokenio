-- Add columns introduced by API health monitoring to keep Pos rows in sync
-- with the Prisma schema and generated client.
ALTER TABLE "Pos"
ADD COLUMN "errorCounter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "isResponsive" BOOLEAN NOT NULL DEFAULT true;
