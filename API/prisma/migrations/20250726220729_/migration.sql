/*
  Warnings:

  - Changed the type of `colaborador` on the `Sobreaviso` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Sobreaviso" DROP COLUMN "colaborador",
ADD COLUMN     "colaborador" INTEGER NOT NULL;
