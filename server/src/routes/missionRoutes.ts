import { Router } from 'express';
import { findMissionBySlug, upsertMissionBySlug } from "../services/missionService.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/impact/mission", async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    console.log("[mission] GET", { slug });
    const mission = await findMissionBySlug(slug);

    if (!mission) {
      console.warn("[mission] GET not found", { slug });
      return res.status(404).json({ error: "Mission content not found" });
    }

    const { _id, slug: storedSlug, ...data } = mission;
    console.log("[mission] GET success", {
      slug,
      fields: Object.keys(data || {}),
    });
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.put("/impact/mission", requireAuth, async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    const data = (req.body ?? {}) as Record<string, unknown>;
    console.log("[mission] PUT request", {
      slug,
      incomingKeys: Object.keys(data || {}),
    });

    const allowedKeys = [
      "backgroundColor",
      "backgroundImage",
      "backgroundImageAlt",
      "backgroundImageGrayscale",
      "ariaLabel",
      "visible",
      "textAlign",
      "layoutVariant",
      "animationsEnabled",
      "title",
      "titleColor",
      "titleGradient",
      "titleUnderlineGradient",
      "badgeLabel",
      "badgeIcon",
      "badgeTextColor",
      "badgeBgColor",
      "badgeBorderColor",
      "statementTitle",
      "statementTitleColor",
      "statementText",
      "statementTextColor",
      "statementMeta",
      "statementMetaColor",
      "serial",
      "serialColor",
      "ticketStripeGradient",
      "ticketBorderColor",
      "ticketBackdropColor",
      "ticketShowBarcode",
      "backgroundLogo",
      "statsTitle",
      "statsTitleColor",
      "stats",
      "statsEqualizer",
      "modals",
    ];

    const sanitized: Record<string, unknown> = {};
    for (const key of allowedKeys) {
      if (key in data) sanitized[key] = (data as any)[key];
    }
    // Drop invalid gradient strings
    const gradientFields = ["backgroundColor", "titleGradient", "titleUnderlineGradient", "ticketStripeGradient"];
    for (const f of gradientFields) {
      const v = sanitized[f];
      if (typeof v === "string" && /undefined/i.test(v)) {
        delete sanitized[f];
      }
    }

    console.log("[mission] PUT sanitized", {
      slug,
      sanitizedKeys: Object.keys(sanitized),
    });

    const saved = await upsertMissionBySlug(slug, sanitized as any);
    const { _id, slug: storedSlug, ...response } = saved ?? {};
    console.log("[mission] PUT success", {
      slug,
      updatedFields: Object.keys(response || {}),
    });
    return res.json({ data: response });
  } catch (error) {
    return next(error);
  }
});

export default router;


