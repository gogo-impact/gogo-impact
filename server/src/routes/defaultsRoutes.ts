import { Router } from 'express';
import { findDefaultsBySlug, upsertDefaultsBySlug } from "../services/defaultsService.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/impact/defaults", async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    console.log("[defaults] GET", { slug });
    const defaults = await findDefaultsBySlug(slug);
    if (!defaults) {
      console.warn("[defaults] GET not found", { slug });
      return res.status(404).json({ error: "Defaults not found" });
    }
    const { _id, slug: storedSlug, ...data } = defaults;
    console.log("[defaults] GET success", {
      slug,
      fields: Object.keys(data || {}),
    });
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.put("/impact/defaults", requireAuth, async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    const data = (req.body ?? {}) as Record<string, unknown>;
    console.log("[defaults] PUT request", {
      slug,
      incomingKeys: Object.keys(data || {}),
    });
    const allowedKeys = ["colorSwatch"];
    const sanitized: Record<string, unknown> = {};
    for (const key of allowedKeys) {
      if (key in data) sanitized[key] = (data as any)[key];
    }
    // Defensive: ensure swatch is an array of strings
    if (Array.isArray(sanitized.colorSwatch)) {
      sanitized.colorSwatch = (sanitized.colorSwatch as any[]).filter((c) => typeof c === "string");
    }
    const saved = await upsertDefaultsBySlug(slug, sanitized as any);
    const { _id, slug: storedSlug, ...response } = saved ?? {};
    console.log("[defaults] PUT success", {
      slug,
      updatedFields: Object.keys(response || {}),
    });
    return res.json({ data: response });
  } catch (error) {
    return next(error);
  }
});

export default router;


