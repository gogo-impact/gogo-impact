import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import COLORS from '../../assets/colors';
import {
  fetchHearOurImpactContent,
  HearOurImpactContent,
  SpotifyEmbed,
} from '../services/impact.api';

// Default embeds for fallback
const DEFAULT_FEATURED_EMBEDS: SpotifyEmbed[] = [
  { id: 'default-1', url: 'https://open.spotify.com/embed/album/22CwQMUEzyzKzoOl6JN5T3', type: 'album' },
  { id: 'default-2', url: 'https://open.spotify.com/embed/album/1vN52DIyTQxa3c5x5lPbHG', type: 'album' },
  { id: 'default-3', url: 'https://open.spotify.com/embed/album/4dkhXFnrDTnwvr9Iy5hEEW', type: 'album' },
];

const DEFAULT_MENTOR_EMBEDS: SpotifyEmbed[] = [
  { id: 'mentor-1', url: 'https://open.spotify.com/embed/artist/66CXWjxzNUsdJxJ2JdwvnR', type: 'artist' },
  { id: 'mentor-2', url: 'https://open.spotify.com/embed/artist/6vWDO969PvNqNYHIOW5v0m', type: 'artist' },
  { id: 'mentor-3', url: 'https://open.spotify.com/embed/artist/6eUKZXaKkcviH0Ku9w2n3V', type: 'artist' },
  { id: 'mentor-4', url: 'https://open.spotify.com/embed/artist/0du5cEVh5yTK9QJze8zA0C', type: 'artist' },
  { id: 'mentor-5', url: 'https://open.spotify.com/embed/artist/246dkjvS1zLTtiykXe5h60', type: 'artist' },
  { id: 'mentor-6', url: 'https://open.spotify.com/embed/artist/1Xyo4u8uXC1ZmMpatF05PJ', type: 'artist' },
];

const DEFAULT_ALL_SONGS_EMBEDS: SpotifyEmbed[] = [
  { id: 'song-1', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M', type: 'playlist' },
  { id: 'song-2', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4JAvHpjipBk', type: 'playlist' },
  { id: 'song-3', url: 'https://open.spotify.com/embed/track/7ouMYWpwJ422jRcDASZB7P', type: 'track' },
  { id: 'song-4', url: 'https://open.spotify.com/embed/track/3AJwUDP919kvQ9QcozQPxg', type: 'track' },
  { id: 'song-5', url: 'https://open.spotify.com/embed/track/0VjIjW4GlUZAMYd2vXMi3b', type: 'track' },
  { id: 'song-6', url: 'https://open.spotify.com/embed/track/35mvY5S1H3J2QZyna3TFe0', type: 'track' },
];

interface SectionProps {
  $bgGradient?: string;
}

const Section = styled.section<SectionProps>`
  padding: 5rem 0;
  background: ${(p) => p.$bgGradient || 'linear-gradient(to bottom, #121212, #0a0a0a)'};
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

interface TitleProps {
  $gradient?: string;
}

const Title = styled.h2<TitleProps>`
  font-size: 2.5rem;
  font-weight: 900;
  color: white;
  margin-bottom: 1rem;
  background: ${(p) => p.$gradient || `linear-gradient(to right, ${COLORS.gogo_blue}, ${COLORS.gogo_teal})`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
`;

interface DescriptionProps {
  $color?: string;
}

const Description = styled.p<DescriptionProps>`
  font-size: 1.1rem;
  color: ${(p) => p.$color || 'rgba(255, 255, 255, 0.75)'};
  max-width: 800px;
  margin: 0 auto;
`;

const Grid = styled.div`
  margin-top: 2rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

interface EmbedWrapperProps {
  $bgColor?: string;
  $borderColor?: string;
}

const EmbedWrapper = styled.div<EmbedWrapperProps>`
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background: ${(p) => p.$bgColor || 'rgba(255, 255, 255, 0.06)'};
  border: 1px solid ${(p) => p.$borderColor || 'rgba(255, 255, 255, 0.08)'};
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

interface ActionButtonProps {
  $bgGradient?: string;
  $textColor?: string;
}

const ActionButton = styled.button<ActionButtonProps>`
  appearance: none;
  border: none;
  cursor: pointer;
  padding: 0.75rem 1.25rem;
  border-radius: 999px;
  font-weight: 700;
  color: ${(p) => p.$textColor || '#0a0a0a'};
  background: ${(p) => p.$bgGradient || `linear-gradient(to right, ${COLORS.gogo_blue}, ${COLORS.gogo_teal})`};
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

export interface SpotifyEmbedsSectionProps {
  hearOurImpactData?: HearOurImpactContent | null;
  previewMode?: boolean;
  hearOurImpactOverride?: Partial<HearOurImpactContent>;
}

function SpotifyEmbedsSection({
  hearOurImpactData: externalData,
  previewMode = false,
  hearOurImpactOverride,
}: SpotifyEmbedsSectionProps) {
  const [internalData, setInternalData] = useState<HearOurImpactContent | null>(externalData || null);
  const [showMentorProfiles, setShowMentorProfiles] = useState(false);
  const [showAllSongs, setShowAllSongs] = useState(false);
  const modalGridRef = useRef<HTMLDivElement>(null);

  // Fetch data if not provided externally
  useEffect(() => {
    if (externalData) {
      setInternalData(externalData);
    } else if (!previewMode) {
      fetchHearOurImpactContent().then((data) => {
        if (data) setInternalData(data);
      });
    }
  }, [externalData, previewMode]);

  // Merge data
  const effectiveData: HearOurImpactContent = externalData
    ? { ...externalData, ...(hearOurImpactOverride || {}) }
    : { ...(internalData || {}), ...(hearOurImpactOverride || {}) };

  // Extract values with fallbacks
  const sectionBgGradient = effectiveData.sectionBgGradient || '';
  const title = effectiveData.title || 'Hear our Impact';
  const titleGradient = effectiveData.titleGradient || '';
  const description = effectiveData.description || 'Explore our music on Spotify. Dive into mentor profiles and browse all our songs.';
  const descriptionColor = effectiveData.descriptionColor || '';
  const embedWrapperBgColor = effectiveData.embedWrapperBgColor || '';
  const embedWrapperBorderColor = effectiveData.embedWrapperBorderColor || '';
  const featuredEmbeds = effectiveData.featuredEmbeds?.length ? effectiveData.featuredEmbeds : DEFAULT_FEATURED_EMBEDS;
  const mentorProfilesButtonText = effectiveData.mentorProfilesButtonText || 'Mentor Profiles';
  const allSongsButtonText = effectiveData.allSongsButtonText || 'All Our Songs';
  const buttonBgGradient = effectiveData.buttonBgGradient || '';
  const buttonTextColor = effectiveData.buttonTextColor || '';
  const mentorProfilesModalTitle = effectiveData.mentorProfilesModalTitle || 'Mentor Profiles';
  const mentorProfileEmbeds = effectiveData.mentorProfileEmbeds?.length ? effectiveData.mentorProfileEmbeds : DEFAULT_MENTOR_EMBEDS;
  const allSongsModalTitle = effectiveData.allSongsModalTitle || 'All Our Songs';
  const allSongsEmbeds = effectiveData.allSongsEmbeds?.length ? effectiveData.allSongsEmbeds : DEFAULT_ALL_SONGS_EMBEDS;
  const modalBgGradient = effectiveData.modalBgGradient || 'linear-gradient(180deg, rgba(22,22,22,0.96), rgba(10,10,10,0.96))';
  const modalBorderColor = effectiveData.modalBorderColor || 'rgba(255,255,255,0.08)';
  const modalTitleColor = effectiveData.modalTitleColor || 'white';
  const modalCardBgColor = effectiveData.modalCardBgColor || 'rgba(255,255,255,0.06)';
  const modalCardBorderColor = effectiveData.modalCardBorderColor || 'rgba(255,255,255,0.08)';

  // Light entrance animation similar to disciplines modal
  useEffect(() => {
    const grid = modalGridRef.current;
    if (!grid) return;
    const cards = Array.from(
      grid.querySelectorAll('[data-embed-card="true"]'),
    ) as HTMLElement[];
    cards.forEach((node) => {
      const card = node as HTMLElement;
      card.style.opacity = '1';
      card.style.transform = 'none';
    });
  }, [showMentorProfiles, showAllSongs]);

  // Allow external triggers (e.g., from header playlist links) to open the modals.
  useEffect(() => {
    const handleMentor = () => setShowMentorProfiles(true);
    const handleStudent = () => setShowAllSongs(true);

    window.addEventListener('openMentorMusicModal', handleMentor);
    window.addEventListener('openStudentMusicModal', handleStudent);

    return () => {
      window.removeEventListener('openMentorMusicModal', handleMentor);
      window.removeEventListener('openStudentMusicModal', handleStudent);
    };
  }, [setShowMentorProfiles, setShowAllSongs]);

  return (
    <Section $bgGradient={sectionBgGradient}>
      <Container>
        <Header>
          <Title $gradient={titleGradient}>{title}</Title>
          {description ? <Description $color={descriptionColor}>{description}</Description> : null}
        </Header>
        <Grid>
          {featuredEmbeds.map((embed) => (
            <EmbedWrapper
              key={embed.id}
              $bgColor={embedWrapperBgColor}
              $borderColor={embedWrapperBorderColor}
            >
              <iframe
                title={embed.url}
                src={embed.url}
                width="100%"
                height="352"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </EmbedWrapper>
          ))}
        </Grid>
        <Actions>
          <ActionButton
            onClick={() => setShowMentorProfiles(true)}
            $bgGradient={buttonBgGradient}
            $textColor={buttonTextColor}
          >
            {mentorProfilesButtonText}
          </ActionButton>
          <ActionButton
            onClick={() => setShowAllSongs(true)}
            $bgGradient={buttonBgGradient}
            $textColor={buttonTextColor}
          >
            {allSongsButtonText}
          </ActionButton>
        </Actions>
      </Container>

      <Dialog
        open={showMentorProfiles}
        onClose={() => setShowMentorProfiles(false)}
        fullWidth
        maxWidth="xl"
        PaperProps={{
          style: {
            background: modalBgGradient,
            border: `1px solid ${modalBorderColor}`,
            borderRadius: 16,
            boxShadow:
              '0 40px 120px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 60px rgba(123,127,209,0.06)',
            width: 'min(1200px, 92vw)',
            position: 'relative',
          },
        }}
        BackdropProps={{
          style: {
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(0,0,0,0.6)',
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, color: modalTitleColor }}>
          {mentorProfilesModalTitle}
          <IconButton
            aria-label="close"
            onClick={() => setShowMentorProfiles(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <div
            ref={modalGridRef}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              padding: '16px',
            }}
          >
            {mentorProfileEmbeds.map((embed) => (
              <div
                key={embed.id}
                data-embed-card="true"
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: modalCardBgColor,
                  border: `1px solid ${modalCardBorderColor}`,
                }}
              >
                <iframe
                  title={embed.url}
                  src={embed.url}
                  width="100%"
                  height="352"
                  frameBorder={0}
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showAllSongs}
        onClose={() => setShowAllSongs(false)}
        fullWidth
        maxWidth="xl"
        PaperProps={{
          style: {
            background: modalBgGradient,
            border: `1px solid ${modalBorderColor}`,
            borderRadius: 16,
            boxShadow:
              '0 40px 120px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 60px rgba(123,127,209,0.06)',
            width: 'min(1200px, 92vw)',
            position: 'relative',
          },
        }}
        BackdropProps={{
          style: {
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(0,0,0,0.6)',
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, color: modalTitleColor }}>
          {allSongsModalTitle}
          <IconButton
            aria-label="close"
            onClick={() => setShowAllSongs(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              padding: '16px',
            }}
          >
            {allSongsEmbeds.map((embed) => (
              <div
                key={embed.id}
                data-embed-card="true"
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: modalCardBgColor,
                  border: `1px solid ${modalCardBorderColor}`,
                }}
              >
                <iframe
                  title={embed.url}
                  src={embed.url}
                  width="100%"
                  height="352"
                  frameBorder={0}
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Section>
  );
}

export default SpotifyEmbedsSection;
