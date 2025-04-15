-- CreateTable
CREATE TABLE "seo_metadata" (
    "id" SERIAL NOT NULL,
    "page_key" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_translations" (
    "id" SERIAL NOT NULL,
    "seo_id" INTEGER NOT NULL,
    "language_code" VARCHAR(5) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "meta_description" TEXT NOT NULL,
    "keywords" TEXT,
    "og_title" VARCHAR(255),
    "og_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seo_metadata_page_key_key" ON "seo_metadata"("page_key");

-- CreateIndex
CREATE UNIQUE INDEX "seo_translations_seo_id_language_code_key" ON "seo_translations"("seo_id", "language_code");

-- AddForeignKey
ALTER TABLE "seo_translations" ADD CONSTRAINT "seo_translations_seo_id_fkey" FOREIGN KEY ("seo_id") REFERENCES "seo_metadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_translations" ADD CONSTRAINT "seo_translations_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "languages"("code") ON DELETE CASCADE ON UPDATE CASCADE;
