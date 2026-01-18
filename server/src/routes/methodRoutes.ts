import { Router } from 'express';
import { findMethodBySlug, upsertMethodBySlug } from "../services/methodService.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/impact/method", async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    console.log("[method] GET", { slug });
    const method = await findMethodBySlug(slug);

    if (!method) {
      console.warn("[method] GET not found", { slug });
      return res.status(404).json({ error: "Method content not found" });
    }

    const { _id, slug: storedSlug, ...data } = method;
    console.log("[method] GET success", {
      slug,
      fields: Object.keys(data || {}),
    });
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.put("/impact/method", requireAuth, async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    const data = (req.body ?? {}) as Record<string, unknown>;
    console.log("[method] PUT request", {
      slug,
      incomingKeys: Object.keys(data || {}),
    });

    const allowedKeys = [
      // Visibility
      "visible",
      "animationsEnabled",
      // Background
      "sectionBgGradient",
      "glowColor1",
      "glowColor2",
      // Header
      "title",
      "titleGradient",
      "subtitle",
      "subtitleColor",
      // Method cards
      "cardBgColor",
      "cardBorderColor",
      "cardTitleColor",
      "iconGradient",
      "methodItems",
      // Narrative section
      "leadText",
      "leadTextColor",
      "secondaryText",
      "secondaryTextColor",
      "secondaryBorderColor",
    ];

    const sanitized: Record<string, unknown> = {};
    for (const key of allowedKeys) {
      if (key in data) sanitized[key] = (data as any)[key];
    }

    console.log("[method] PUT sanitized", {
      slug,
      sanitizedKeys: Object.keys(sanitized),
    });

    const saved = await upsertMethodBySlug(slug, sanitized as any);
    const { _id, slug: storedSlug, ...response } = saved ?? {};
    console.log("[method] PUT success", {
      slug,
      updatedFields: Object.keys(response || {}),
    });
    return res.json({ data: response });
  } catch (error) {
    return next(error);
  }
});

export default router;





