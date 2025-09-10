import Pool from 'pg-pool';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

//@ts-ignore
export const db = drizzle({ client: pool, schema, logger: true });