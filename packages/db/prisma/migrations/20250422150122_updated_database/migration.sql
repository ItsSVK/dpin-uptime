-- CreateEnum
CREATE TYPE "WebsiteStatus" AS ENUM ('ONLINE', 'OFFLINE', 'DEGRADED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('Pending', 'Success', 'Failure');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Website" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "status" "WebsiteStatus" NOT NULL DEFAULT 'UNKNOWN',
    "upSince" TIMESTAMP(3),
    "lastCheckedAt" TIMESTAMP(3),
    "checkFrequency" INTEGER NOT NULL DEFAULT 60,
    "isPaused" BOOLEAN NOT NULL DEFAULT false,
    "monitoringSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uptimePercentage" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "averageResponse" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Website_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Validator" (
    "id" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "ip" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "pendingPayouts" INTEGER NOT NULL DEFAULT 0,
    "processingPayout" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Validator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsiteTick" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "validatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "WebsiteStatus" NOT NULL,
    "nameLookup" DOUBLE PRECISION,
    "connection" DOUBLE PRECISION,
    "tlsHandshake" DOUBLE PRECISION,
    "dataTransfer" DOUBLE PRECISION,
    "ttfb" DOUBLE PRECISION,
    "total" DOUBLE PRECISION,
    "error" TEXT,

    CONSTRAINT "WebsiteTick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'Pending',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "instructionData" JSONB NOT NULL,
    "validatorId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WebsiteTick" ADD CONSTRAINT "WebsiteTick_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebsiteTick" ADD CONSTRAINT "WebsiteTick_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "Validator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "Validator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
