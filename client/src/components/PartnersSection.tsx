import React, { useEffect, useMemo, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import COLORS from '../../assets/colors';
import { PartnersContent, PartnerItem, fetchPartnersContent } from '../services/impact.api';

interface SectionProps {
  $sectionBgGradient?: string | null;
  $glowColor1?: string | null;
  $glowColor2?: string | null;
  $glowColor3?: string | null;
  $titleGradient?: string | null;
}

const PartnersSectionWrapper = styled.section<SectionProps>`
  position: relative;
  padding: 8rem 0;
  background: ${(p) => p.$sectionBgGradient || 'linear-gradient(180deg, #121212 0%, #0f0f10 100%)'};
  overflow: hidden;
  --section-underline: ${(p) => p.$titleGradient || 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)'};

  /* Glow 1 - top left */
  &:before {
    content: '';
    position: absolute;
    top: -10%;
    left: -10%;
    width: 80rem;
    height: 60rem;
    background: radial-gradient(
      closest-side,
      ${(p) => p.$glowColor1 || 'rgba(79, 70, 229, 0.25)'},
      transparent
    );
    pointer-events: none;
  }

  /* Glow 2 - top right */
  &:after {
    content: '';
    position: absolute;
    top: -5%;
    right: -10%;
    width: 70rem;
    height: 50rem;
    background: radial-gradient(
      closest-side,
      ${(p) => p.$glowColor2 || 'rgba(16, 185, 129, 0.15)'},
      transparent
    );
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 3rem 0;
  }
`;

// Separate glow element for glow 3
const Glow3 = styled.div<{ $glowColor3?: string | null }>`
  position: absolute;
  inset: -20% -10% auto -10%;
  height: 40rem;
  background: radial-gradient(
    closest-side,
    ${(p) => p.$glowColor3 || 'rgba(56, 189, 248, 0.1)'},
    transparent
  );
  filter: blur(60px);
  pointer-events: none;
`;

const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 100%;
  position: relative;
  z-index: 1;

  @media (max-width: 480px) {
    padding: 0 1rem;
  }
`;

const Heading = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

interface TitleProps {
  $titleGradient?: string | null;
}

const Title = styled.h2<TitleProps>`
  margin: 0.9rem 0 0.4rem;
  font-size: 3rem;
  line-height: 1.1;
  font-weight: 900;
  letter-spacing: -0.02em;
  background: ${(p) => p.$titleGradient || 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)'};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

interface SubTitleProps {
  $subtitleColor?: string | null;
}

const SubTitle = styled.p<SubTitleProps>`
  margin: 0.5rem auto 0;
  max-width: 760px;
  color: ${(p) => p.$subtitleColor || '#94a3b8'};
  font-size: 1.1rem;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

interface GridLabelProps {
  $gridLabelColor?: string | null;
}

const GridLabel = styled.p<GridLabelProps>`
  margin: 1rem 0 0;
  text-align: left;
  color: ${(p) => p.$gridLabelColor || '#cbd5e1'};
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-top: 1rem;
  }
`;

interface BadgeProps {
  $badgeBgColor?: string | null;
  $badgeHoverBgColor?: string | null;
  $badgeBorderColor?: string | null;
  $badgeHoverBorderColor?: string | null;
  $badgeBorderRadius?: number | null;
}

const Badge = styled.a<BadgeProps>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: ${(p) => p.$badgeBorderRadius ?? 16}px;
  background: ${(p) => p.$badgeBgColor || 'rgba(255, 255, 255, 0.03)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${(p) => p.$badgeBorderColor || 'rgba(255, 255, 255, 0.06)'};
  text-decoration: none;
  color: #f3f4f6;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px) scale(1.02);
    border-color: ${(p) => p.$badgeHoverBorderColor || 'rgba(255, 255, 255, 0.1)'};
    background: ${(p) => p.$badgeHoverBgColor || 'rgba(255, 255, 255, 0.06)'};
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  }

  @media (max-width: 768px) {
    padding: 0.6rem;
    gap: 0.5rem;
    border-radius: 10px;
  }
`;

const Dot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  box-shadow: 0 0 10px ${(p) => p.$color}, 0 0 0 2px rgba(255, 255, 255, 0.1) inset;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 6px;
    height: 6px;
  }
`;

const BadgeText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

interface BadgeTitleProps {
  $badgeTitleColor?: string | null;
}

const BadgeTitle = styled.span<BadgeTitleProps>`
  font-weight: 700;
  font-size: 1rem;
  line-height: 1.2;
  color: ${(p) => p.$badgeTitleColor || '#f1f5f9'};

  @media (max-width: 768px) {
    font-size: 0.65rem;
    line-height: 1.3;
  }
`;

interface BadgeSubProps {
  $badgeDescriptorColor?: string | null;
}

const BadgeSub = styled.span<BadgeSubProps>`
  font-size: 0.85rem;
  color: ${(p) => p.$badgeDescriptorColor || '#94a3b8'};

  @media (max-width: 768px) {
    font-size: 0.55rem;
  }
`;

interface ScrollProps {
  $speed?: number;
}

const scroll = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-25%); }
`;

const TickerWrapper = styled.div`
  overflow: hidden;
  margin-top: 1rem;
  mask-image: linear-gradient(
    to right,
    transparent 0,
    #000 10%,
    #000 90%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0,
    #000 10%,
    #000 90%,
    transparent 100%
  );
`;

const TickerRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-top: 3rem;
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    top: -1.5rem;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  }

  @media (max-width: 768px) {
    gap: 1.25rem;
    margin-top: 2rem;
  }
`;

const ButtonsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

interface ViewAllLinkProps {
  $viewAllBgColor?: string | null;
  $viewAllTextColor?: string | null;
  $viewAllBorderColor?: string | null;
  $viewAllHoverBgColor?: string | null;
}

const ViewAllLink = styled.a<ViewAllLinkProps>`
  color: ${(p) => p.$viewAllTextColor || '#e2e8f0'};
  text-decoration: none;
  font-weight: 600;
  border: 1px solid ${(p) => p.$viewAllBorderColor || 'rgba(255, 255, 255, 0.1)'};
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  background: ${(p) => p.$viewAllBgColor || 'rgba(255, 255, 255, 0.03)'};
  transition: all 0.2s ease;
  font-size: 0.95rem;

  &:hover {
    color: #fff;
    background: ${(p) => p.$viewAllHoverBgColor || 'rgba(255, 255, 255, 0.08)'};
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

interface DonateButtonProps {
  $donateBgGradient?: string | null;
  $donateTextColor?: string | null;
  $donateHoverBgGradient?: string | null;
}

const DonateButton = styled.a<DonateButtonProps>`
  color: ${(p) => p.$donateTextColor || '#fff'};
  text-decoration: none;
  font-weight: 700;
  border: 1px solid transparent;
  padding: 0.75rem 2rem;
  border-radius: 999px;
  background: ${(p) => p.$donateBgGradient || `linear-gradient(135deg, ${COLORS.gogo_blue}, ${COLORS.gogo_purple})`};
  transition: all 0.3s ease;
  font-size: 0.95rem;
  box-shadow: 0 4px 12px rgba(25, 70, 245, 0.3);

  &:hover {
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(25, 70, 245, 0.5);
    ${(p) => p.$donateHoverBgGradient && css`background: ${p.$donateHoverBgGradient};`}
    filter: brightness(1.1);
  }
`;

interface BetweenNoteProps {
  $betweenNoteColor?: string | null;
}

const BetweenNote = styled.p<BetweenNoteProps>`
  margin: 0;
  color: ${(p) => p.$betweenNoteColor || '#94a3b8'};
  font-size: 0.95rem;
  text-align: center;
  max-width: 600px;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

interface TickerTrackProps {
  $speed?: number;
}

const TickerTrack = styled.div<TickerTrackProps>`
  display: flex;
  width: max-content;
  gap: 1rem;
  padding: 0.5rem 0;
  animation: ${scroll} ${(p) => p.$speed || 60}s linear infinite;
  will-change: transform;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
  &:hover {
    animation-play-state: paused;
  }
`;

interface TickerItemProps {
  $itemBgColor?: string | null;
  $itemTextColor?: string | null;
  $itemBorderColor?: string | null;
  $itemHoverBgColor?: string | null;
  $itemHoverTextColor?: string | null;
}

const TickerItem = styled.span<TickerItemProps>`
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  border: 1px solid ${(p) => p.$itemBorderColor || 'rgba(255, 255, 255, 0.05)'};
  background: ${(p) => p.$itemBgColor || 'rgba(255, 255, 255, 0.02)'};
  color: ${(p) => p.$itemTextColor || '#cbd5e1'};
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s;
  
  &:hover {
    background: ${(p) => p.$itemHoverBgColor || 'rgba(255, 255, 255, 0.05)'};
    color: ${(p) => p.$itemHoverTextColor || '#fff'};
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

// Default hardcoded data for fallback
const DEFAULT_PARTNERS: PartnerItem[] = [
  { id: '1', name: 'Helen V. Brach Foundation', dotColor: COLORS.gogo_blue },
  { id: '2', name: 'The Barry & Mimi Sternlicht Foundation', dotColor: COLORS.gogo_purple },
  { id: '3', name: 'Lovett‑Woodsum Foundation', dotColor: COLORS.gogo_teal },
  { id: '4', name: 'Margaret & Daniel Loeb Family Foundation', dotColor: COLORS.gogo_yellow },
  { id: '5', name: 'Cox‑Vadakan Foundation', dotColor: COLORS.gogo_green },
  { id: '6', name: 'The Howard & Paula Trienens Fund', dotColor: COLORS.gogo_pink },
  { id: '7', name: 'Shippy Foundation', dotColor: '#60a5fa' },
  { id: '8', name: 'Daniel Lewis & Valerie Dillon', dotColor: COLORS.gogo_purple },
  { id: '9', name: 'Savage Content', dotColor: COLORS.gogo_yellow },
  { id: '10', name: 'Moss Foundation', dotColor: COLORS.gogo_green },
  { id: '11', name: 'MJ & Fred Wright', dotColor: COLORS.gogo_teal },
  { id: '12', name: 'Turner Investment Management', dotColor: '#f59e0b' },
  { id: '13', name: 'Office of Senator Elgie R. Sims, Jr.', descriptor: "Illinois' 17th District", dotColor: '#86efac' },
  { id: '14', name: 'Office of Senator Mattie Hunter', descriptor: "Illinois' 3rd District", dotColor: '#93c5fd' },
  { id: '15', name: 'Office of Senator Robert Peters', descriptor: "Illinois' 13th District", dotColor: '#fda4af' },
  { id: '16', name: 'McDermott Will & Emery', dotColor: '#c4b5fd' },
];

interface PartnersSectionProps {
  previewMode?: boolean;
  partnersOverride?: PartnersContent | null;
}

function PartnersSection({ previewMode = false, partnersOverride }: PartnersSectionProps): JSX.Element {
  const [inView, setInView] = useState(false);
  const [fetchedData, setFetchedData] = useState<PartnersContent | null>(null);

  // Use override in preview mode, otherwise use fetched data
  const data = previewMode && partnersOverride ? partnersOverride : fetchedData;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setInView(true),
      { threshold: 0.2 },
    );
    const section = document.querySelector('.partners-section');
    if (section) observer.observe(section);
    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  useEffect(() => {
    if (!previewMode) {
      fetchPartnersContent().then(setFetchedData);
    }
  }, [previewMode]);

  // Use data from API or fall back to defaults
  const partners = data?.partners ?? DEFAULT_PARTNERS;
  const fallbackLink = data?.fallbackLink ?? { enabled: true, url: 'https://guitarsoverguns.org/supporters/' };
  const carousel = data?.carousel ?? { enabled: true, showCustomItems: false, customItems: [], speed: 60 };
  const cta = data?.cta ?? {
    viewAllText: 'View all our supporters ↗',
    viewAllUrl: 'https://guitarsoverguns.org/supporters/',
    donateText: 'Donate',
    donateUrl: 'https://www.classy.org/give/352794/#!/donation/checkout',
  };

  // All partners go in the grid
  const majorPartners: PartnerItem[] = partners;

  // Carousel items - either custom items or partner names
  const carouselNames: string[] = useMemo(() => {
    if (carousel.showCustomItems && carousel.customItems.length > 0) {
      let items = [...carousel.customItems];
      // Repeat until we have enough items for smooth animation
      const minItems = 40;
      while (items.length < minItems && items.length > 0) {
        items = [...items, ...items];
      }
      return items;
    }
    
    // Use partner names
    let names = partners.map((p) => p.name);
    // Repeat until we have enough items for smooth animation
    const minItems = 40;
    while (names.length < minItems && names.length > 0) {
      names = [...names, ...names];
    }
    return names;
  }, [partners, carousel.showCustomItems, carousel.customItems]);

  const tickerNames = useMemo(() => {
    // Create a seamless loop by duplicating the array
    return [...carouselNames, ...carouselNames, ...carouselNames, ...carouselNames];
  }, [carouselNames]);

  // Normalize URL to ensure it has a protocol
  const normalizeUrl = (url: string): string => {
    if (!url) return '#';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    // Add https:// if no protocol
    return `https://${trimmed}`;
  };

  const getPartnerUrl = (partner: PartnerItem): string => {
    if (partner.url) return normalizeUrl(partner.url);
    if (fallbackLink.enabled) return normalizeUrl(fallbackLink.url);
    return '#';
  };

  const renderBadges = (items: PartnerItem[], delayBase = 0) =>
    items.map((item, idx) => (
      <Badge
        key={item.id}
        href={getPartnerUrl(item)}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`${item.name}${item.descriptor ? `, ${item.descriptor}` : ''}`}
        $badgeBgColor={data?.badgeBgColor}
        $badgeHoverBgColor={data?.badgeHoverBgColor}
        $badgeBorderColor={data?.badgeBorderColor}
        $badgeHoverBorderColor={data?.badgeHoverBorderColor}
        $badgeBorderRadius={data?.badgeBorderRadius}
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          transition: `opacity .6s cubic-bezier(0.2, 0.8, 0.2, 1) ${
            delayBase + idx * 0.05
          }s, transform .6s cubic-bezier(0.2, 0.8, 0.2, 1) ${delayBase + idx * 0.05}s`,
        }}
      >
        <Dot $color={item.dotColor} />
        <BadgeText>
          <BadgeTitle $badgeTitleColor={data?.badgeTitleColor}>{item.name}</BadgeTitle>
          {item.descriptor && <BadgeSub $badgeDescriptorColor={data?.badgeDescriptorColor}>{item.descriptor}</BadgeSub>}
        </BadgeText>
      </Badge>
    ));

  if (data?.visible === false) return <></>;

  return (
    <PartnersSectionWrapper 
      className="partners-section"
      $sectionBgGradient={data?.sectionBgGradient}
      $glowColor1={data?.glowColor1}
      $glowColor2={data?.glowColor2}
      $glowColor3={data?.glowColor3}
      $titleGradient={data?.titleGradient}
    >
      <Glow3 $glowColor3={data?.glowColor3} />
      <SectionContainer>
        <Heading>
          <Title $titleGradient={data?.titleGradient}>
            {data?.title ?? 'Our Supporters'}
          </Title>
          <SubTitle $subtitleColor={data?.subtitleColor}>
            {data?.subtitle ?? 'Thank you to every donor and partner—your generosity makes Guitars Over Guns possible.'}
          </SubTitle>
        </Heading>

        <GridLabel $gridLabelColor={data?.gridLabelColor}>
          {data?.gridLabel ?? 'Major Supporters ($25,000+)'}
        </GridLabel>
        <Grid aria-live="polite">{renderBadges(majorPartners)}</Grid>

        {carousel.enabled && (
          <TickerRow>
            <BetweenNote $betweenNoteColor={data?.betweenNoteColor}>
              {data?.betweenNoteText ?? 'The supporters below represent additional donors who make our work possible. Our $25,000+ list highlights a featured selection; please see the full roll at the link below.'}
            </BetweenNote>

            <TickerWrapper aria-hidden>
              <TickerTrack $speed={carousel.speed}>
                {tickerNames.map((label, index) => (
                  <TickerItem 
                    key={`other-${index}-${label}`}
                    $itemBgColor={carousel.itemBgColor}
                    $itemTextColor={carousel.itemTextColor}
                    $itemBorderColor={carousel.itemBorderColor}
                    $itemHoverBgColor={carousel.itemHoverBgColor}
                    $itemHoverTextColor={carousel.itemHoverTextColor}
                  >
                    {label}
                  </TickerItem>
                ))}
              </TickerTrack>
            </TickerWrapper>
            
            <ButtonsRow>
              <ViewAllLink
                href={normalizeUrl(cta.viewAllUrl)}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="View all supporters on guitars over guns website"
                $viewAllBgColor={cta.viewAllBgColor}
                $viewAllTextColor={cta.viewAllTextColor}
                $viewAllBorderColor={cta.viewAllBorderColor}
                $viewAllHoverBgColor={cta.viewAllHoverBgColor}
              >
                {cta.viewAllText}
              </ViewAllLink>
              <DonateButton
                href={normalizeUrl(cta.donateUrl)}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Donate to Guitars Over Guns"
                $donateBgGradient={cta.donateBgGradient}
                $donateTextColor={cta.donateTextColor}
                $donateHoverBgGradient={cta.donateHoverBgGradient}
              >
                {cta.donateText}
              </DonateButton>
            </ButtonsRow>
          </TickerRow>
        )}
      </SectionContainer>
    </PartnersSectionWrapper>
  );
}

export default PartnersSection;
