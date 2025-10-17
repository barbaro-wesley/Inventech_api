/*
  Warnings:

  - You are about to drop the column `Identificação` on the `HcrEquipamentosMedicos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HcrEquipamentosMedicos" DROP COLUMN "Identificação",
ADD COLUMN     "Identificacao" TEXT;
