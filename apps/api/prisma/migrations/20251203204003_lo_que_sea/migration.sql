/*
  Warnings:

  - You are about to drop the column `sensorId` on the `Maintenance` table. All the data in the column will be lost.
  - You are about to drop the column `metricsConfig` on the `Sensor` table. All the data in the column will be lost.
  - Added the required column `ingenioId` to the `Failure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `machineId` to the `Failure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `severity` to the `Failure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ingenioId` to the `Maintenance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `machineId` to the `Maintenance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Maintenance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ingenioId` to the `Sensor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `machineId` to the `Sensor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPERADMIN', 'ADMIN', 'TECNICO', 'LECTOR');

-- DropForeignKey
ALTER TABLE "Failure" DROP CONSTRAINT "Failure_sensorId_fkey";

-- DropForeignKey
ALTER TABLE "Maintenance" DROP CONSTRAINT "Maintenance_sensorId_fkey";

-- AlterTable
ALTER TABLE "Failure" ADD COLUMN     "ingenioId" INTEGER NOT NULL,
ADD COLUMN     "machineId" INTEGER NOT NULL,
ADD COLUMN     "maintenanceId" INTEGER,
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "severity" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pendiente',
ALTER COLUMN "sensorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Maintenance" DROP COLUMN "sensorId",
ADD COLUMN     "cost" DOUBLE PRECISION,
ADD COLUMN     "durationMinutes" INTEGER,
ADD COLUMN     "ingenioId" INTEGER NOT NULL,
ADD COLUMN     "machineId" INTEGER NOT NULL,
ADD COLUMN     "technicianId" INTEGER,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Sensor" DROP COLUMN "metricsConfig",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "config" JSONB,
ADD COLUMN     "ingenioId" INTEGER NOT NULL,
ADD COLUMN     "lastSeen" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "machineId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "ingenioId" INTEGER,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL;

-- CreateTable
CREATE TABLE "Ingenio" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "location" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingenio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Machine" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT,
    "location" TEXT,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastAnalysis" JSONB,
    "lastAnalyzedAt" TIMESTAMP(3),
    "ingenioId" INTEGER NOT NULL,

    CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MachineHourlyKPI" (
    "id" BIGSERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "machineId" INTEGER NOT NULL,
    "availability" DECIMAL(5,2) NOT NULL,
    "performance" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "quality" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "oee" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "processMetrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MachineHourlyKPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngenioHourlyKPI" (
    "id" BIGSERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "ingenioId" INTEGER NOT NULL,
    "availability" DECIMAL(5,2) NOT NULL,
    "oee" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "totals" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngenioHourlyKPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Technician" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "ingenioId" INTEGER NOT NULL,

    CONSTRAINT "Technician_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" SERIAL NOT NULL,
    "sensorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB NOT NULL,
    "summary" TEXT,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" BIGSERIAL NOT NULL,
    "userId" INTEGER,
    "ingenioId" INTEGER,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" INTEGER,
    "ip" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ingenio_code_key" ON "Ingenio"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Machine_code_key" ON "Machine"("code");

-- CreateIndex
CREATE INDEX "MachineHourlyKPI_machineId_timestamp_idx" ON "MachineHourlyKPI"("machineId", "timestamp");

-- CreateIndex
CREATE INDEX "MachineHourlyKPI_timestamp_idx" ON "MachineHourlyKPI"("timestamp");

-- CreateIndex
CREATE INDEX "IngenioHourlyKPI_ingenioId_timestamp_idx" ON "IngenioHourlyKPI"("ingenioId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Technician_email_key" ON "Technician"("email");

-- AddForeignKey
ALTER TABLE "Machine" ADD CONSTRAINT "Machine_ingenioId_fkey" FOREIGN KEY ("ingenioId") REFERENCES "Ingenio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineHourlyKPI" ADD CONSTRAINT "MachineHourlyKPI_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngenioHourlyKPI" ADD CONSTRAINT "IngenioHourlyKPI_ingenioId_fkey" FOREIGN KEY ("ingenioId") REFERENCES "Ingenio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sensor" ADD CONSTRAINT "Sensor_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sensor" ADD CONSTRAINT "Sensor_ingenioId_fkey" FOREIGN KEY ("ingenioId") REFERENCES "Ingenio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Technician" ADD CONSTRAINT "Technician_ingenioId_fkey" FOREIGN KEY ("ingenioId") REFERENCES "Ingenio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Failure" ADD CONSTRAINT "Failure_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Failure" ADD CONSTRAINT "Failure_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "Sensor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Failure" ADD CONSTRAINT "Failure_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "Maintenance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Failure" ADD CONSTRAINT "Failure_ingenioId_fkey" FOREIGN KEY ("ingenioId") REFERENCES "Ingenio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_ingenioId_fkey" FOREIGN KEY ("ingenioId") REFERENCES "Ingenio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "Sensor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_ingenioId_fkey" FOREIGN KEY ("ingenioId") REFERENCES "Ingenio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_ingenioId_fkey" FOREIGN KEY ("ingenioId") REFERENCES "Ingenio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
