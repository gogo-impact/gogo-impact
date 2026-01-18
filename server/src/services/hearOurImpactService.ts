import { getDatabase } from '../config/database.js';

// Spotify embed interface
export interface SpotifyEmbed {
  id: string;
  url: string;
  type: 'album' | 'artist' | 'playlist' | 'track';
}

export interface HearOurImpactContent {
  // Section visibility
  visible?: boolean;
  animationsEnabled?: boolean;

  // Section background
  sectionBgGradient?: string | null;

  // Header
  title?: string | null;
  titleGradient?: string | null;
  description?: string | null;
  descriptionColor?: string | null;

  // Embed card styling
  embedWrapperBgColor?: string | null;
  embedWrapperBorderColor?: string | null;

  // Featured embeds (main grid)
  featuredEmbeds?: SpotifyEmbed[] | null;

  // Action buttons
  mentorProfilesButtonText?: string | null;
  allSongsButtonText?: string | null;
  buttonBgGradient?: string | null;
  buttonTextColor?: string | null;

  // Mentor profiles modal
  mentorProfilesModalTitle?: string | null;
  mentorProfileEmbeds?: SpotifyEmbed[] | null;

  // All songs modal
  allSongsModalTitle?: string | null;
  allSongsEmbeds?: SpotifyEmbed[] | null;

  // Modal styling
  modalBgGradient?: string | null;
  modalBorderColor?: string | null;
  modalTitleColor?: string | null;
  modalCardBgColor?: string | null;
  modalCardBorderColor?: string | null;
}

export interface HearOurImpactDocument extends HearOurImpactContent {
  _id?: string;
  slug?: string;
  updatedAt?: Date;
}

const HEAR_OUR_IMPACT_COLLECTION = 'hear_our_impact';

export async function findHearOurImpactBySlug(slug = 'impact-report'): Promise<HearOurImpactDocument | null> {
  const db = await getDatabase();
  const collection = db.collection<HearOurImpactDocument>(HEAR_OUR_IMPACT_COLLECTION);
  const doc = await collection.findOne({ slug });
  return doc ?? null;
}

export async function upsertHearOurImpactBySlug(slug: string, data: HearOurImpactContent): Promise<HearOurImpactDocument> {
  const db = await getDatabase();
  const collection = db.collection<HearOurImpactDocument>(HEAR_OUR_IMPACT_COLLECTION);

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
  return saved as HearOurImpactDocument;
}




