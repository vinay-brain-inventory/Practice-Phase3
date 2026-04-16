import type { Request } from "express";

export type AuthUser = { id: string };

export type AuthedRequest = Request & { user?: AuthUser; requestId?: string };

