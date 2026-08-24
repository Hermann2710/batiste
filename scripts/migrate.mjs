import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

// Configure WebSockets pour Node.js
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL)
  throw new Error("DATABASE_URL is required to migrate");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  const [{ exists: hasBlocks }] = (
    await pool.query(
      "select to_regclass('public.blocks') is not null as exists",
    )
  ).rows;
  const [{ exists: hasLedger }] = (
    await pool.query(
      "select to_regclass('drizzle.__drizzle_migrations') is not null as exists",
    )
  ).rows;

  if (hasBlocks) {
    await pool.query(
      "create schema if not exists drizzle; create table if not exists drizzle.__drizzle_migrations (id serial primary key, hash text not null, created_at bigint)",
    );
    const { rows: applied } = await pool.query(
      "select 1 from drizzle.__drizzle_migrations where created_at = $1",
      [1787427890946],
    );
    if (!applied.length) {
      const baseline = await readFile("drizzle/0000_dashing_captain_cross.sql");
      await pool.query(
        "insert into drizzle.__drizzle_migrations (hash, created_at) values ($1, $2)",
        [createHash("sha256").update(baseline).digest("hex"), 1787427890946],
      );
      console.log("Existing schema baselined at migration 0000.");
    }
  } else if (hasLedger) {
    console.log(
      "No application tables found; applying migrations from the beginning.",
    );
  }

  await migrate(drizzle(pool), { migrationsFolder: "drizzle" });
  console.log("Database migrations applied.");
} finally {
  await pool.end();
}
