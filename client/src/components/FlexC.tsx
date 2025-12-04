import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { Reveal } from '../../animations';
import COLORS from '../../assets/colors';
import { FlexCContent, fetchFlexCContent } from '../services/impact.api';

/**
 * Converts a regular YouTube URL to an embed URL
 * Supports formats like:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  // Already an embed URL
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  let videoId: string | null = null;
  
  // Try to extract video ID from youtube.com/watch?v=
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) {
    videoId = watchMatch[1];
  }
  
  // Try to extract from youtu.be/
  if (!videoId) {
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) {
      videoId = shortMatch[1];
    }
  }
  
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  }
  
  return null;
}

interface FlexCProps {
  previewMode?: boolean;
  flexCOverride?: FlexCContent | null;
}

interface WrapperProps {
  $bgGradient?: string;
  $primaryColor?: string;
  $titleColor?: string;
  $subtitleColor?: string;
  $notesTextColor?: string;
  $creditRoleColor?: string;
  $creditValueColor?: string;
  $borderColor?: string;
}

const Wrapper = styled.section<WrapperProps>`
  padding: 10rem 0;
  background: ${(p) => p.$bgGradient || '#050505'};
  color: #e0e0e0;
  position: relative;
  overflow: hidden;
  --section-underline: ${(p) => p.$primaryColor || COLORS.gogo_teal};
  --primary-color: ${(p) => p.$primaryColor || COLORS.gogo_teal};
  --title-color: ${(p) => p.$titleColor || '#fff'};
  --subtitle-color: ${(p) => p.$subtitleColor || 'rgba(255, 255, 255, 0.6)'};
  --notes-text-color: ${(p) => p.$notesTextColor || 'rgba(255, 255, 255, 0.8)'};
  --credit-role-color: ${(p) => p.$creditRoleColor || 'rgba(255, 255, 255, 0.4)'};
  --credit-value-color: ${(p) => p.$creditValueColor || '#fff'};
  --border-color: ${(p) => p.$borderColor || 'rgba(255, 255, 255, 0.1)'};
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
`;

const Header = styled.header`
  margin-bottom: 4rem;
`;

const Label = styled.div`
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9rem;
  color: var(--primary-color, ${COLORS.gogo_teal});
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 1rem;
  opacity: 0.8;
`;

const Title = styled.h2`
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 900;
  line-height: 0.9;
  color: var(--title-color, #fff);
  text-transform: uppercase;
  letter-spacing: -0.02em;
  margin-bottom: 1.5rem;
  
  span {
    display: block;
    font-size: 0.4em;
    font-weight: 400;
    letter-spacing: 0.1em;
    margin-top: 0.5rem;
    color: var(--subtitle-color, rgba(255, 255, 255, 0.6));
  }
`;

const PosterContainer = styled.div`
  position: relative;
  margin: 0 auto 5rem;
  max-width: 1200px;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    box-shadow: inset 0 0 100px 20px #050505;
    z-index: 2;
    pointer-events: none;
  }
`;

const PosterImage = styled.div<{ $src: string }>`
  width: 100%;
  aspect-ratio: 16/9;
  background: url('${(p) => p.$src}') center/cover no-repeat;
  border-radius: 4px;
  opacity: 0.9;
`;

const PlayButtonOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 3;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--primary-color, ${COLORS.gogo_teal});
    transform: translate(-50%, -50%) scale(1.1);
    border-color: var(--primary-color, ${COLORS.gogo_teal});
  }

  &::after {
    content: '';
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 10px 0 10px 16px;
    border-color: transparent transparent transparent #fff;
    margin-left: 4px;
  }
`;

const VideoEmbed = styled.iframe`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  z-index: 4;
`;

const CloseVideoButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
  transition: all 0.2s ease;
  color: #fff;
  font-size: 20px;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const DirectorsNotes = styled.div`
  max-width: 700px;
  margin: 0 auto 5rem;
  text-align: left;
  border-left: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  padding-left: 2rem;

  @media (max-width: 600px) {
    padding-left: 1rem;
    border-left: none;
    border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    padding-top: 2rem;
  }
`;

const NoteLabel = styled.div`
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.8rem;
  color: var(--primary-color, ${COLORS.gogo_teal});
  margin-bottom: 1rem;
  text-transform: uppercase;
`;

const NoteText = styled.p`
  font-size: 1.2rem;
  line-height: 1.7;
  color: var(--notes-text-color, rgba(255, 255, 255, 0.8));
  margin-bottom: 1.5rem;
`;

const CreditsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  padding: 2rem 0;
  text-align: left;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const CreditItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CreditRole = styled.div`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--credit-role-color, rgba(255, 255, 255, 0.4));
`;

const CreditValue = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--credit-value-color, #fff);
`;

function FlexC({ previewMode = false, flexCOverride }: FlexCProps): JSX.Element | null {
  const [internalData, setInternalData] = useState<FlexCContent | null>(null);
  const [loading, setLoading] = useState(!previewMode);
  const [error, setError] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    if (!previewMode) {
      const loadContent = async () => {
        try {
          setLoading(true);
          const content = await fetchFlexCContent();
          if (content) {
            setInternalData(content);
          } else {
            setError('Content not found. Please create it in the admin panel.');
          }
        } catch (err) {
          console.error('Failed to fetch FlexC content:', err);
          setError('Failed to load content.');
        } finally {
          setLoading(false);
        }
      };
      loadContent();
    }
  }, [previewMode]);

  const data = previewMode ? flexCOverride : internalData;

  // Get the embed URL for the video - must be called before any early returns
  const posterVideoUrl = data?.poster?.videoUrl ?? null;
  const embedUrl = useMemo(() => {
    return posterVideoUrl ? getYouTubeEmbedUrl(posterVideoUrl) : null;
  }, [posterVideoUrl]);

  if (loading) {
    return (
      <Wrapper>
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.6)' }}>
            Loading section...
          </div>
        </Container>
      </Wrapper>
    );
  }

  if (error) {
    return (
      <Wrapper>
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem', color: '#ff6b6b' }}>
            {error}
          </div>
        </Container>
      </Wrapper>
    );
  }

  if (!data || data.visible === false) {
    return null;
  }

  const header = data.header ?? { label: '', title: '', subtitle: '' };
  const poster = data.poster ?? { imageUrl: '', imageAlt: '', videoUrl: null, showPlayButton: true };
  const directorsNotes = data.directorsNotes ?? { label: '', paragraphs: [] };
  const credits = data.credits ?? [];

  const handlePlayClick = () => {
    if (embedUrl) {
      setIsVideoPlaying(true);
    }
  };

  const handleCloseVideo = () => {
    setIsVideoPlaying(false);
  };

  return (
    <Wrapper
      aria-label={data.ariaLabel || undefined}
      $bgGradient={data.sectionBgGradient || undefined}
      $primaryColor={data.primaryColor || undefined}
      $titleColor={data.titleColor || undefined}
      $subtitleColor={data.subtitleColor || undefined}
      $notesTextColor={data.notesTextColor || undefined}
      $creditRoleColor={data.creditRoleColor || undefined}
      $creditValueColor={data.creditValueColor || undefined}
      $borderColor={data.borderColor || undefined}
    >
      <Container>
        <Reveal variant="fade-up" enabled={data.animationsEnabled ?? true}>
          <Header>
            {header.label && <Label>{header.label}</Label>}
            {header.title && (
              <Title>
                {header.title}
                {header.subtitle && <span>{header.subtitle}</span>}
              </Title>
            )}
          </Header>

          {poster.imageUrl && (
            <PosterContainer>
              {isVideoPlaying && embedUrl ? (
                <>
                  <div style={{ width: '100%', aspectRatio: '16/9', position: 'relative' }}>
                    <VideoEmbed
                      src={embedUrl}
                      title="Video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    <CloseVideoButton onClick={handleCloseVideo} aria-label="Close video">
                      ✕
                    </CloseVideoButton>
                  </div>
                </>
              ) : (
                <>
                  <PosterImage $src={poster.imageUrl} />
                  {poster.showPlayButton && embedUrl && (
                    <PlayButtonOverlay onClick={handlePlayClick} role="button" aria-label="Play video" />
                  )}
                </>
              )}
            </PosterContainer>
          )}

          {(directorsNotes.label || directorsNotes.paragraphs.length > 0) && (
            <DirectorsNotes>
              {directorsNotes.label && <NoteLabel>{directorsNotes.label}</NoteLabel>}
              {directorsNotes.paragraphs.map((paragraph, idx) => (
                <NoteText key={idx}>{paragraph}</NoteText>
              ))}
            </DirectorsNotes>
          )}

          {credits.length > 0 && (
            <CreditsGrid>
              {credits.map((credit) => (
                <CreditItem key={credit.id}>
                  <CreditRole>{credit.role}</CreditRole>
                  <CreditValue>{credit.value}</CreditValue>
                </CreditItem>
              ))}
            </CreditsGrid>
          )}
        </Reveal>
      </Container>
    </Wrapper>
  );
}

export default FlexC;
