-- CreateEnum
CREATE TYPE "VcsKind" AS ENUM ('HG', 'GIT');

-- AlterTable
ALTER TABLE "repositories" ADD COLUMN     "vcs_kind" "VcsKind" NOT NULL DEFAULT 'HG';
