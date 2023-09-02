-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('AVAILABLE', 'PARTIAL_AVAILABLE', 'UNAVAILABLE', 'NOT_APPLICABLE', 'UNKNOWN');

-- CreateTable
CREATE TABLE "Pos" (
    "id" TEXT NOT NULL,
    "nationalStoreNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "mcFlurryCount" INTEGER NOT NULL DEFAULT 0,
    "mcFlurryError" INTEGER NOT NULL DEFAULT 0,
    "mcFlurryStatus" "ItemStatus" NOT NULL DEFAULT 'UNKNOWN',
    "mcSundaeCount" INTEGER NOT NULL DEFAULT 0,
    "mcSundaeError" INTEGER NOT NULL DEFAULT 0,
    "mcSundaeStatus" "ItemStatus" NOT NULL DEFAULT 'UNKNOWN',
    "milkshakeCount" INTEGER NOT NULL DEFAULT 0,
    "milkshakeError" INTEGER NOT NULL DEFAULT 0,
    "milkshakeStatus" "ItemStatus" NOT NULL DEFAULT 'UNKNOWN',
    "customItems" JSONB NOT NULL DEFAULT '[]',
    "hasMobileOrdering" BOOLEAN NOT NULL DEFAULT false,
    "lastChecked" TIMESTAMP(3),
    "country" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stats" (
    "id" UUID NOT NULL,
    "country" TEXT NOT NULL,
    "totalMcd" INTEGER NOT NULL,
    "availableMilkshakes" INTEGER NOT NULL,
    "trackableMilkshakes" INTEGER NOT NULL,
    "availableMcFlurry" INTEGER NOT NULL,
    "trackableMcFlurry" INTEGER NOT NULL,
    "availableMcSundae" INTEGER NOT NULL,
    "trackableMcSundae" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Pos_country_idx" ON "Pos" USING HASH ("country");

-- CreateIndex
CREATE INDEX "Pos_country_hasMobileOrdering_idx" ON "Pos"("country", "hasMobileOrdering");
