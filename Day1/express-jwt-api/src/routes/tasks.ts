import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { HttpError } from "../errors";
import { auth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import type { AuthedRequest } from "../types";
import { User } from "../models/User";
import { Task } from "../models/Task";

export const tasksRouter = Router();

tasksRouter.get("/me", auth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const user = await User.findById(userId).lean();
    if (!user) throw new HttpError(401, "Unauthorized");
    return res.json({ id: user._id.toString(), email: user.email, name: user.name });
  } catch (err) {
    next(err);
  }
});

const createTaskSchema = z.object({ title: z.string().min(1) });

tasksRouter.post("/tasks", auth, validateBody(createTaskSchema), async (req: AuthedRequest, res, next) => {
  try {
    const body = req.body as z.infer<typeof createTaskSchema>;
    const task = await Task.create({ userId: req.user!.id, title: body.title, status: "todo" });
    return res.status(201).json({
      id: task._id.toString(),
      title: task.title,
      status: task.status,
    });
  } catch (err) {
    next(err);
  }
});

tasksRouter.get("/tasks", auth, async (req: AuthedRequest, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user!.id }).sort({ createdAt: -1 }).lean();
    return res.json(
      tasks.map((t) => ({ id: t._id.toString(), title: t.title, status: t.status }))
    );
  } catch (err) {
    next(err);
  }
});

const updateTaskSchema = z
  .object({ title: z.string().min(1).optional(), status: z.enum(["todo", "doing", "done"]).optional() })
  .refine((v) => v.title !== undefined || v.status !== undefined, { message: "No changes" });

tasksRouter.patch(
  "/tasks/:id",
  auth,
  validateBody(updateTaskSchema),
  async (req: AuthedRequest, res, next) => {
    try {
      const id = req.params.id;
      if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid id");

      const body = req.body as z.infer<typeof updateTaskSchema>;

      const task = await Task.findById(id);
      if (!task) throw new HttpError(400, "Task not found");
      if (task.userId.toString() !== req.user!.id) throw new HttpError(403, "Forbidden");

      if (body.title !== undefined) task.title = body.title;
      if (body.status !== undefined) task.status = body.status;
      await task.save();

      return res.json({ id: task._id.toString(), title: task.title, status: task.status });
    } catch (err) {
      next(err);
    }
  }
);

tasksRouter.delete("/tasks/:id", auth, async (req: AuthedRequest, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) throw new HttpError(400, "Invalid id");

    const task = await Task.findById(id);
    if (!task) throw new HttpError(400, "Task not found");
    if (task.userId.toString() !== req.user!.id) throw new HttpError(403, "Forbidden");

    await task.deleteOne();
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

