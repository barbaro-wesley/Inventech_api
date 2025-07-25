-- CreateEnum
CREATE TYPE "Prioridade" AS ENUM ('BAIXO', 'MEDIO', 'ALTO', 'URGENTE');

-- CreateEnum
CREATE TYPE "StatusChamado" AS ENUM ('ABERTO', 'EM_ANDAMENTO', 'FECHADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "Chamado" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Aberto',
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFinalizacao" TIMESTAMP(3),
    "prioridade" "Prioridade" NOT NULL DEFAULT 'MEDIO',
    "SistemaId" INTEGER,

    CONSTRAINT "Chamado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sistema" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Sistema_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chamado_numero_key" ON "Chamado"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Sistema_nome_key" ON "Sistema"("nome");

-- AddForeignKey
ALTER TABLE "Chamado" ADD CONSTRAINT "Chamado_SistemaId_fkey" FOREIGN KEY ("SistemaId") REFERENCES "Sistema"("id") ON DELETE SET NULL ON UPDATE CASCADE;
