-- CreateTable
CREATE TABLE "Funcionario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "cargo" TEXT,
    "setor" TEXT,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Funcionario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoDocumento" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoDocumento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Capacitação" (
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

    CONSTRAINT "Capacitação_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapacitaçãoParticipante" (
    "id" SERIAL NOT NULL,
    "capacitacaoId" INTEGER NOT NULL,
    "funcionarioId" INTEGER NOT NULL,
    "assinaturaStatus" TEXT NOT NULL DEFAULT 'pendente',
    "assinaturaData" TIMESTAMP(3),

    CONSTRAINT "CapacitaçãoParticipante_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Funcionario_cpf_key" ON "Funcionario"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Funcionario_email_key" ON "Funcionario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TipoDocumento_nome_key" ON "TipoDocumento"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "CapacitaçãoParticipante_capacitacaoId_funcionarioId_key" ON "CapacitaçãoParticipante"("capacitacaoId", "funcionarioId");

-- AddForeignKey
ALTER TABLE "Capacitação" ADD CONSTRAINT "Capacitação_tipoDocumentoId_fkey" FOREIGN KEY ("tipoDocumentoId") REFERENCES "TipoDocumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapacitaçãoParticipante" ADD CONSTRAINT "CapacitaçãoParticipante_capacitacaoId_fkey" FOREIGN KEY ("capacitacaoId") REFERENCES "Capacitação"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapacitaçãoParticipante" ADD CONSTRAINT "CapacitaçãoParticipante_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "Funcionario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
