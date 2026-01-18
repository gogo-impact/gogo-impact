import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Reveal } from '../../animations';
import COLORS from '../../assets/colors';
import { FlexAContent, fetchFlexAContent } from '../services/impact.api';

interface FlexAProps {
  previewMode?: boolean;
  flexAOverride?: FlexAContent | null;
}

interface WrapperProps {
  $bgGradient?: string;
  $primaryColor?: string;
  $textColor?: string;
  $labelTextColor?: string;
  $headlineColor?: string;
  $subtitleColor?: string;
  $heroImageBorderRadius?: number;
  $heroOverlayColor?: string;
  $quoteBgColor?: string;
  $quoteTextColor?: string;
  $quoteBorderRadius?: number;
  $quoteAuthorColor?: string;
  $sidebarBgColor?: string;
  $sidebarBorderColor?: string;
  $sidebarBorderRadius?: number;
  $sidebarTitleColor?: string;
  $sidebarTitleBorderColor?: string;
  $statNumberColor?: string;
  $statLabelColor?: string;
}

const Wrapper = styled.section<WrapperProps>`
  padding: 8rem 0;
  background: ${(p) => p.$bgGradient || '#0f0f0f'};
  color: ${(p) => p.$textColor || '#e0e0e0'};
  --section-underline: ${(p) => p.$primaryColor || COLORS.gogo_yellow};
  --primary-color: ${(p) => p.$primaryColor || COLORS.gogo_yellow};
  --label-text-color: ${(p) => p.$labelTextColor || '#111'};
  --headline-color: ${(p) => p.$headlineColor || '#fff'};
  --subtitle-color: ${(p) => p.$subtitleColor || 'rgba(255, 255, 255, 0.7)'};
  --hero-image-border-radius: ${(p) => p.$heroImageBorderRadius ?? 24}px;
  --hero-overlay-color: ${(p) => p.$heroOverlayColor || 'rgba(15, 15, 15, 0.9)'};
  --quote-bg-color: ${(p) => p.$quoteBgColor || 'rgba(255, 255, 255, 0.03)'};
  --quote-text-color: ${(p) => p.$quoteTextColor || '#fff'};
  --quote-border-radius: ${(p) => p.$quoteBorderRadius ?? 12}px;
  --quote-author-color: ${(p) => p.$quoteAuthorColor || 'rgba(255, 255, 255, 0.6)'};
  --sidebar-bg-color: ${(p) => p.$sidebarBgColor || '#1a1a1a'};
  --sidebar-border-color: ${(p) => p.$sidebarBorderColor || 'rgba(255, 255, 255, 0.05)'};
  --sidebar-border-radius: ${(p) => p.$sidebarBorderRadius ?? 16}px;
  --sidebar-title-color: ${(p) => p.$sidebarTitleColor || 'rgba(255, 255, 255, 0.5)'};
  --sidebar-title-border-color: ${(p) => p.$sidebarTitleBorderColor || 'rgba(255, 255, 255, 0.1)'};
  --stat-number-color: ${(p) => p.$statNumberColor || '#fff'};
  --stat-label-color: ${(p) => p.$statLabelColor || 'rgba(255, 255, 255, 0.7)'};

  @media (max-width: 768px) {
    padding: 3rem 0;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 480px) {
    padding: 0 1rem;
  }
`;

const Header = styled.header`
  margin-bottom: 4rem;
  text-align: center;

  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const Label = styled.span`
  display: inline-block;
  padding: 8px 16px;
  border-radius: 50px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-size: 0.85rem;
  background: var(--primary-color, ${COLORS.gogo_yellow});
  color: var(--label-text-color, #111);
  margin-bottom: 1.5rem;
`;

const Headline = styled.h2`
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  font-weight: 900;
  line-height: 1.1;
  color: var(--headline-color, #fff);
  max-width: 900px;
  margin: 0 auto;
  letter-spacing: -0.02em;

  span {
    color: var(--primary-color, ${COLORS.gogo_yellow});
  }
`;

const Subhead = styled.p`
  font-size: 1.5rem;
  color: var(--subtitle-color, rgba(255, 255, 255, 0.7));
  max-width: 700px;
  margin: 1.5rem auto 0;
  line-height: 1.5;
  font-weight: 300;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-top: 1rem;
  }
`;

const HeroImage = styled.div<{ $src: string }>`
  width: 100%;
  height: 60vh;
  min-height: 400px;
  max-height: 700px;
  background: url('${(p) => p.$src}') center/cover no-repeat;
  border-radius: var(--hero-image-border-radius, 24px);
  margin-bottom: 4rem;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: linear-gradient(to top, var(--hero-overlay-color, rgba(15, 15, 15, 0.9)), transparent);
  }

  @media (max-width: 768px) {
    height: 40vh;
    min-height: 200px;
    max-height: 300px;
    margin-bottom: 2rem;
    border-radius: 12px;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 4rem;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  @media (max-width: 480px) {
    gap: 1.5rem;
  }
`;

const ArticleBody = styled.div`
  font-size: 1.15rem;
  line-height: 1.8;
  color: inherit;

  p {
    margin-bottom: 1.5rem;
  }

  p:first-of-type::first-letter {
    font-size: 3.5em;
    float: left;
    line-height: 0.8;
    margin-right: 0.15em;
    color: var(--primary-color, ${COLORS.gogo_yellow});
    font-weight: 900;
  }

  @media (max-width: 768px) {
    font-size: 1rem;

    p {
      margin-bottom: 1rem;
    }

    p:first-of-type::first-letter {
      font-size: 2.5em;
    }
  }
`;

const Sidebar = styled.aside`
  position: sticky;
  top: 2rem;
  background: var(--sidebar-bg-color, #1a1a1a);
  padding: 2rem;
  border-radius: var(--sidebar-border-radius, 16px);
  border: 1px solid var(--sidebar-border-color, rgba(255, 255, 255, 0.05));

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const SidebarTitle = styled.h3`
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--sidebar-title-color, rgba(255, 255, 255, 0.5));
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--sidebar-title-border-color, rgba(255, 255, 255, 0.1));
  padding-bottom: 0.5rem;
`;

const StatItem = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--stat-number-color, #fff);
  line-height: 1;
  margin-bottom: 0.25rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: var(--stat-label-color, rgba(255, 255, 255, 0.7));
`;

const Quote = styled.blockquote`
  margin: 2rem 0;
  padding: 2rem;
  background: var(--quote-bg-color, rgba(255, 255, 255, 0.03));
  border-left: 4px solid var(--primary-color, ${COLORS.gogo_yellow});
  border-radius: 0 var(--quote-border-radius, 12px) var(--quote-border-radius, 12px) 0;
  font-size: 1.25rem;
  font-style: italic;
  color: var(--quote-text-color, #fff);
  font-weight: 500;

  @media (max-width: 768px) {
    padding: 1.25rem;
    margin: 1.5rem 0;
    font-size: 1.1rem;
  }
`;

const QuoteAuthor = styled.cite`
  display: block;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--quote-author-color, rgba(255, 255, 255, 0.6));
  font-style: normal;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

function FlexA({ previewMode = false, flexAOverride }: FlexAProps): JSX.Element | null {
  const [internalData, setInternalData] = useState<FlexAContent | null>(null);
  const [loading, setLoading] = useState(!previewMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!previewMode) {
      const loadContent = async () => {
        try {
          setLoading(true);
          const content = await fetchFlexAContent();
          if (content) {
            setInternalData(content);
          } else {
            setError('Content not found. Please create it in the admin panel.');
          }
        } catch (err) {
          console.error('Failed to fetch FlexA content:', err);
          setError('Failed to load content.');
        } finally {
          setLoading(false);
        }
      };
      loadContent();
    }
  }, [previewMode]);

  const data = previewMode ? flexAOverride : internalData;

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

  // Extract nested data with defaults
  const header = data.header ?? { label: '', title: '', titleHighlight: '', subtitle: '' };
  const heroImage = data.heroImage ?? { url: '', alt: '' };
  const paragraphs = data.paragraphs ?? [];
  const quote = data.quote ?? { text: '', author: '', insertAfterParagraph: 1 };
  const sidebar = data.sidebar ?? { title: '', stats: [] };
  const sidebarStats = sidebar.stats ?? [];

  return (
    <Wrapper
      aria-label={data.ariaLabel || undefined}
      $bgGradient={data.sectionBgGradient || undefined}
      $primaryColor={data.primaryColor || undefined}
      $textColor={data.textColor || undefined}
      $labelTextColor={data.labelTextColor || undefined}
      $headlineColor={data.headlineColor || undefined}
      $subtitleColor={data.subtitleColor || undefined}
      $heroImageBorderRadius={data.heroImageBorderRadius ?? undefined}
      $heroOverlayColor={data.heroOverlayColor || undefined}
      $quoteBgColor={data.quoteBgColor || undefined}
      $quoteTextColor={data.quoteTextColor || undefined}
      $quoteBorderRadius={data.quoteBorderRadius ?? undefined}
      $quoteAuthorColor={data.quoteAuthorColor || undefined}
      $sidebarBgColor={data.sidebarBgColor || undefined}
      $sidebarBorderColor={data.sidebarBorderColor || undefined}
      $sidebarBorderRadius={data.sidebarBorderRadius ?? undefined}
      $sidebarTitleColor={data.sidebarTitleColor || undefined}
      $sidebarTitleBorderColor={data.sidebarTitleBorderColor || undefined}
      $statNumberColor={data.statNumberColor || undefined}
      $statLabelColor={data.statLabelColor || undefined}
    >
      <Container>
        <Reveal variant="fade-up" enabled={data.animationsEnabled ?? true}>
          <Header>
            {header.label && <Label>{header.label}</Label>}
            <Headline>
              {header.title} {header.titleHighlight && <span>{header.titleHighlight}</span>}
            </Headline>
            {header.subtitle && <Subhead>{header.subtitle}</Subhead>}
          </Header>

          {heroImage.url && <HeroImage $src={heroImage.url} />}

          <ContentGrid>
            <ArticleBody>
              {paragraphs.map((paragraph, idx) => (
                <React.Fragment key={idx}>
                  <p>{paragraph}</p>
                  {quote.text && quote.insertAfterParagraph === idx && (
                    <Quote>
                      "{quote.text}"
                      {quote.author && <QuoteAuthor>— {quote.author}</QuoteAuthor>}
                    </Quote>
                  )}
                </React.Fragment>
              ))}
            </ArticleBody>

            <Sidebar>
              {sidebar.title && <SidebarTitle>{sidebar.title}</SidebarTitle>}
              {sidebarStats.map((stat) => (
                <StatItem key={stat.id}>
                  <StatNumber>{stat.number}</StatNumber>
                  <StatLabel>{stat.label}</StatLabel>
                </StatItem>
              ))}
            </Sidebar>
          </ContentGrid>
        </Reveal>
      </Container>
    </Wrapper>
  );
}

export default FlexA;
