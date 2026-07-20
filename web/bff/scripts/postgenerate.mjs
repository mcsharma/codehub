#!/usr/bin/env node
/**
 * Runs after `prisma generate`. Ensures BFF __generated__ files have the
 * @generated header and fixes the Prisma import for TypeScript resolution.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const generatedPath = join(root, "src", "__generated__", "pothos-prisma-types.ts");

const HEADER =
  "// @generated - This file is generated, DO NOT modify it directly!\n\n";

let content = readFileSync(generatedPath, "utf8");

// Prepend header if missing
if (!content.includes("@generated - This file is generated")) {
  content = HEADER + content;
}

// Fix import so TypeScript resolves @prisma/client
content = content.replace(
  /from ["']\.\.\/\.\.\/node_modules\/@prisma\/client[^"']*["']/,
  'from "@prisma/client"'
);

writeFileSync(generatedPath, content);
console.log("Postgenerate: updated", generatedPath);
