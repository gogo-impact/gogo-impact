import { Router } from 'express';
import { findFlexCBySlug, upsertFlexCBySlug } from "../services/flexCService.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/impact/flex-c", async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    console.log("[flex-c] GET", { slug });
    const flexC = await findFlexCBySlug(slug);

    if (!flexC) {
      console.warn("[flex-c] GET not found", { slug });
      return res.status(404).json({ error: "FlexC content not found" });
    }

    const { _id, slug: storedSlug, ...data } = flexC;
    console.log("[flex-c] GET success", {
      slug,
      fields: Object.keys(data || {}),
    });
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.put("/impact/flex-c", requireAuth, async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    const data = (req.body ?? {}) as Record<string, unknown>;
    console.log("[flex-c] PUT request", {
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
      "sectionBgImage",
      // Colors
      "primaryColor",
      // Title styling
      "titleColor",
      "subtitleColor",
      // Notes styling
      "notesTextColor",
      // Credits styling
      "creditRoleColor",
      "creditValueColor",
      // Border/bar styling
      "borderColor",
      // Header
      "header",
      // Poster
      "poster",
      // Director's notes
      "directorsNotes",
      // Credits
      "credits",
      // Accessibility
      "ariaLabel",
    ];

    const sanitized: Record<string, unknown> = {};
    for (const key of allowedKeys) {
      if (key in data) sanitized[key] = (data as any)[key];
    }

    console.log("[flex-c] PUT sanitized", {
      slug,
      sanitizedKeys: Object.keys(sanitized),
    });

    const saved = await upsertFlexCBySlug(slug, sanitized as any);
    const { _id, slug: storedSlug, ...response } = saved ?? {};
    console.log("[flex-c] PUT success", {
      slug,
      updatedFields: Object.keys(response || {}),
    });
    return res.json({ data: response });
  } catch (error) {
    return next(error);
  }
});

export default router;

