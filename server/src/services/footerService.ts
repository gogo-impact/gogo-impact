import { getDatabase } from '../config/database.js';

// Social link item
export interface FooterSocialLink {
  id: string;
  iconKey: string;
  url: string;
  label: string;
}

// Link item in a column
export interface FooterLinkItem {
  id: string;
  label: string;
  url: string;
}

// Footer column
export interface FooterColumn {
  id: string;
  title: string;
  titleColor?: string | null;
  stackWithNext: boolean;  // If true, stacks vertically with the next column
  links: FooterLinkItem[];
}

// Bottom bar link
export interface FooterBottomLink {
  id: string;
  label: string;
  url: string;
}

// Bottom bar configuration
export interface FooterBottomBar {
  copyrightText: string;
  copyrightColor?: string | null;
  bgColor?: string | null;
  borderColor?: string | null;
  links: FooterBottomLink[];
  linkColor?: string | null;
  linkHoverColor?: string | null;
  linkSeparator?: string | null;
}

// Newsletter configuration
export interface FooterNewsletter {
  enabled: boolean;
  title?: string | null;
  titleColor?: string | null;
  placeholder?: string | null;
  buttonText?: string | null;
  buttonBgColor?: string | null;
  buttonTextColor?: string | null;
  inputBgColor?: string | null;
  inputBorderColor?: string | null;
  inputTextColor?: string | null;
}

// Mailing address
export interface FooterMailingAddress {
  enabled: boolean;
  text?: string | null;
  textColor?: string | null;
}

// Logo configuration
export interface FooterLogo {
  imageUrl?: string | null;
  alt?: string | null;
  width?: number | null;
}

export interface FooterContent {
  // Section visibility
  visible?: boolean | null;

  // Section background
  sectionBgGradient?: string | null;
  sectionBgColor?: string | null;

  // Top border/pattern gradient
  topBorderGradient?: string | null;

  // Logo & Branding
  logo?: FooterLogo | null;

  // Description text
  description?: string | null;
  descriptionColor?: string | null;

  // Social/Icon bubbles
  socialLinks?: FooterSocialLink[] | null;
  socialBubbleBgColor?: string | null;
  socialBubbleHoverBgColor?: string | null;
  socialBubbleIconColor?: string | null;
  socialBubbleBorderColor?: string | null;

  // Link columns
  columns?: FooterColumn[] | null;
  columnTitleColor?: string | null;
  columnLinkColor?: string | null;
  columnLinkHoverColor?: string | null;

  // Bottom bar
  bottomBar?: FooterBottomBar | null;

  // Newsletter (optional)
  newsletter?: FooterNewsletter | null;

  // Mailing address (optional)
  mailingAddress?: FooterMailingAddress | null;
}

export interface FooterDocument extends FooterContent {
  _id?: string;
  slug?: string;
  updatedAt?: Date;
}

const FOOTER_COLLECTION = 'footer';

export async function findFooterBySlug(slug = 'impact-report'): Promise<FooterDocument | null> {
  const db = await getDatabase();
  const collection = db.collection<FooterDocument>(FOOTER_COLLECTION);
  const doc = await collection.findOne({ slug });
  return doc ?? null;
}

export async function upsertFooterBySlug(slug: string, data: FooterContent): Promise<FooterDocument> {
  const db = await getDatabase();
  const collection = db.collection<FooterDocument>(FOOTER_COLLECTION);

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
  return saved as FooterDocument;
}

