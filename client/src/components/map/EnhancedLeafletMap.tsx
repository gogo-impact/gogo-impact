// @ts-nocheck - Disable TypeScript checking for this file to avoid Leaflet typing issues
import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './EnhancedLeafletMap.css';
import styled from 'styled-components';
import COLORS from '../../../assets/colors.ts';
import defaultRegions from './data/regions';
import { darkenColor, lightenColor } from './utils/colorHelpers';
import { Region, Sublocation } from './types';
import { MapRegion as ApiMapRegion, MapLocation as ApiMapLocation } from '../../services/impact.api';

// Import Leaflet images directly
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Define type for location types
const LocationTypes = {
  SCHOOL: 'school',
  ACADEMY: 'academy',
  COMMUNITY_CENTER: 'community-center',
  STUDIO: 'studio',
  HUB: 'hub',
  PROGRAM: 'program',
  OFFICE: 'office',
  SUMMER_PROGRAM: 'summer-program',
  PERFORMANCE_VENUE: 'performance-venue',
  DEFAULT: 'default',
};

// Define icon paths for different location types
const ICON_PATHS = {
  [LocationTypes.SCHOOL]: `<path d="M5,13.18v4L12,21l7-3.82v-4L12,17L5,13.18z M12,3L1,9l11,6l9-4.91V17h2V9L12,3z" fill="url(#iconGradient)"/>`,
  [LocationTypes.ACADEMY]: `<path d="M5,13.18v4L12,21l7-3.82v-4L12,17L5,13.18z M12,3L1,9l11,6l9-4.91V17h2V9L12,3z" fill="url(#iconGradient)"/>`,
  [LocationTypes.COMMUNITY_CENTER]: `<path d="M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9S16.97,3,12,3z M15.5,8c0.83,0,1.5,0.67,1.5,1.5S16.33,11,15.5,11S14,10.33,14,9.5S14.67,8,15.5,8z M8.5,8C9.33,8,10,8.67,10,9.5S9.33,11,8.5,11S7,10.33,7,9.5S7.67,8,8.5,8z M12,17.5c-2.33,0-4.31-1.46-5.11-3.5h10.22C16.31,16.04,14.33,17.5,12,17.5z" fill="url(#iconGradient)"/>`,
  [LocationTypes.STUDIO]: `<path d="M12,3v10.55c-0.59-0.34-1.27-0.55-2-0.55c-2.21,0-4,1.79-4,4s1.79,4,4,4s4-1.79,4-4V7h4V3H12z M10,19c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S11.1,19,10,19z" fill="url(#iconGradient)"/>`,
  [LocationTypes.HUB]: `<path d="M16,11c1.66,0,2.99-1.34,2.99-3S17.66,5,16,5c-1.66,0-3,1.34-3,3s1.34,3,3,3z M8,11c1.66,0,2.99-1.34,2.99-3S9.66,5,8,5C6.34,5,5,6.34,5,8s1.34,3,3,3z M8,13c-2.33,0-7,1.17-7,3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z M16,13c-0.29,0-0.62,0.02-0.97,0.05c1.16,0.84,1.97,1.97,1.97,3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="url(#iconGradient)"/>`,
  [LocationTypes.PROGRAM]: `<path d="M19,3h-4.18C14.4,1.84,13.3,1,12,1c-1.3,0-2.4,0.84-2.82,2H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M12,3c0.55,0,1,0.45,1,1s-0.45,1-1,1s-1-0.45-1-1S11.45,3,12,3z M16,15H8v-2h8V15z M16,11H8V9h8V11z M16,7H8V5h8V7z" fill="url(#iconGradient)"/>`,
  [LocationTypes.SUMMER_PROGRAM]: `<path d="M6.76,4.84l-1.8-1.79l-1.41,1.41l1.79,1.79L6.76,4.84z M1,10.5h3v2H1V10.5z M11,0.55h2V3.5h-2V0.55z M19.04,3.045l1.408,1.407l-1.79,1.79l-1.407-1.408L19.04,3.045z M17.24,18.16l1.79,1.8l1.41-1.41l-1.8-1.79L17.24,18.16z M20,10.5h3v2h-3V10.5z M12,5.5c-3.31,0-6,2.69-6,6s2.69,6,6,6s6-2.69,6-6S15.31,5.5,12,5.5z M11,22.45h2v-2.95h-2V22.45z M3.55,4.46l1.41,1.41l1.79-1.8l-1.41-1.41L3.55,4.46z" fill="url(#iconGradient)"/>`,
  [LocationTypes.OFFICE]: `<path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" fill="url(#iconGradient)"/>`,
  [LocationTypes.PERFORMANCE_VENUE]: `<path d="M22 10V6c0-1.1-.9-2-2-2H4c-1.1 0-1.99.9-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-9 7.5h-2v-2h2v2zm0-4.5h-2v-2h2v2zm0-4.5h-2v-2h2v2z" fill="url(#iconGradient)"/>`,
  [LocationTypes.DEFAULT]: `<path d="M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2z M12,11.5c-1.38,0-2.5-1.12-2.5-2.5s1.12-2.5,2.5-2.5s2.5,1.12,2.5,2.5S13.38,11.5,12,11.5z" fill="url(#iconGradient)"/>`,
};

// CSS for the map container
const MapContainer = styled.div`
  height: 500px;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  z-index: 1; /* Lower z-index to ensure header is above the map */
`;

// Add a blur overlay component
const MapOverlay = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: 10; /* Relative to parent container */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.3s ease;
  opacity: ${(props) => (props.$isVisible ? 1 : 0)};
  pointer-events: ${(props) => (props.$isVisible ? 'auto' : 'none')};
`;

const OverlayMessage = styled.div`
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 15px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

interface OverlayButtonProps {
  $bgColor?: string;
  $hoverBgColor?: string;
}

const OverlayButton = styled.button<OverlayButtonProps>`
  background: ${(p) => p.$bgColor || COLORS.gogo_blue};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease, background-color 0.2s ease;

  &:hover {
    background: ${(p) => p.$hoverBgColor || COLORS.gogo_purple};
    transform: scale(1.05);
  }
`;

// Stats panel to show the number of locations
const StatsPanel = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 15px;
  border-radius: 8px;
  z-index: 5; /* Relative to parent container */
  font-size: 14px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

// Instructions panel for the map
const InstructionsPanel = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 30px;
  z-index: 5; /* Relative to parent container */
  font-size: 14px;
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 90%;
`;

// Button for exiting region view
const ExitRegionButton = styled.button`
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  z-index: 5; /* Relative to parent container */
  display: flex;
  align-items: center;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &:active {
    transform: scale(0.98);
  }
`;

// Add the BoundaryMessage component
const BoundaryMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  z-index: 5; /* Relative to parent container */
  font-size: 16px;
  backdrop-filter: blur(5px);
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
`;

// Props interface
interface EnhancedLeafletMapProps {
  regions?: ApiMapRegion[];
  overlayButtonBgColor?: string;
  overlayButtonHoverBgColor?: string;
}

// Transform API regions to internal format with sublocations
function transformApiRegions(apiRegions: ApiMapRegion[]): Region[] {
  return apiRegions.map((region) => {
    // Calculate center from locations
    const locations = region.locations || [];
    let centerCoordinates: [number, number] = [39.8283, -98.5795]; // Default US center
    
    if (locations.length > 0) {
      const avgLat = locations.reduce((sum, loc) => sum + loc.coordinates[0], 0) / locations.length;
      const avgLng = locations.reduce((sum, loc) => sum + loc.coordinates[1], 0) / locations.length;
      centerCoordinates = [avgLat, avgLng];
    }

    // Calculate bounds and zoom from locations spread
    let defaultZoom = 10;
    let maxBounds: [[number, number], [number, number]] | undefined;
    
    if (locations.length > 1) {
      const lats = locations.map(l => l.coordinates[0]);
      const lngs = locations.map(l => l.coordinates[1]);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      // Add padding
      const latPad = (maxLat - minLat) * 0.3 || 0.1;
      const lngPad = (maxLng - minLng) * 0.3 || 0.1;
      maxBounds = [
        [minLat - latPad, minLng - lngPad],
        [maxLat + latPad, maxLng + lngPad],
      ];
      
      // Estimate zoom based on spread
      const latSpread = maxLat - minLat;
      const lngSpread = maxLng - minLng;
      const maxSpread = Math.max(latSpread, lngSpread);
      if (maxSpread > 5) defaultZoom = 6;
      else if (maxSpread > 2) defaultZoom = 8;
      else if (maxSpread > 1) defaultZoom = 9;
      else if (maxSpread > 0.5) defaultZoom = 10;
      else defaultZoom = 11;
    }

    // Transform locations to sublocations format
    const sublocations: Sublocation[] = locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      coordinates: loc.coordinates,
      type: loc.type || 'default',
      description: loc.description || undefined,
      address: loc.showAddress !== false ? loc.address : undefined,
      website: loc.website || undefined,
    }));

    return {
      id: region.id,
      name: region.name,
      centerCoordinates,
      defaultZoom,
      minZoom: 5,
      maxZoom: 18,
      color: region.color || COLORS.gogo_blue,
      maxBounds,
      sublocations,
    };
  });
}

// Component that uses Leaflet directly without React Context
function EnhancedLeafletMap({
  regions: apiRegions,
  overlayButtonBgColor,
  overlayButtonHoverBgColor,
}: EnhancedLeafletMapProps) {
  // Transform API regions or use defaults
  const regions = useMemo(() => {
    if (apiRegions && apiRegions.length > 0) {
      return transformApiRegions(apiRegions);
    }
    return defaultRegions;
  }, [apiRegions]);

  // Create a ref to store the map DOM element
  const mapRef = useRef(null);
  // Create a ref to store the map instance
  const leafletMapRef = useRef(null);
  // Store the selected region state
  const [selectedRegion, setSelectedRegion] = useState(null);
  // Store total locations for stats
  const [totalLocations, setTotalLocations] = useState(0);
  // Add state for boundary message visibility
  const [showBoundaryMessage, setShowBoundaryMessage] = useState(false);
  // Reference to the boundary message timeout
  const boundaryMessageTimeoutRef = useRef(null);
  // Add state for overlay visibility
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    // Keep track of total locations
    const countLocations = regions.reduce((count, region) => {
      return count + region.sublocations.length;
    }, 0);
    setTotalLocations(countLocations);
  }, [regions]);

  // Function to create a region marker icon
  const createRegionMarkerIcon = (color = COLORS.gogo_blue, name = '') => {
    // Get the first letter of the region name, default to 'R' if empty
    const firstLetter = name && name.length > 0 ? name.charAt(0) : 'R';

    return L.divIcon({
      className: 'custom-region-marker',
      html: `
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Outer glow/shadow -->
          <circle cx="22" cy="22" r="20" fill="${color}" fill-opacity="0.2" />
          
          <!-- Main circle with gradient -->
          <circle cx="22" cy="22" r="16" fill="url(#regionGradient)" stroke="${color}" stroke-width="2"/>
          
          <!-- Inner highlight -->
          <circle cx="22" cy="22" r="14" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
          
          <!-- Center circle with gradient -->
          <circle cx="22" cy="22" r="8" fill="white"/>
          
          <!-- Pulse animation (subtle expanding circle) -->
          <circle cx="22" cy="22" r="20" fill="${color}" fill-opacity="0.2">
            <animate attributeName="r" values="16;20;16" dur="2s" repeatCount="indefinite" />
            <animate attributeName="fill-opacity" values="0.2;0.1;0.2" dur="2s" repeatCount="indefinite" />
          </circle>
          
          <!-- Text with slight shadow -->
          <text x="22" y="26" font-family="Arial" font-size="11" fill="${color}" text-anchor="middle" font-weight="bold" filter="url(#textShadow)">${firstLetter}</text>
          
          <!-- Definitions for gradients and filters -->
          <defs>
            <linearGradient id="regionGradient" x1="6" y1="6" x2="38" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="${color}" />
              <stop offset="100%" stop-color="${darkenColor(color, 30)}" />
            </linearGradient>
            
            <filter id="textShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1" stdDeviation="0.5" flood-opacity="0.3" />
            </filter>
          </defs>
        </svg>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22],
    });
  };


  // Function to create a marker icon for a specific location type
  const createLocationMarkerIcon = (
    type = 'default',
    color = COLORS.gogo_blue,
  ) => {
    const getIconPath = () => {
      // Check if the type exists in our predefined paths, otherwise use default
      // This allows for dynamic types as long as they match a key, or falls back gracefully
      return ICON_PATHS[type] || ICON_PATHS[LocationTypes.DEFAULT];
    };

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="marker-container">
          <svg width="44" height="44" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <!-- Main circular background with shadow -->
            <circle cx="12" cy="12" r="11" fill="white" filter="url(#dropShadow)" />
            
            <!-- Highlight ring -->
            <circle cx="12" cy="12" r="10" fill="none" stroke="${color}" stroke-width="0.5" stroke-opacity="0.7" />
            
            <!-- The icon itself -->
            ${getIconPath()}
            
            <!-- Definitions for effects -->
            <defs>
              <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.3" />
              </filter>
              
              <linearGradient id="iconGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="${lightenColor(color, 15)}" />
                <stop offset="100%" stop-color="${darkenColor(color, 15)}" />
              </linearGradient>
            </defs>
            
            <!-- Subtle pulse effect for hover (CSS will handle showing/hiding) -->
            <circle class="marker-pulse" cx="12" cy="12" r="14" fill="${color}" fill-opacity="0" stroke="${color}" stroke-width="1" stroke-opacity="0">
              <animate attributeName="r" values="10;14;10" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.7;0;0.7" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22],
    });
  };

  // Create a styled popup content for a location
  const createPopupContentForLocation = (location, regionColor) => {
    const container = document.createElement('div');
    container.style.padding = '15px';
    container.style.maxWidth = '250px';

    const title = document.createElement('h3');
    title.textContent = location.name;
    title.style.color = regionColor || COLORS.gogo_blue;
    title.style.margin = '0 0 8px 0';
    title.style.fontSize = '18px';
    title.style.fontWeight = 'bold';

    container.appendChild(title);

    if (location.type && location.type !== 'default') {
      const typeElem = document.createElement('div');
      typeElem.textContent = location.type.replace(/-/g, ' ');
      typeElem.style.color = '#aaa';
      typeElem.style.fontSize = '12px';
      typeElem.style.marginBottom = '8px';
      typeElem.style.textTransform = 'uppercase';
      container.appendChild(typeElem);
    }

    if (location.address) {
      const addressElem = document.createElement('div');
      addressElem.textContent = location.address;
      addressElem.style.color = '#ccc';
      addressElem.style.fontSize = '13px';
      addressElem.style.marginBottom = '8px';
      addressElem.style.lineHeight = '1.3';
      container.appendChild(addressElem);
    }

    if (location.description) {
      const descElem = document.createElement('p');
      descElem.textContent = location.description;
      descElem.style.margin = '8px 0';
      descElem.style.lineHeight = '1.4';
      container.appendChild(descElem);
    }

    // Legacy support for mediums (from old data format)
    if (location.mediums && location.mediums.length > 0) {
      const mediumsTitle = document.createElement('div');
      mediumsTitle.textContent = 'Mediums';
      mediumsTitle.style.fontWeight = 'bold';
      mediumsTitle.style.marginTop = '10px';
      mediumsTitle.style.marginBottom = '5px';

      const mediumsList = document.createElement('ul');
      mediumsList.style.margin = '0 0 10px 0';
      mediumsList.style.paddingLeft = '20px';

      location.mediums.forEach((medium) => {
        const listItem = document.createElement('li');
        listItem.textContent = medium;
        listItem.style.margin = '3px 0';
        mediumsList.appendChild(listItem);
      });

      container.appendChild(mediumsTitle);
      container.appendChild(mediumsList);
    }

    if (location.website) {
      const websiteLink = document.createElement('a');
      websiteLink.href = location.website;
      websiteLink.textContent = 'Visit Website';
      websiteLink.target = '_blank';
      websiteLink.rel = 'noopener noreferrer';
      websiteLink.style.display = 'inline-block';
      websiteLink.style.marginTop = '10px';
      websiteLink.style.color = regionColor || COLORS.gogo_blue;
      websiteLink.style.textDecoration = 'none';
      websiteLink.style.fontWeight = 'bold';
      container.appendChild(websiteLink);
    }

    // Legacy support for extraText (from old data format)
    if (location.extraText) {
      const extraTextElem = document.createElement('div');
      extraTextElem.textContent = location.extraText;
      extraTextElem.style.fontStyle = 'italic';
      extraTextElem.style.fontSize = '12px';
      extraTextElem.style.marginTop = '10px';
      extraTextElem.style.color = '#aaa';
      container.appendChild(extraTextElem);
    }

    return container;
  };

  // Create a styled popup content for a region
  const createPopupContentForRegion = (region) => {
    const container = document.createElement('div');
    container.style.padding = '15px';
    container.style.maxWidth = '250px';

    const title = document.createElement('h3');
    title.textContent = region.name;
    title.style.color = region.color || COLORS.gogo_blue;
    title.style.margin = '0 0 8px 0';
    title.style.fontSize = '18px';
    title.style.fontWeight = 'bold';

    const countElem = document.createElement('div');
    countElem.textContent = `${region.sublocations.length} locations`;
    countElem.style.fontSize = '14px';
    countElem.style.marginBottom = '10px';

    const button = document.createElement('button');
    button.textContent = `Explore ${region.name}`;
    button.style.background = region.color || COLORS.gogo_blue;
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.padding = '8px 16px';
    button.style.borderRadius = '20px';
    button.style.cursor = 'pointer';
    button.style.marginTop = '10px';
    button.style.width = '100%';
    button.style.fontWeight = 'bold';

    // Add event listener to the button
    button.addEventListener('click', () => {
      // Close the popup
      leafletMapRef.current.closePopup();
      // Select the region - this will trigger the useEffect
      setSelectedRegion(region);
    });

    container.appendChild(title);
    container.appendChild(countElem);

    if (region.description) {
      const descElem = document.createElement('p');
      descElem.textContent = region.description;
      descElem.style.margin = '8px 0';
      descElem.style.lineHeight = '1.4';
      container.appendChild(descElem);
    }

    container.appendChild(button);

    return container;
  };

  // Function to initialize the map with regions
  const initializeMapWithRegions = (map) => {
    // Add all region markers
    regions
      .filter((region) => region.id !== 'summer-programs')
      .forEach((region) => {
        const marker = L.marker(region.centerCoordinates, {
          icon: createRegionMarkerIcon(
            region.color || COLORS.gogo_blue,
            region.name,
          ),
        }).addTo(map);

        // Add a tooltip
        const tooltip = L.tooltip({
          direction: 'top',
          offset: [0, -10],
          opacity: 0.9,
          permanent: true,
        });

        tooltip.setContent(region.name);
        marker.bindTooltip(tooltip);

        // Add a popup
        const popup = L.popup({
          className: 'custom-popup',
          maxWidth: 300,
          closeButton: true,
        });

        popup.setContent(createPopupContentForRegion(region));
        marker.bindPopup(popup);
      });
  };

  // Function to initialize the map with sublocations for a specific region
  const initializeMapWithSublocations = (map, region) => {
    const { sublocations } = region;
    
    // Check if we should use canvas rendering for performance (many points)
    // Use canvas if there are more than 500 points
    const useCanvas = sublocations.length > 500;
    
    if (useCanvas) {
      // Use a canvas renderer for better performance with many points
      const renderer = L.canvas({ padding: 0.5 });
      
      sublocations.forEach((location) => {
        const marker = L.circleMarker(location.coordinates, {
          renderer: renderer,
          radius: 8,
          fillColor: region.color || COLORS.gogo_blue,
          color: '#fff',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(map);
        
        // Add popup
        const popup = L.popup({
          className: 'custom-popup',
          maxWidth: 300,
          closeButton: true,
        });

        popup.setContent(createPopupContentForLocation(location, region.color));
        marker.bindPopup(popup);
      });
    } else {
      // Use custom markers for smaller datasets
      sublocations.forEach((location) => {
        const marker = L.marker(location.coordinates, {
          icon: createLocationMarkerIcon(
            location.type || 'default',
            region.color,
          ),
        }).addTo(map);

        // Add a popup
        const popup = L.popup({
          className: 'custom-popup',
          maxWidth: 300,
          closeButton: true,
        });

        popup.setContent(createPopupContentForLocation(location, region.color));
        marker.bindPopup(popup);
      });
    }
  };

  // Add function to show boundary message temporarily
  const showBoundaryMessageTemporarily = () => {
    setShowBoundaryMessage(true);

    // Clear any existing timeout
    if (boundaryMessageTimeoutRef.current) {
      clearTimeout(boundaryMessageTimeoutRef.current);
    }

    // Set a new timeout to hide the message after 2 seconds
    boundaryMessageTimeoutRef.current = setTimeout(() => {
      setShowBoundaryMessage(false);
    }, 2000);
  };

  // Setup the map when component mounts or region changes
  useEffect(() => {
    // Only execute if map container is available
    if (!mapRef.current) return;

    // Clean up any existing map
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    // Fix default icon issue
    const DefaultIcon = L.icon({
      iconUrl: icon,
      shadowUrl: iconShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    // Initialize the map with appropriate view
    let map;
    if (selectedRegion) {
      // Dynamic calculation of bounds if sublocations exist
      let bounds;
      if (selectedRegion.sublocations && selectedRegion.sublocations.length > 0) {
         // Create a Leaflet LatLngBounds object
         const latLngs = selectedRegion.sublocations.map(s => s.coordinates);
         bounds = L.latLngBounds(latLngs);
         // Pad the bounds slightly
         bounds = bounds.pad(0.2);
      }

      // Set view based on selected region
      map = L.map(mapRef.current, {
        // Disable all interactions by default if overlay is active
        dragging: !showOverlay,
        touchZoom: !showOverlay,
        scrollWheelZoom: !showOverlay,
        doubleClickZoom: !showOverlay,
        boxZoom: !showOverlay,
        keyboard: !showOverlay,
        zoomControl: false, // Always disable the zoom control
      });

      if (bounds) {
        map.fitBounds(bounds);
      } else if (selectedRegion.centerCoordinates) {
        map.setView(
          selectedRegion.centerCoordinates,
          selectedRegion.defaultZoom || 10,
        );
      } else {
        // Fallback if no bounds and no center
         map.setView([39.8283, -98.5795], 4);
      }

      // Set bounds if available from data, otherwise use calculated bounds expanded
      const maxBoundsToUse = selectedRegion.maxBounds 
        ? L.latLngBounds(selectedRegion.maxBounds[0], selectedRegion.maxBounds[1])
        : (bounds ? bounds.pad(0.5) : null);

      if (maxBoundsToUse) {
        map.setMaxBounds(maxBoundsToUse);

        // Add event listener for when user hits the map boundary (only if overlay is not shown)
        if (!showOverlay) {
          map.on('drag', function () {
            // Check if current view is at the bounds
            const mapBounds = map.getBounds();
            const { maxBounds } = map.options;

            if (
              maxBounds &&
              (mapBounds.getSouth() <= maxBounds.getSouth() ||
                mapBounds.getNorth() >= maxBounds.getNorth() ||
                mapBounds.getWest() <= maxBounds.getWest() ||
                mapBounds.getEast() >= maxBounds.getEast())
            ) {
              showBoundaryMessageTemporarily();
            }
          });
        }
      }

      // Set min/max zoom
      if (selectedRegion.minZoom) map.setMinZoom(selectedRegion.minZoom);
      if (selectedRegion.maxZoom) map.setMaxZoom(selectedRegion.maxZoom);

      // Initialize map with location markers for the selected region
      initializeMapWithSublocations(map, selectedRegion);

      // Add zoom event listener to detect when user zooms out of region view
      if (!showOverlay) {
        map.on('zoomend', function () {
          const currentZoom = map.getZoom();
          // Define a threshold - if the user zooms out far enough, return to nationwide view
          // Typically 3-4 levels below the region's default zoom is a good threshold
          // If defaultZoom is not present, estimate from current view after fitBounds? 
          // Better to just use a reasonable absolute minimum for region view (e.g. 6) or use the prop if available
          const minRegionZoom = selectedRegion.minZoom || 5;
          const zoomThreshold = Math.max(minRegionZoom, 4);

          if (currentZoom <= zoomThreshold) {
            // User has zoomed out far enough, return to nationwide view
            handleExitRegion();
          }
        });
      }
    } else {
      // Overview of USA
      map = L.map(mapRef.current, {
        // Disable all interactions by default if overlay is active
        dragging: !showOverlay,
        touchZoom: !showOverlay,
        scrollWheelZoom: !showOverlay,
        doubleClickZoom: !showOverlay,
        boxZoom: !showOverlay,
        keyboard: !showOverlay,
        zoomControl: false, // Always disable the zoom control
      }).setView([39.8283, -98.5795], 4);

      map.setMinZoom(4);
      map.setMaxZoom(4);

      // Set USA bounds
      const usaBounds = L.latLngBounds(
        L.latLng(24.396308, -125.0), // Southwest corner of US
        L.latLng(49.384358, -66.93457), // Northeast corner of US
      );
      map.setMaxBounds(usaBounds.pad(0.1)); // Add some padding

      // Initialize map with region markers
      initializeMapWithRegions(map);
    }

    // Add tile layer
    L.tileLayer(
      'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      },
    ).addTo(map);

    // Store map reference
    leafletMapRef.current = map;

    // Add custom CSS for map styling
    const style = document.createElement('style');
    style.textContent = `
      /* Ensure that Leaflet elements respect the map container's z-index */
      .leaflet-pane,
      .leaflet-map-pane,
      .leaflet-tile,
      .leaflet-marker-icon,
      .leaflet-marker-shadow,
      .leaflet-tile-container,
      .leaflet-pane > svg,
      .leaflet-pane > canvas,
      .leaflet-zoom-box,
      .leaflet-image-layer,
      .leaflet-layer {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 2 !important;
      }

      .leaflet-popup-pane {
        z-index: 7 !important;
      }

      .leaflet-tooltip-pane {
        z-index: 6 !important;
      }

      .leaflet-control {
        z-index: 8 !important;
      }

      .custom-popup .leaflet-popup-content-wrapper {
        background: rgba(26, 26, 30, 0.95);
        color: white;
        border-radius: 8px;
        box-shadow: 0 3px 15px rgba(0, 0, 0, 0.4);
      }
      .custom-popup .leaflet-popup-tip {
        background: rgba(26, 26, 30, 0.95);
      }
      .leaflet-tooltip {
        background: rgba(26, 26, 30, 0.9);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        font-weight: bold;
        padding: 6px 12px;
        font-size: 14px;
        text-align: center;
        white-space: nowrap;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
      }
      .leaflet-tooltip:before {
        display: none;
      }
      .custom-marker, .custom-region-marker {
        transition: transform 0.2s ease;
      }
      .custom-marker:hover, .custom-region-marker:hover {
        z-index: 9 !important; /* High within the map container, but still below the header */
        transform: scale(1.1);
      }
    `;
    document.head.appendChild(style);

    // Clean up function
    return () => {
      // Clean up style element
      if (style.parentNode) {
        document.head.removeChild(style);
      }

      // Clear any pending timeout
      if (boundaryMessageTimeoutRef.current) {
        clearTimeout(boundaryMessageTimeoutRef.current);
      }

      if (leafletMapRef.current) {
        // Remove any event listeners
        leafletMapRef.current.off();
        // Remove the map instance
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      return undefined;
    };
  }, [
    selectedRegion,
    showOverlay,
    initializeMapWithRegions,
    initializeMapWithSublocations,
  ]); // Added all required dependencies

  // Handle exiting region view
  const handleExitRegion = () => {
    // Clear any boundary message timeout
    if (boundaryMessageTimeoutRef.current) {
      clearTimeout(boundaryMessageTimeoutRef.current);
      setShowBoundaryMessage(false);
    }

    setSelectedRegion(null);
  };

  // Handle clicking on the overlay
  const handleOverlayClick = () => {
    setShowOverlay(false);

    // Enable map interactions when overlay is removed
    if (leafletMapRef.current) {
      leafletMapRef.current.dragging.enable();
      leafletMapRef.current.touchZoom.enable();
      leafletMapRef.current.scrollWheelZoom.enable();
      leafletMapRef.current.doubleClickZoom.enable();
      leafletMapRef.current.boxZoom.enable();
      leafletMapRef.current.keyboard.enable();
    }
  };

  return (
    <MapContainer>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      {/* Stats Panel */}
      <StatsPanel style={{ display: showOverlay ? 'none' : 'block' }}>
        {selectedRegion ? (
          <>
            <strong>{selectedRegion.name}</strong>:{' '}
            {selectedRegion.sublocations.length} locations
          </>
        ) : (
          <>
            <strong>GOGO Impact</strong>: {totalLocations} locations in{' '}
            {regions.length - 1} regions
          </>
        )}
      </StatsPanel>

      {/* Instructions Panel */}
      <InstructionsPanel style={{ display: showOverlay ? 'none' : 'block' }}>
        {selectedRegion ? (
          <>
            Explore {selectedRegion.name}. Click on markers to see location
            details.
          </>
        ) : (
          <>
            Click on any region marker to explore GOGO&apos;s locations in that
            area.
          </>
        )}
      </InstructionsPanel>

      {/* Exit Region Button - Only show when a region is selected and overlay is not visible */}
      {selectedRegion && !showOverlay && (
        <ExitRegionButton onClick={handleExitRegion}>
          ← Back to National Map
        </ExitRegionButton>
      )}

      {/* Boundary Message - Shows when trying to pan outside bounds */}
      <BoundaryMessage style={{ opacity: showBoundaryMessage ? 1 : 0 }}>
        You&apos;ve reached the edge of this region&apos;s view
      </BoundaryMessage>

      {/* Add the overlay that will blur the map until clicked */}
      <MapOverlay $isVisible={showOverlay} onClick={handleOverlayClick}>
        <OverlayMessage>Interactive Map Available</OverlayMessage>
        <OverlayButton
          $bgColor={overlayButtonBgColor}
          $hoverBgColor={overlayButtonHoverBgColor}
        >
          Click to Explore
        </OverlayButton>
      </MapOverlay>
    </MapContainer>
  );
}

export default EnhancedLeafletMap;
