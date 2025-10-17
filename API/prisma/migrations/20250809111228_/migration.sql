-- CreateEnum
CREATE TYPE "Recorrencia" AS ENUM ('NENHUMA', 'DIARIA', 'SEMANAL', 'QUINZENAL', 'MENSAL', 'ANUAL', 'PERSONALIZADA');

-- AlterTable
ALTER TABLE "OrdemServico" ADD COLUMN     "dataAgendada" TIMESTAMP(3),
ADD COLUMN     "intervaloDias" INTEGER,
ADD COLUMN     "recorrencia" "Recorrencia" DEFAULT 'NENHUMA',
ALTER COLUMN "preventiva" DROP DEFAULT;
