import React, { useEffect, useRef, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import '../../assets/fonts/fonts.css';
import { animate, stagger } from 'animejs';
import COLORS from "../../assets/colors";
import {
  GOGO_LOGO_BK_PATHS,
  GOGO_LOGO_BK_VIEWBOX,
} from "../../assets/logos/gogoLogoBK";

/**
 * Calculate relative luminance of a color to determine if it's light or dark.
 * Returns true if the color is light (luminance > 0.5), false otherwise.
 */
function isLightColor(color: string | null | undefined): boolean {
  if (!color) return false; // Default to dark background assumption
  
  // Try to parse the color
  let r = 0, g = 0, b = 0;
  
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length >= 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    }
  }
  // Handle rgb/rgba colors
  else if (color.startsWith('rgb')) {
    const match = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (match) {
      r = parseInt(match[1], 10);
      g = parseInt(match[2], 10);
      b = parseInt(match[3], 10);
    }
  }
  
  // Calculate relative luminance using sRGB formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}


const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
`;

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

  @media (max-width: 768px) {
    padding: 1.5rem 0.75rem;
    border-radius: 10px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  }

  &::before {
    content: "";
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

  @media (max-width: 768px) {
    width: 75%;
    transform: translate(-50%, -50%) rotate(0deg);
    top: 45%;
  }
`;

const TicketContainer = styled.div`
  margin: 3rem auto;
  width: 100%;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    margin: 1.5rem auto;
    padding: 0 1rem;
  }
`;

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

  /* CSS mask for punch-out notches - creates actual transparent holes */
  --notch-size: 12px;
  --notch-offset: 68px; /* Distance from right edge to notch center */
  mask-image: 
    radial-gradient(circle at calc(100% - var(--notch-offset)) 0, transparent var(--notch-size), black calc(var(--notch-size) + 0.5px)),
    radial-gradient(circle at calc(100% - var(--notch-offset)) 100%, transparent var(--notch-size), black calc(var(--notch-size) + 0.5px));
  mask-composite: intersect;
  -webkit-mask-image: 
    radial-gradient(circle at calc(100% - var(--notch-offset)) 0, transparent var(--notch-size), black calc(var(--notch-size) + 0.5px)),
    radial-gradient(circle at calc(100% - var(--notch-offset)) 100%, transparent var(--notch-size), black calc(var(--notch-size) + 0.5px));
  -webkit-mask-composite: source-in;

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
        var(--ticket-blotch1-color, ${COLORS.gogo_blue}22),
        transparent 60%
      ),
      radial-gradient(
        800px 300px at 20% 80%,
        var(--ticket-blotch2-color, ${COLORS.gogo_purple}22),
        transparent 60%
      );
  }

  @media (max-width: 768px) {
    /* Vertical ticket orientation for mobile */
    width: min(320px, 85vw);
    min-height: 480px;
    border-radius: 18px;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.04) inset;

    /* Notches on left and right for vertical ticket (bottom section) */
    --notch-size: 10px;
    --notch-offset: 72px; /* Distance from bottom to notch center */
    mask-image: 
      radial-gradient(circle at 0 calc(100% - var(--notch-offset)), transparent var(--notch-size), black calc(var(--notch-size) + 0.5px)),
      radial-gradient(circle at 100% calc(100% - var(--notch-offset)), transparent var(--notch-size), black calc(var(--notch-size) + 0.5px));
    mask-composite: intersect;
    -webkit-mask-image: 
      radial-gradient(circle at 0 calc(100% - var(--notch-offset)), transparent var(--notch-size), black calc(var(--notch-size) + 0.5px)),
      radial-gradient(circle at 100% calc(100% - var(--notch-offset)), transparent var(--notch-size), black calc(var(--notch-size) + 0.5px));
    -webkit-mask-composite: source-in;

    /* Stripe at top instead of left */
    &::before {
      top: 0;
      bottom: auto;
      left: 0;
      right: 0;
      width: auto;
      height: 5px;
      background: var(--ticket-stripe-gradient, linear-gradient(90deg, ${COLORS.gogo_blue}, ${COLORS.gogo_purple}, ${COLORS.gogo_teal}));
    }

    &::after {
      background: radial-gradient(
          300px 400px at 50% 20%,
          var(--ticket-blotch1-color, ${COLORS.gogo_blue}22),
          transparent 60%
        ),
        radial-gradient(
          250px 300px at 50% 80%,
          var(--ticket-blotch2-color, ${COLORS.gogo_purple}22),
          transparent 60%
        );
    }
  }
`;

const TicketInner = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0;
  padding: 18px 20px 18px 24px;
  height: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
    gap: 0;
    padding: 20px 16px 16px 16px;
    min-height: 480px;
  }
`;

const TicketLeft = styled.div`
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  gap: 8px;
  text-align: left;

  @media (max-width: 768px) {
    gap: 12px;
    text-align: center;
  }
`;

const TicketRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 18px;
  border-left: 2px dashed rgba(255, 255, 255, 0.25);
  position: relative;

  @media (max-width: 768px) {
    /* Show barcode at bottom for vertical ticket */
    padding-left: 0;
    padding-top: 12px;
    border-left: none;
    border-top: 2px dashed rgba(255, 255, 255, 0.25);
    justify-content: center;
  }
`;

const BadgeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const Serial = styled.span`
  font-size: 0.75rem;
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.65);
  user-select: none;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 0.65rem;
    letter-spacing: 0.08em;
  }
`;

const Title = styled.h3`
  margin: 0;
  font-size: clamp(1rem, 3.6vw, 1.8rem);
  letter-spacing: 0.18em;
  font-weight: 900;
  color: #fff;

  @media (max-width: 768px) {
    font-size: 0.85rem;
    letter-spacing: 0.12em;
    line-height: 1.4;
  }
`;

const Statement = styled.div`
  position: relative;
  z-index: 2;
  display: inline-block;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--statement-box-border-color, rgba(255, 255, 255, 0.1));
  background: var(--statement-box-bg-color, rgba(255, 255, 255, 0.04));
  max-width: 760px;

  @media (max-width: 768px) {
    padding: 14px 12px;
    border-radius: 10px;
    max-width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const StatementText = styled.p`
  margin: 0;
  font-family: 'Century Gothic', 'Arial', sans-serif;
  font-weight: 800;
  font-size: clamp(0.9rem, 1.8vw, 1rem);
  line-height: 1.22;
  background: var(--statement-text-gradient, linear-gradient(90deg, #ffffff, ${COLORS.gogo_teal}));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  word-break: break-word;
  overflow-wrap: anywhere;

  @media (max-width: 768px) {
    font-size: 0.82rem;
    line-height: 1.45;
    text-align: center;
  }
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 0.18em;
  font-size: 0.66rem;

  @media (max-width: 768px) {
    font-size: 0.6rem;
    letter-spacing: 0.1em;
    gap: 6px;
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const Barcode = styled.div`
  width: 46px;
  height: 168px;
  background: repeating-linear-gradient(
    to bottom,
    var(--barcode-color, rgba(255, 255, 255, 0.85)) 0 1.5px,
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

  @media (max-width: 768px) {
    /* Horizontal barcode for vertical ticket */
    width: 85%;
    max-width: 220px;
    height: 36px;
    background: repeating-linear-gradient(
      to right,
      var(--barcode-color, rgba(255, 255, 255, 0.85)) 0 1.5px,
      transparent 1.5px 3px
    );
    border-radius: 4px;

    &::after {
      bottom: auto;
      top: calc(100% + 6px);
      width: 60%;
      height: 4px;
    }
  }
`;

interface MissionStatementProps {
  statement: string;
  statementTitle?: string | null;
  statementTitleColor?: string | null;
  statementTextColor?: string | null;
  statementTextGradientColor?: string | null;
  statementMeta?: string | null;
  statementMetaColor?: string | null;
  statementBoxBorderColor?: string | null;
  statementBoxBgColor?: string | null;
  serial?: string | null;
  serialColor?: string | null;
  ticketStripeGradient?: string | null;
  ticketBorderColor?: string | null;
  ticketBackdropColor?: string | null;
  ticketBlotch1Color?: string | null;
  ticketBlotch2Color?: string | null;
  ticketShowBarcode?: boolean | null;
  barcodeColor?: string | null;
  backgroundLogoEnabled?: boolean | null;
  backgroundLogoOpacity?: number | null;
  backgroundLogoRotation?: number | null;
  backgroundLogoScale?: number | null;
}

function MissionStatement({
  statement,
  statementTitle,
  statementTitleColor,
  statementTextColor,
  statementTextGradientColor,
  statementMeta,
  statementMetaColor,
  statementBoxBorderColor,
  statementBoxBgColor,
  serial,
  serialColor,
  ticketStripeGradient,
  ticketBorderColor,
  ticketBackdropColor,
  ticketBlotch1Color,
  ticketBlotch2Color,
  ticketShowBarcode = true,
  barcodeColor,
  backgroundLogoEnabled = true,
  backgroundLogoOpacity,
  backgroundLogoRotation,
  backgroundLogoScale,
}: MissionStatementProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate logo fill color based on backdrop luminance
  // Light backgrounds get dark logo, dark backgrounds get light logo
  const logoFillColor = useMemo(() => {
    const isLight = isLightColor(ticketBackdropColor);
    // Use semi-transparent black for light backgrounds, semi-transparent white for dark
    return isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)';
  }, [ticketBackdropColor]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Animate in the statement
    {
      const statementEl = containerRef.current.querySelector(".statement");
      if (statementEl) {
        animate(statementEl as Element, {
          translateY: [40, 0],
          opacity: [0, 1],
          easing: "easeOutCubic",
          duration: 1000,
          delay: 300,
        });
      }
    }

    // Animate in stats cards
    {
      const statCards = containerRef.current.querySelectorAll(".stat-card");
      if (statCards && statCards.length > 0) {
        animate(statCards as unknown as Element[], {
          scale: [0.9, 1],
          opacity: [0, 1],
          delay: stagger(100, { start: 600 }),
          easing: "easeOutElastic(1, 0.6)",
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
            ...(ticketStripeGradient
              ? { ["--ticket-stripe-gradient" as any]: ticketStripeGradient }
              : {}),
            ...(ticketBlotch1Color
              ? { ["--ticket-blotch1-color" as any]: ticketBlotch1Color }
              : {}),
            ...(ticketBlotch2Color
              ? { ["--ticket-blotch2-color" as any]: ticketBlotch2Color }
              : {}),
          } as React.CSSProperties}
        >
          {backgroundLogoEnabled !== false && (
            <BgLogoWrap aria-hidden="true">
              <BgLogoSvg
                viewBox={GOGO_LOGO_BK_VIEWBOX}
                role="img"
                style={{
                  opacity: backgroundLogoOpacity ?? 0.08,
                  transform: `translate(-50%, -50%) rotate(${backgroundLogoRotation ?? 90}deg) scale(${backgroundLogoScale ?? 0.82})`,
                }}
              >
                {GOGO_LOGO_BK_PATHS.map(({ d, transform }) => (
                  <path
                    key={`${d}-${transform ?? ""}`}
                    d={d}
                    transform={transform}
                    fill={logoFillColor}
                  />
                ))}
              </BgLogoSvg>
            </BgLogoWrap>
          )}
          <TicketInner>
            <TicketLeft>
              <BadgeRow>
                <Serial
                  style={serialColor ? { color: serialColor } : undefined}
                >
                  {serial ?? "SN-GOGO-2025"}
                </Serial>
              </BadgeRow>
              <Title
                style={
                  statementTitleColor
                    ? { color: statementTitleColor }
                    : undefined
                }
              >
                {statementTitle ?? "MISSION STATEMENT — ADMIT ALL"}
              </Title>
              <Statement
                style={{
                  ...(statementBoxBorderColor
                    ? { ["--statement-box-border-color" as any]: statementBoxBorderColor }
                    : {}),
                  ...(statementBoxBgColor
                    ? { ["--statement-box-bg-color" as any]: statementBoxBgColor }
                    : {}),
                } as React.CSSProperties}
              >
                <StatementText
                  style={
                    statementTextColor
                      ? {
                          WebkitTextFillColor: "unset",
                          color: statementTextColor,
                          background: "none",
                        }
                      : statementTextGradientColor
                        ? { ["--statement-text-gradient" as any]: `linear-gradient(90deg, #ffffff, ${statementTextGradientColor})` } as React.CSSProperties
                        : undefined
                  }
                >
                  {statement}
                </StatementText>
              </Statement>
              <Meta
                style={
                  statementMetaColor ? { color: statementMetaColor } : undefined
                }
              >
                {statementMeta ?? "ISSUED 2025 • CHOOSE YOUR SOUND"}
              </Meta>
            </TicketLeft>
            <TicketRight>
              {ticketShowBarcode ? (
                <Barcode
                  style={
                    barcodeColor
                      ? { ["--barcode-color" as any]: barcodeColor } as React.CSSProperties
                      : undefined
                  }
                />
              ) : null}
            </TicketRight>
          </TicketInner>
        </Ticket>
      </TicketContainer>
    </SectionContainer>
  );
}

export default MissionStatement;
