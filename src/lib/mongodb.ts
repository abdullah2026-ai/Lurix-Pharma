import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "pharmacy_management";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

if (!uri && process.env.NODE_ENV === "production") {
  console.warn("MONGODB_URI is not defined in environment variables");
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (!uri) {
    throw new Error("MONGODB_URI is not set in environment variables");
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
  });

  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  // Initialize essential indexes asynchronously once
  ensureIndexes(db).catch((err) => console.error("Index initialization error:", err));

  return { client, db };
}

let indexesInitialized = false;

async function ensureIndexes(db: Db) {
  if (indexesInitialized) return;
  indexesInitialized = true;

  try {
    // 1. Medicine normalized unique name index
    await db.collection("medicines").createIndex(
      { normalizedName: 1 },
      { unique: true, background: true }
    );

    // 2. Users unique firebaseUid index
    await db.collection("users").createIndex(
      { firebaseUid: 1 },
      { unique: true, background: true }
    );

    // 3. Sales indexes for date queries and quick lookups
    await db.collection("sales").createIndex({ createdAt: -1 });
    await db.collection("sales").createIndex({ invoiceNumber: 1 }, { unique: true });
    await db.collection("sales").createIndex({ isCancelled: 1, createdAt: -1 });

    // 4. Expenses index
    await db.collection("expenses").createIndex({ createdAt: -1 });

    // 5. Audit logs index
    await db.collection("audit_logs").createIndex({ createdAt: -1 });
    await db.collection("audit_logs").createIndex({ entityId: 1, entityType: 1 });

    // 6. Stock movements index
    await db.collection("stock_movements").createIndex({ medicineId: 1, createdAt: -1 });
  } catch (err) {
    console.error("Index creation warning:", err);
  }
}
