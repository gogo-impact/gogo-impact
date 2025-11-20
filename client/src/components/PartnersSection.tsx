import React, { useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import COLORS from '../../assets/colors.ts';

const PartnersSectionWrapper = styled.section`
  position: relative;
  padding: 8rem 0;
  background: radial-gradient(
      80rem 60rem at 10% -10%,
      rgba(79, 70, 229, 0.25),
      transparent
    ),
    radial-gradient(
      70rem 50rem at 110% 10%,
      rgba(16, 185, 129, 0.15),
      transparent
    ),
    linear-gradient(180deg, #121212 0%, #0f0f10 100%);
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    inset: -20% -10% auto -10%;
    height: 40rem;
    background: radial-gradient(
      closest-side,
      rgba(56, 189, 248, 0.1),
      transparent
    );
    filter: blur(60px);
    pointer-events: none;
  }
`;

const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 100%;
  position: relative;
  z-index: 1;
`;

const Heading = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h2`
  margin: 0.9rem 0 0.4rem;
  font-size: 3rem;
  line-height: 1.1;
  font-weight: 900;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SubTitle = styled.p`
  margin: 0.5rem auto 0;
  max-width: 760px;
  color: #94a3b8;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const GridLabel = styled.p`
  margin: 1rem 0 0;
  text-align: left;
  color: #cbd5e1;
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
`;

const Badge = styled.a`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  text-decoration: none;
  color: #f3f4f6;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px) scale(1.02);
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  }
`;

const Dot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  box-shadow: 0 0 10px ${(p) => p.$color}, 0 0 0 2px rgba(255, 255, 255, 0.1) inset;
  flex-shrink: 0;
`;

const BadgeText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const BadgeTitle = styled.span`
  font-weight: 700;
  font-size: 1rem;
  line-height: 1.2;
  color: #f1f5f9;
`;

const BadgeSub = styled.span`
  font-size: 0.85rem;
  color: #94a3b8;
`;

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
`;

const ButtonsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ViewAllLink = styled.a`
  color: #e2e8f0;
  text-decoration: none;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.2s ease;
  font-size: 0.95rem;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const DonateButton = styled.a`
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  border: 1px solid transparent;
  padding: 0.75rem 2rem;
  border-radius: 999px;
  background: linear-gradient(135deg, ${COLORS.gogo_blue}, ${COLORS.gogo_purple});
  transition: all 0.3s ease;
  font-size: 0.95rem;
  box-shadow: 0 4px 12px rgba(25, 70, 245, 0.3);

  &:hover {
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(25, 70, 245, 0.5);
    filter: brightness(1.1);
  }
`;

const BetweenNote = styled.p`
  margin: 0;
  color: #94a3b8;
  font-size: 0.95rem;
  text-align: center;
  max-width: 600px;
`;

const TickerTrack = styled.div`
  display: flex;
  width: max-content;
  gap: 1rem;
  padding: 0.5rem 0;
  animation: ${scroll} 60s linear infinite;
  will-change: transform;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
  &:hover {
    animation-play-state: paused;
  }
`;

const TickerItem = styled.span`
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.02);
  color: #cbd5e1;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

type CategoryKey =
  | 'Foundations'
  | 'Corporate & Individual'
  | 'Government'
  | 'Community & In‑Kind';

interface SupporterItem {
  name: string;
  descriptor?: string;
  url?: string;
  color: string;
}

type SupporterDirectory = Record<CategoryKey, SupporterItem[]>;

function PartnersSection(): JSX.Element {
  const [inView, setInView] = useState(false);

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

  const data: SupporterDirectory = useMemo(
    () => ({
      Foundations: [
        { name: 'Helen V. Brach Foundation', color: COLORS.gogo_blue },
        {
          name: 'The Barry & Mimi Sternlicht Foundation',
          color: COLORS.gogo_purple,
        },
        { name: 'Lovett‑Woodsum Foundation', color: COLORS.gogo_teal },
        {
          name: 'Margaret & Daniel Loeb Family Foundation',
          color: COLORS.gogo_yellow,
        },
        { name: 'Cox‑Vadakan Foundation', color: COLORS.gogo_green },
        { name: 'The Howard & Paula Trienens Fund', color: COLORS.gogo_pink },
        { name: 'Shippy Foundation', color: '#60a5fa' },
      ],
      'Corporate & Individual': [
        { name: 'Daniel Lewis & Valerie Dillon', color: COLORS.gogo_purple },
        { name: 'Savage Content', color: COLORS.gogo_yellow },
        { name: 'Moss Foundation', color: COLORS.gogo_green },
        { name: 'MJ & Fred Wright', color: COLORS.gogo_teal },
        { name: 'Turner Investment Management', color: '#f59e0b' },
      ],
      Government: [
        {
          name: 'Office of Senator Elgie R. Sims, Jr.',
          descriptor: "Illinois' 17th District",
          color: '#86efac',
        },
        {
          name: 'Office of Senator Mattie Hunter',
          descriptor: "Illinois' 3rd District",
          color: '#93c5fd',
        },
        {
          name: 'Office of Senator Robert Peters',
          descriptor: "Illinois' 13th District",
          color: '#fda4af',
        },
      ],
      'Community & In‑Kind': [
        { name: 'McDermott Will & Emery', color: '#c4b5fd' },
      ],
    }),
    [],
  );

  // Partition donors into major vs other donors by category
  const majorCounts: Record<CategoryKey, number> = useMemo(
    () => ({
      Foundations: 7,
      'Corporate & Individual': 5,
      Government: 3,
      'Community & In‑Kind': 3,
    }),
    [],
  );

  const majorDonors: SupporterItem[] = useMemo(() => {
    return (Object.keys(data) as CategoryKey[]).flatMap((k) =>
      data[k].slice(0, majorCounts[k] || 0),
    );
  }, [data, majorCounts]);

  const otherDonorNames: string[] = useMemo(() => {
    const names = (Object.keys(data) as CategoryKey[]).flatMap((k) =>
      data[k].slice(majorCounts[k] || 0).map((i) => i.name),
    );
    
    // If not enough other donors exist, just repeat existing major donors for the ticker effect
    // to ensure we have enough items for the animation to look good.
    const minItems = 40;
    let result = [...names];
    
    if (result.length === 0) {
       // Fallback to major donors if no "other" donors
       result = majorDonors.map(d => d.name);
    }

    // Repeat until we have enough items
    while (result.length < minItems && result.length > 0) {
        result = [...result, ...result];
    }
    
    return result;
  }, [data, majorCounts, majorDonors]);

  const tickerNames = useMemo(() => {
    // Create a seamless loop by duplicating the list multiple times
    // Using 4 copies ensures that on very wide screens, we don't see the end
    // before the beginning loops back around.
    return [...otherDonorNames, ...otherDonorNames, ...otherDonorNames, ...otherDonorNames];
  }, [otherDonorNames]);

  const renderBadges = (items: SupporterItem[], delayBase = 0) =>
    items.map((item, idx) => (
      <Badge
        key={item.name}
        href={item.url || 'https://guitarsoverguns.org/supporters/'}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`${item.name}${
          item.descriptor ? `, ${item.descriptor}` : ''
        }`}
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          transition: `opacity .6s cubic-bezier(0.2, 0.8, 0.2, 1) ${
            delayBase + idx * 0.05
          }s, transform .6s cubic-bezier(0.2, 0.8, 0.2, 1) ${delayBase + idx * 0.05}s`,
        }}
      >
        <Dot $color={item.color} />
        <BadgeText>
          <BadgeTitle>{item.name}</BadgeTitle>
          {item.descriptor && <BadgeSub>{item.descriptor}</BadgeSub>}
        </BadgeText>
      </Badge>
    ));

  return (
    <PartnersSectionWrapper className="partners-section">
      <SectionContainer>
        <Heading>
          <Title>Our Supporters</Title>
          <SubTitle>
            Thank you to every donor and partner—your generosity makes Guitars
            Over Guns possible.
          </SubTitle>
        </Heading>

        <GridLabel>Major Supporters ($25,000+)</GridLabel>
        <Grid aria-live="polite">{renderBadges(majorDonors)}</Grid>

        <TickerRow>
            <BetweenNote>
            The supporters below represent additional donors who make our work
            possible. Our $25,000+ list highlights a featured selection; please
            see the full roll at the link below.
            </BetweenNote>

          <TickerWrapper aria-hidden>
            <TickerTrack>
              {tickerNames.map((label, index) => (
                <TickerItem key={`other-${index}-${label}`}>{label}</TickerItem>
              ))}
            </TickerTrack>
          </TickerWrapper>
          
          <ButtonsRow>
            <ViewAllLink
              href="https://guitarsoverguns.org/supporters/"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="View all supporters on guitars over guns website"
            >
              View all our supporters ↗
            </ViewAllLink>
            <DonateButton
              href="https://www.classy.org/give/352794/#!/donation/checkout"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Donate to Guitars Over Guns"
            >
              Donate
            </DonateButton>
          </ButtonsRow>
        </TickerRow>
      </SectionContainer>
    </PartnersSectionWrapper>
  );
}

export default PartnersSection;
