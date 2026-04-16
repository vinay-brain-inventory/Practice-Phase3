import type { NextFunction, Response } from "express";
import { randomUUID } from "crypto";
import type { AuthedRequest } from "../types";

export function requestId(req: AuthedRequest, res: Response, next: NextFunction) {
  const id = randomUUID();
  req.requestId = id;
  res.setHeader("x-request-id", id);
  next();
}

