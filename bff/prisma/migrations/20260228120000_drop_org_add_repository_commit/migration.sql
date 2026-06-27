-- DropOrganizationAndAddRepositoryAndCommit
-- 1. Drop FK and organizations
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_organization_id_fkey";
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "User_organization_id_fkey";
DROP TABLE IF EXISTS "organizations";

-- 2. Add username to users (backfill then constrain)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" TEXT;
UPDATE "users" SET "username" = 'user_' || "id" WHERE "username" IS NULL;
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
ALTER TABLE "users" DROP COLUMN IF EXISTS "organization_id";
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");

-- 3. Create repositories
CREATE TABLE "repositories" (
    "id" BIGSERIAL NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_time" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "owner_id" BIGINT NOT NULL,
    CONSTRAINT "repositories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "repositories_owner_id_name_key" ON "repositories"("owner_id", "name");
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 4. Implicit many-to-many: ModelUser <-> Repository (alphabetical: ModelUser, Repository)
CREATE TABLE "_ModelUserToRepository" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL,
    CONSTRAINT "_ModelUserToRepository_AB_unique" UNIQUE ("A", "B")
);
ALTER TABLE "_ModelUserToRepository" ADD CONSTRAINT "_ModelUserToRepository_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_ModelUserToRepository" ADD CONSTRAINT "_ModelUserToRepository_B_fkey" FOREIGN KEY ("B") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. Create commits
CREATE TABLE "commits" (
    "id" BIGSERIAL NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "repository_id" BIGINT NOT NULL,
    "sha" TEXT NOT NULL,
    "message" TEXT,
    "author_id" BIGINT,
    CONSTRAINT "commits_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "commits_repository_id_sha_key" ON "commits"("repository_id", "sha");
ALTER TABLE "commits" ADD CONSTRAINT "commits_repository_id_fkey" FOREIGN KEY ("repository_id") REFERENCES "repositories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "commits" ADD CONSTRAINT "commits_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
