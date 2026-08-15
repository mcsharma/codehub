-- AlterTable
ALTER TABLE "books" ADD COLUMN     "added_by_user_id" BIGINT;

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_added_by_user_id_fkey" FOREIGN KEY ("added_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
