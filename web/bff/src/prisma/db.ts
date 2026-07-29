import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const adapter = new PrismaPg({ connectionString });
const logQuery = process.env.DEBUG_PRISMA === "true";

export const prisma = new PrismaClient({
  adapter,
  log: logQuery ? [{ emit: "event", level: "query" }] : undefined,
});

if (logQuery) {
  type QueryEvent = { query: string; params: string; duration: number };
  (prisma as unknown as { $on(event: "query", cb: (e: QueryEvent) => void): void }).$on(
    "query",
    (e: QueryEvent) => {
      const query = e.query.replace(/\s+/g, " ").trim();
      let substituted = query;
      try {
        const params =
          typeof e.params === "string" ? JSON.parse(e.params) : e.params;
        if (Array.isArray(params) && params.length > 0) {
          substituted = query.replace(
            /\$(\d+)/g,
            (_: string, n: string) =>
              String(params[Number(n) - 1] ?? `$${n}`),
          );
        }
      } catch {
        // leave query as-is if params unparseable
      }
      const unquoted = substituted.replace(/"/g, "");
      // public.users.created_time => created_time (drop schema.table. prefix)
      const out = unquoted.replace(
        /(?:[a-zA-Z_][a-zA-Z0-9_]*\.)+([a-zA-Z_][a-zA-Z0-9_]*)/g,
        "$1",
      );
      // console.log(`[prisma] ${out}  (${e.duration}ms)`);
    },
  );
}
