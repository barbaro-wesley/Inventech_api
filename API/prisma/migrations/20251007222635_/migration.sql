/*
  Warnings:

  - You are about to drop the column `grupoId` on the `TipoEquipamento` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."TipoEquipamento" DROP CONSTRAINT "TipoEquipamento_grupoId_fkey";

-- AlterTable
ALTER TABLE "public"."TipoEquipamento" DROP COLUMN "grupoId";

-- CreateTable
CREATE TABLE "public"."_GrupoTipos" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_GrupoTipos_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GrupoTipos_B_index" ON "public"."_GrupoTipos"("B");

-- AddForeignKey
ALTER TABLE "public"."_GrupoTipos" ADD CONSTRAINT "_GrupoTipos_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."GrupoManutencao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_GrupoTipos" ADD CONSTRAINT "_GrupoTipos_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."TipoEquipamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
