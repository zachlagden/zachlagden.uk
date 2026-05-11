import { MongoClient } from "mongodb";

const options = {};

let clientPromise: Promise<MongoClient> | null = null;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Attach a no-op side handler so a rejected connect promise doesn't
// surface as a Node-level unhandledRejection event. Callers that
// `await` the same promise still receive the rejection, but the
// rejection is considered "handled" globally because this side branch
// consumes it. Without this, NextAuth's MongoDBAdapter — which calls
// MongoDBAdapter(promise) at module load and stores the result without
// attaching a catch — crashes the process when Mongo is unreachable.
function markHandled<T>(p: Promise<T>): Promise<T> {
  p.catch(() => {});
  return p;
}

function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) return clientPromise;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global._mongoClientPromise = markHandled(client.connect());
    }
    clientPromise = global._mongoClientPromise;
  } else {
    const client = new MongoClient(uri, options);
    clientPromise = markHandled(client.connect());
  }

  return clientPromise;
}

export default getClientPromise;

export async function getDb() {
  const client = await getClientPromise();
  return client.db();
}
