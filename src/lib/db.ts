import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  // Create a lazy promise that only rejects when actually awaited,
  // allowing builds to succeed without MONGODB_URI set
  clientPromise = new Promise<MongoClient>((_, reject) => {
    reject(new Error('Invalid/Missing environment variable: "MONGODB_URI"'));
  });
  // Prevent unhandled rejection during build
  clientPromise.catch(() => {});
} else if (process.env.NODE_ENV === "development") {
  // In development, use a global variable to preserve the client across hot reloads
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production, create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
