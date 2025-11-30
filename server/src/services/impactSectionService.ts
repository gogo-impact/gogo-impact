import { getDatabase } from '../config/database.js';

// Turntable stat interface
export interface ImpactTurntableStat {
  id: string;
  number: number;
  label: string;
  colorA: string;
  colorB: string;
}

// Highlight chip interface
export interface ImpactHighlightChip {
  id: string;
  text: string;
  iconKey: string;
}

// Highlight card interface
export interface ImpactHighlightCard {
  id: string;
  title: string;
  text: string;
}

// Method item for "Our Method Provides" section
export interface ImpactMethodItem {
  id: string;
  iconKey?: string | null;
  title: string;
  text: string;
}

// Tool item for "Measurement & Evaluation Tools" section
export interface ImpactToolItem {
  id: string;
  iconSvg?: string | null;
  title: string;
  description: string;
}

export interface ImpactSectionContent {
  // Section visibility
  visible?: boolean;
  animationsEnabled?: boolean;

  // Section background
  sectionBgGradient?: string | null;
  topBorderGradient?: string | null;

  // Top image carousel
  topCarouselImages?: string[] | null;

  // Stats section
  statsTitle?: string | null;
  statsTitleColor?: string | null;
  turntableStats?: ImpactTurntableStat[] | null;
  turntableCardBgGradient?: string | null;
  turntableCardBorderColor?: string | null;
  statCaptionColor?: string | null;

  // Highlights section
  highlightsTitle?: string | null;
  highlightsTitleColor?: string | null;
  highlightsSubtitle?: string | null;
  highlightsSubtitleColor?: string | null;
  highlightChips?: ImpactHighlightChip[] | null;
  highlightChipBgColor?: string | null;
  highlightChipBorderColor?: string | null;
  highlightChipTextColor?: string | null;
  highlightCards?: ImpactHighlightCard[] | null;
  highlightCardBgColor?: string | null;
  highlightCardBorderColor?: string | null;
  highlightCardTitleColor?: string | null;
  highlightCardTextColor?: string | null;

  // Bottom image carousel
  bottomCarouselImages?: string[] | null;

  // Measurement section header
  measureTitle?: string | null;
  measureTitleHighlight?: string | null;
  measureTitleColor?: string | null;
  measureTitleHighlightColor?: string | null;
  measureSubtitle?: string | null;
  measureSubtitleColor?: string | null;

  // "Our Method Provides" card (left column)
  methodCardTitle?: string | null;
  methodCardTitleColor?: string | null;
  methodCardAccentGradient?: string | null;
  methodCardBgColor?: string | null;
  methodCardBorderColor?: string | null;
  methodItems?: ImpactMethodItem[] | null;
  methodItemBgColor?: string | null;
  methodItemBorderColor?: string | null;
  methodItemTitleColor?: string | null;
  methodItemTextColor?: string | null;
  methodCardFooterText?: string | null;
  methodCardFooterTextColor?: string | null;

  // "Measurement & Evaluation Tools" card (right column)
  toolsCardTitle?: string | null;
  toolsCardTitleColor?: string | null;
  toolsCardBgColor?: string | null;
  toolsCardBorderColor?: string | null;
  toolItems?: ImpactToolItem[] | null;
  toolIconBgGradient?: string | null;
  toolNameColor?: string | null;
  toolDescriptionColor?: string | null;
  toolsFooterText?: string | null;
  toolsFooterTextColor?: string | null;
}

export interface ImpactSectionDocument extends ImpactSectionContent {
  _id?: string;
  slug?: string;
  updatedAt?: Date;
}

const IMPACT_SECTION_COLLECTION = 'impact_section';

export async function findImpactSectionBySlug(slug = 'impact-report'): Promise<ImpactSectionDocument | null> {
  const db = await getDatabase();
  const collection = db.collection<ImpactSectionDocument>(IMPACT_SECTION_COLLECTION);
  const doc = await collection.findOne({ slug });
  return doc ?? null;
}

export async function upsertImpactSectionBySlug(slug: string, data: ImpactSectionContent): Promise<ImpactSectionDocument> {
  const db = await getDatabase();
  const collection = db.collection<ImpactSectionDocument>(IMPACT_SECTION_COLLECTION);

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
  return saved as ImpactSectionDocument;
}


