/*
  Warnings:

  - You are about to drop the column `equipamentoArId` on the `OrdemServico` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrdemServico" DROP CONSTRAINT "OrdemServico_equipamentoArId_fkey";

-- AlterTable
ALTER TABLE "HcrAirConditioning" ADD COLUMN     "arquivos" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "OrdemServico" DROP COLUMN "equipamentoArId";
