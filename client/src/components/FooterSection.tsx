import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import COLORS from '../../assets/colors';
import {
  fetchFooterContent,
  FooterContent,
  FooterColumn,
  FooterSocialLink,
} from '../services/impact.api';
import { getImpactIconByKey } from './IconSelector';
import { normalizeUrl } from '../Admin/utils';

// Default logo
import gogoWideLogo from '../../assets/GOGO_LOGO_WIDE_WH.png';

interface FooterProps {
  previewMode?: boolean;
  footerOverride?: FooterContent | null;
}

// Styled components
const FooterWrapper = styled.footer<{
  $bgColor?: string;
  $bgGradient?: string;
}>`
  background: ${({ $bgGradient, $bgColor }) => $bgGradient || $bgColor || '#121212'};
  padding: 4rem 0 2rem;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 2.5rem 0 1.5rem;
  }
`;

const TopBorder = styled.div<{ $gradient?: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: ${({ $gradient }) =>
    $gradient ||
    `linear-gradient(90deg, ${COLORS.gogo_blue}44, ${COLORS.gogo_pink}44, ${COLORS.gogo_purple}44, ${COLORS.gogo_teal}44, ${COLORS.gogo_yellow}44, ${COLORS.gogo_green}44)`};
`;

const FooterGrid = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 0 1rem;
  }
`;

const FooterLogo = styled.div<{ $width?: number }>`
  margin-bottom: 2rem;

  img {
    max-width: ${({ $width }) => $width || 180}px;
    height: auto;
  }

  @media (max-width: 768px) {
    margin-bottom: 1.5rem;

    img {
      max-width: 150px;
    }
  }
`;

const FooterAbout = styled.div<{ $color?: string }>`
  font-size: 0.9rem;
  line-height: 1.6;
  color: ${({ $color }) => $color || 'rgba(255, 255, 255, 0.6)'};
  max-width: 400px;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-bottom: 1.5rem;
  }
`;

const FooterColumnWrapper = styled.div``;

const FooterColumnTitle = styled.h3<{ $color?: string }>`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ $color }) => $color || 'white'};
  margin-bottom: 1.5rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FooterLink = styled.li<{ $color?: string; $hoverColor?: string }>`
  margin-bottom: 0.8rem;

  a {
    color: ${({ $color }) => $color || 'rgba(255, 255, 255, 0.6)'};
    text-decoration: none;
    font-size: 0.9rem;
    transition: all 0.2s ease;

    &:hover {
      color: ${({ $hoverColor }) => $hoverColor || 'white'};
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const SocialIcon = styled.a<{
  $bgColor?: string;
  $hoverBgColor?: string;
  $iconColor?: string;
  $borderColor?: string;
}>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $bgColor }) => $bgColor || 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${({ $borderColor }) => $borderColor || 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: ${({ $iconColor }) => $iconColor || 'white'};

  &:hover {
    background: ${({ $hoverBgColor }) => $hoverBgColor || 'rgba(255, 255, 255, 0.2)'};
    transform: translateY(-3px);
  }

  svg {
    font-size: 1.2rem;
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;

    svg {
      font-size: 1rem;
    }
  }
`;

const BottomBar = styled.div<{ $bgColor?: string; $borderColor?: string }>`
  max-width: 1400px;
  margin: 4rem auto 0;
  padding: 2rem;
  border-top: 1px solid ${({ $borderColor }) => $borderColor || 'rgba(255, 255, 255, 0.1)'};
  background: ${({ $bgColor }) => $bgColor || 'transparent'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    margin-top: 2rem;
    padding: 1.5rem 1rem;
    flex-direction: column;
    text-align: center;
  }
`;

const Copyright = styled.div<{ $color?: string }>`
  font-size: 0.8rem;
  color: ${({ $color }) => $color || 'rgba(255, 255, 255, 0.5)'};
`;

const LegalLinks = styled.div<{
  $linkColor?: string;
  $linkHoverColor?: string;
  $separator?: string;
}>`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;

  a {
    font-size: 0.8rem;
    color: ${({ $linkColor }) => $linkColor || 'rgba(255, 255, 255, 0.5)'};
    text-decoration: none;

    &:hover {
      color: ${({ $linkHoverColor }) => $linkHoverColor || 'white'};
    }
  }

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const MailingAddressSection = styled.div<{ $color?: string }>`
  font-size: 0.85rem;
  color: ${({ $color }) => $color || '#64748b'};
  white-space: pre-line;
  line-height: 1.6;
  margin-top: 1.5rem;
`;

const NewsletterSection = styled.div`
  margin-top: 2rem;
`;

const NewsletterTitle = styled.h4<{ $color?: string }>`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ $color }) => $color || 'white'};
  margin-bottom: 1rem;
`;

const NewsletterForm = styled.form<{
  $inputBgColor?: string;
  $inputBorderColor?: string;
  $inputTextColor?: string;
  $buttonBgColor?: string;
  $buttonTextColor?: string;
}>`
  display: flex;
  gap: 0.5rem;

  input {
    flex: 1;
    padding: 0.6rem 1rem;
    border-radius: 6px;
    border: 1px solid ${({ $inputBorderColor }) => $inputBorderColor || 'rgba(255,255,255,0.1)'};
    background: ${({ $inputBgColor }) => $inputBgColor || 'rgba(255,255,255,0.05)'};
    color: ${({ $inputTextColor }) => $inputTextColor || 'white'};
    font-size: 0.9rem;

    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    &:focus {
      outline: none;
      border-color: ${COLORS.gogo_blue};
    }
  }

  button {
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    border: none;
    background: ${({ $buttonBgColor }) => $buttonBgColor || COLORS.gogo_blue};
    color: ${({ $buttonTextColor }) => $buttonTextColor || 'white'};
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.9;
    }
  }
`;

const StackedColumns = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

function FooterSection({ previewMode = false, footerOverride }: FooterProps) {
  const [footerData, setFooterData] = useState<FooterContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (footerOverride) {
      setFooterData(footerOverride);
      setLoading(false);
      return;
    }

    async function loadFooter() {
      try {
        const data = await fetchFooterContent();
        setFooterData(data);
      } catch (error) {
        console.error('Failed to load footer content:', error);
      } finally {
        setLoading(false);
      }
    }

    loadFooter();
  }, [footerOverride]);

  // Use footerOverride in preview mode or loaded data
  const footer = footerOverride ?? footerData;

  // If section is explicitly hidden, don't render
  if (footer?.visible === false) return null;

  // Show loading placeholder or fallback to defaults
  const logoData = footer?.logo ?? { useDefaultLogo: true, imageUrl: '', alt: 'Guitars Over Guns Logo', width: 180 };
  // Determine which logo image to use
  const logoImageUrl = logoData.useDefaultLogo !== false || !logoData.imageUrl
    ? gogoWideLogo
    : logoData.imageUrl;
  const logo = {
    ...logoData,
    imageUrl: logoImageUrl,
  };
  const description = footer?.description ?? 
    'Guitars Over Guns is a 501(c)(3) organization that connects youth with professional musician mentors to help them overcome hardship, find their voice and reach their potential through music, art and mentorship.';
  const socialLinks = footer?.socialLinks ?? [];
  const columns = footer?.columns ?? [];
  const bottomBar = footer?.bottomBar ?? {
    copyrightText: '© 2024 Guitars Over Guns. All rights reserved.',
    links: [
      { id: '1', label: 'Privacy Policy', url: '/privacy' },
      { id: '2', label: 'Terms of Use', url: '/terms' },
      { id: '3', label: 'Accessibility', url: '/accessibility' },
    ],
  };
  const newsletter = footer?.newsletter ?? { enabled: false };
  const mailingAddress = footer?.mailingAddress ?? { enabled: false };

  // Group columns by stackWithNext
  const groupedColumns: (FooterColumn | FooterColumn[])[] = [];
  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];
    if (col.stackWithNext && i + 1 < columns.length) {
      groupedColumns.push([col, columns[i + 1]]);
      i++; // Skip the next column since we grouped it
    } else {
      groupedColumns.push(col);
    }
  }

  const renderSocialIcon = (link: FooterSocialLink) => {
    const iconDef = getImpactIconByKey(link.iconKey);
    if (iconDef) {
      const IconComponent = iconDef.Icon;
      return <IconComponent />;
    }
    return null;
  };

  return (
    <FooterWrapper
      $bgColor={footer?.sectionBgColor ?? undefined}
      $bgGradient={footer?.sectionBgGradient ?? undefined}
    >
      <TopBorder $gradient={footer?.topBorderGradient ?? undefined} />
      
      <FooterGrid>
        {/* Brand column */}
        <FooterColumnWrapper>
          <FooterLogo $width={logo.width ?? 180}>
            <img
              src={logo.imageUrl || gogoWideLogo}
              alt={logo.alt || 'Logo'}
              loading="lazy"
              decoding="async"
            />
          </FooterLogo>
          <FooterAbout $color={footer?.descriptionColor ?? undefined}>
            {description}
          </FooterAbout>

          {socialLinks.length > 0 && (
            <SocialLinks>
              {socialLinks.map((link) => (
                <SocialIcon
                  key={link.id}
                  href={normalizeUrl(link.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  $bgColor={footer?.socialBubbleBgColor ?? undefined}
                  $hoverBgColor={footer?.socialBubbleHoverBgColor ?? undefined}
                  $iconColor={footer?.socialBubbleIconColor ?? undefined}
                  $borderColor={footer?.socialBubbleBorderColor ?? undefined}
                  title={link.label}
                >
                  {renderSocialIcon(link)}
                </SocialIcon>
              ))}
            </SocialLinks>
          )}

          {mailingAddress.enabled && mailingAddress.text && (
            <MailingAddressSection $color={mailingAddress.textColor ?? undefined}>
              {mailingAddress.text}
            </MailingAddressSection>
          )}

          {/* Newsletter disabled - functionality not implemented. Re-enable by removing `false &&` below */}
          {false && newsletter.enabled && (
            <NewsletterSection>
              <NewsletterTitle $color={newsletter.titleColor ?? undefined}>
                {newsletter.title || 'Join Our Newsletter'}
              </NewsletterTitle>
              <NewsletterForm
                $inputBgColor={newsletter.inputBgColor ?? undefined}
                $inputBorderColor={newsletter.inputBorderColor ?? undefined}
                $inputTextColor={newsletter.inputTextColor ?? undefined}
                $buttonBgColor={newsletter.buttonBgColor ?? undefined}
                $buttonTextColor={newsletter.buttonTextColor ?? undefined}
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder={newsletter.placeholder || 'Enter your email'}
                />
                <button type="submit">
                  {newsletter.buttonText || 'Sign Up'}
                </button>
              </NewsletterForm>
            </NewsletterSection>
          )}
        </FooterColumnWrapper>

        {/* Link columns */}
        {groupedColumns.map((colOrGroup, idx) => {
          if (Array.isArray(colOrGroup)) {
            // Stacked columns
            return (
              <StackedColumns key={`stacked-${idx}`}>
                {colOrGroup.map((col) => (
                  <FooterColumnWrapper key={col.id}>
                    <FooterColumnTitle $color={col.titleColor || footer?.columnTitleColor || undefined}>
                      {col.title}
                    </FooterColumnTitle>
                    <FooterLinks>
                      {col.links.map((link) => (
                        <FooterLink
                          key={link.id}
                          $color={footer?.columnLinkColor ?? undefined}
                          $hoverColor={footer?.columnLinkHoverColor ?? undefined}
                        >
                          <a href={normalizeUrl(link.url)}>{link.label}</a>
                        </FooterLink>
                      ))}
                    </FooterLinks>
                  </FooterColumnWrapper>
                ))}
              </StackedColumns>
            );
          } else {
            // Single column
            const col = colOrGroup;
            return (
              <FooterColumnWrapper key={col.id}>
                <FooterColumnTitle $color={col.titleColor || footer?.columnTitleColor || undefined}>
                  {col.title}
                </FooterColumnTitle>
                <FooterLinks>
                  {col.links.map((link) => (
                    <FooterLink
                      key={link.id}
                      $color={footer?.columnLinkColor ?? undefined}
                      $hoverColor={footer?.columnLinkHoverColor ?? undefined}
                    >
                      <a href={normalizeUrl(link.url)}>{link.label}</a>
                    </FooterLink>
                  ))}
                </FooterLinks>
              </FooterColumnWrapper>
            );
          }
        })}
      </FooterGrid>

      <BottomBar
        $bgColor={bottomBar.bgColor ?? undefined}
        $borderColor={bottomBar.borderColor ?? undefined}
      >
        <Copyright $color={bottomBar.copyrightColor ?? undefined}>
          {bottomBar.copyrightText}
        </Copyright>
        <LegalLinks
          $linkColor={bottomBar.linkColor ?? undefined}
          $linkHoverColor={bottomBar.linkHoverColor ?? undefined}
        >
          {bottomBar.links.map((link, idx) => (
            <React.Fragment key={link.id}>
              <a href={normalizeUrl(link.url)}>{link.label}</a>
            </React.Fragment>
          ))}
        </LegalLinks>
      </BottomBar>
    </FooterWrapper>
  );
}

export default FooterSection;

