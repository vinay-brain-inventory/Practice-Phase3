import bcrypt from "bcryptjs";
import mongoose, { type InferSchemaType } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      validate: {
        validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Invalid email"
      }
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 200,
      select: false
    }
  },
  { timestamps: true, versionKey: false }
);

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.index({ lastName: 1, firstName: 1 });
userSchema.index({ createdAt: -1, email: 1 });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

export type UserDoc = InferSchemaType<typeof userSchema>;
export const UserModel = mongoose.model("User", userSchema);

