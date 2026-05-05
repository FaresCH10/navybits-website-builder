import mongoose from "mongoose";
import { Page } from "./models/Page";

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Define MONGODB_URI in .env.local (e.g. mongodb+srv://user:pass@cluster/db)"
    );
  }
  return uri;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
  // eslint-disable-next-line no-var
  var pageIndexesSynced: boolean | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(getMongoUri()).then((m) => m);
  }
  cache.conn = await cache.promise;

  /* Drop legacy { slug: 1 } unique (slug_1) so each project can have slug "home". */
  if (!global.pageIndexesSynced) {
    global.pageIndexesSynced = true;
    try {
      await Page.syncIndexes();
    } catch (e) {
      console.warn("[mongodb] Page.syncIndexes() failed:", e);
    }
  }

  return cache.conn;
}
