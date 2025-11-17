import { getDatabase } from '../config/database.js';

export interface MissionModalItem {
  name: string;
  iconKey?: string | null;
}

export interface MissionModal {
  id: string;
  title?: string;
  items: MissionModalItem[];
}

export interface MissionStat {
  id: string;
  number: string | number;
  label: string;
  color?: string;
  iconKey?: string | null;
  action?: 'none' | 'openModal';
  modalId?: string | null;
  numberSource?: 'explicit' | 'modalItemsLength';
}

export interface MissionContent {
  backgroundColor?: string | null;
  backgroundImage?: string | null;
  backgroundImageAlt?: string | null;
  backgroundImageGrayscale?: boolean | null;
  ariaLabel?: string | null;
  visible?: boolean | null;

  textAlign?: 'left' | 'center' | 'right' | string | null;
  layoutVariant?: 'ticket' | 'default' | string | null;
  animationsEnabled?: boolean | null;

  title?: string | null;
  titleColor?: string | null;
  titleGradient?: string | null;
  titleUnderlineGradient?: string | null;

  badgeLabel?: string | null;
  badgeIcon?: { type: 'glyph' | 'iconKey'; value: string } | null;
  badgeTextColor?: string | null;
  badgeBgColor?: string | null;
  badgeBorderColor?: string | null;

  statementTitle?: string | null;
  statementTitleColor?: string | null;

  statementText?: string | null;
  statementTextColor?: string | null;

  statementMeta?: string | null;
  statementMetaColor?: string | null;

  serial?: string | null;
  serialColor?: string | null;

  ticketStripeGradient?: string | null;
  ticketBorderColor?: string | null;
  ticketBackdropColor?: string | null;
  ticketShowBarcode?: boolean | null;

  backgroundLogo?: {
    enabled: boolean;
    svgKey?: string;
    opacity?: number;
    rotationDeg?: number;
    scale?: number;
  } | null;

  statsTitle?: string | null;
  statsTitleColor?: string | null;
  stats?: MissionStat[] | null;

  statsEqualizer?: {
    enabled: boolean;
    barCount?: number;
  } | null;

  modals?: MissionModal[] | null;
}

export interface MissionDocument extends MissionContent {
  _id?: string;
  slug?: string;
  updatedAt?: Date;
}

const MISSION_COLLECTION = 'mission';

export async function findMissionBySlug(slug = 'impact-report'): Promise<MissionDocument | null> {
  const db = await getDatabase();
  const collection = db.collection<MissionDocument>(MISSION_COLLECTION);
  const doc = await collection.findOne({ slug });
  return doc ?? null;
}

export async function upsertMissionBySlug(slug: string, data: MissionContent): Promise<MissionDocument> {
  const db = await getDatabase();
  const collection = db.collection<MissionDocument>(MISSION_COLLECTION);

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
  return saved as MissionDocument;
}


