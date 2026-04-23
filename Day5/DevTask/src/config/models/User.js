const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ["user", "admin"], default: "user" }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = { User };

