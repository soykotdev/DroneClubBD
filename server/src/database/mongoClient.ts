import { MongoClient, ServerApiVersion, type Db } from "mongodb";
import { env } from "../config/env.js";

// One pooled MongoClient for the whole process, reused across every
// repository. Never instantiate MongoClient anywhere else.
let client: MongoClient | undefined;
let db: Db | undefined;

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;

  client = new MongoClient(env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      // NOT strict: true — MongoDB's Stable API rejects text index creation
      // outright under strict mode ("text indexes cannot be created with
      // apiStrict: true"), and this schema relies on one (services search).
      // Version pinning + deprecation warnings are the parts of Stable API
      // that matter here; strict enforcement isn't compatible with that need.
      strict: false,
      deprecationErrors: true,
    },
    maxPoolSize: 20,
    minPoolSize: 1,
  });

  await client.connect();
  // Confirm connectivity without ever logging the connection string.
  await client.db("admin").command({ ping: 1 });

  db = client.db(env.MONGODB_DATABASE);
  console.log(`[mongo] connected to database "${env.MONGODB_DATABASE}"`);
  return db;
}

export function getDb(): Db {
  if (!db) {
    throw new Error("Database not initialized. Call connectToDatabase() before getDb().");
  }
  return db;
}

export async function closeDatabaseConnection(): Promise<void> {
  await client?.close();
  client = undefined;
  db = undefined;
}
