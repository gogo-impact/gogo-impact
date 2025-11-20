import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const uri = process.env.MONGO_URI ?? '';

if (!uri) {
  console.warn('[database] MONGO_URI is not set. Set it in your environment before starting the server.');
}

let client: MongoClient | null = null;
let database: Db | null = null;

export async function getDatabase(): Promise<Db> {
  if (database) return database;

  if (!uri) {
    throw new Error('MONGO_URI is not defined');
  }

  if (!client) {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 0,
      retryWrites: true,
      retryReads: true,
    } as any);
  }

  await client.connect();

  const dbName = process.env.MONGO_DB_NAME ?? 'gogo-impact-report';
  database = client.db(dbName);
  return database;
}

export function getClient(): MongoClient | null {
  return client;
}

export async function disconnectDatabase() {
  if (client) {
    await client.close();
    client = null;
    database = null;
  }
}

