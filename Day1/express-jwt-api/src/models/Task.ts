import mongoose, { Schema, Types } from "mongoose";

export type TaskStatus = "todo" | "doing" | "done";

export type TaskDoc = {
  userId: Types.ObjectId;
  title: string;
  status: TaskStatus;
};

const taskSchema = new Schema<TaskDoc>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    title: { type: String, required: true },
    status: { type: String, required: true, enum: ["todo", "doing", "done"], default: "todo" },
  },
  { timestamps: true }
);

export const Task = mongoose.model<TaskDoc>("Task", taskSchema);

