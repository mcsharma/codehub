#!/usr/bin/env node
// One-off admin script: creates (if missing) the reserved
// "codehub-hg-worker" service-account user this BFF's claim_hg_job/
// complete_hg_job/fail_hg_job mutations require (see
// src/pothos/schema/hg-worker.ts's requireHgWorker), and mints a fresh
// Personal Access Token for it. Run once per environment (test, prod) —
// DATABASE_URL selects which. The printed raw token is not recoverable
// afterwards (only its hash is stored, same as any other PAT — see
// src/auth/personal-access-token.ts) — copy it straight into that
// environment's VM worker stack as HG_WORKER_TOKEN and don't re-run unless
// you intend to rotate it.
//
// Usage: DATABASE_URL=... node scripts/seed-hg-worker.mjs
import "dotenv/config";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const HG_WORKER_USERNAME = "codehub-hg-worker";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const user = await prisma.modelUser.upsert({
  where: { username: HG_WORKER_USERNAME },
  update: {},
  create: { username: HG_WORKER_USERNAME, data: {} },
});

const rawToken = crypto.randomBytes(32).toString("base64url");
await prisma.personalAccessToken.create({
  data: { userId: user.id, label: "vm-worker", tokenHash: hashToken(rawToken) },
});

console.log(`Created/confirmed service-account user "${HG_WORKER_USERNAME}" (id ${user.id}).`);
console.log("New worker PAT (copy into this environment's VM worker stack as HG_WORKER_TOKEN — shown once):");
console.log(rawToken);

await prisma.$disconnect();
