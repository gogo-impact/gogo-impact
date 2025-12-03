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

// Autocomplete for places (cities or addresses)
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  addresstype?: string;
  class: string;
}

interface PlaceSuggestion {
  displayName: string;
  coordinates: [number, number];
  placeId: string;
  type: string;
  addressType?: string;
}

async function searchPlaces(query: string, mode: 'city' | 'address'): Promise<PlaceSuggestion[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    
    // For city mode, add USA country code and filter for place types
    // For address mode, search all types
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=8&addressdetails=1`;
    
    if (mode === 'city') {
      // Focus on USA cities/places
      url += '&countrycodes=us&featuretype=city';
    }
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'GOGO-Impact-Report/1.0',
      },
    });

    if (!response.ok) {
      console.error('[autocomplete] Nominatim request failed', { status: response.status });
      return [];
    }

    const results: NominatimResult[] = await response.json();
    
    // Filter and transform results based on mode
    const suggestions: PlaceSuggestion[] = results
      .filter(result => {
        if (mode === 'city') {
          // For cities, accept city, town, village, hamlet, municipality types
          const cityTypes = ['city', 'town', 'village', 'hamlet', 'municipality', 'suburb', 'neighbourhood'];
          return cityTypes.includes(result.type) || cityTypes.includes(result.addresstype || '');
        }
        // For addresses, accept all results
        return true;
      })
      .map(result => ({
        displayName: result.display_name,
        coordinates: [parseFloat(result.lat), parseFloat(result.lon)] as [number, number],
        placeId: String(result.place_id),
        type: result.type,
        addressType: result.addresstype,
      }));

    return suggestions;
  } catch (error) {
    console.error('[autocomplete] Error searching places', { query, mode, error });
    return [];
  }
}

// Place autocomplete endpoint
router.get("/impact/autocomplete-place", requireAuth, async (req, res, next) => {
  try {
    const query = req.query.q as string;
    const mode = (req.query.mode as 'city' | 'address') || 'address';
    
    if (!query || typeof query !== 'string' || query.length < 3) {
      return res.json({ suggestions: [] });
    }

    console.log('[autocomplete-place] Searching', { query, mode });
    const suggestions = await searchPlaces(query.trim(), mode);
    
    console.log('[autocomplete-place] Found', { count: suggestions.length });
    return res.json({ suggestions });
  } catch (error) {
    console.error('[autocomplete-place] Error', error);
    return res.status(500).json({ suggestions: [], error: 'Server error' });
  }
});

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

