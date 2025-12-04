import { Router } from 'express';
import { findFlexBBySlug, upsertFlexBBySlug } from "../services/flexBService.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/impact/flex-b", async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    console.log("[flex-b] GET", { slug });
    const flexB = await findFlexBBySlug(slug);

    if (!flexB) {
      console.warn("[flex-b] GET not found", { slug });
      return res.status(404).json({ error: "FlexB content not found" });
    }

    const { _id, slug: storedSlug, ...data } = flexB;
    console.log("[flex-b] GET success", {
      slug,
      fields: Object.keys(data || {}),
    });
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.put("/impact/flex-b", requireAuth, async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    const data = (req.body ?? {}) as Record<string, unknown>;
    console.log("[flex-b] PUT request", {
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
      "textColor",
      // Header styling
      "labelTextColor",
      "headlineColor",
      // Text styling
      "leadParagraphColor",
      "bodyTextColor",
      // Pull quote styling
      "pullQuoteBgColor",
      "pullQuoteTextColor",
      "pullQuoteAuthorColor",
      // Sidebar styling
      "sidebarBgColor",
      "sidebarBorderColor",
      "sidebarBorderRadius",
      "sidebarImageBorderRadius",
      "sidebarTitleColor",
      "bulletTextColor",
      "bulletMarkerColor",
      // Key takeaway styling
      "keyTakeawayBgColor",
      "keyTakeawayTextColor",
      "keyTakeawayBorderRadius",
      // Header
      "header",
      // Main content
      "leadParagraph",
      "bodyParagraphs",
      // Pull quote
      "pullQuote",
      // Sidebar
      "sidebar",
      // Key takeaway
      "keyTakeaway",
      // Accessibility
      "ariaLabel",
    ];

    const sanitized: Record<string, unknown> = {};
    for (const key of allowedKeys) {
      if (key in data) sanitized[key] = (data as any)[key];
    }

    console.log("[flex-b] PUT sanitized", {
      slug,
      sanitizedKeys: Object.keys(sanitized),
    });

    const saved = await upsertFlexBBySlug(slug, sanitized as any);
    const { _id, slug: storedSlug, ...response } = saved ?? {};
    console.log("[flex-b] PUT success", {
      slug,
      updatedFields: Object.keys(response || {}),
    });
    return res.json({ data: response });
  } catch (error) {
    return next(error);
  }
});

export default router;

