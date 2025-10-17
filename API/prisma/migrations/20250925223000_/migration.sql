-- CreateTable
CREATE TABLE "public"."folders" (
    "id" SERIAL NOT NULL,
    "cailun_id" INTEGER NOT NULL,
    "organization_account_id" INTEGER,
    "name" TEXT NOT NULL,
    "label" TEXT,
    "hash" TEXT,
    "downward" INTEGER,
    "is_root" INTEGER NOT NULL DEFAULT 0,
    "users_id" INTEGER,
    "local_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cailun_created_at" TEXT,
    "cailun_updated_at" TEXT,
    "cailun_deleted_at" TEXT,

    CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "folders_cailun_id_key" ON "public"."folders"("cailun_id");

-- AddForeignKey
ALTER TABLE "public"."folders" ADD CONSTRAINT "folders_downward_fkey" FOREIGN KEY ("downward") REFERENCES "public"."folders"("cailun_id") ON DELETE SET NULL ON UPDATE CASCADE;
