import postgres from "postgres";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const dbUrl = process.env.DATABASE_URL
  .replace("-pooler", "")
  .replace("&channel_binding=require", "")
  .replace("channel_binding=require", "");
const sql = postgres(dbUrl, { ssl: "require" });



async function run() {
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS use_custom_vault boolean DEFAULT false;`;
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS vault_endpoint text;`;
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS vault_access_key_id text;`;
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS vault_secret_key text;`;
  console.log("BYOS vault columns added successfully");
  await sql.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
