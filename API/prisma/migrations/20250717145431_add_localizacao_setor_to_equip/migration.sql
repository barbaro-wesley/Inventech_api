/*
  Warnings:

  - Added the required column `tipoEquipamentoId` to the `HcrEquipamentosMedicos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HcrEquipamentosMedicos" ADD COLUMN     "tipoEquipamentoId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "HcrEquipamentosMedicos" ADD CONSTRAINT "HcrEquipamentosMedicos_tipoEquipamentoId_fkey" FOREIGN KEY ("tipoEquipamentoId") REFERENCES "TipoEquipamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
