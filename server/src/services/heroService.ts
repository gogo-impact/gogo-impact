import { getDatabase } from '../config/database.js';

export interface HeroCta {
  label?: string;
  href?: string;
  target?: string | null;
  rel?: string | null;
  trackingId?: string | null;
}

// Removed background video and overlay support

export interface HeroContent {
  // Background - Full CSS gradient string
  backgroundGradient?: string | null;
  backgroundColor?: string | null;
  backgroundImage?: string | null;
  backgroundImageGrayscale?: boolean | null;
  titleColor?: string | null;
  subtitleColor?: string | null;
  yearColor?: string | null;
  taglineColor?: string | null;
  primaryCtaColor?: string | null;
  secondaryCtaColor?: string | null;
  // CTA button background colors
  primaryCtaBgColor?: string | null;
  primaryCtaHoverBgColor?: string | null;
  secondaryCtaBgColor?: string | null;
  secondaryCtaHoverBgColor?: string | null;
  // Title underline color
  titleUnderlineColor?: string | null;
  // Bubble/chip styling
  bubbleTextColor?: string | null;
  bubbleBgColor?: string | null;
  bubbleBorderColor?: string | null;
  // Waveform & Music Toy
  showWaveform?: boolean | null;
  showMusicToy?: boolean | null;
  waveformGradient?: string | null;
  waveformRainbow?: boolean | null;
  title?: string;
  subtitle?: string;
  year?: string;
  tagline?: string;
  bubbles?: string[];
  primaryCta?: HeroCta | null;
  secondaryCta?: HeroCta | null;
  textAlign?: string;
  layoutVariant?: string;
  ariaLabel?: string;
}

export interface HeroDocument extends HeroContent {
  _id?: string;
  slug?: string;
  updatedAt?: Date;
}

const HERO_COLLECTION = 'hero';

export async function findHeroBySlug(slug = 'impact-report'): Promise<HeroDocument | null> {
  const db = await getDatabase();
  const collection = db.collection<HeroDocument>(HERO_COLLECTION);
  const doc = await collection.findOne({ slug });
  return doc ?? null;
}

export async function upsertHeroBySlug(slug: string, data: HeroContent): Promise<HeroDocument> {
  const db = await getDatabase();
  const collection = db.collection<HeroDocument>(HERO_COLLECTION);

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
  return saved as HeroDocument;
}

