-- CreateTable
CREATE TABLE "HcrEquipamentosMedicos" (
    "id" SERIAL NOT NULL,
    "numeroPatrimonio" TEXT NOT NULL,
    "numeroSerie" TEXT,
    "numeroAnvisa" TEXT,
    "nomeEquipamento" TEXT NOT NULL,
    "modelo" TEXT,
    "valorCompra" DOUBLE PRECISION,
    "dataCompra" TIMESTAMP(3),
    "inicioGarantia" TIMESTAMP(3),
    "terminoGarantia" TIMESTAMP(3),
    "notaFiscal" TEXT,
    "obs" TEXT,
    "setorId" INTEGER NOT NULL,
    "localizacaoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HcrEquipamentosMedicos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HcrEquipamentosMedicos" ADD CONSTRAINT "HcrEquipamentosMedicos_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrEquipamentosMedicos" ADD CONSTRAINT "HcrEquipamentosMedicos_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "Localizacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
