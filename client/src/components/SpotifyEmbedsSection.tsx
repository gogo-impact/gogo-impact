import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import COLORS from '../../assets/colors';

type SpotifyEmbedsSectionProps = {
  title?: string;
  description?: string;
  embedUrls?: string[];
};

const Section = styled.section`
  padding: 5rem 0;
  background: linear-gradient(to bottom, #121212, #0a0a0a);
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

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 900;
  color: white;
  margin-bottom: 1rem;
  background: linear-gradient(
    to right,
    ${COLORS.gogo_blue},
    ${COLORS.gogo_teal}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.75);
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

const EmbedWrapper = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  appearance: none;
  border: none;
  cursor: pointer;
  padding: 0.75rem 1.25rem;
  border-radius: 999px;
  font-weight: 700;
  color: #0a0a0a;
  background: linear-gradient(
    to right,
    ${COLORS.gogo_blue},
    ${COLORS.gogo_teal}
  );
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

const defaultEmbeds = [
  'https://open.spotify.com/embed/album/22CwQMUEzyzKzoOl6JN5T3',
  'https://open.spotify.com/embed/album/1vN52DIyTQxa3c5x5lPbHG',
  'https://open.spotify.com/embed/album/4dkhXFnrDTnwvr9Iy5hEEW',
];

function SpotifyEmbedsSection({
  title = 'Hear our Impact',
  description = 'Explore our music on Spotify. Dive into mentor profiles and browse all our songs.',
  embedUrls = defaultEmbeds,
}: SpotifyEmbedsSectionProps) {
  const [showMentorProfiles, setShowMentorProfiles] = useState(false);
  const [showAllSongs, setShowAllSongs] = useState(false);
  const modalGridRef = useRef<HTMLDivElement>(null);

  // Light entrance animation similar to disciplines modal (optional no-op if not supported)
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

  // Spotify artist profile embeds (mentor profiles)
  const mentorArtistEmbeds: string[] = [
    'https://open.spotify.com/embed/artist/66CXWjxzNUsdJxJ2JdwvnR',
    'https://open.spotify.com/embed/artist/6vWDO969PvNqNYHIOW5v0m',
    'https://open.spotify.com/embed/artist/6eUKZXaKkcviH0Ku9w2n3V',
    'https://open.spotify.com/embed/artist/0du5cEVh5yTK9QJze8zA0C',
    'https://open.spotify.com/embed/artist/246dkjvS1zLTtiykXe5h60',
    'https://open.spotify.com/embed/artist/1Xyo4u8uXC1ZmMpatF05PJ',
  ];

  // Mix of playlists and tracks (all our songs)
  const allSongsEmbeds: string[] = [
    'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M',
    'https://open.spotify.com/embed/playlist/37i9dQZF1DX4JAvHpjipBk',
    'https://open.spotify.com/embed/track/7ouMYWpwJ422jRcDASZB7P',
    'https://open.spotify.com/embed/track/3AJwUDP919kvQ9QcozQPxg',
    'https://open.spotify.com/embed/track/0VjIjW4GlUZAMYd2vXMi3b',
    'https://open.spotify.com/embed/track/35mvY5S1H3J2QZyna3TFe0',
  ];
  return (
    <Section>
      <Container>
        <Header>
          <Title>{title}</Title>
          {description ? <Description>{description}</Description> : null}
        </Header>
        <Grid>
          {embedUrls.map((url) => (
            <EmbedWrapper key={url}>
              <iframe
                title={url}
                src={url}
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
          <ActionButton onClick={() => setShowMentorProfiles(true)}>
            Mentor Profiles
          </ActionButton>
          <ActionButton onClick={() => setShowAllSongs(true)}>
            All Our Songs
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
            background:
              'linear-gradient(180deg, rgba(22,22,22,0.96), rgba(10,10,10,0.96))',
            border: '1px solid rgba(255,255,255,0.08)',
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
        <DialogTitle sx={{ m: 0, p: 2, color: 'white' }}>
          Mentor Profiles
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
            {mentorArtistEmbeds.map((url) => (
              <div
                key={`mentor-artist-${url}`}
                data-embed-card="true"
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <iframe
                  title={url}
                  src={url}
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
            background:
              'linear-gradient(180deg, rgba(22,22,22,0.96), rgba(10,10,10,0.96))',
            border: '1px solid rgba(255,255,255,0.08)',
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
        <DialogTitle sx={{ m: 0, p: 2, color: 'white' }}>
          All Our Songs
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
            {allSongsEmbeds.map((url) => (
              <div
                key={`all-songs-${url}`}
                data-embed-card="true"
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <iframe
                  title={url}
                  src={url}
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
