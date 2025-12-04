import { getDatabase } from '../config/database.js';

export interface FlexBHeader {
  label: string;
  headline: string;
}

export interface FlexBPullQuote {
  text: string;
  author: string;
  insertAfterParagraph: number;
}

export interface FlexBSidebar {
  imageUrl: string;
  imageAlt: string;
  title: string;
  bullets: string[];
}

export interface FlexBKeyTakeaway {
  text: string;
}

export interface FlexBContent {
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

  // Header styling
  labelTextColor?: string | null;
  headlineColor?: string | null;

  // Text styling
  leadParagraphColor?: string | null;
  bodyTextColor?: string | null;

  // Pull quote styling
  pullQuoteBgColor?: string | null;
  pullQuoteTextColor?: string | null;
  pullQuoteAuthorColor?: string | null;

  // Sidebar styling
  sidebarBgColor?: string | null;
  sidebarBorderColor?: string | null;
  sidebarBorderRadius?: number | null;
  sidebarImageBorderRadius?: number | null;
  sidebarTitleColor?: string | null;
  bulletTextColor?: string | null;
  bulletMarkerColor?: string | null;

  // Key takeaway styling
  keyTakeawayBgColor?: string | null;
  keyTakeawayTextColor?: string | null;
  keyTakeawayBorderRadius?: number | null;

  // Header
  header?: FlexBHeader | null;

  // Main content
  leadParagraph?: string | null;
  bodyParagraphs?: string[] | null;

  // Pull quote
  pullQuote?: FlexBPullQuote | null;

  // Sidebar
  sidebar?: FlexBSidebar | null;

  // Key takeaway
  keyTakeaway?: FlexBKeyTakeaway | null;

  // Accessibility
  ariaLabel?: string | null;
}

export interface FlexBDocument extends FlexBContent {
  _id?: string;
  slug?: string;
  updatedAt?: Date;
}

const FLEXB_COLLECTION = 'flex_b';

export async function findFlexBBySlug(slug = 'impact-report'): Promise<FlexBDocument | null> {
  const db = await getDatabase();
  const collection = db.collection<FlexBDocument>(FLEXB_COLLECTION);
  const doc = await collection.findOne({ slug });
  return doc ?? null;
}

export async function upsertFlexBBySlug(slug: string, data: FlexBContent): Promise<FlexBDocument> {
  const db = await getDatabase();
  const collection = db.collection<FlexBDocument>(FLEXB_COLLECTION);

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
  return saved as FlexBDocument;
}

