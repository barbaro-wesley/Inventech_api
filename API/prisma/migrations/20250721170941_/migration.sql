-- DropForeignKey
ALTER TABLE "Localizacao" DROP CONSTRAINT "Localizacao_setorId_fkey";

-- AlterTable
ALTER TABLE "Localizacao" ALTER COLUMN "setorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Localizacao" ADD CONSTRAINT "Localizacao_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
