import { Router } from 'express';
import { findHearOurImpactBySlug, upsertHearOurImpactBySlug } from "../services/hearOurImpactService.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/impact/hear-our-impact", async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    console.log("[hear-our-impact] GET", { slug });
    const hearOurImpact = await findHearOurImpactBySlug(slug);

    if (!hearOurImpact) {
      console.warn("[hear-our-impact] GET not found", { slug });
      return res.status(404).json({ error: "Hear our impact content not found" });
    }

    const { _id, slug: storedSlug, ...data } = hearOurImpact;
    console.log("[hear-our-impact] GET success", {
      slug,
      fields: Object.keys(data || {}),
    });
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.put("/impact/hear-our-impact", requireAuth, async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    const data = (req.body ?? {}) as Record<string, unknown>;
    console.log("[hear-our-impact] PUT request", {
      slug,
      incomingKeys: Object.keys(data || {}),
    });

    const allowedKeys = [
      // Visibility
      "visible",
      "animationsEnabled",
      // Background
      "sectionBgGradient",
      // Header
      "title",
      "titleGradient",
      "description",
      "descriptionColor",
      // Embed card styling
      "embedWrapperBgColor",
      "embedWrapperBorderColor",
      // Featured embeds
      "featuredEmbeds",
      // Action buttons
      "mentorProfilesButtonText",
      "allSongsButtonText",
      "buttonBgGradient",
      "buttonTextColor",
      // Mentor profiles modal
      "mentorProfilesModalTitle",
      "mentorProfileEmbeds",
      // All songs modal
      "allSongsModalTitle",
      "allSongsEmbeds",
      // Modal styling
      "modalBgGradient",
      "modalBorderColor",
      "modalTitleColor",
      "modalCardBgColor",
      "modalCardBorderColor",
    ];

    const sanitized: Record<string, unknown> = {};
    for (const key of allowedKeys) {
      if (key in data) sanitized[key] = (data as Record<string, unknown>)[key];
    }

    console.log("[hear-our-impact] PUT sanitized", {
      slug,
      sanitizedKeys: Object.keys(sanitized),
    });

    const saved = await upsertHearOurImpactBySlug(slug, sanitized as Record<string, unknown>);
    const { _id, slug: storedSlug, ...response } = saved ?? {};
    console.log("[hear-our-impact] PUT success", {
      slug,
      updatedFields: Object.keys(response || {}),
    });
    return res.json({ data: response });
  } catch (error) {
    return next(error);
  }
});

export default router;

