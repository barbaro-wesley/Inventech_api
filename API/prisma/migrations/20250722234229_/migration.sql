-- CreateEnum
CREATE TYPE "PapelUsuario" AS ENUM ('admin', 'cadastro', 'tecnico', 'visualizador', 'usuario_comum');

-- CreateEnum
CREATE TYPE "StatusOS" AS ENUM ('ABERTA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA');

-- CreateTable
CREATE TABLE "Setor" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Setor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Localizacao" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "setorId" INTEGER,

    CONSTRAINT "Localizacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "papel" "PapelUsuario" NOT NULL,
    "tecnicoId" INTEGER,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrupoManutencao" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "GrupoManutencao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoEquipamento" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "grupoId" INTEGER,

    CONSTRAINT "TipoEquipamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tecnico" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "cpf" TEXT,
    "matricula" TEXT,
    "admissao" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "telegramChatId" TEXT,
    "grupoId" INTEGER NOT NULL,

    CONSTRAINT "Tecnico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdemServico" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipoEquipamentoId" INTEGER NOT NULL,
    "equipamentoId" INTEGER NOT NULL,
    "tecnicoId" INTEGER,
    "solicitanteId" INTEGER NOT NULL,
    "status" "StatusOS" NOT NULL DEFAULT 'ABERTA',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizadoEm" TIMESTAMP(3),
    "resolucao" TEXT,
    "arquivos" TEXT[],
    "preventiva" BOOLEAN NOT NULL DEFAULT false,
    "setorId" INTEGER,

    CONSTRAINT "OrdemServico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HcrComputer" (
    "id" SERIAL NOT NULL,
    "nPatrimonio" TEXT NOT NULL,
    "nomePC" TEXT NOT NULL,
    "ip" TEXT,
    "sistemaOperacional" TEXT NOT NULL,
    "setorId" INTEGER NOT NULL,
    "localizacaoId" INTEGER NOT NULL,
    "tipoEquipamentoId" INTEGER NOT NULL,

    CONSTRAINT "HcrComputer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HcrPrinter" (
    "id" SERIAL NOT NULL,
    "nPatrimonio" TEXT NOT NULL,
    "ip" TEXT,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "setorId" INTEGER NOT NULL,
    "localizacaoId" INTEGER NOT NULL,
    "tipoEquipamentoId" INTEGER NOT NULL,

    CONSTRAINT "HcrPrinter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HcrAirConditioning" (
    "id" SERIAL NOT NULL,
    "nPatrimonio" TEXT NOT NULL,
    "nControle" TEXT NOT NULL,
    "numeroSerie" TEXT,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "BTUS" TEXT NOT NULL,
    "obs" TEXT,
    "setorId" INTEGER,
    "localizacaoId" INTEGER,
    "tipoEquipamentoId" INTEGER,

    CONSTRAINT "HcrAirConditioning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HcrMobilia" (
    "id" SERIAL NOT NULL,
    "nPatrimonio" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "setorId" INTEGER NOT NULL,
    "localizacaoId" INTEGER NOT NULL,
    "obs" TEXT,
    "tipoEquipamentoId" INTEGER NOT NULL,

    CONSTRAINT "HcrMobilia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HcrEquipamentosMedicos" (
    "id" SERIAL NOT NULL,
    "numeroPatrimonio" TEXT,
    "Identificação" TEXT,
    "numeroSerie" TEXT,
    "numeroAnvisa" TEXT,
    "nomeEquipamento" TEXT NOT NULL,
    "modelo" TEXT,
    "Fabricante" TEXT,
    "valorCompra" DOUBLE PRECISION,
    "dataCompra" TIMESTAMP(3),
    "inicioGarantia" TIMESTAMP(3),
    "terminoGarantia" TIMESTAMP(3),
    "notaFiscal" TEXT,
    "obs" TEXT,
    "setorId" INTEGER,
    "localizacaoId" INTEGER,
    "tipoEquipamentoId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "HcrEquipamentosMedicos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Setor_nome_key" ON "Setor"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Localizacao_nome_key" ON "Localizacao"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TipoEquipamento_nome_key" ON "TipoEquipamento"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Tecnico_email_key" ON "Tecnico"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tecnico_cpf_key" ON "Tecnico"("cpf");

-- AddForeignKey
ALTER TABLE "Localizacao" ADD CONSTRAINT "Localizacao_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "Tecnico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipoEquipamento" ADD CONSTRAINT "TipoEquipamento_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "GrupoManutencao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tecnico" ADD CONSTRAINT "Tecnico_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "GrupoManutencao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemServico" ADD CONSTRAINT "OrdemServico_tipoEquipamentoId_fkey" FOREIGN KEY ("tipoEquipamentoId") REFERENCES "TipoEquipamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemServico" ADD CONSTRAINT "OrdemServico_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "Tecnico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemServico" ADD CONSTRAINT "OrdemServico_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemServico" ADD CONSTRAINT "OrdemServico_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrComputer" ADD CONSTRAINT "HcrComputer_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrComputer" ADD CONSTRAINT "HcrComputer_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "Localizacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrComputer" ADD CONSTRAINT "HcrComputer_tipoEquipamentoId_fkey" FOREIGN KEY ("tipoEquipamentoId") REFERENCES "TipoEquipamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrPrinter" ADD CONSTRAINT "HcrPrinter_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrPrinter" ADD CONSTRAINT "HcrPrinter_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "Localizacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrPrinter" ADD CONSTRAINT "HcrPrinter_tipoEquipamentoId_fkey" FOREIGN KEY ("tipoEquipamentoId") REFERENCES "TipoEquipamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrAirConditioning" ADD CONSTRAINT "HcrAirConditioning_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrAirConditioning" ADD CONSTRAINT "HcrAirConditioning_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "Localizacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrAirConditioning" ADD CONSTRAINT "HcrAirConditioning_tipoEquipamentoId_fkey" FOREIGN KEY ("tipoEquipamentoId") REFERENCES "TipoEquipamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrMobilia" ADD CONSTRAINT "HcrMobilia_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrMobilia" ADD CONSTRAINT "HcrMobilia_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "Localizacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrMobilia" ADD CONSTRAINT "HcrMobilia_tipoEquipamentoId_fkey" FOREIGN KEY ("tipoEquipamentoId") REFERENCES "TipoEquipamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrEquipamentosMedicos" ADD CONSTRAINT "HcrEquipamentosMedicos_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrEquipamentosMedicos" ADD CONSTRAINT "HcrEquipamentosMedicos_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "Localizacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrEquipamentosMedicos" ADD CONSTRAINT "HcrEquipamentosMedicos_tipoEquipamentoId_fkey" FOREIGN KEY ("tipoEquipamentoId") REFERENCES "TipoEquipamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
