import { getDatabase } from '../config/database.js';

// Section keys that can be reordered
export type ReorderableSectionKey = 
  | 'hero'
  | 'mission'
  | 'population'
  | 'financial'
  | 'method'
  | 'curriculum'
  | 'impactSection'
  | 'hearOurImpact'
  | 'testimonials'
  | 'nationalImpact'
  | 'flexA'
  | 'flexB'
  | 'flexC'
  | 'impactLevels'
  | 'partners'
  | 'footer';

export interface DefaultsContent {
  colorSwatch?: string[] | null;
  sectionOrder?: ReorderableSectionKey[] | null;
}

export interface DefaultsDocument extends DefaultsContent {
  _id?: string;
  slug?: string;
  updatedAt?: Date;
}

const DEFAULTS_COLLECTION = 'defaults';

export async function findDefaultsBySlug(slug = 'impact-report'): Promise<DefaultsDocument | null> {
  const db = await getDatabase();
  const collection = db.collection<DefaultsDocument>(DEFAULTS_COLLECTION);
  const doc = await collection.findOne({ slug });
  return doc ?? null;
}

export async function upsertDefaultsBySlug(slug: string, data: DefaultsContent): Promise<DefaultsDocument> {
  const db = await getDatabase();
  const collection = db.collection<DefaultsDocument>(DEFAULTS_COLLECTION);
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
  return saved as DefaultsDocument;
}


