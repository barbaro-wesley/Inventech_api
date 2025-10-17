/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `fluxosAssinaturas` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
CREATE SEQUENCE "public".fluxosassinaturas_id_seq;
ALTER TABLE "public"."fluxosAssinaturas" ALTER COLUMN "id" SET DEFAULT nextval('"public".fluxosassinaturas_id_seq'),
ALTER COLUMN "resolution" DROP NOT NULL,
ALTER COLUMN "pages" DROP NOT NULL,
ALTER COLUMN "size" DROP NOT NULL,
ALTER COLUMN "language" DROP NOT NULL,
ALTER COLUMN "timezone" DROP NOT NULL;
ALTER SEQUENCE "public".fluxosassinaturas_id_seq OWNED BY "public"."fluxosAssinaturas"."id";

-- CreateIndex
CREATE UNIQUE INDEX "fluxosAssinaturas_uuid_key" ON "public"."fluxosAssinaturas"("uuid");
