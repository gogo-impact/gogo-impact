import { getDatabase } from '../config/database.js';

export interface DefaultsContent {
  colorSwatch?: string[] | null;
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


