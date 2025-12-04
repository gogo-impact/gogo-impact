import { getDatabase } from '../config/database.js';

export interface FlexCHeader {
  label: string;
  title: string;
  subtitle: string;
}

export interface FlexCPoster {
  imageUrl: string;
  imageAlt: string;
  videoUrl: string | null;
  showPlayButton: boolean;
}

export interface FlexCDirectorsNotes {
  label: string;
  paragraphs: string[];
}

export interface FlexCCredit {
  id: string;
  role: string;
  value: string;
}

export interface FlexCContent {
  // Section visibility
  visible?: boolean | null;
  animationsEnabled?: boolean | null;

  // Section background
  sectionBgColor?: string | null;
  sectionBgGradient?: string | null;
  sectionBgImage?: string | null;

  // Colors
  primaryColor?: string | null;

  // Title styling
  titleColor?: string | null;
  subtitleColor?: string | null;

  // Notes styling
  notesTextColor?: string | null;

  // Credits styling
  creditRoleColor?: string | null;
  creditValueColor?: string | null;

  // Border/bar styling
  borderColor?: string | null;

  // Header
  header?: FlexCHeader | null;

  // Poster
  poster?: FlexCPoster | null;

  // Director's notes
  directorsNotes?: FlexCDirectorsNotes | null;

  // Credits
  credits?: FlexCCredit[] | null;

  // Accessibility
  ariaLabel?: string | null;
}

export interface FlexCDocument extends FlexCContent {
  _id?: string;
  slug?: string;
  updatedAt?: Date;
}

const FLEXC_COLLECTION = 'flex_c';

export async function findFlexCBySlug(slug = 'impact-report'): Promise<FlexCDocument | null> {
  const db = await getDatabase();
  const collection = db.collection<FlexCDocument>(FLEXC_COLLECTION);
  const doc = await collection.findOne({ slug });
  return doc ?? null;
}

export async function upsertFlexCBySlug(slug: string, data: FlexCContent): Promise<FlexCDocument> {
  const db = await getDatabase();
  const collection = db.collection<FlexCDocument>(FLEXC_COLLECTION);

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
  return saved as FlexCDocument;
}

