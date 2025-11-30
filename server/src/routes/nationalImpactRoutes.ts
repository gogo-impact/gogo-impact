import { Router } from 'express';
import { findNationalImpactBySlug, upsertNationalImpactBySlug } from "../services/nationalImpactService.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

// Geocoding using OpenStreetMap Nominatim (free, no API key required)
async function geocodeAddress(address: string): Promise<{ formattedAddress: string; coordinates: [number, number] } | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'GOGO-Impact-Report/1.0',
        },
      }
    );

    if (!response.ok) {
      console.error('[geocode] Nominatim request failed', { status: response.status });
      return null;
    }

    const results = await response.json();
    if (!results || results.length === 0) {
      console.warn('[geocode] No results for address', { address });
      return null;
    }

    const result = results[0];
    return {
      formattedAddress: result.display_name,
      coordinates: [parseFloat(result.lat), parseFloat(result.lon)],
    };
  } catch (error) {
    console.error('[geocode] Error geocoding address', { address, error });
    return null;
  }
}

// Address validation endpoint
router.post("/impact/validate-address", requireAuth, async (req, res, next) => {
  try {
    const { address } = req.body;
    
    if (!address || typeof address !== 'string' || !address.trim()) {
      return res.status(400).json({ valid: false, error: 'Address is required' });
    }

    console.log('[validate-address] Geocoding', { address });
    const result = await geocodeAddress(address.trim());

    if (!result) {
      return res.json({ valid: false, error: 'Could not find address. Please check and try again.' });
    }

    console.log('[validate-address] Success', { 
      original: address, 
      formatted: result.formattedAddress,
      coordinates: result.coordinates 
    });

    return res.json({
      valid: true,
      formattedAddress: result.formattedAddress,
      coordinates: result.coordinates,
    });
  } catch (error) {
    console.error('[validate-address] Error', error);
    return res.status(500).json({ valid: false, error: 'Server error validating address' });
  }
});

router.get("/impact/national-impact", async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    console.log("[national-impact] GET", { slug });
    const nationalImpact = await findNationalImpactBySlug(slug);

    if (!nationalImpact) {
      console.warn("[national-impact] GET not found", { slug });
      return res.status(404).json({ error: "National impact content not found" });
    }

    const { _id, slug: storedSlug, ...data } = nationalImpact;
    console.log("[national-impact] GET success", {
      slug,
      fields: Object.keys(data || {}),
      regionCount: data.regions?.length || 0,
    });
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.put("/impact/national-impact", requireAuth, async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    const data = (req.body ?? {}) as Record<string, unknown>;
    console.log("[national-impact] PUT request", {
      slug,
      incomingKeys: Object.keys(data || {}),
    });

    const allowedKeys = [
      // Visibility
      "visible",
      "animationsEnabled",
      // Header
      "title",
      "titleColor",
      // Background
      "sectionBgColor",
      // Overlay button
      "overlayButtonBgColor",
      "overlayButtonHoverBgColor",
      // Regions
      "regions",
    ];

    const sanitized: Record<string, unknown> = {};
    for (const key of allowedKeys) {
      if (key in data) sanitized[key] = (data as Record<string, unknown>)[key];
    }

    console.log("[national-impact] PUT sanitized", {
      slug,
      sanitizedKeys: Object.keys(sanitized),
      regionCount: Array.isArray(sanitized.regions) ? sanitized.regions.length : 0,
    });

    const saved = await upsertNationalImpactBySlug(slug, sanitized as Record<string, unknown>);
    const { _id, slug: storedSlug, ...response } = saved ?? {};
    console.log("[national-impact] PUT success", {
      slug,
      updatedFields: Object.keys(response || {}),
    });
    return res.json({ data: response });
  } catch (error) {
    return next(error);
  }
});

export default router;

