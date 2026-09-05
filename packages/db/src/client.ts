import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema.js";

export type Database = LibSQLDatabase<typeof schema>;

export type CreateDbOptions = {
  url: string;
  authToken?: string;
};

export function createLibsqlClient(options: CreateDbOptions): Client {
  return createClient({
    url: options.url,
    authToken: options.authToken,
  });
}

export function createDb(options: CreateDbOptions): Database {
  const client = createLibsqlClient(options);

  return drizzle(client, { schema });
}
