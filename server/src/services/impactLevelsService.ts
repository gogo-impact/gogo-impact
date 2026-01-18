import { getDatabase } from '../config/database.js';

export interface ImpactLevelsHeader {
  title: string;
  titleGradient: string;
  subtitle: string;
  subtitleColor: string;
}

export interface ImpactLevel {
  id: string;
  imageUrl: string;
  amount: string;
  description: string;
}

export interface ImpactLevelsCTA {
  text: string;
  url: string;
  bgColor: string;
  textColor: string;
  hoverBgColor: string;
}

export interface ImpactLevelsSoundWave {
  enabled: boolean;
  color1: string;
  color2: string;
}

export interface ImpactLevelsContent {
  // Section visibility
  visible?: boolean | null;
  animationsEnabled?: boolean | null;

  // Section background
  sectionBgColor?: string | null;
  sectionBgGradient?: string | null;
  glowColor1?: string | null;
  glowColor2?: string | null;

  // Header
  header?: ImpactLevelsHeader | null;

  // Levels (cards)
  levels?: ImpactLevel[] | null;

  // Card styling
  cardBgColor?: string | null;
  cardHoverBgColor?: string | null;
  amountColor?: string | null;
  descriptionColor?: string | null;

  // CTA
  cta?: ImpactLevelsCTA | null;

  // Sound wave
  soundWave?: ImpactLevelsSoundWave | null;

  // Accessibility
  ariaLabel?: string | null;
}

export interface ImpactLevelsDocument extends ImpactLevelsContent {
  _id?: string;
  slug?: string;
  updatedAt?: Date;
}

const IMPACT_LEVELS_COLLECTION = 'impact_levels';

export async function findImpactLevelsBySlug(slug = 'impact-report'): Promise<ImpactLevelsDocument | null> {
  const db = await getDatabase();
  const collection = db.collection<ImpactLevelsDocument>(IMPACT_LEVELS_COLLECTION);
  const doc = await collection.findOne({ slug });
  return doc ?? null;
}

export async function upsertImpactLevelsBySlug(slug: string, data: ImpactLevelsContent): Promise<ImpactLevelsDocument> {
  const db = await getDatabase();
  const collection = db.collection<ImpactLevelsDocument>(IMPACT_LEVELS_COLLECTION);

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
  return saved as ImpactLevelsDocument;
}



