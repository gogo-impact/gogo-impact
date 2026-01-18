import { Router } from 'express';
import { findImpactLevelsBySlug, upsertImpactLevelsBySlug } from "../services/impactLevelsService.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/impact/impact-levels", async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    console.log("[impact-levels] GET", { slug });
    const impactLevels = await findImpactLevelsBySlug(slug);

    if (!impactLevels) {
      console.warn("[impact-levels] GET not found", { slug });
      return res.status(404).json({ error: "ImpactLevels content not found" });
    }

    const { _id, slug: storedSlug, ...data } = impactLevels;
    console.log("[impact-levels] GET success", {
      slug,
      fields: Object.keys(data || {}),
    });
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.put("/impact/impact-levels", requireAuth, async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    const data = (req.body ?? {}) as Record<string, unknown>;
    console.log("[impact-levels] PUT request", {
      slug,
      incomingKeys: Object.keys(data || {}),
    });

    const allowedKeys = [
      // Visibility
      "visible",
      "animationsEnabled",
      // Background
      "sectionBgColor",
      "sectionBgGradient",
      "glowColor1",
      "glowColor2",
      // Header
      "header",
      // Levels
      "levels",
      // Card styling
      "cardBgColor",
      "cardHoverBgColor",
      "amountColor",
      "descriptionColor",
      // CTA
      "cta",
      // Sound wave
      "soundWave",
      // Accessibility
      "ariaLabel",
    ];

    const sanitized: Record<string, unknown> = {};
    for (const key of allowedKeys) {
      if (key in data) sanitized[key] = (data as any)[key];
    }

    console.log("[impact-levels] PUT sanitized", {
      slug,
      sanitizedKeys: Object.keys(sanitized),
    });

    const saved = await upsertImpactLevelsBySlug(slug, sanitized as any);
    const { _id, slug: storedSlug, ...response } = saved ?? {};
    console.log("[impact-levels] PUT success", {
      slug,
      updatedFields: Object.keys(response || {}),
    });
    return res.json({ data: response });
  } catch (error) {
    return next(error);
  }
});

export default router;



