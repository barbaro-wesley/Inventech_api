-- AddForeignKey
ALTER TABLE "OrdemServico" ADD CONSTRAINT "OrdemServico_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "HcrEquipamentosMedicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
