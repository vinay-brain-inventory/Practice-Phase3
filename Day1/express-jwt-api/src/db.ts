import mongoose from "mongoose";

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing");

  const dbName = process.env.DB_NAME || undefined;

  await mongoose.connect(uri, { dbName });
}

