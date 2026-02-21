// find_address.js
// Usage: node find_address.js smith
// Requires: Node 18+ (for fetch optional), or any Node with 'pg' package installed
// Environment variable: DATABASE_URL must be set to your Postgres connection string

import pg from "pg";

const { Client } = pg;

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: node find_address.js <name>");
    process.exit(1);
  }
  const nameToFind = args.join(" ");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Please set the DATABASE_URL environment variable (Postgres connection string).");
    process.exit(1);
  }

  // TODO: change these to your table/schema names if different
  const schema = "public";
  const table = "TABLE_NAME"; // <-- replace with your table name

  const client = new Client({ connectionString });
  await client.connect();

  try {
    // Parameterized query to avoid injection; case-insensitive match
    const sql = `SELECT "address" FROM "${schema}"."${table}" WHERE "names" ILIKE $1;`;
    const res = await client.query(sql, [nameToFind]);

    if (res.rowCount === 0) {
      console.log(`No rows found where names = "${nameToFind}"`);
    } else {
      console.log(`Found ${res.rowCount} row(s):`);
      for (const row of res.rows) {
        console.log(row.address);
      }
    }
  } catch (err) {
    console.error("Query error:", err.message || err);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
