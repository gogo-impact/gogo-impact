import React, { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import '../../assets/fonts/fonts.css';
import { animate, stagger } from 'animejs';
import COLORS from "../../assets/colors";
import {
  GOGO_LOGO_BK_PATHS,
  GOGO_LOGO_BK_VIEWBOX,
} from "../../assets/logos/gogoLogoBK";


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
`;

const TicketContainer = styled.div`
  margin: 3rem auto;
  width: 100%;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
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
        ${COLORS.gogo_blue}22,
        transparent 60%
      ),
      radial-gradient(
        800px 300px at 20% 80%,
        ${COLORS.gogo_purple}22,
        transparent 60%
      );
  }

  @media (max-width: 768px) {
    mask-image: none;
    -webkit-mask-image: none;
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
  text-align: left;
`;

const TicketRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 18px;
  border-left: 2px dashed rgba(255, 255, 255, 0.25);
  position: relative;

  @media (max-width: 768px) {
    border-left: 0;
    padding-left: 0;
    justify-content: flex-start;
    
    border-top: 2px dashed rgba(255, 255, 255, 0.25);
    padding-top: 18px;
    margin-top: 12px;
    width: 100%;
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
  font-size: 0.75rem;
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.65);
  user-select: none;
  font-weight: 600;
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
              ? ({
                  ["--ticket-stripe-gradient" as any]: ticketStripeGradient,
                } as React.CSSProperties)
              : {}),
          }}
        >
          <BgLogoWrap aria-hidden="true">
            <BgLogoSvg
              viewBox={GOGO_LOGO_BK_VIEWBOX}
              role="img"
              style={{
                ...(backgroundLogoCfg?.opacity != null
                  ? { opacity: backgroundLogoCfg.opacity }
                  : {}),
                ...(backgroundLogoCfg?.rotationDeg != null ||
                backgroundLogoCfg?.scale != null
                  ? {
                      transform: `translate(-50%, -50%) rotate(${backgroundLogoCfg?.rotationDeg ?? 90}deg) scale(${backgroundLogoCfg?.scale ?? 0.82})`,
                    }
                  : {}),
              }}
            >
              {GOGO_LOGO_BK_PATHS.map(({ d, transform }) => (
                <path
                  key={`${d}-${transform ?? ""}`}
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
              <Statement>
                <StatementText
                  style={
                    statementTextColor
                      ? {
                          WebkitTextFillColor: "unset",
                          color: statementTextColor,
                          background: "none",
                        }
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
            <TicketRight>{ticketShowBarcode ? <Barcode /> : null}</TicketRight>
          </TicketInner>
        </Ticket>
      </TicketContainer>
    </SectionContainer>
  );
}

export default MissionStatement;
