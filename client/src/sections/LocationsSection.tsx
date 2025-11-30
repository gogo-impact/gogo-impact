import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import EnhancedLeafletMap from '../components/map/EnhancedLeafletMap';
import COLORS from '../../assets/colors.ts';
import {
  fetchNationalImpactContent,
  NationalImpactContent,
} from '../services/impact.api';

interface LocationsSectionWrapperProps {
  $bgColor?: string;
}

const LocationsSectionWrapper = styled.div<LocationsSectionWrapperProps>`
  padding: 4rem 0 6rem;
  background: ${(p) => p.$bgColor || '#121212'};
`;

const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

interface SectionHeadingProps {
  $color?: string;
}

const SectionHeading = styled.h2<SectionHeadingProps>`
  font-size: 2.25rem;
  font-weight: 800;
  text-align: center;
  margin: 0 0 1.5rem;
  color: ${(p) => p.$color || '#fff'};
`;

const MapFrame = styled.div`
  position: relative;
  padding: 12px;
  border-radius: 16px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.01)
  );
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.35);
  pointer-events: none;

  &:before,
  &:after {
    content: '';
    position: absolute;
    width: 28px;
    height: 28px;
    border-color: rgba(255, 255, 255, 0.18);
    pointer-events: none;
  }

  &:before {
    top: 6px;
    left: 6px;
    border-top: 2px solid rgba(255, 255, 255, 0.18);
    border-left: 2px solid rgba(255, 255, 255, 0.18);
  }

  &:after {
    bottom: 6px;
    right: 6px;
    border-bottom: 2px solid rgba(255, 255, 255, 0.18);
    border-right: 2px solid rgba(255, 255, 255, 0.18);
  }
`;

const MapContainer = styled.div`
  border-radius: 12px;
  overflow: hidden;
  background: ${COLORS.black};
  border: 1px solid rgba(255, 255, 255, 0.08);
  pointer-events: auto;
`;

export interface LocationsSectionProps {
  nationalImpactData?: NationalImpactContent | null;
  previewMode?: boolean;
  nationalImpactOverride?: Partial<NationalImpactContent>;
}

function LocationsSection({
  nationalImpactData: externalData,
  previewMode = false,
  nationalImpactOverride,
}: LocationsSectionProps): JSX.Element {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [internalData, setInternalData] = useState<NationalImpactContent | null>(externalData || null);

  // Fetch data if not provided externally
  useEffect(() => {
    if (externalData) {
      setInternalData(externalData);
    } else if (!previewMode) {
      fetchNationalImpactContent().then((data) => {
        if (data) setInternalData(data);
      });
    }
  }, [externalData, previewMode]);

  // Merge data
  const effectiveData: NationalImpactContent = externalData
    ? { ...externalData, ...(nationalImpactOverride || {}) }
    : { ...(internalData || {}), ...(nationalImpactOverride || {}) };

  // Extract values
  const title = effectiveData.title || 'Our National Impact';
  const titleColor = effectiveData.titleColor || '';
  const sectionBgColor = effectiveData.sectionBgColor || '';
  const overlayButtonBgColor = effectiveData.overlayButtonBgColor || '';
  const overlayButtonHoverBgColor = effectiveData.overlayButtonHoverBgColor || '';
  const regions = effectiveData.regions || [];

  return (
    <LocationsSectionWrapper id="locations" ref={sectionRef} $bgColor={sectionBgColor}>
      <SectionContainer>
        <SectionHeading $color={titleColor}>{title}</SectionHeading>
        <MapFrame>
          <MapContainer>
            <EnhancedLeafletMap
              regions={regions}
              overlayButtonBgColor={overlayButtonBgColor}
              overlayButtonHoverBgColor={overlayButtonHoverBgColor}
            />
          </MapContainer>
        </MapFrame>
      </SectionContainer>
    </LocationsSectionWrapper>
  );
}

export default LocationsSection;
