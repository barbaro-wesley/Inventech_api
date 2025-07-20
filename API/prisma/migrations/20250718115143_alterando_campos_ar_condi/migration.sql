/*
  Warnings:

  - Added the required column `BTUS` to the `HcrAirConditioning` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "HcrAirConditioning" DROP CONSTRAINT "HcrAirConditioning_localizacaoId_fkey";

-- DropForeignKey
ALTER TABLE "HcrAirConditioning" DROP CONSTRAINT "HcrAirConditioning_setorId_fkey";

-- DropForeignKey
ALTER TABLE "HcrAirConditioning" DROP CONSTRAINT "HcrAirConditioning_tipoEquipamentoId_fkey";

-- AlterTable
ALTER TABLE "HcrAirConditioning" ADD COLUMN     "BTUS" TEXT NOT NULL,
ALTER COLUMN "tipoEquipamentoId" DROP NOT NULL,
ALTER COLUMN "localizacaoId" DROP NOT NULL,
ALTER COLUMN "setorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "HcrAirConditioning" ADD CONSTRAINT "HcrAirConditioning_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrAirConditioning" ADD CONSTRAINT "HcrAirConditioning_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "Localizacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrAirConditioning" ADD CONSTRAINT "HcrAirConditioning_tipoEquipamentoId_fkey" FOREIGN KEY ("tipoEquipamentoId") REFERENCES "TipoEquipamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
