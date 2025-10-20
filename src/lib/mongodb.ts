import mongoose from "mongoose";

// eslint-disable-next-line no-var
var env = process.env.NODE_ENV || 'development';

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

const cached: CachedMongoose = global.mongoose = global.mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
    if (!cached.conn) {
        if (!cached.promise) {
            if (env == 'development')
                console.log("Connecting to MongoDB URI: " + MONGODB_URI);
            cached.promise = mongoose.connect(MONGODB_URI!, {
                bufferCommands: false,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
        }
        cached.conn = await cached.promise;
    }
    return cached.conn;
}