/*
  Warnings:

  - Made the column `nPatrimonio` on table `HcrAirConditioning` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nControle` on table `HcrAirConditioning` required. This step will fail if there are existing NULL values in that column.
  - Made the column `modelo` on table `HcrAirConditioning` required. This step will fail if there are existing NULL values in that column.
  - Made the column `numeroSerie` on table `HcrAirConditioning` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "HcrAirConditioning" ALTER COLUMN "nPatrimonio" SET NOT NULL,
ALTER COLUMN "nControle" SET NOT NULL,
ALTER COLUMN "modelo" SET NOT NULL,
ALTER COLUMN "numeroSerie" SET NOT NULL;
