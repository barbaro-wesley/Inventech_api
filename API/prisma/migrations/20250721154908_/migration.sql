-- DropForeignKey
ALTER TABLE "HcrEquipamentosMedicos" DROP CONSTRAINT "HcrEquipamentosMedicos_localizacaoId_fkey";

-- DropForeignKey
ALTER TABLE "HcrEquipamentosMedicos" DROP CONSTRAINT "HcrEquipamentosMedicos_setorId_fkey";

-- DropForeignKey
ALTER TABLE "HcrEquipamentosMedicos" DROP CONSTRAINT "HcrEquipamentosMedicos_tipoEquipamentoId_fkey";

-- AlterTable
ALTER TABLE "HcrEquipamentosMedicos" ALTER COLUMN "setorId" DROP NOT NULL,
ALTER COLUMN "localizacaoId" DROP NOT NULL,
ALTER COLUMN "tipoEquipamentoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "HcrEquipamentosMedicos" ADD CONSTRAINT "HcrEquipamentosMedicos_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrEquipamentosMedicos" ADD CONSTRAINT "HcrEquipamentosMedicos_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "Localizacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HcrEquipamentosMedicos" ADD CONSTRAINT "HcrEquipamentosMedicos_tipoEquipamentoId_fkey" FOREIGN KEY ("tipoEquipamentoId") REFERENCES "TipoEquipamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
