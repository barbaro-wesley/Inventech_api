-- CreateTable
CREATE TABLE "GestaoSoftware" (
    "id" SERIAL NOT NULL,
    "equipamentoId" INTEGER NOT NULL,
    "software" TEXT NOT NULL,
    "versao" TEXT NOT NULL,
    "dataInstalacao" TIMESTAMP(3) NOT NULL,
    "responsavel" TEXT NOT NULL,
    "licencaSerial" TEXT NOT NULL,
    "statusLicenca" TEXT NOT NULL,
    "dataExpiracao" TIMESTAMP(3) NOT NULL,
    "motivoInstalacao" TEXT NOT NULL,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GestaoSoftware_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GestaoSoftware_equipamentoId_key" ON "GestaoSoftware"("equipamentoId");

-- AddForeignKey
ALTER TABLE "GestaoSoftware" ADD CONSTRAINT "GestaoSoftware_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "HcrEquipamentosMedicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
