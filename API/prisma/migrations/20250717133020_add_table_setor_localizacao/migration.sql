/*
  Warnings:

  - You are about to drop the column `localizacao` on the `HcrAirConditioning` table. All the data in the column will be lost.
  - You are about to drop the column `setor` on the `HcrAirConditioning` table. All the data in the column will be lost.
  - You are about to drop the column `localizacao` on the `HcrComputer` table. All the data in the column will be lost.
  - You are about to drop the column `setor` on the `HcrComputer` table. All the data in the column will be lost.
  - You are about to drop the column `localizacao` on the `HcrMobilia` table. All the data in the column will be lost.
  - You are about to drop the column `setor` on the `HcrMobilia` table. All the data in the column will be lost.
  - You are about to drop the column `localizacao` on the `HcrPrinter` table. All the data in the column will be lost.
  - You are about to drop the column `setor` on the `HcrPrinter` table. All the data in the column will be lost.
  - Added the required column `localizacaoId` to the `HcrAirConditioning` table without a default value. This is not possible if the table is not empty.
  - Added the required column `setorId` to the `HcrAirConditioning` table without a default value. This is not possible if the table is not empty.
  - Added the required column `localizacaoId` to the `HcrComputer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `setorId` to the `HcrComputer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `localizacaoId` to the `HcrMobilia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `setorId` to the `HcrMobilia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `localizacaoId` to the `HcrPrinter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `setorId` to the `HcrPrinter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HcrAirConditioning" DROP COLUMN "localizacao",
DROP COLUMN "setor",
ADD COLUMN     "localizacaoId" INTEGER NOT NULL,
ADD COLUMN     "setorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "HcrComputer" DROP COLUMN "localizacao",
DROP COLUMN "setor",
ADD COLUMN     "localizacaoId" INTEGER NOT NULL,
ADD COLUMN     "setorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "HcrMobilia" DROP COLUMN "localizacao",
DROP COLUMN "setor",
ADD COLUMN     "localizacaoId" INTEGER NOT NULL,
ADD COLUMN     "setorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "HcrPrinter" DROP COLUMN "localizacao",
DROP COLUMN "setor",
ADD COLUMN     "localizacaoId" INTEGER NOT NULL,
ADD COLUMN     "setorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "OrdemServico" ADD COLUMN     "setorId" INTEGER;

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
    "setorId" INTEGER NOT NULL,

    CONSTRAINT "Localizacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Setor_nome_key" ON "Setor"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Localizacao_nome_key" ON "Localizacao"("nome");

-- AddForeignKey
ALTER TABLE "Localizacao" ADD CONSTRAINT "Localizacao_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemServico" ADD CONSTRAINT "OrdemServico_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrComputer" ADD CONSTRAINT "HcrComputer_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrComputer" ADD CONSTRAINT "HcrComputer_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "Localizacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrPrinter" ADD CONSTRAINT "HcrPrinter_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrPrinter" ADD CONSTRAINT "HcrPrinter_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "Localizacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrAirConditioning" ADD CONSTRAINT "HcrAirConditioning_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrAirConditioning" ADD CONSTRAINT "HcrAirConditioning_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "Localizacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrMobilia" ADD CONSTRAINT "HcrMobilia_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrMobilia" ADD CONSTRAINT "HcrMobilia_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "Localizacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
