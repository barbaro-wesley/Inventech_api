-- AlterEnum
ALTER TYPE "public"."PapelUsuario" ADD VALUE 'CEP';

-- CreateTable
CREATE TABLE "public"."fluxosAssinaturas" (
    "id" BIGINT NOT NULL,
    "organizationAccountId" BIGINT NOT NULL,
    "documentStatusTypeId" INTEGER NOT NULL,
    "documentTypesId" INTEGER NOT NULL,
    "envelopesId" BIGINT NOT NULL,
    "filesId" BIGINT NOT NULL,
    "status" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "uuid" UUID NOT NULL,
    "resolution" INTEGER NOT NULL,
    "pages" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "language" VARCHAR(10) NOT NULL,
    "timezone" INTEGER NOT NULL,
    "versionId" BIGINT NOT NULL,
    "dt_timezone_zero" TIMESTAMP(3) NOT NULL,
    "links" JSONB,

    CONSTRAINT "fluxosAssinaturas_pkey" PRIMARY KEY ("id")
);
