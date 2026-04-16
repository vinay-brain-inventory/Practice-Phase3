import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../errors";
import type { AuthedRequest } from "../types";

export function auth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  if (!header) return next(new HttpError(401, "Unauthorized"));

  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return next(new HttpError(401, "Unauthorized"));

  const secret = process.env.JWT_SECRET;
  if (!secret) return next(new Error("JWT_SECRET missing"));

  try {
    const payload = jwt.verify(token, secret) as { sub?: string };
    if (!payload.sub) return next(new HttpError(401, "Unauthorized"));
    req.user = { id: payload.sub };
    next();
  } catch {
    next(new HttpError(401, "Unauthorized"));
  }
}

