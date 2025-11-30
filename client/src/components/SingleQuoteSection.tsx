import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import MusicNoteOutlinedIcon from '@mui/icons-material/MusicNoteOutlined';
import COLORS from '../../assets/colors';
import bgPhoto from '../../assets/missionPhotos/Photo1.jpg';
import {
  fetchTestimonialsContent,
  TestimonialsContent,
} from '../services/impact.api';

const breathe = keyframes`
  from { opacity: .85; transform: scale(1.01); }
  to { opacity: 1; transform: scale(1); }
`;

interface SectionProps {
  $bgGradient?: string;
  $glowColor1?: string;
  $glowColor2?: string;
}

const Section = styled.section<SectionProps>`
  position: relative;
  padding: 6rem 0 7rem;
  background: ${(p) => p.$bgGradient || `radial-gradient(
      1200px 600px at 10% 0%,
      ${p.$glowColor1 || `${COLORS.gogo_purple}0d`},
      transparent 60%
    ),
    radial-gradient(
      900px 600px at 90% 100%,
      ${p.$glowColor2 || `${COLORS.gogo_blue}0d`},
      transparent 60%
    ),
    #0b0b0b`};
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

interface EyebrowProps {
  $color?: string;
}

const Eyebrow = styled.div<EyebrowProps>`
  color: ${(p) => p.$color || 'rgba(255, 255, 255, 0.7)'};
  letter-spacing: 0.35em;
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

interface NameProps {
  $gradient?: string;
}

const Name = styled.h2<NameProps>`
  margin: 0;
  font-size: clamp(2.4rem, 7vw, 5rem);
  line-height: 0.95;
  font-weight: 900;
  letter-spacing: 0.02em;
  background: ${(p) => p.$gradient || `linear-gradient(90deg, ${COLORS.gogo_yellow}, ${COLORS.gogo_teal})`};
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

interface EQProps {
  $bgGradient?: string;
  $borderColor?: string;
}

const EQ = styled.div<EQProps>`
  display: flex;
  align-items: flex-end;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 10px;
  background: ${(p) => p.$bgGradient || `linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06),
    rgba(255, 255, 255, 0.02)
  )`};
  border: 1px solid ${(p) => p.$borderColor || 'rgba(255, 255, 255, 0.08)'};
  backdrop-filter: blur(6px);
`;

interface BarProps {
  $delay: number;
  $gradient?: string;
}

const Bar = styled.div<BarProps>`
  width: 6px;
  height: 30px;
  border-radius: 6px;
  background: ${(p) => p.$gradient || `linear-gradient(${COLORS.gogo_teal}, ${COLORS.gogo_blue})`};
  animation: ${rise} 1.4s ease-in-out infinite;
  animation-delay: ${(p) => p.$delay}ms;
`;

interface ImageCardProps {
  $borderColor?: string;
}

const ImageCard = styled.figure<ImageCardProps>`
  position: relative;
  margin: 1.5rem 0 0;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid ${(p) => p.$borderColor || 'rgba(255, 255, 255, 0.06)'};
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

interface QuoteCardProps {
  $bgGradient?: string;
  $borderColor?: string;
}

const QuoteCard = styled.div<QuoteCardProps>`
  position: relative;
  max-width: 960px;
  margin: -60px auto 0;
  padding: clamp(1.25rem, 3vw, 1.8rem) clamp(1.25rem, 4vw, 2.2rem);
  background: ${(p) => p.$bgGradient || `linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.04)
  )`};
  border: 1px solid ${(p) => p.$borderColor || 'rgba(255, 255, 255, 0.12)'};
  color: white;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);

  @media (max-width: 768px) {
    margin-top: -30px;
  }
`;

interface QuoteProps {
  $textColor?: string;
  $markColor?: string;
}

const Quote = styled.blockquote<QuoteProps>`
  margin: 0 0 0.75rem 0;
  font-size: clamp(1.05rem, 2.2vw, 1.35rem);
  line-height: 1.8;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: ${(p) => p.$textColor || 'white'};

  &:before {
    content: '"';
    color: ${(p) => p.$markColor || COLORS.gogo_teal};
    margin-right: 0.15em;
    font-size: 1.6em;
    vertical-align: -0.2em;
  }

  &:after {
    content: '"';
    color: ${(p) => p.$markColor || COLORS.gogo_teal};
    margin-left: 0.05em;
    font-size: 1.6em;
    vertical-align: -0.2em;
  }
`;

interface AttributionProps {
  $color?: string;
}

const Attribution = styled.div<AttributionProps>`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: ${(p) => p.$color || 'rgba(255, 255, 255, 0.8)'};
  font-style: italic;
`;

interface NoteProps {
  color?: string;
}

const Note = ({ color }: NoteProps) => (
  <MusicNoteOutlinedIcon
    fontSize="small"
    sx={{ color: color || COLORS.gogo_teal }}
    aria-hidden="true"
  />
);

export interface SingleQuoteSectionProps {
  testimonialsData?: TestimonialsContent | null;
  previewMode?: boolean;
  testimonialsOverride?: Partial<TestimonialsContent>;
}

function SingleQuoteSection({
  testimonialsData: externalData,
  previewMode = false,
  testimonialsOverride,
}: SingleQuoteSectionProps): JSX.Element {
  const [internalData, setInternalData] = useState<TestimonialsContent | null>(externalData || null);

  // Fetch data if not provided externally
  useEffect(() => {
    if (externalData) {
      setInternalData(externalData);
    } else if (!previewMode) {
      fetchTestimonialsContent().then((data) => {
        if (data) setInternalData(data);
      });
    }
  }, [externalData, previewMode]);

  // Merge data
  const effectiveData: TestimonialsContent = externalData
    ? { ...externalData, ...(testimonialsOverride || {}) }
    : { ...(internalData || {}), ...(testimonialsOverride || {}) };

  // Extract values with fallbacks
  const sectionBgGradient = effectiveData.sectionBgGradient || '';
  const glowColor1 = effectiveData.glowColor1 || '';
  const glowColor2 = effectiveData.glowColor2 || '';
  const eyebrowText = effectiveData.eyebrowText || 'Testimonial';
  const eyebrowColor = effectiveData.eyebrowColor || '';
  const name = effectiveData.name || 'Jayden Holmes';
  const nameGradient = effectiveData.nameGradient || '';
  const eqBarGradient = effectiveData.eqBarGradient || '';
  const eqBgGradient = effectiveData.eqBgGradient || '';
  const eqBorderColor = effectiveData.eqBorderColor || '';
  const imageUrl = effectiveData.imageUrl || bgPhoto;
  const imageAlt = effectiveData.imageAlt || 'Students performing with guitars and bass on stage';
  const imageBorderColor = effectiveData.imageBorderColor || '';
  const quoteCardBgGradient = effectiveData.quoteCardBgGradient || '';
  const quoteCardBorderColor = effectiveData.quoteCardBorderColor || '';
  const quoteText = effectiveData.quoteText || 'Aside from all my awesome concert stories, my days in the alumni band are some of my best memories. From eighth grade all the way to senior year every Monday and Wednesday was the highlight of my week.';
  const quoteTextColor = effectiveData.quoteTextColor || '';
  const quoteMarkColor = effectiveData.quoteMarkColor || '';
  const attributionText = effectiveData.attributionText || '— 2023 Louis Salgar Award Winner';
  const attributionColor = effectiveData.attributionColor || '';
  const attributionIconColor = effectiveData.attributionIconColor || '';

  return (
    <Section
      $bgGradient={sectionBgGradient}
      $glowColor1={glowColor1}
      $glowColor2={glowColor2}
    >
      <Container>
        <Eyebrow $color={eyebrowColor}>{eyebrowText}</Eyebrow>
        <HeaderRow>
          <Name $gradient={nameGradient}>{name}</Name>
          <EQ
            aria-hidden="true"
            $bgGradient={eqBgGradient}
            $borderColor={eqBorderColor}
          >
            {Array.from({ length: 18 }).map((_, i) => (
              <Bar key={`bar-${i}`} $delay={i * 70} $gradient={eqBarGradient} />
            ))}
          </EQ>
        </HeaderRow>

        <ImageCard $borderColor={imageBorderColor}>
          <HeroImage
            src={imageUrl}
            alt={imageAlt}
          />
          <ImageTint />
        </ImageCard>

        <QuoteCard
          $bgGradient={quoteCardBgGradient}
          $borderColor={quoteCardBorderColor}
        >
          <Quote $textColor={quoteTextColor} $markColor={quoteMarkColor}>
            {quoteText}
          </Quote>
          <Attribution $color={attributionColor}>
            <Note color={attributionIconColor} /> {attributionText}
          </Attribution>
        </QuoteCard>
      </Container>
    </Section>
  );
}

export default SingleQuoteSection;
