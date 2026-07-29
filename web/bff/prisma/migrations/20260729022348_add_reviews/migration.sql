-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('OPEN', 'LANDING', 'LANDED', 'LAND_FAILED', 'ABANDONED');

-- AlterTable
ALTER TABLE "repositories" ADD COLUMN     "next_review_number" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "reviews" (
    "id" BIGSERIAL NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_time" TIMESTAMP(3) NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'OPEN',
    "landed_node" TEXT,
    "land_error" TEXT,
    "repository_id" BIGINT NOT NULL,
    "author_id" BIGINT NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_versions" (
    "id" BIGSERIAL NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL,
    "head_node" TEXT NOT NULL,
    "base_node" TEXT,
    "bookmark" TEXT NOT NULL,
    "review_id" BIGINT NOT NULL,

    CONSTRAINT "review_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reviews_repository_id_number_key" ON "reviews"("repository_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "review_versions_review_id_version_key" ON "review_versions"("review_id", "version");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_repository_id_fkey" FOREIGN KEY ("repository_id") REFERENCES "repositories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_versions" ADD CONSTRAINT "review_versions_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
