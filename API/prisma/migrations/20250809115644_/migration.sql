-- AlterTable
ALTER TABLE "OrdemServico" ADD COLUMN     "equipamentoArId" INTEGER;

-- AddForeignKey
ALTER TABLE "OrdemServico" ADD CONSTRAINT "OrdemServico_equipamentoArId_fkey" FOREIGN KEY ("equipamentoArId") REFERENCES "HcrAirConditioning"("id") ON DELETE SET NULL ON UPDATE CASCADE;
