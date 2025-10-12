import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Environment variable MONGODB_URI is not defined!");
}

interface CachedMongoose {
    promise: Promise<typeof mongoose>;
    conn: typeof mongoose;
}

declare global {
    var mongoose: CachedMongoose;
}

let cached: CachedMongoose = global.mongoose = global.mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
    if (!cached.conn) {
        if (!cached.promise) {
            cached.promise = mongoose.connect(MONGODB_URI!);
        }
        cached.conn = await cached.promise;
    }
    return cached.conn;
}