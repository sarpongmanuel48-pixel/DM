import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Direct (unpooled) connection for the CLI/migrations. The app's runtime
  // client (lib/prisma.ts) uses the pooled DATABASE_URL instead — Supabase's
  // pgbouncer transaction pooler doesn't support the DDL Migrate needs.
  datasource: {
    url: env("DIRECT_URL"),
  },
});
