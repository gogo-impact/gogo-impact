import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import COLORS from '../../assets/colors';
import { fetchMethodContent, MethodContent, MethodItem } from '../services/impact.api';
import { getImpactIconByKey } from './IconSelector';

// Default method items for fallback
const DEFAULT_METHOD_ITEMS: MethodItem[] = [
  { id: '1', iconKey: 'handshakeOutlined', text: 'Trusting relationships with caring adults' },
  { id: '2', iconKey: 'menuBook', text: 'High-quality, no-cost arts education during typically unsupervised hours' },
  { id: '3', iconKey: 'lightbulb', text: 'Enriching, safe activities that foster self-esteem & creative self-expression' },
  { id: '4', iconKey: 'tuneOutlined', text: 'Skill Development' },
  { id: '5', iconKey: 'mic', text: 'Performance' },
  { id: '6', iconKey: 'favoriteBorder', text: 'Trauma-informed mental health support' },
];

// Default content
const DEFAULT_CONTENT: MethodContent = {
  title: 'Our Method',
  titleGradient: `linear-gradient(90deg, ${COLORS.gogo_blue}, ${COLORS.gogo_teal})`,
  subtitle: 'Our mentoring-centric approach is delivered by paid, professional musician mentors and helps alleviate primary challenges faced by youth in vulnerable communities by providing:',
  subtitleColor: 'rgba(255, 255, 255, 0.8)',
  sectionBgGradient: 'linear-gradient(180deg, #111111 0%, #0a0a0a 100%)',
  glowColor1: COLORS.gogo_blue,
  glowColor2: COLORS.gogo_teal,
  cardBgColor: 'rgba(255, 255, 255, 0.02)',
  cardBorderColor: 'rgba(255, 255, 255, 0.05)',
  cardTitleColor: '#ffffff',
  iconGradient: `linear-gradient(135deg, ${COLORS.gogo_blue}, ${COLORS.gogo_teal})`,
  methodItems: DEFAULT_METHOD_ITEMS,
  leadText: 'Our successful model pairs youth with a caring adult mentor, the unparalleled power of music, and trauma-informed mental health support.',
  leadTextColor: '#ffffff',
  secondaryText: 'Separately, these interventions increase academic and social-emotional development as well as future employability and economic potential. We uniquely combine these to maximize their collective effectiveness. Through weekly after-school music and art instruction, mentoring, trauma-informed care, and performance opportunities across Miami, Chicago, Los Angeles, and New York, GOGO is a platform for youth to learn, grow and unleash their leadership potential.',
  secondaryTextColor: 'rgba(255, 255, 255, 0.6)',
  secondaryBorderColor: COLORS.gogo_purple,
};

interface SectionProps {
  $bgGradient: string;
  $glowColor1: string;
  $glowColor2: string;
}

const Section = styled.section<SectionProps>`
  padding: 8rem 0;
  background: ${(p) => p.$bgGradient};
  position: relative;
  overflow: hidden;

  /* Subtle background glow */
  &::before {
    content: '';
    position: absolute;
    top: 20%;
    left: -10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, ${(p) => p.$glowColor1}11 0%, transparent 70%);
    filter: blur(80px);
    z-index: 0;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 10%;
    right: -5%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, ${(p) => p.$glowColor2}11 0%, transparent 70%);
    filter: blur(80px);
    z-index: 0;
    pointer-events: none;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
`;

const Header = styled.div`
  text-align: left;
  margin-bottom: 4rem;
  max-width: 900px;
`;

interface TitleProps {
  $gradient: string;
}

const Title = styled.h2<TitleProps>`
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 900;
  margin: 0 0 1.5rem 0;
  letter-spacing: -0.02em;
  background: ${(p) => p.$gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
`;

interface SubtitleProps {
  $color: string;
}

const Subtitle = styled.p<SubtitleProps>`
  margin: 0;
  color: ${(p) => p.$color};
  font-size: 1.25rem;
  line-height: 1.6;
  font-weight: 300;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
  margin-bottom: 4rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

interface IconWrapProps {
  $gradient: string;
}

const IconWrap = styled.div<IconWrapProps>`
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(p) => p.$gradient};
  color: white;
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 1;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;

  svg {
    width: 32px;
    height: 32px;
    stroke-width: 1.5;
  }
`;

interface CardProps {
  $bgColor: string;
  $borderColor: string;
}

const Card = styled.div<CardProps>`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: ${(p) => p.$bgColor};
  border: 1px solid ${(p) => p.$borderColor};
  border-radius: 24px;
  padding: 2rem;
  height: 100%;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);

  /* Subtle inner sheen */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 24px;
    padding: 1px;
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.01)
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  /* Hover glow effect */
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      ${COLORS.gogo_blue}15 0%,
      transparent 50%
    );
    opacity: 0;
    transform: translate(0, 0);
    transition: opacity 0.4s ease;
    pointer-events: none;
    z-index: 0;
  }

  &:hover {
    transform: translateY(-6px) scale(1.01);
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.5);

    &::after {
      opacity: 1;
    }

    ${IconWrap} {
      transform: scale(1.1);
      box-shadow: 0 0 20px ${COLORS.gogo_blue}66;
    }
  }
`;

interface CardTitleProps {
  $color: string;
}

const CardTitle = styled.h3<CardTitleProps>`
  color: ${(p) => p.$color};
  font-family: 'Century Gothic', 'Arial', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  line-height: 1.4;
  margin: 0;
  letter-spacing: -0.01em;
  position: relative;
  z-index: 1;
`;

const NarrativeContainer = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 3rem;
  align-items: start;
  margin-top: 2rem;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

interface LeadTextProps {
  $color: string;
}

const LeadText = styled.div<LeadTextProps>`
  font-size: 1.5rem;
  line-height: 1.5;
  color: ${(p) => p.$color};
  font-weight: 500;
`;

interface SecondaryTextProps {
  $color: string;
  $borderColor: string;
}

const SecondaryText = styled.div<SecondaryTextProps>`
  font-size: 0.9rem;
  line-height: 1.6;
  color: ${(p) => p.$color};
  padding-left: 2rem;
  border-left: 1px solid ${(p) => p.$borderColor};
  max-width: 90%;

  @media (max-width: 900px) {
    padding-left: 1.5rem;
    border-left-width: 2px;
    max-width: 100%;
  }
`;

interface OurMethodSectionProps {
  /** Data passed directly from parent - used for production */
  methodData?: MethodContent;
  /** Preview mode for admin editor */
  previewMode?: boolean;
  /** Override data for admin preview */
  methodOverride?: Partial<MethodContent>;
}

function OurMethodSection({ 
  methodData: externalData, 
  previewMode = false, 
  methodOverride 
}: OurMethodSectionProps): JSX.Element {
  const [internalData, setInternalData] = useState<MethodContent | null>(externalData || null);

  useEffect(() => {
    if (externalData) {
      // externalData was provided by parent - use it directly
      setInternalData(externalData);
    } else if (!previewMode) {
      // Backward compatibility: fetch data if no externalData provided
      fetchMethodContent().then((data) => {
        if (data) setInternalData(data);
      });
    }
  }, [externalData, previewMode]);

  // Use externalData, fetched data, or override (for preview mode)
  // In production (with externalData), no defaults are applied
  const effectiveData: MethodContent = externalData 
    ? { ...externalData, ...(methodOverride || {}) }
    : { ...DEFAULT_CONTENT, ...(internalData || {}), ...(methodOverride || {}) };

  // Extract values with defaults
  const title = effectiveData.title ?? DEFAULT_CONTENT.title;
  const titleGradient = effectiveData.titleGradient ?? DEFAULT_CONTENT.titleGradient;
  const subtitle = effectiveData.subtitle ?? DEFAULT_CONTENT.subtitle;
  const subtitleColor = effectiveData.subtitleColor ?? DEFAULT_CONTENT.subtitleColor;
  const sectionBgGradient = effectiveData.sectionBgGradient ?? DEFAULT_CONTENT.sectionBgGradient;
  const glowColor1 = effectiveData.glowColor1 ?? DEFAULT_CONTENT.glowColor1;
  const glowColor2 = effectiveData.glowColor2 ?? DEFAULT_CONTENT.glowColor2;
  const cardBgColor = effectiveData.cardBgColor ?? DEFAULT_CONTENT.cardBgColor;
  const cardBorderColor = effectiveData.cardBorderColor ?? DEFAULT_CONTENT.cardBorderColor;
  const cardTitleColor = effectiveData.cardTitleColor ?? DEFAULT_CONTENT.cardTitleColor;
  const iconGradient = effectiveData.iconGradient ?? DEFAULT_CONTENT.iconGradient;
  const methodItems = effectiveData.methodItems ?? DEFAULT_CONTENT.methodItems;
  const leadText = effectiveData.leadText ?? DEFAULT_CONTENT.leadText;
  const leadTextColor = effectiveData.leadTextColor ?? DEFAULT_CONTENT.leadTextColor;
  const secondaryText = effectiveData.secondaryText ?? DEFAULT_CONTENT.secondaryText;
  const secondaryTextColor = effectiveData.secondaryTextColor ?? DEFAULT_CONTENT.secondaryTextColor;
  const secondaryBorderColor = effectiveData.secondaryBorderColor ?? DEFAULT_CONTENT.secondaryBorderColor;

  // Render icon from iconKey
  const renderIcon = (iconKey: string) => {
    const iconDef = getImpactIconByKey(iconKey);
    if (iconDef) {
      const IconComponent = iconDef.Icon;
      return <IconComponent fontSize="inherit" />;
    }
    // Fallback to a default icon
    return null;
  };

  return (
    <Section
      $bgGradient={sectionBgGradient!}
      $glowColor1={glowColor1!}
      $glowColor2={glowColor2!}
    >
      <Container>
        <Header className="animate-child">
          <Title $gradient={titleGradient!}>{title}</Title>
          <Subtitle $color={subtitleColor!}>{subtitle}</Subtitle>
        </Header>

        <Grid className="animate-child">
          {methodItems!.map((item, index) => (
            <Card
              key={item.id || index}
              className="method-card"
              $bgColor={cardBgColor!}
              $borderColor={cardBorderColor!}
            >
              <IconWrap $gradient={iconGradient!} aria-hidden>
                {renderIcon(item.iconKey)}
              </IconWrap>
              <CardTitle $color={cardTitleColor!}>{item.text}</CardTitle>
            </Card>
          ))}
        </Grid>

        <NarrativeContainer className="animate-child">
          <LeadText $color={leadTextColor!}>{leadText}</LeadText>
          <SecondaryText $color={secondaryTextColor!} $borderColor={secondaryBorderColor!}>
            {secondaryText}
          </SecondaryText>
        </NarrativeContainer>
      </Container>
    </Section>
  );
}

export default OurMethodSection;
