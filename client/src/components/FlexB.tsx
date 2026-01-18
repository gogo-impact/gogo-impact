import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Reveal } from '../../animations';
import COLORS from '../../assets/colors';
import { FlexBContent, fetchFlexBContent } from '../services/impact.api';

interface FlexBProps {
  previewMode?: boolean;
  flexBOverride?: FlexBContent | null;
}

interface WrapperProps {
  $bgGradient?: string;
  $primaryColor?: string;
  $textColor?: string;
  $labelTextColor?: string;
  $headlineColor?: string;
  $leadParagraphColor?: string;
  $bodyTextColor?: string;
  $pullQuoteBgColor?: string;
  $pullQuoteTextColor?: string;
  $pullQuoteAuthorColor?: string;
  $sidebarBgColor?: string;
  $sidebarBorderColor?: string;
  $sidebarBorderRadius?: number;
  $sidebarImageBorderRadius?: number;
  $sidebarTitleColor?: string;
  $bulletTextColor?: string;
  $bulletMarkerColor?: string;
  $keyTakeawayBgColor?: string;
  $keyTakeawayTextColor?: string;
  $keyTakeawayBorderRadius?: number;
}

const Wrapper = styled.section<WrapperProps>`
  padding: 8rem 0;
  background: ${(p) => p.$bgGradient || '#141414'};
  --text-color: ${(p) => p.$textColor || '#e0e0e0'};
  color: var(--text-color);
  --section-underline: ${(p) => p.$primaryColor || COLORS.gogo_purple};
  --primary-color: ${(p) => p.$primaryColor || COLORS.gogo_purple};
  --label-text-color: ${(p) => p.$labelTextColor || '#fff'};
  --headline-color: ${(p) => p.$headlineColor || 'var(--text-color)'};
  --lead-paragraph-color: ${(p) => p.$leadParagraphColor || 'var(--text-color)'};
  --body-text-color: ${(p) => p.$bodyTextColor || 'var(--text-color)'};
  --pull-quote-bg-color: ${(p) => p.$pullQuoteBgColor || 'rgba(124, 77, 255, 0.1)'};
  --pull-quote-text-color: ${(p) => p.$pullQuoteTextColor || 'var(--text-color)'};
  --pull-quote-author-color: ${(p) => p.$pullQuoteAuthorColor || COLORS.gogo_purple};
  --sidebar-bg-color: ${(p) => p.$sidebarBgColor || '#1a1a1a'};
  --sidebar-border-color: ${(p) => p.$sidebarBorderColor || 'rgba(255, 255, 255, 0.08)'};
  --sidebar-border-radius: ${(p) => p.$sidebarBorderRadius ?? 16}px;
  --sidebar-image-border-radius: ${(p) => p.$sidebarImageBorderRadius ?? 12}px;
  --sidebar-title-color: ${(p) => p.$sidebarTitleColor || 'var(--text-color)'};
  --bullet-text-color: ${(p) => p.$bulletTextColor || 'var(--text-color)'};
  --bullet-marker-color: ${(p) => p.$bulletMarkerColor || COLORS.gogo_purple};
  --key-takeaway-bg-color: ${(p) => p.$keyTakeawayBgColor || COLORS.gogo_purple};
  --key-takeaway-text-color: ${(p) => p.$keyTakeawayTextColor || '#fff'};
  --key-takeaway-border-radius: ${(p) => p.$keyTakeawayBorderRadius ?? 12}px;

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

const Grid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
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

const MainContent = styled.div``;

const Sidebar = styled.aside`
  position: sticky;
  top: 2rem;
`;

const Label = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-size: 0.75rem;
  background: var(--primary-color, ${COLORS.gogo_purple});
  color: var(--label-text-color, #fff);
  margin-bottom: 1.5rem;
`;

const Headline = styled.h2`
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 800;
  line-height: 1.1;
  color: var(--headline-color);
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    margin-bottom: 1.25rem;
  }
`;

const LeadParagraph = styled.p`
  font-size: 1.25rem;
  line-height: 1.6;
  color: var(--lead-paragraph-color);
  margin-bottom: 2rem;
  font-weight: 300;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 1.25rem;
  }
`;

const BodyText = styled.div`
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--body-text-color);

  p {
    margin-bottom: 1.5rem;
  }

  @media (max-width: 768px) {
    font-size: 1rem;

    p {
      margin-bottom: 1rem;
    }
  }
`;

const PullQuote = styled.blockquote`
  margin: 3rem -2rem 3rem 0;
  padding: 2rem;
  background: linear-gradient(to right, var(--pull-quote-bg-color), transparent);
  border-left: 4px solid var(--primary-color, ${COLORS.gogo_purple});
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--pull-quote-text-color);
  font-style: italic;
  line-height: 1.4;

  @media (max-width: 900px) {
    margin-right: 0;
  }

  @media (max-width: 768px) {
    margin: 1.5rem 0;
    padding: 1.25rem;
    font-size: 1.15rem;
  }
`;

const QuoteAuthor = styled.cite`
  display: block;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--pull-quote-author-color, ${COLORS.gogo_purple});
  font-style: normal;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const SidebarBox = styled.div`
  background: var(--sidebar-bg-color, #1a1a1a);
  border: 1px solid var(--sidebar-border-color, rgba(255, 255, 255, 0.08));
  border-radius: var(--sidebar-border-radius, 16px);
  padding: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
`;

const SidebarTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: var(--sidebar-title-color);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 1.2em;
    background: var(--primary-color, ${COLORS.gogo_purple});
    border-radius: 2px;
  }
`;

const BulletList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    position: relative;
    padding-left: 1.5rem;
    margin-bottom: 1rem;
    color: var(--bullet-text-color);
    font-size: 0.95rem;
    line-height: 1.5;

    &::before {
      content: '•';
      position: absolute;
      left: 0;
      color: var(--bullet-marker-color, ${COLORS.gogo_purple});
      font-weight: bold;
    }
  }
`;

const KeyTakeaway = styled.div`
  background: var(--key-takeaway-bg-color, ${COLORS.gogo_purple});
  color: var(--key-takeaway-text-color, #fff);
  padding: 1.5rem;
  border-radius: var(--key-takeaway-border-radius, 12px);
  font-weight: 600;
  line-height: 1.5;
  font-size: 1.1rem;
  text-align: center;

  @media (max-width: 768px) {
    padding: 1rem;
    font-size: 1rem;
  }
`;

const ImageContainer = styled.div<{ $src: string }>`
  width: 100%;
  height: 300px;
  background: url('${(p) => p.$src}') center/cover no-repeat;
  border-radius: var(--sidebar-image-border-radius, 12px);
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    height: 200px;
    margin-bottom: 1.5rem;
  }
`;

function FlexB({ previewMode = false, flexBOverride }: FlexBProps): JSX.Element | null {
  const [internalData, setInternalData] = useState<FlexBContent | null>(null);
  const [loading, setLoading] = useState(!previewMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!previewMode) {
      const loadContent = async () => {
        try {
          setLoading(true);
          const content = await fetchFlexBContent();
          if (content) {
            setInternalData(content);
          } else {
            setError('Content not found. Please create it in the admin panel.');
          }
        } catch (err) {
          console.error('Failed to fetch FlexB content:', err);
          setError('Failed to load content.');
        } finally {
          setLoading(false);
        }
      };
      loadContent();
    }
  }, [previewMode]);

  const data = previewMode ? flexBOverride : internalData;

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

  const header = data.header ?? { label: '', headline: '' };
  const pullQuote = data.pullQuote ?? { text: '', author: '', insertAfterParagraph: 1 };
  const sidebar = data.sidebar ?? { imageUrl: '', imageAlt: '', title: '', bullets: [] };
  const keyTakeaway = data.keyTakeaway ?? { text: '' };
  const bodyParagraphs = data.bodyParagraphs ?? [];

  return (
    <Wrapper
      aria-label={data.ariaLabel || undefined}
      $bgGradient={data.sectionBgGradient || undefined}
      $primaryColor={data.primaryColor || undefined}
      $textColor={data.textColor || undefined}
      $labelTextColor={data.labelTextColor || undefined}
      $headlineColor={data.headlineColor || undefined}
      $leadParagraphColor={data.leadParagraphColor || undefined}
      $bodyTextColor={data.bodyTextColor || undefined}
      $pullQuoteBgColor={data.pullQuoteBgColor || undefined}
      $pullQuoteTextColor={data.pullQuoteTextColor || undefined}
      $pullQuoteAuthorColor={data.pullQuoteAuthorColor || undefined}
      $sidebarBgColor={data.sidebarBgColor || undefined}
      $sidebarBorderColor={data.sidebarBorderColor || undefined}
      $sidebarBorderRadius={data.sidebarBorderRadius ?? undefined}
      $sidebarImageBorderRadius={data.sidebarImageBorderRadius ?? undefined}
      $sidebarTitleColor={data.sidebarTitleColor || undefined}
      $bulletTextColor={data.bulletTextColor || undefined}
      $bulletMarkerColor={data.bulletMarkerColor || undefined}
      $keyTakeawayBgColor={data.keyTakeawayBgColor || undefined}
      $keyTakeawayTextColor={data.keyTakeawayTextColor || undefined}
      $keyTakeawayBorderRadius={data.keyTakeawayBorderRadius ?? undefined}
    >
      <Container>
        <Reveal variant="fade-up" enabled={data.animationsEnabled ?? true}>
          <Grid>
            <MainContent>
              {header.label && <Label>{header.label}</Label>}
              {header.headline && <Headline>{header.headline}</Headline>}
              {data.leadParagraph && <LeadParagraph>{data.leadParagraph}</LeadParagraph>}
              
              <BodyText>
                {bodyParagraphs.map((paragraph, idx) => (
                  <React.Fragment key={idx}>
                    <p>{paragraph}</p>
                    {pullQuote.text && pullQuote.insertAfterParagraph === idx && (
                      <PullQuote>
                        "{pullQuote.text}"
                        {pullQuote.author && <QuoteAuthor>— {pullQuote.author}</QuoteAuthor>}
                      </PullQuote>
                    )}
                  </React.Fragment>
                ))}
              </BodyText>
            </MainContent>

            <Sidebar>
              <SidebarBox>
                {sidebar.imageUrl && <ImageContainer $src={sidebar.imageUrl} />}
                {sidebar.title && <SidebarTitle>{sidebar.title}</SidebarTitle>}
                {sidebar.bullets && sidebar.bullets.length > 0 && (
                  <BulletList>
                    {sidebar.bullets.map((bullet, idx) => (
                      <li key={idx}>{bullet}</li>
                    ))}
                  </BulletList>
                )}
              </SidebarBox>

              {keyTakeaway.text && <KeyTakeaway>{keyTakeaway.text}</KeyTakeaway>}
            </Sidebar>
          </Grid>
        </Reveal>
      </Container>
    </Wrapper>
  );
}

export default FlexB;
