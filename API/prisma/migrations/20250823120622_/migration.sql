/*
  Warnings:

  - You are about to drop the `Capacitação` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CapacitaçãoParticipante` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Capacitação" DROP CONSTRAINT "Capacitação_tipoDocumentoId_fkey";

-- DropForeignKey
ALTER TABLE "CapacitaçãoParticipante" DROP CONSTRAINT "CapacitaçãoParticipante_capacitacaoId_fkey";

-- DropForeignKey
ALTER TABLE "CapacitaçãoParticipante" DROP CONSTRAINT "CapacitaçãoParticipante_funcionarioId_fkey";

-- DropTable
DROP TABLE "Capacitação";

-- DropTable
DROP TABLE "CapacitaçãoParticipante";

-- CreateTable
CREATE TABLE "Modulo" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "Modulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioModulo" (
    "usuarioId" INTEGER NOT NULL,
    "moduloId" INTEGER NOT NULL,
    "dataVinculo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UsuarioModulo_pkey" PRIMARY KEY ("usuarioId","moduloId")
);

-- CreateTable
CREATE TABLE "Capacitacao" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "local" TEXT,
    "instrutor" TEXT,
    "tipoDocumentoId" INTEGER NOT NULL,
    "arquivoPdf" TEXT,
    "arquivoAssinado" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Capacitacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapacitacaoParticipante" (
    "id" SERIAL NOT NULL,
    "capacitacaoId" INTEGER NOT NULL,
    "funcionarioId" INTEGER NOT NULL,
    "assinaturaStatus" TEXT NOT NULL DEFAULT 'pendente',
    "assinaturaData" TIMESTAMP(3),

    CONSTRAINT "CapacitacaoParticipante_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Modulo_nome_key" ON "Modulo"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "CapacitacaoParticipante_capacitacaoId_funcionarioId_key" ON "CapacitacaoParticipante"("capacitacaoId", "funcionarioId");

-- AddForeignKey
ALTER TABLE "UsuarioModulo" ADD CONSTRAINT "UsuarioModulo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioModulo" ADD CONSTRAINT "UsuarioModulo_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "Modulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Capacitacao" ADD CONSTRAINT "Capacitacao_tipoDocumentoId_fkey" FOREIGN KEY ("tipoDocumentoId") REFERENCES "TipoDocumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapacitacaoParticipante" ADD CONSTRAINT "CapacitacaoParticipante_capacitacaoId_fkey" FOREIGN KEY ("capacitacaoId") REFERENCES "Capacitacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapacitacaoParticipante" ADD CONSTRAINT "CapacitacaoParticipante_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "Funcionario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
