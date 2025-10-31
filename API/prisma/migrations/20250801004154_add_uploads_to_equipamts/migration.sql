-- AlterTable
ALTER TABLE "HcrEquipamentosMedicos" ADD COLUMN     "arquivos" TEXT[] DEFAULT ARRAY[]::TEXT[];
