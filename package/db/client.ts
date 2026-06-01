import { drizzle } from 'drizzle-orm/postgres-js';

import postgres from 'postgres';



let dbInstance: any = null;

export function getDb() {

  if (!dbInstance) {

    const client = postgres(process.env.DATABASE_URL!);

    dbInstance = drizzle(client);

  }

  return dbInstance;

}


export const db = {

  insert: (table: any) => getDb().insert(table),

  update: (table: any) => getDb().update(table),

  select: (table: any) => getDb().select(table),

  delete: (table: any) => getDb().delete(table),

} as any;