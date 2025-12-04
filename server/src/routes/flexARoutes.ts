import { Router } from 'express';
import { findFlexABySlug, upsertFlexABySlug } from "../services/flexAService.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

// Transform flat DB format to nested API format
function transformDbToApi(doc: Record<string, any>): Record<string, any> {
  const {
    // Flat fields to transform
    headerLabel,
    headline,
    headlineHighlight,
    subhead,
    heroImageUrl,
    heroImageAlt,
    quoteVisible,
    quoteText,
    quoteAuthor,
    quoteInsertAfterParagraph,
    sidebarVisible,
    sidebarTitle,
    sidebarStats,
    // Already nested fields (pass through)
    header,
    heroImage,
    quote,
    sidebar,
    // Other fields
    ...rest
  } = doc;

  const result: Record<string, any> = { ...rest };

  // Transform header (prefer nested, fall back to flat)
  if (header) {
    result.header = header;
  } else if (headerLabel || headline || headlineHighlight || subhead) {
    result.header = {
      label: headerLabel ?? '',
      title: headline ?? '',
      titleHighlight: headlineHighlight ?? '',
      subtitle: subhead ?? '',
    };
  }

  // Transform heroImage (prefer nested, fall back to flat)
  if (heroImage) {
    result.heroImage = heroImage;
  } else if (heroImageUrl || heroImageAlt) {
    result.heroImage = {
      url: heroImageUrl ?? '',
      alt: heroImageAlt ?? '',
    };
  }

  // Transform quote (prefer nested, fall back to flat)
  if (quote) {
    result.quote = quote;
  } else if (quoteText || quoteAuthor || quoteInsertAfterParagraph !== undefined) {
    result.quote = {
      text: quoteText ?? '',
      author: quoteAuthor ?? '',
      insertAfterParagraph: quoteInsertAfterParagraph ?? 1,
    };
    // Include visibility in quote if it was flat
    if (quoteVisible !== undefined) {
      (result.quote as any).visible = quoteVisible;
    }
  }

  // Transform sidebar (prefer nested, fall back to flat)
  if (sidebar) {
    result.sidebar = sidebar;
  } else if (sidebarTitle || sidebarStats) {
    result.sidebar = {
      title: sidebarTitle ?? '',
      stats: sidebarStats ?? [],
    };
    // Include visibility in sidebar if it was flat
    if (sidebarVisible !== undefined) {
      (result.sidebar as any).visible = sidebarVisible;
    }
  }

  return result;
}

// Transform nested API format to flat DB format for storage
function transformApiToDb(data: Record<string, any>): Record<string, any> {
  const {
    header,
    heroImage,
    quote,
    sidebar,
    ...rest
  } = data;

  const result: Record<string, any> = { ...rest };

  // Store nested structures directly (new format)
  if (header) {
    result.header = header;
    // Also store flat for backward compatibility
    result.headerLabel = header.label;
    result.headline = header.title;
    result.headlineHighlight = header.titleHighlight;
    result.subhead = header.subtitle;
  }

  if (heroImage) {
    result.heroImage = heroImage;
    // Also store flat for backward compatibility
    result.heroImageUrl = heroImage.url;
    result.heroImageAlt = heroImage.alt;
  }

  if (quote) {
    result.quote = quote;
    // Also store flat for backward compatibility
    result.quoteText = quote.text;
    result.quoteAuthor = quote.author;
    result.quoteInsertAfterParagraph = quote.insertAfterParagraph;
    if ((quote as any).visible !== undefined) {
      result.quoteVisible = (quote as any).visible;
    }
  }

  if (sidebar) {
    result.sidebar = sidebar;
    // Also store flat for backward compatibility
    result.sidebarTitle = sidebar.title;
    result.sidebarStats = sidebar.stats;
    if ((sidebar as any).visible !== undefined) {
      result.sidebarVisible = (sidebar as any).visible;
    }
  }

  return result;
}

router.get("/impact/flex-a", async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    console.log("[flex-a] GET", { slug });
    const flexA = await findFlexABySlug(slug);

    if (!flexA) {
      console.warn("[flex-a] GET not found", { slug });
      return res.status(404).json({ error: "FlexA content not found" });
    }

    const { _id, slug: storedSlug, updatedAt, ...rawData } = flexA as any;
    
    // Transform flat DB format to nested API format
    const data = transformDbToApi(rawData);
    
    console.log("[flex-a] GET success", {
      slug,
      fields: Object.keys(data || {}),
    });
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.put("/impact/flex-a", requireAuth, async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    const data = (req.body ?? {}) as Record<string, unknown>;
    console.log("[flex-a] PUT request", {
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
      "labelTextColor",
      "headlineColor",
      "subtitleColor",
      // Hero image styling
      "heroImageBorderRadius",
      "heroOverlayColor",
      // Quote styling
      "quoteBgColor",
      "quoteTextColor",
      "quoteBorderRadius",
      "quoteAuthorColor",
      // Sidebar styling
      "sidebarBgColor",
      "sidebarBorderColor",
      "sidebarBorderRadius",
      "sidebarTitleColor",
      "sidebarTitleBorderColor",
      "statNumberColor",
      "statLabelColor",
      // Header (nested)
      "header",
      // Hero image (nested)
      "heroImage",
      // Article content
      "paragraphs",
      // Quote (nested)
      "quote",
      // Sidebar (nested)
      "sidebar",
      // Accessibility
      "ariaLabel",
    ];

    const sanitized: Record<string, unknown> = {};
    for (const key of allowedKeys) {
      if (key in data) sanitized[key] = (data as any)[key];
    }

    // Transform nested API format to flat DB format
    const dbData = transformApiToDb(sanitized);

    console.log("[flex-a] PUT sanitized", {
      slug,
      sanitizedKeys: Object.keys(dbData),
    });

    const saved = await upsertFlexABySlug(slug, dbData as any);
    const { _id, slug: storedSlug, updatedAt, ...rawResponse } = (saved ?? {}) as any;
    
    // Transform back to nested for response
    const response = transformDbToApi(rawResponse);
    
    console.log("[flex-a] PUT success", {
      slug,
      updatedFields: Object.keys(response || {}),
    });
    return res.json({ data: response });
  } catch (error) {
    return next(error);
  }
});

export default router;

