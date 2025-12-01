/**
 * ParallaxLayer - Component for creating parallax background/foreground layers
 * Wraps content and applies parallax transform based on scroll position
 */
import React, { ReactNode, CSSProperties } from 'react';
import styled from 'styled-components';
import { useParallax, ParallaxOptions } from './useParallax';

export interface ParallaxLayerProps extends ParallaxOptions {
  /** Content to render inside the parallax layer */
  children: ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
  /** HTML tag to render as */
  as?: keyof JSX.IntrinsicElements;
  /** Z-index for layering */
  zIndex?: number;
  /** Whether the layer should be absolute positioned */
  absolute?: boolean;
  /** Whether the layer covers the full parent */
  fullSize?: boolean;
}

const LayerWrapper = styled.div<{
  $zIndex?: number;
  $absolute?: boolean;
  $fullSize?: boolean;
}>`
  ${(props) =>
    props.$absolute &&
    `
    position: absolute;
    top: 0;
    left: 0;
  `}
  ${(props) =>
    props.$fullSize &&
    `
    width: 100%;
    height: 100%;
  `}
  ${(props) => props.$zIndex !== undefined && `z-index: ${props.$zIndex};`}
  pointer-events: none;
  will-change: transform;
`;

/**
 * ParallaxLayer component
 * Creates a layer that moves at a different speed than normal scroll
 */
export function ParallaxLayer({
  children,
  className,
  style,
  as,
  zIndex,
  absolute = false,
  fullSize = false,
  ...parallaxOptions
}: ParallaxLayerProps): JSX.Element {
  const [ref, { style: parallaxStyle }] = useParallax<HTMLDivElement>(parallaxOptions);

  return (
    <LayerWrapper
      ref={ref}
      as={as}
      className={className}
      style={{ ...style, ...parallaxStyle }}
      $zIndex={zIndex}
      $absolute={absolute}
      $fullSize={fullSize}
    >
      {children}
    </LayerWrapper>
  );
}

/**
 * ParallaxContainer - Container that holds multiple parallax layers
 */
const ContainerWrapper = styled.div`
  position: relative;
  overflow: hidden;
`;

export interface ParallaxContainerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Height of the container */
  height?: string | number;
}

export function ParallaxContainer({
  children,
  className,
  style,
  height,
}: ParallaxContainerProps): JSX.Element {
  return (
    <ContainerWrapper
      className={className}
      style={{
        ...style,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      {children}
    </ContainerWrapper>
  );
}

/**
 * ParallaxBackground - Convenience component for background parallax layers
 */
export interface ParallaxBackgroundProps {
  /** Background image URL */
  imageUrl?: string;
  /** Background color or gradient */
  background?: string;
  /** Parallax speed (default 0.3 for slow background movement) */
  speed?: number;
  /** Additional styles */
  style?: CSSProperties;
  /** Optional children to render inside */
  children?: ReactNode;
}

const BackgroundLayer = styled.div<{ $background?: string; $imageUrl?: string }>`
  position: absolute;
  top: -10%;
  left: -5%;
  width: 110%;
  height: 120%;
  ${(props) =>
    props.$imageUrl
      ? `
    background-image: url(${props.$imageUrl});
    background-size: cover;
    background-position: center;
  `
      : ''}
  ${(props) => (props.$background ? `background: ${props.$background};` : '')}
  pointer-events: none;
`;

export function ParallaxBackground({
  imageUrl,
  background,
  speed = 0.3,
  style,
  children,
}: ParallaxBackgroundProps): JSX.Element {
  const [ref, { style: parallaxStyle }] = useParallax<HTMLDivElement>({
    speed,
    direction: 'vertical',
    maxOffset: 100,
  });

  return (
    <BackgroundLayer
      ref={ref}
      $imageUrl={imageUrl}
      $background={background}
      style={{ ...style, ...parallaxStyle }}
    >
      {children}
    </BackgroundLayer>
  );
}

export default ParallaxLayer;

