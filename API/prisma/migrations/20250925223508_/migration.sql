-- CreateTable
CREATE TABLE "public"."files" (
    "id" SERIAL NOT NULL,
    "cailun_id" INTEGER,
    "name" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "folder_cailun_id" INTEGER NOT NULL,
    "hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cailun_created_at" TEXT,
    "cailun_updated_at" TEXT,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."files" ADD CONSTRAINT "files_folder_cailun_id_fkey" FOREIGN KEY ("folder_cailun_id") REFERENCES "public"."folders"("cailun_id") ON DELETE CASCADE ON UPDATE CASCADE;
