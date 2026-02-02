import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../db/schema.js";
import { env } from "../utils/config.js";
import createLib from "../utils/createLib.js";
import { createClient } from "@libsql/client";

const db = createLib(() => {
  const client = createClient({ url: env.DB_FILENAME });
  return drizzle(client, { schema });
}, "db");

export default db;

export type Database = typeof db;
