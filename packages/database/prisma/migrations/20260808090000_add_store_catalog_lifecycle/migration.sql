-- Track independent Store Catalog observations separately from availability polling.
ALTER TABLE "Pos"
ADD COLUMN "lastCatalogSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "lastCatalogSeenCycle" TEXT,
ADD COLUMN "missingCatalogCycles" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lastMissingCatalogCycle" TEXT,
ADD COLUMN "closedAt" TIMESTAMP(3);

CREATE TABLE "CatalogRefreshCycle" (
    "cycleId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "finalizedAt" TIMESTAMP(3),
    "reconciliationSkipped" BOOLEAN NOT NULL DEFAULT false,
    "knownStoreCount" INTEGER,
    "observedStoreCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogRefreshCycle_pkey" PRIMARY KEY ("cycleId", "country")
);

CREATE TABLE "CatalogRefreshScope" (
    "cycleId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "discoveredStoreCount" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogRefreshScope_pkey" PRIMARY KEY ("cycleId", "country", "scope")
);

CREATE INDEX "Pos_country_closedAt_idx" ON "Pos"("country", "closedAt");
CREATE INDEX "Pos_lastCatalogSeenCycle_idx" ON "Pos"("lastCatalogSeenCycle");
CREATE INDEX "Pos_closedAt_idx" ON "Pos"("closedAt");
CREATE INDEX "CatalogRefreshCycle_country_finalizedAt_idx" ON "CatalogRefreshCycle"("country", "finalizedAt");

ALTER TABLE "CatalogRefreshScope"
ADD CONSTRAINT "CatalogRefreshScope_cycleId_country_fkey"
FOREIGN KEY ("cycleId", "country")
REFERENCES "CatalogRefreshCycle"("cycleId", "country")
ON DELETE CASCADE ON UPDATE CASCADE;
