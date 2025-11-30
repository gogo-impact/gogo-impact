import { Router } from 'express';
import { findImpactSectionBySlug, upsertImpactSectionBySlug } from "../services/impactSectionService.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/impact/impact-section", async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    console.log("[impact-section] GET", { slug });
    const impactSection = await findImpactSectionBySlug(slug);

    if (!impactSection) {
      console.warn("[impact-section] GET not found", { slug });
      return res.status(404).json({ error: "Impact section content not found" });
    }

    const { _id, slug: storedSlug, ...data } = impactSection;
    console.log("[impact-section] GET success", {
      slug,
      fields: Object.keys(data || {}),
    });
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.put("/impact/impact-section", requireAuth, async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    const data = (req.body ?? {}) as Record<string, unknown>;
    console.log("[impact-section] PUT request", {
      slug,
      incomingKeys: Object.keys(data || {}),
    });

    const allowedKeys = [
      // Visibility
      "visible",
      "animationsEnabled",
      // Background
      "sectionBgGradient",
      "topBorderGradient",
      // Top carousel
      "topCarouselImages",
      // Stats section
      "statsTitle",
      "statsTitleColor",
      "turntableStats",
      "turntableCardBgGradient",
      "turntableCardBorderColor",
      "statCaptionColor",
      // Highlights section
      "highlightsTitle",
      "highlightsTitleColor",
      "highlightsSubtitle",
      "highlightsSubtitleColor",
      "highlightChips",
      "highlightChipBgColor",
      "highlightChipBorderColor",
      "highlightChipTextColor",
      "highlightCards",
      "highlightCardBgColor",
      "highlightCardBorderColor",
      "highlightCardTitleColor",
      "highlightCardTextColor",
      // Bottom carousel
      "bottomCarouselImages",
      // Measurement section header
      "measureTitle",
      "measureTitleHighlight",
      "measureTitleColor",
      "measureTitleHighlightColor",
      "measureSubtitle",
      "measureSubtitleColor",
      // "Our Method Provides" card (left column)
      "methodCardTitle",
      "methodCardTitleColor",
      "methodCardAccentGradient",
      "methodCardBgColor",
      "methodCardBorderColor",
      "methodItems",
      "methodItemBgColor",
      "methodItemBorderColor",
      "methodItemTitleColor",
      "methodItemTextColor",
      "methodCardFooterText",
      "methodCardFooterTextColor",
      // "Measurement & Evaluation Tools" card (right column)
      "toolsCardTitle",
      "toolsCardTitleColor",
      "toolsCardBgColor",
      "toolsCardBorderColor",
      "toolItems",
      "toolIconBgGradient",
      "toolNameColor",
      "toolDescriptionColor",
      "toolsFooterText",
      "toolsFooterTextColor",
    ];

    const sanitized: Record<string, unknown> = {};
    for (const key of allowedKeys) {
      if (key in data) sanitized[key] = (data as any)[key];
    }

    console.log("[impact-section] PUT sanitized", {
      slug,
      sanitizedKeys: Object.keys(sanitized),
    });

    const saved = await upsertImpactSectionBySlug(slug, sanitized as any);
    const { _id, slug: storedSlug, ...response } = saved ?? {};
    console.log("[impact-section] PUT success", {
      slug,
      updatedFields: Object.keys(response || {}),
    });
    return res.json({ data: response });
  } catch (error) {
    return next(error);
  }
});

export default router;


