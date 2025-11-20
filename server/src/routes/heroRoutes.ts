import { Router } from 'express';
import { findHeroBySlug, upsertHeroBySlug } from "../services/heroService.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/impact/hero", async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    console.log("[hero] GET", { slug });
    const hero = await findHeroBySlug(slug);

    if (!hero) {
      console.warn("[hero] GET not found", { slug });
      return res.status(404).json({ error: "Hero content not found" });
    }

    const { _id, slug: storedSlug, ...data } = hero;
    console.log("[hero] GET success", {
      slug,
      fields: Object.keys(data || {}),
    });
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.put("/impact/hero", requireAuth, async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    const data = (req.body ?? {}) as Record<string, unknown>;
    console.log("[hero] PUT request", {
      slug,
      incomingKeys: Object.keys(data || {}),
    });
    const allowedKeys = [
      "backgroundColor",
      "backgroundImage",
      "backgroundImageGrayscale",
      "titleColor",
      "subtitleColor",
      "yearColor",
      "taglineColor",
      "primaryCtaColor",
      "secondaryCtaColor",
      "title",
      "subtitle",
      "year",
      "tagline",
      "bubbles",
      "primaryCta",
      "secondaryCta",
      "textAlign",
      "layoutVariant",
      "ariaLabel",
    ];

    const sanitized: Record<string, unknown> = {};
    for (const key of allowedKeys) {
      if (key in data) sanitized[key] = (data as any)[key];
    }
    // Defensive: drop invalid gradient strings to avoid breaking the client
    if (typeof sanitized.backgroundColor === "string") {
      const bg = sanitized.backgroundColor as string;
      if (/undefined/i.test(bg)) {
        delete sanitized.backgroundColor;
      }
    }
    console.log("[hero] PUT sanitized", {
      slug,
      sanitizedKeys: Object.keys(sanitized),
    });

    const saved = await upsertHeroBySlug(slug, sanitized as any);
    const { _id, slug: storedSlug, ...response } = saved ?? {};
    console.log("[hero] PUT success", {
      slug,
      updatedFields: Object.keys(response || {}),
    });
    return res.json({ data: response });
  } catch (error) {
    return next(error);
  }
});

export default router;

