import React, { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import '../../assets/fonts/fonts.css';
import { animate, stagger } from 'animejs';
import COLORS from '../../assets/colors.ts';
import {
  GOGO_LOGO_BK_PATHS,
  GOGO_LOGO_BK_VIEWBOX,
} from '../../assets/logos/gogoLogoBK';

// Modern animations
const shimmer = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.03);
  }
`;

const equalizer = keyframes`
  0% {
    height: 15%;
  }
  10% {
    height: 70%;
  }
  30% {
    height: 45%;
  }
  50% {
    height: 85%;
  }
  70% {
    height: 30%;
  }
  90% {
    height: 60%;
  }
  100% {
    height: 15%;
  }
`;

// Add the scrolling animations back
const slideLeft = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-25%);
  }
`;

const slideRight = keyframes`
  0% {
    transform: translateX(-25%);
  }
  100% {
    transform: translateX(0);
  }
`;

// Section container with improved glass effect
const SectionContainer = styled.div`
  padding: 4rem 2rem;
  position: relative;
  overflow: visible;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  background: linear-gradient(
    135deg,
    rgba(18, 18, 18, 0.9),
    rgba(25, 25, 35, 0.8)
  );
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      120deg,
      ${COLORS.gogo_blue}20,
      ${COLORS.gogo_purple}20,
      ${COLORS.gogo_teal}20,
      ${COLORS.gogo_blue}20
    );
    background-size: 100% 100%;
    z-index: -1;
    filter: blur(60px);
    opacity: 0.6;
  }
`;

// Improved glass card with hover effects
const ImageCard = styled.div`
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 1rem;
  flex-shrink: 0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
  background: rgba(25, 25, 35, 0.3);
  backdrop-filter: blur(8px);
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  transform-origin: center;
  animation: ${float} 6s ease-in-out infinite;
  animation-delay: calc(var(--index) * 0.2s);

  &:hover {
    transform: translateY(-12px) scale(1.05);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4), 0 0 0 2px ${COLORS.gogo_blue}66;
    z-index: 10;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      120deg,
      ${COLORS.gogo_blue}40,
      ${COLORS.gogo_purple}40,
      ${COLORS.gogo_pink}40,
      ${COLORS.gogo_blue}40
    );
    background-size: 100% 100%;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }

  &:hover::before {
    opacity: 0.3;
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);

  &:hover {
    transform: scale(1.1);
  }
`;

// (Conveyor belt moved to Outcomes section)

// Background logo (absolute, behind content)
const BgLogoWrap = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
`;

const BgLogoSvg = styled.svg`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 82%;
  height: auto;
  opacity: 0.08;
  filter: blur(0.2px);
  transform: translate(-50%, -50%) rotate(90deg);
  transform-origin: 50% 50%;
`;

// Container (2D, no perspective)
const TicketContainer = styled.div`
  margin: 3rem auto;
  width: 100%;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// (removed unused original ticket styles)

// Back face small fields
const FieldGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 0.5rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
`;

const FieldLabel = styled.div`
  font-size: 0.6rem;
  letter-spacing: 0.14em;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.25rem;
`;

const FieldValue = styled.div`
  font-weight: 800;
  font-size: 0.85rem;
`;

// Back face layout for values
const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  width: 100%;
  max-width: 840px;
  margin-top: 0.75rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const ValueCard = styled.div`
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  text-align: left;
`;

const ValueTitle = styled.div`
  font-weight: 900;
  letter-spacing: 0.16em;
  color: ${COLORS.gogo_teal};
  margin-bottom: 0.35rem;
`;

const ValueText = styled.div`
  font-size: 0.9rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.85);
`;

// (Removed photo grid in favor of logo)

const Body = styled.div`
  padding: 0.8rem 0.9rem;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.5rem;
  z-index: 1;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
        circle at 20% 30%,
        ${COLORS.gogo_blue}19,
        transparent 40%
      ),
      radial-gradient(
        circle at 80% 70%,
        ${COLORS.gogo_purple}19,
        transparent 40%
      );
    pointer-events: none;
  }
`;

const Overline = styled.div`
  font-size: 0.65rem;
  letter-spacing: 0.24em;
  color: rgba(255, 255, 255, 0.72);
  font-weight: 800;
`;

// (removed old Title)

const MissionText = styled.p`
  margin: 0;
  font-family: 'Century Gothic', 'Arial', sans-serif;
  font-weight: 800;
  font-size: clamp(0.9rem, 1.8vw, 1rem);
  line-height: 1.22;
  background: linear-gradient(90deg, #ffffff, ${COLORS.gogo_teal});
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  word-break: break-word;
  overflow-wrap: anywhere;
`;

const StatementBox = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.45rem 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  max-width: 820px;
  backdrop-filter: blur(4px);
`;

const DateBox = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  letter-spacing: 0.24em;
  font-weight: 800;
  font-size: 0.78rem;
`;

const LocationText = styled.div`
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 0.18em;
  font-size: 0.66rem;
  margin-top: 0.05rem;
`;

// (removed old Serial)

// =====================
// Redesigned Ticket V2
// =====================
const Ticket = styled.div`
  position: relative;
  z-index: 2;
  border-radius: 22px;
  overflow: hidden;
  background: linear-gradient(135deg, #111416 0%, #0f0f14 40%, #141620 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  width: min(1040px, 96vw);
  min-height: 180px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 6px;
    background: var(--ticket-stripe-gradient, linear-gradient(180deg, ${COLORS.gogo_blue}, ${COLORS.gogo_purple}, ${COLORS.gogo_teal}));
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
        1200px 400px at 80% 20%,
        ${COLORS.gogo_blue}22,
        transparent 60%
      ),
      radial-gradient(
        800px 300px at 20% 80%,
        ${COLORS.gogo_purple}22,
        transparent 60%
      );
  }
`;

const TicketInner = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0;
  padding: 18px 20px 18px 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    row-gap: 10px;
  }
`;

const TicketLeft = styled.div`
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  gap: 8px;
`;

const TicketRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 18px;
  border-left: 1px dashed rgba(255, 255, 255, 0.14);

  @media (max-width: 768px) {
    border-left: 0;
    padding-left: 0;
    justify-content: flex-start;
  }
`;

const BadgeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 0.62rem;
  letter-spacing: 0.22em;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const Serial = styled.span`
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.55);
  user-select: none;
`;

const Title = styled.h3`
  margin: 0;
  font-size: clamp(1rem, 3.6vw, 1.8rem);
  letter-spacing: 0.18em;
  font-weight: 900;
  color: #fff;
`;

const Statement = styled.div`
  display: inline-block;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  max-width: 760px;
`;

const StatementText = styled.p`
  margin: 0;
  font-family: 'Century Gothic', 'Arial', sans-serif;
  font-weight: 800;
  font-size: clamp(0.9rem, 1.8vw, 1rem);
  line-height: 1.22;
  background: linear-gradient(90deg, #ffffff, ${COLORS.gogo_teal});
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  word-break: break-word;
  overflow-wrap: anywhere;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 0.18em;
  font-size: 0.66rem;
`;

const Barcode = styled.div`
  width: 46px;
  height: 168px;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.85) 0 1.5px,
    transparent 1.5px 3px
  );
  border-radius: 6px;
  opacity: 0.85;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    width: 70%;
    height: 6px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 4px;
  }
`;

interface MissionStatementProps {
  topImages: string[];
  bottomImages: string[];
  statement: string;
  statementTitle?: string | null;
  statementTitleColor?: string | null;
  statementTextColor?: string | null;
  statementMeta?: string | null;
  statementMetaColor?: string | null;
  serial?: string | null;
  serialColor?: string | null;
  ticketStripeGradient?: string | null;
  ticketBorderColor?: string | null;
  ticketBackdropColor?: string | null;
  ticketShowBarcode?: boolean | null;
  backgroundLogoCfg?: {
    opacity?: number | null;
    rotationDeg?: number | null;
    scale?: number | null;
  } | null;
}

function MissionStatement({
  topImages,
  bottomImages,
  statement,
  statementTitle,
  statementTitleColor,
  statementTextColor,
  statementMeta,
  statementMetaColor,
  serial,
  serialColor,
  ticketStripeGradient,
  ticketBorderColor,
  ticketBackdropColor,
  ticketShowBarcode = true,
  backgroundLogoCfg,
}: MissionStatementProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Belts moved to Outcomes section

  useEffect(() => {
    if (!containerRef.current) return;

    // Animate in the statement
    {
      const statementEl = containerRef.current.querySelector('.statement');
      if (statementEl) {
        animate(statementEl as Element, {
          translateY: [40, 0],
          opacity: [0, 1],
          easing: 'easeOutCubic',
          duration: 1000,
          delay: 300,
        });
      }
    }

    // Animate in stats cards
    {
      const statCards = containerRef.current.querySelectorAll('.stat-card');
      if (statCards && statCards.length > 0) {
        animate(statCards as unknown as Element[], {
          scale: [0.9, 1],
          opacity: [0, 1],
          delay: stagger(100, { start: 600 }),
          easing: 'easeOutElastic(1, 0.6)',
          duration: 1200,
        });
      }
    }
  }, []);

  // Removed height measurement; static layout

  return (
    <SectionContainer ref={containerRef}>
      <TicketContainer className="statement">
        <Ticket
          style={{
            ...(ticketBorderColor ? { borderColor: ticketBorderColor } : {}),
            ...(ticketBackdropColor ? { background: ticketBackdropColor } : {}),
            ...(ticketStripeGradient ? ({ ['--ticket-stripe-gradient' as any]: ticketStripeGradient } as React.CSSProperties) : {}),
          }}
        >
          <BgLogoWrap aria-hidden="true">
            <BgLogoSvg
              viewBox={GOGO_LOGO_BK_VIEWBOX}
              role="img"
              style={{
                ...(backgroundLogoCfg?.opacity != null ? { opacity: backgroundLogoCfg.opacity } : {}),
                ...(backgroundLogoCfg?.rotationDeg != null || backgroundLogoCfg?.scale != null
                  ? {
                      transform: `translate(-50%, -50%) rotate(${backgroundLogoCfg?.rotationDeg ?? 90}deg) scale(${backgroundLogoCfg?.scale ?? 0.82})`,
                    }
                  : {}),
              }}
            >
              {GOGO_LOGO_BK_PATHS.map(({ d, transform }) => (
                <path
                  key={`${d}-${transform ?? ''}`}
                  d={d}
                  transform={transform}
                  fill="rgba(255, 255, 255, 0.06)"
                />
              ))}
            </BgLogoSvg>
          </BgLogoWrap>
          <TicketInner>
            <TicketLeft>
              <BadgeRow>
                <Badge>TICKET</Badge>
                <Serial style={serialColor ? { color: serialColor } : undefined}>{serial ?? 'SN-GOGO-2025'}</Serial>
              </BadgeRow>
              <Title style={statementTitleColor ? { color: statementTitleColor } : undefined}>
                {statementTitle ?? 'MISSION STATEMENT — ADMIT ALL'}
              </Title>
              <Statement>
                <StatementText style={statementTextColor ? { WebkitTextFillColor: 'unset', color: statementTextColor, background: 'none' } : undefined}>
                  {statement}
                </StatementText>
              </Statement>
              <Meta style={statementMetaColor ? { color: statementMetaColor } : undefined}>
                {statementMeta ?? 'ISSUED 2025 • CHOOSE YOUR SOUND'}
              </Meta>
            </TicketLeft>
            <TicketRight>
              {ticketShowBarcode ? <Barcode /> : null}
            </TicketRight>
          </TicketInner>
        </Ticket>
      </TicketContainer>
    </SectionContainer>
  );
}

export default MissionStatement;
