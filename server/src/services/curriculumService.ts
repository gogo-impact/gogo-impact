import { getDatabase } from '../config/database.js';

// Timeline item interface
export interface CurriculumTimelineItem {
  id: string;
  title: string;
  text: string;
}

// Pedal card interface
export interface CurriculumPedalCard {
  id: string;
  title: string;
  text: string;
  accentColor: string;
  badges: string[];
}

export interface CurriculumContent {
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

  // Equalizer bar colors
  eqColor1?: string | null;
  eqColor2?: string | null;
  eqColor3?: string | null;

  // Pedal cards
  pedalCards?: CurriculumPedalCard[] | null;
  pedalBgColor?: string | null;
  pedalBorderColor?: string | null;
  cardTitleColor?: string | null;
  cardTextColor?: string | null;

  // Timeline section
  timelineTitle?: string | null;
  timelineTitleColor?: string | null;
  timelineBgColor?: string | null;
  timelineBorderColor?: string | null;
  timelineItems?: CurriculumTimelineItem[] | null;
  timelineItemTitleColor?: string | null;
  timelineItemTextColor?: string | null;
}

export interface CurriculumDocument extends CurriculumContent {
  _id?: string;
  slug?: string;
  updatedAt?: Date;
}

const CURRICULUM_COLLECTION = 'curriculum';

export async function findCurriculumBySlug(slug = 'impact-report'): Promise<CurriculumDocument | null> {
  const db = await getDatabase();
  const collection = db.collection<CurriculumDocument>(CURRICULUM_COLLECTION);
  const doc = await collection.findOne({ slug });
  return doc ?? null;
}

export async function upsertCurriculumBySlug(slug: string, data: CurriculumContent): Promise<CurriculumDocument> {
  const db = await getDatabase();
  const collection = db.collection<CurriculumDocument>(CURRICULUM_COLLECTION);

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
  return saved as CurriculumDocument;
}





