/*
  Warnings:

  - You are about to drop the column `Fabricante` on the `HcrEquipamentosMedicos` table. All the data in the column will be lost.
  - You are about to drop the column `Identificacao` on the `HcrEquipamentosMedicos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HcrEquipamentosMedicos" DROP COLUMN "Fabricante",
DROP COLUMN "Identificacao",
ADD COLUMN     "fabricante" TEXT,
ADD COLUMN     "identificacao" TEXT;
