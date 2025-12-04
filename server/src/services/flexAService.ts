import { getDatabase } from '../config/database.js';

export interface FlexAStat {
  id: string;
  number: string;
  label: string;
}

export interface FlexAQuote {
  text: string;
  author: string;
  insertAfterParagraph: number;
}

export interface FlexASidebar {
  title: string;
  stats: FlexAStat[];
}

export interface FlexAHeader {
  label: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
}

export interface FlexAHeroImage {
  url: string;
  alt: string;
}

export interface FlexAContent {
  // Section visibility
  visible?: boolean | null;
  animationsEnabled?: boolean | null;

  // Section background
  sectionBgColor?: string | null;
  sectionBgGradient?: string | null;
  sectionBgImage?: string | null;

  // Colors
  primaryColor?: string | null;
  textColor?: string | null;

  // Header
  header?: FlexAHeader | null;

  // Label/Badge styling
  labelTextColor?: string | null;

  // Headline styling
  headlineColor?: string | null;

  // Subtitle styling
  subtitleColor?: string | null;

  // Hero image
  heroImage?: FlexAHeroImage | null;

  // Hero image styling
  heroImageBorderRadius?: number | null;
  heroOverlayColor?: string | null;

  // Article content
  paragraphs?: string[] | null;

  // Quote
  quote?: FlexAQuote | null;

  // Quote styling
  quoteBgColor?: string | null;
  quoteTextColor?: string | null;
  quoteBorderRadius?: number | null;
  quoteAuthorColor?: string | null;

  // Sidebar
  sidebar?: FlexASidebar | null;

  // Sidebar styling
  sidebarBgColor?: string | null;
  sidebarBorderColor?: string | null;
  sidebarBorderRadius?: number | null;
  sidebarTitleColor?: string | null;
  sidebarTitleBorderColor?: string | null;
  statNumberColor?: string | null;
  statLabelColor?: string | null;

  // Accessibility
  ariaLabel?: string | null;
}

export interface FlexADocument extends FlexAContent {
  _id?: string;
  slug?: string;
  updatedAt?: Date;
}

const FLEXA_COLLECTION = 'flex_a';

export async function findFlexABySlug(slug = 'impact-report'): Promise<FlexADocument | null> {
  const db = await getDatabase();
  const collection = db.collection<FlexADocument>(FLEXA_COLLECTION);
  const doc = await collection.findOne({ slug });
  return doc ?? null;
}

export async function upsertFlexABySlug(slug: string, data: FlexAContent): Promise<FlexADocument> {
  const db = await getDatabase();
  const collection = db.collection<FlexADocument>(FLEXA_COLLECTION);

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
  return saved as FlexADocument;
}

