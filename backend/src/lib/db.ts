import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../db/schema";
import { env } from "../utils/config";
import createLib from "../utils/createLib";
import { createClient } from "@libsql/client";

const db = createLib(() => {
  const client = createClient({ url: env.DB_FILENAME });
  return drizzle(client, { schema });
}, "db");

export default db;

export type Database = typeof db;
