import mongoose from "mongoose";

export async function connectDb(mongoUri: string) {
  await mongoose.connect(mongoUri);
}

export async function disconnectDb() {
  await mongoose.disconnect();
}

