import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

async function main() {
  const db = drizzle(neon(process.env.DATABASE_URL!));
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("migrated");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
