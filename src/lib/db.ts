import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/lushleaves";
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  console.warn("Please add your MONGODB_URI to .env.local. Falling back to local default.");
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  const connectedClient = await clientPromise;
  const db = connectedClient.db();
  return { client: connectedClient, db };
}
