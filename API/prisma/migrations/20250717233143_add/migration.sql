/*
  Warnings:

  - Added the required column `BTUS` to the `HcrAirConditioning` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HcrAirConditioning" ADD COLUMN     "BTUS" TEXT NOT NULL;
