/*
  Warnings:

  - You are about to drop the column `setor` on the `Funcionario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Funcionario" DROP COLUMN "setor",
ADD COLUMN     "setorId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Funcionario" ADD CONSTRAINT "Funcionario_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "public"."Setor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
