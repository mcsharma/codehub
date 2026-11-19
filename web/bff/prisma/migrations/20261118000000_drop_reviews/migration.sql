-- Code review was removed from scope: drop the review tables, and the
-- service account that only git's (now removed) post-receive review hook
-- used. Wrapped in one transaction so a failure leaves nothing half-applied.
BEGIN;

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_repository_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_author_id_fkey";

-- DropForeignKey
ALTER TABLE "review_versions" DROP CONSTRAINT "review_versions_review_id_fkey";

-- AlterTable
ALTER TABLE "repositories" DROP COLUMN "next_review_number";

-- DropTable
DROP TABLE "reviews";

-- DropTable
DROP TABLE "review_versions";

-- DropEnum
DROP TYPE "ReviewStatus";

-- Remove the codehub-git-hook service account (seeded by the deleted
-- scripts/seed-git-hook.mjs) and its PATs.
DELETE FROM "personal_access_tokens"
WHERE "user_id" IN (SELECT "id" FROM "users" WHERE "username" = 'codehub-git-hook');
DELETE FROM "users" WHERE "username" = 'codehub-git-hook';

COMMIT;
