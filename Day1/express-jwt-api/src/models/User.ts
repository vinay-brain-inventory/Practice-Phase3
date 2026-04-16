import mongoose, { Schema } from "mongoose";

export type UserDoc = {
  email: string;
  name: string;
  passwordHash: string;
};

const userSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<UserDoc>("User", userSchema);

