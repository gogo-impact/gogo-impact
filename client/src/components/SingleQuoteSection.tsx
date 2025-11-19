import React from 'react';
import styled, { keyframes } from 'styled-components';
import MusicNoteOutlinedIcon from '@mui/icons-material/MusicNoteOutlined';
import COLORS from '../../assets/colors';
import bgPhoto from '../../assets/missionPhotos/Photo1.jpg';

const breathe = keyframes`
  from { opacity: .85; transform: scale(1.01); }
  to { opacity: 1; transform: scale(1); }
`;

const Section = styled.section`
  position: relative;
  padding: 6rem 0 7rem;
  background: radial-gradient(
      1200px 600px at 10% 0%,
      ${COLORS.gogo_purple}0d,
      transparent 60%
    ),
    radial-gradient(
      900px 600px at 90% 100%,
      ${COLORS.gogo_blue}0d,
      transparent 60%
    ),
    #0b0b0b;
  overflow: hidden;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 1rem;
`;

const Eyebrow = styled.div`
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.35em;
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const Name = styled.h2`
  margin: 0;
  font-size: clamp(2.4rem, 7vw, 5rem);
  line-height: 0.95;
  font-weight: 900;
  letter-spacing: 0.02em;
  background: linear-gradient(
    90deg,
    ${COLORS.gogo_yellow},
    ${COLORS.gogo_teal}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

// Animated equalizer bars for a musical vibe
const rise = keyframes`
  0% { height: 25%; }
  35% { height: 95%; }
  70% { height: 35%; }
  100% { height: 25%; }
`;

const EQ = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 10px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06),
    rgba(255, 255, 255, 0.02)
  );
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(6px);
`;

const Bar = styled.div<{ $delay: number }>`
  width: 6px;
  height: 30px;
  border-radius: 6px;
  background: linear-gradient(${COLORS.gogo_teal}, ${COLORS.gogo_blue});
  animation: ${rise} 1.4s ease-in-out infinite;
  animation-delay: ${(p) => p.$delay}ms;
`;

const ImageCard = styled.figure`
  position: relative;
  margin: 1.5rem 0 0;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.35);
`;

const HeroImage = styled.img`
  display: block;
  width: 100%;
  height: auto;
  transform-origin: center;
  animation: ${breathe} 6s ease-in-out infinite alternate;

  filter: saturate(1.1);
`;

const ImageTint = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35));
  mix-blend-mode: multiply;
`;

const QuoteCard = styled.div`
  position: relative;
  max-width: 960px;
  margin: -60px auto 0;
  padding: clamp(1.25rem, 3vw, 1.8rem) clamp(1.25rem, 4vw, 2.2rem);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.04)
  );
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: white;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);

  @media (max-width: 768px) {
    margin-top: -30px;
  }
`;

const Quote = styled.blockquote`
  margin: 0 0 0.75rem 0;
  font-size: clamp(1.05rem, 2.2vw, 1.35rem);
  line-height: 1.8;
  font-weight: 700;
  letter-spacing: 0.01em;

  &:before {
    content: '“';
    color: ${COLORS.gogo_teal};
    margin-right: 0.15em;
    font-size: 1.6em;
    vertical-align: -0.2em;
  }

  &:after {
    content: '”';
    color: ${COLORS.gogo_teal};
    margin-left: 0.05em;
    font-size: 1.6em;
    vertical-align: -0.2em;
  }
`;

const Attribution = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
`;

const Note = () => (
  <MusicNoteOutlinedIcon
    fontSize="small"
    sx={{ color: COLORS.gogo_teal }}
    aria-hidden="true"
  />
);

function SingleQuoteSection(): JSX.Element {
  return (
    <Section>
      <Container>
        <Eyebrow>Testimonial</Eyebrow>
        <HeaderRow>
          <Name>Jayden Holmes</Name>
          <EQ aria-hidden="true">
            {Array.from({ length: 18 }).map((_, i) => (
              <Bar key={`bar-${i}`} $delay={i * 70} />
            ))}
          </EQ>
        </HeaderRow>

        <ImageCard>
          <HeroImage
            src={bgPhoto}
            alt="Students performing with guitars and bass on stage"
          />
          <ImageTint />
        </ImageCard>

        <QuoteCard>
          <Quote>
            Aside from all my awesome concert stories, my days in the alumni
            band are some of my best memories. From eighth grade all the way to
            senior year every Monday and Wednesday was the highlight of my week.
          </Quote>
          <Attribution>
            <Note /> — 2023 Louis Salgar Award Winner
          </Attribution>
        </QuoteCard>
      </Container>
    </Section>
  );
}

export default SingleQuoteSection;
