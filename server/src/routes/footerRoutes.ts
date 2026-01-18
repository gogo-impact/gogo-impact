import { Router } from 'express';
import { findFooterBySlug, upsertFooterBySlug } from "../services/footerService.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/impact/footer", async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    console.log("[footer] GET", { slug });
    const footer = await findFooterBySlug(slug);

    if (!footer) {
      console.warn("[footer] GET not found", { slug });
      return res.status(404).json({ error: "Footer content not found" });
    }

    const { _id, slug: storedSlug, ...data } = footer;
    console.log("[footer] GET success", {
      slug,
      fields: Object.keys(data || {}),
    });
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.put("/impact/footer", requireAuth, async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    const data = (req.body ?? {}) as Record<string, unknown>;
    console.log("[footer] PUT request", {
      slug,
      incomingKeys: Object.keys(data || {}),
    });

    const allowedKeys = [
      // Visibility
      "visible",
      // Background
      "sectionBgGradient",
      "sectionBgColor",
      "topBorderGradient",
      // Logo
      "logo",
      // Description
      "description",
      "descriptionColor",
      // Social links
      "socialLinks",
      "socialBubbleBgColor",
      "socialBubbleHoverBgColor",
      "socialBubbleIconColor",
      "socialBubbleBorderColor",
      // Columns
      "columns",
      "columnTitleColor",
      "columnLinkColor",
      "columnLinkHoverColor",
      // Bottom bar
      "bottomBar",
      // Newsletter
      "newsletter",
      // Mailing address
      "mailingAddress",
    ];

    const sanitized: Record<string, unknown> = {};
    for (const key of allowedKeys) {
      if (key in data) sanitized[key] = (data as any)[key];
    }

    console.log("[footer] PUT sanitized", {
      slug,
      sanitizedKeys: Object.keys(sanitized),
    });

    const saved = await upsertFooterBySlug(slug, sanitized as any);
    const { _id, slug: storedSlug, ...response } = saved ?? {};
    console.log("[footer] PUT success", {
      slug,
      updatedFields: Object.keys(response || {}),
    });
    return res.json({ data: response });
  } catch (error) {
    return next(error);
  }
});

export default router;



