import { Router } from 'express';
import { findCurriculumBySlug, upsertCurriculumBySlug } from "../services/curriculumService.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/impact/curriculum", async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    console.log("[curriculum] GET", { slug });
    const curriculum = await findCurriculumBySlug(slug);

    if (!curriculum) {
      console.warn("[curriculum] GET not found", { slug });
      return res.status(404).json({ error: "Curriculum content not found" });
    }

    const { _id, slug: storedSlug, ...data } = curriculum;
    console.log("[curriculum] GET success", {
      slug,
      fields: Object.keys(data || {}),
    });
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.put("/impact/curriculum", requireAuth, async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    const data = (req.body ?? {}) as Record<string, unknown>;
    console.log("[curriculum] PUT request", {
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
      // Equalizer colors
      "eqColor1",
      "eqColor2",
      "eqColor3",
      // Pedal cards
      "pedalCards",
      "pedalBgColor",
      "pedalBorderColor",
      "cardTitleColor",
      "cardTextColor",
      // Timeline
      "timelineTitle",
      "timelineTitleColor",
      "timelineBgColor",
      "timelineBorderColor",
      "timelineItems",
      "timelineItemTitleColor",
      "timelineItemTextColor",
    ];

    const sanitized: Record<string, unknown> = {};
    for (const key of allowedKeys) {
      if (key in data) sanitized[key] = (data as any)[key];
    }

    console.log("[curriculum] PUT sanitized", {
      slug,
      sanitizedKeys: Object.keys(sanitized),
    });

    const saved = await upsertCurriculumBySlug(slug, sanitized as any);
    const { _id, slug: storedSlug, ...response } = saved ?? {};
    console.log("[curriculum] PUT success", {
      slug,
      updatedFields: Object.keys(response || {}),
    });
    return res.json({ data: response });
  } catch (error) {
    return next(error);
  }
});

export default router;





