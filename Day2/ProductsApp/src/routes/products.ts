import { Router } from "express";
import { z } from "zod";
import { ProductModel, productCategories } from "../models/Product";

type ExplainSummary = {
  indexUsed: boolean;
  indexStage: "IXSCAN" | "COLLSCAN" | "UNKNOWN";
  executionTimeMs: number | null;
  docsExamined: number | null;
  docsReturned: number | null;
  performance: "Good" | "Needs Optimization";
  suggestion?: string;
};

function findStageName(node: unknown, wanted: string): boolean {
  if (!node || typeof node !== "object") return false;
  const asRec = node as Record<string, unknown>;
  if (asRec.stage === wanted) return true;

  for (const v of Object.values(asRec)) {
    if (Array.isArray(v)) {
      for (const item of v) if (findStageName(item, wanted)) return true;
    } else if (v && typeof v === "object") {
      if (findStageName(v, wanted)) return true;
    }
  }
  return false;
}

function summarizeExplain(plan: any): ExplainSummary {
  const qs = plan?.executionStats;
  const executionTimeMs = typeof qs?.executionTimeMillis === "number" ? qs.executionTimeMillis : null;
  const docsReturned = typeof qs?.nReturned === "number" ? qs.nReturned : null;
  const docsExamined =
    typeof qs?.totalDocsExamined === "number"
      ? qs.totalDocsExamined
      : typeof qs?.executionStages?.docsExamined === "number"
        ? qs.executionStages.docsExamined
        : null;

  const winning = plan?.queryPlanner?.winningPlan ?? qs?.executionStages;
  const hasIxscan = findStageName(winning, "IXSCAN");
  const hasCollscan = findStageName(winning, "COLLSCAN");

  const indexStage: ExplainSummary["indexStage"] = hasIxscan ? "IXSCAN" : hasCollscan ? "COLLSCAN" : "UNKNOWN";
  const indexUsed = hasIxscan && !hasCollscan;

  const slow = executionTimeMs !== null && executionTimeMs > 50;
  const heavyScan =
    docsExamined !== null && docsReturned !== null ? docsExamined > Math.max(1000, docsReturned * 50) : false;
  const performance: ExplainSummary["performance"] = slow || heavyScan || !indexUsed ? "Needs Optimization" : "Good";

  let suggestion: string | undefined;
  if (performance === "Needs Optimization") {
    if (indexStage === "COLLSCAN") suggestion = "Add an index for your filter/sort fields to avoid collection scan.";
    else if (slow) suggestion = "Reduce sort work or add a supporting index for your most common sortBy + filters.";
    else if (heavyScan) suggestion = "Tighten filters or add a compound index matching your most common filters.";
  }

  return { indexUsed, indexStage, executionTimeMs, docsExamined, docsReturned, performance, suggestion };
}

const sortMap = {
  newest: { createdAt: -1 as const },
  priceAsc: { price: 1 as const },
  priceDesc: { price: -1 as const },
  nameAsc: { name: 1 as const }
} as const;

const querySchema = z.object({
  search: z.string().trim().min(1).optional(),
  category: z.enum(productCategories).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["newest", "priceAsc", "priceDesc", "nameAsc"]).default("newest"),
  explain: z.coerce.boolean().optional()
});

export const productsRouter = Router();

productsRouter.get("/", async (req, res, next) => {
  try {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { search, category, minPrice, maxPrice, page, limit, sortBy, explain } = parsed.data;

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {
        ...(minPrice !== undefined ? { $gte: minPrice } : {}),
        ...(maxPrice !== undefined ? { $lte: maxPrice } : {})
      };
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const sort = search ? { score: { $meta: "textScore" as const }, ...sortMap[sortBy] } : sortMap[sortBy];
    const skip = (page - 1) * limit;

    const base = ProductModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select(search ? { score: { $meta: "textScore" } } : {})
      .lean();

    if (explain) {
      const plan = await ProductModel.find(filter).sort(sort).skip(skip).limit(limit).explain("executionStats");
      const summary = summarizeExplain(plan);
      return res.json({ summary });
    }

    const [items, total] = await Promise.all([base.exec(), ProductModel.countDocuments(filter)]);

    return res.json({ page, limit, total, totalPages: Math.ceil(total / limit), items });
  } catch (err) {
    next(err);
  }
});

