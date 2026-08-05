#!/usr/bin/env node
// One-off admin script: creates (if missing) the reserved "codehub-git-hook"
// service-account user the report_git_review_push mutation requires (see
// src/pothos/schema/git-review.ts's requireGitHook), and mints a fresh
// Personal Access Token for it. Run once per environment (test, prod) —
// DATABASE_URL selects which. The printed raw token is not recoverable
// afterwards (only its hash is stored, same as any other PAT — see
// src/auth/personal-access-token.ts) — copy it into that environment's git
// stack's hook-config.$STACK.env as GIT_HOOKS_TOKEN, not a BFF env var (the
// post-receive hook, not the BFF, is what authenticates with it).
//
// Deliberately a separate service account from codehub-git-worker
// (seed-git-worker.mjs) — least-privilege: the hook container is directly
// internet-facing (it's what `git push` hits), so a leaked hook token
// should not be able to claim/complete/fail arbitrary provision/delete/land
// jobs the way the worker's token can.
//
// Usage: DATABASE_URL=... node scripts/seed-git-hook.mjs
import "dotenv/config";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const GIT_HOOK_USERNAME = "codehub-git-hook";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const user = await prisma.modelUser.upsert({
  where: { username: GIT_HOOK_USERNAME },
  update: {},
  create: { username: GIT_HOOK_USERNAME, data: {} },
});

const rawToken = crypto.randomBytes(32).toString("base64url");
await prisma.personalAccessToken.create({
  data: { userId: user.id, label: "git-post-receive-hook", tokenHash: hashToken(rawToken) },
});

console.log(`Created/confirmed service-account user "${GIT_HOOK_USERNAME}" (id ${user.id}).`);
console.log("New hook PAT (copy into this environment's hook-config.$STACK.env as GIT_HOOKS_TOKEN — shown once):");
console.log(rawToken);

await prisma.$disconnect();
