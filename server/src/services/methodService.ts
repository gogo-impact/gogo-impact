import { getDatabase } from '../config/database.js';

// Method item interface
export interface MethodItem {
  id: string;
  iconKey: string;
  text: string;
}

export interface MethodContent {
  // Section visibility
  visible?: boolean;
  animationsEnabled?: boolean;

  // Section background
  sectionBgGradient?: string | null;
  glowColor1?: string | null;
  glowColor2?: string | null;

  // Header
  title?: string | null;
  titleGradient?: string | null;
  subtitle?: string | null;
  subtitleColor?: string | null;

  // Method cards
  cardBgColor?: string | null;
  cardBorderColor?: string | null;
  cardTitleColor?: string | null;
  iconGradient?: string | null;
  methodItems?: MethodItem[] | null;

  // Narrative section
  leadText?: string | null;
  leadTextColor?: string | null;
  secondaryText?: string | null;
  secondaryTextColor?: string | null;
  secondaryBorderColor?: string | null;
}

export interface MethodDocument extends MethodContent {
  _id?: string;
  slug?: string;
  updatedAt?: Date;
}

const METHOD_COLLECTION = 'method';

export async function findMethodBySlug(slug = 'impact-report'): Promise<MethodDocument | null> {
  const db = await getDatabase();
  const collection = db.collection<MethodDocument>(METHOD_COLLECTION);
  const doc = await collection.findOne({ slug });
  return doc ?? null;
}

export async function upsertMethodBySlug(slug: string, data: MethodContent): Promise<MethodDocument> {
  const db = await getDatabase();
  const collection = db.collection<MethodDocument>(METHOD_COLLECTION);

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
  return saved as MethodDocument;
}





