import { drizzle } from 'drizzle-orm/postgres-js';

import postgres from 'postgres';



type Database = ReturnType<typeof drizzle>;


let dbInstance: Database | null = null;

export function getDb(): Database {

  if (!dbInstance) {

    const client = postgres(process.env.DATABASE_URL!);

    dbInstance = drizzle(client);

  }

  return dbInstance;

}


// Proxy so `DATABASE_URL` is still read lazily (on first query, not at import
// time), while callers get the fully-typed Drizzle instance — including
// `.select({...})`, joins, and everything the old 4-method shim left out.
export const db: Database = new Proxy({} as Database, {

  get: (_target, prop) => {

    const instance = getDb();

    const value = (instance as any)[prop];

    // Bind methods to the real instance so Drizzle's internal `this` is never
    // the proxy.
    return typeof value === "function" ? value.bind(instance) : value;

  },

});