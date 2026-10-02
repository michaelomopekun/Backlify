import { db, sql } from "db";

async function main() {
  const result = await db.execute(sql`
    SELECT tablename, indexname, indexdef 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    ORDER BY tablename, indexname;
  `);

  console.log("=== Current Database Indexes ===");
  for (const row of result) {
    console.log(`- [${row.tablename}] ${row.indexname}: ${row.indexdef}`);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
