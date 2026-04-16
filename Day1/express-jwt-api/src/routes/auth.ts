import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User } from "../models/User";
import { HttpError } from "../errors";
import { validateBody } from "../middleware/validate";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(userId: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET missing");

  const expiresIn = (process.env.JWT_EXPIRES_IN || "1d") as unknown as jwt.SignOptions["expiresIn"];
  return jwt.sign({ sub: userId }, secret, { expiresIn });
}

authRouter.post("/register", validateBody(registerSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof registerSchema>;
    const email = body.email.toLowerCase();

    const exists = await User.findOne({ email }).lean();
    if (exists) throw new HttpError(400, "Email already exists");

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await User.create({ email, name: body.name, passwordHash });

    const token = signToken(user._id.toString());
    return res.json({ token });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", validateBody(loginSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof loginSchema>;
    const email = body.email.toLowerCase();

    const user = await User.findOne({ email });
    if (!user) throw new HttpError(401, "Invalid credentials");

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) throw new HttpError(401, "Invalid credentials");

    const token = signToken(user._id.toString());
    return res.json({ token });
  } catch (err) {
    next(err);
  }
});

