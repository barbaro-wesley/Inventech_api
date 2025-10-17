-- CreateTable
CREATE TABLE "public"."AcompanhamentoOS" (
    "id" SERIAL NOT NULL,
    "ordemServicoId" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "criadoPorId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcompanhamentoOS_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."AcompanhamentoOS" ADD CONSTRAINT "AcompanhamentoOS_ordemServicoId_fkey" FOREIGN KEY ("ordemServicoId") REFERENCES "public"."OrdemServico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AcompanhamentoOS" ADD CONSTRAINT "AcompanhamentoOS_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
