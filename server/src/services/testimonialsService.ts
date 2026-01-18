import { getDatabase } from '../config/database.js';

export interface TestimonialsContent {
  // Section visibility
  visible?: boolean;
  animationsEnabled?: boolean;

  // Section background
  sectionBgGradient?: string | null;
  glowColor1?: string | null;
  glowColor2?: string | null;

  // Eyebrow
  eyebrowText?: string | null;
  eyebrowColor?: string | null;

  // Name
  name?: string | null;
  nameGradient?: string | null;

  // EQ bars
  eqBarGradient?: string | null;
  eqBgGradient?: string | null;
  eqBorderColor?: string | null;

  // Image
  imageUrl?: string | null;
  imageAlt?: string | null;
  imageBorderColor?: string | null;

  // Quote card
  quoteCardBgGradient?: string | null;
  quoteCardBorderColor?: string | null;

  // Quote text
  quoteText?: string | null;
  quoteTextColor?: string | null;
  quoteMarkColor?: string | null;

  // Attribution
  attributionText?: string | null;
  attributionColor?: string | null;
  attributionIconColor?: string | null;
}

export interface TestimonialsDocument extends TestimonialsContent {
  _id?: string;
  slug?: string;
  updatedAt?: Date;
}

const TESTIMONIALS_COLLECTION = 'testimonials';

export async function findTestimonialsBySlug(slug = 'impact-report'): Promise<TestimonialsDocument | null> {
  const db = await getDatabase();
  const collection = db.collection<TestimonialsDocument>(TESTIMONIALS_COLLECTION);
  const doc = await collection.findOne({ slug });
  return doc ?? null;
}

export async function upsertTestimonialsBySlug(slug: string, data: TestimonialsContent): Promise<TestimonialsDocument> {
  const db = await getDatabase();
  const collection = db.collection<TestimonialsDocument>(TESTIMONIALS_COLLECTION);

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
  return saved as TestimonialsDocument;
}




