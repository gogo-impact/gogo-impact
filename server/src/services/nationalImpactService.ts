import { getDatabase } from '../config/database.js';

export type MapLocationType =
  | 'school'
  | 'community-center'
  | 'studio'
  | 'academy'
  | 'hub'
  | 'program'
  | 'office'
  | 'summer-program'
  | 'performance-venue'
  | 'default';

export interface MapLocation {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  showAddress?: boolean;
  type?: MapLocationType | null;
  description?: string | null;
  website?: string | null;
}

export interface MapRegion {
  id: string;
  name: string;
  color?: string | null;
  locations: MapLocation[];
}

export interface NationalImpactContent {
  // Section visibility
  visible?: boolean;
  animationsEnabled?: boolean;

  // Section header
  title?: string | null;
  titleColor?: string | null;

  // Section background
  sectionBgColor?: string | null;

  // Overlay button
  overlayButtonBgColor?: string | null;
  overlayButtonHoverBgColor?: string | null;

  // Regions data
  regions?: MapRegion[] | null;
}

export interface NationalImpactDocument extends NationalImpactContent {
  _id?: string;
  slug?: string;
  updatedAt?: Date;
}

const NATIONAL_IMPACT_COLLECTION = 'national_impact';

export async function findNationalImpactBySlug(slug = 'impact-report'): Promise<NationalImpactDocument | null> {
  const db = await getDatabase();
  const collection = db.collection<NationalImpactDocument>(NATIONAL_IMPACT_COLLECTION);
  const doc = await collection.findOne({ slug });
  return doc ?? null;
}

export async function upsertNationalImpactBySlug(slug: string, data: NationalImpactContent): Promise<NationalImpactDocument> {
  const db = await getDatabase();
  const collection = db.collection<NationalImpactDocument>(NATIONAL_IMPACT_COLLECTION);

  const now = new Date();
  const update = {
    $set: {
      ...data,
      slug,
      updatedAt: now,
    },
  };

  await collection.updateOne({ slug }, update, { upsert: true });
  const saved = await collection.findOne({ slug });
  return saved as NationalImpactDocument;
}

