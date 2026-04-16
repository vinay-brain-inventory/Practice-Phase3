import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../errors";
import type { AuthedRequest } from "../types";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const requestId = (req as AuthedRequest).requestId;

  if (err instanceof ZodError) {
    return res.status(400).json({
      requestId,
      message: "Validation error",
      details: err.flatten(),
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      requestId,
      message: err.message,
      details: err.details,
    });
  }

  if (typeof err === "object" && err && "code" in err && (err as { code?: unknown }).code === 11000) {
    return res.status(400).json({
      requestId,
      message: "Duplicate key",
    });
  }

  return res.status(500).json({
    requestId,
    message: "Internal server error",
  });
}

