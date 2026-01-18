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

/**
 * Converts a regular Spotify URL to an embed URL.
 * Accepts both regular URLs (https://open.spotify.com/track/xxx) 
 * and embed URLs (https://open.spotify.com/embed/track/xxx).
 * Strips query params like ?si=xxx.
 */
function toSpotifyEmbedUrl(url: string): string {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    
    // Already an embed URL - just return with path only (strips query params)
    if (parsed.pathname.startsWith('/embed/')) {
      return `https://open.spotify.com${parsed.pathname}`;
    }
    
    // Convert regular URL: /track/xxx → /embed/track/xxx
    return `https://open.spotify.com/embed${parsed.pathname}`;
  } catch {
    // If URL parsing fails, return as-is
    return url;
  }
}

interface SectionProps {
  $bgGradient?: string;
  $underlineGradient?: string;
}

const Section = styled.section<SectionProps>`
  padding: 5rem 0;
  background: ${(p) => p.$bgGradient || 'linear-gradient(to bottom, #121212, #0a0a0a)'};
  --section-underline: ${(p) => p.$underlineGradient || 'var(--spotify-green)'};
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
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
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
}: SpotifyEmbedsSectionProps): JSX.Element | null {
  const [internalData, setInternalData] = useState<HearOurImpactContent | null>(externalData || null);
  const [showMentorProfiles, setShowMentorProfiles] = useState(false);
  const [showAllSongs, setShowAllSongs] = useState(false);
  const modalGridRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

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

  // Merge data - in preview mode, override is sufficient to render
  const baseData = externalData || internalData;
  const effectiveData: HearOurImpactContent | null = 
    previewMode && hearOurImpactOverride
      ? { ...(baseData || {}), ...hearOurImpactOverride } as HearOurImpactContent
      : baseData 
        ? { ...baseData, ...(hearOurImpactOverride || {}) }
        : null;

  // If no data available, don't render anything
  if (!effectiveData) {
    return null;
  }

  // Extract values (no defaults - data must come from DB)
  const sectionBgGradient = effectiveData.sectionBgGradient || '';
  const title = effectiveData.title || '';
  const titleGradient = effectiveData.titleGradient || '';
  const description = effectiveData.description || '';
  const descriptionColor = effectiveData.descriptionColor || '';
  const embedWrapperBgColor = effectiveData.embedWrapperBgColor || '';
  const embedWrapperBorderColor = effectiveData.embedWrapperBorderColor || '';
  const featuredEmbeds = effectiveData.featuredEmbeds || [];
  const mentorProfilesButtonText = effectiveData.mentorProfilesButtonText || '';
  const allSongsButtonText = effectiveData.allSongsButtonText || '';
  const buttonBgGradient = effectiveData.buttonBgGradient || '';
  const buttonTextColor = effectiveData.buttonTextColor || '';
  const mentorProfilesModalTitle = effectiveData.mentorProfilesModalTitle || '';
  const mentorProfileEmbeds = effectiveData.mentorProfileEmbeds || [];
  const allSongsModalTitle = effectiveData.allSongsModalTitle || '';
  const allSongsEmbeds = effectiveData.allSongsEmbeds || [];
  const modalBgGradient = effectiveData.modalBgGradient || '';
  const modalBorderColor = effectiveData.modalBorderColor || '';
  const modalTitleColor = effectiveData.modalTitleColor || '';
  const modalCardBgColor = effectiveData.modalCardBgColor || '';
  const modalCardBorderColor = effectiveData.modalCardBorderColor || '';

  return (
    <Section ref={sectionRef} $bgGradient={sectionBgGradient} $underlineGradient={titleGradient}>
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
                src={toSpotifyEmbedUrl(embed.url)}
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
        container={previewMode ? sectionRef.current : undefined}
        disablePortal={previewMode}
        disableEnforceFocus={previewMode}
        disableAutoFocus={previewMode}
        hideBackdrop={previewMode}
        PaperProps={{
          style: {
            background: modalBgGradient,
            border: `1px solid ${modalBorderColor}`,
            borderRadius: 16,
            boxShadow:
              '0 40px 120px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 60px rgba(123,127,209,0.06)',
            width: previewMode ? '95%' : 'min(1200px, 92vw)',
            maxHeight: previewMode ? '90%' : undefined,
            position: 'relative',
          },
        }}
        BackdropProps={{
          style: {
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(0,0,0,0.6)',
            position: previewMode ? 'absolute' : undefined,
          },
        }}
        sx={previewMode ? {
          position: 'absolute',
          '& .MuiDialog-container': {
            position: 'absolute',
          },
        } : undefined}
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
                  src={toSpotifyEmbedUrl(embed.url)}
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
        container={previewMode ? sectionRef.current : undefined}
        disablePortal={previewMode}
        disableEnforceFocus={previewMode}
        disableAutoFocus={previewMode}
        hideBackdrop={previewMode}
        PaperProps={{
          style: {
            background: modalBgGradient,
            border: `1px solid ${modalBorderColor}`,
            borderRadius: 16,
            boxShadow:
              '0 40px 120px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 60px rgba(123,127,209,0.06)',
            width: previewMode ? '95%' : 'min(1200px, 92vw)',
            maxHeight: previewMode ? '90%' : undefined,
            position: 'relative',
          },
        }}
        BackdropProps={{
          style: {
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(0,0,0,0.6)',
            position: previewMode ? 'absolute' : undefined,
          },
        }}
        sx={previewMode ? {
          position: 'absolute',
          '& .MuiDialog-container': {
            position: 'absolute',
          },
        } : undefined}
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
                  src={toSpotifyEmbedUrl(embed.url)}
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
