import { Router } from 'express';
import { findTestimonialsBySlug, upsertTestimonialsBySlug } from "../services/testimonialsService.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/impact/testimonials", async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    console.log("[testimonials] GET", { slug });
    const testimonials = await findTestimonialsBySlug(slug);

    if (!testimonials) {
      console.warn("[testimonials] GET not found", { slug });
      return res.status(404).json({ error: "Testimonials content not found" });
    }

    const { _id, slug: storedSlug, ...data } = testimonials;
    console.log("[testimonials] GET success", {
      slug,
      fields: Object.keys(data || {}),
    });
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.put("/impact/testimonials", requireAuth, async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    const data = (req.body ?? {}) as Record<string, unknown>;
    console.log("[testimonials] PUT request", {
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
      // Eyebrow
      "eyebrowText",
      "eyebrowColor",
      // Name
      "name",
      "nameGradient",
      // EQ bars
      "eqBarGradient",
      "eqBgGradient",
      "eqBorderColor",
      // Image
      "imageUrl",
      "imageAlt",
      "imageBorderColor",
      // Quote card
      "quoteCardBgGradient",
      "quoteCardBorderColor",
      // Quote text
      "quoteText",
      "quoteTextColor",
      "quoteMarkColor",
      // Attribution
      "attributionText",
      "attributionColor",
      "attributionIconColor",
    ];

    const sanitized: Record<string, unknown> = {};
    for (const key of allowedKeys) {
      if (key in data) sanitized[key] = (data as Record<string, unknown>)[key];
    }

    console.log("[testimonials] PUT sanitized", {
      slug,
      sanitizedKeys: Object.keys(sanitized),
    });

    const saved = await upsertTestimonialsBySlug(slug, sanitized as Record<string, unknown>);
    const { _id, slug: storedSlug, ...response } = saved ?? {};
    console.log("[testimonials] PUT success", {
      slug,
      updatedFields: Object.keys(response || {}),
    });
    return res.json({ data: response });
  } catch (error) {
    return next(error);
  }
});

export default router;

