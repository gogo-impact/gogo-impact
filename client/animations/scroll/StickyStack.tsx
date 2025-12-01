/**
 * StickyStack - Component for creating sticky stacking sections
 * Children stack on top of each other as you scroll
 */
import React, { ReactNode, Children, CSSProperties } from 'react';
import styled from 'styled-components';

export interface StickyStackProps {
  /** Child elements to stack */
  children: ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
  /** Top offset for sticky positioning (accounts for fixed header) */
  topOffset?: number | string;
  /** Starting z-index for first child */
  baseZIndex?: number;
  /** Whether stacking is enabled */
  enabled?: boolean;
}

const StackContainer = styled.div`
  position: relative;
  width: 100%;
`;

interface StackItemProps {
  $topOffset: string;
  $zIndex: number;
  $enabled: boolean;
}

const StackItem = styled.div<StackItemProps>`
  ${(props) =>
    props.$enabled
      ? `
    position: sticky;
    top: ${props.$topOffset};
    z-index: ${props.$zIndex};
  `
      : ''}
  width: 100%;
`;

/**
 * StickyStack component
 * Wraps children in sticky-positioned containers that stack on scroll
 */
export function StickyStack({
  children,
  className,
  style,
  topOffset = 0,
  baseZIndex = 1,
  enabled = true,
}: StickyStackProps): JSX.Element {
  const topOffsetValue = typeof topOffset === 'number' ? `${topOffset}px` : topOffset;

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isEnabled = enabled && !prefersReducedMotion;

  return (
    <StackContainer className={className} style={style}>
      {Children.map(children, (child, index) => (
        <StackItem
          $topOffset={topOffsetValue}
          $zIndex={baseZIndex + index}
          $enabled={isEnabled}
        >
          {child}
        </StackItem>
      ))}
    </StackContainer>
  );
}

/**
 * StickyStackItem - Individual item within a sticky stack
 * Use this for more control over individual items
 */
export interface StickyStackItemProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Z-index for this item */
  zIndex?: number;
  /** Top offset for sticky positioning */
  topOffset?: number | string;
  /** Whether this item should be sticky */
  sticky?: boolean;
  /** Minimum height for this item */
  minHeight?: string | number;
}

const StyledStackItem = styled.div<{
  $topOffset: string;
  $zIndex: number;
  $sticky: boolean;
  $minHeight?: string;
}>`
  ${(props) =>
    props.$sticky
      ? `
    position: sticky;
    top: ${props.$topOffset};
    z-index: ${props.$zIndex};
  `
      : ''}
  width: 100%;
  ${(props) => (props.$minHeight ? `min-height: ${props.$minHeight};` : '')}
`;

export function StickyStackItem({
  children,
  className,
  style,
  zIndex = 1,
  topOffset = 0,
  sticky = true,
  minHeight,
}: StickyStackItemProps): JSX.Element {
  const topOffsetValue = typeof topOffset === 'number' ? `${topOffset}px` : topOffset;
  const minHeightValue =
    typeof minHeight === 'number' ? `${minHeight}px` : minHeight;

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <StyledStackItem
      className={className}
      style={style}
      $topOffset={topOffsetValue}
      $zIndex={zIndex}
      $sticky={sticky && !prefersReducedMotion}
      $minHeight={minHeightValue}
    >
      {children}
    </StyledStackItem>
  );
}

/**
 * StickyCard - A card designed for use in sticky stacks
 * Includes background, shadow, and proper layering
 */
export interface StickyCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Background color or gradient */
  background?: string;
  /** Border radius */
  borderRadius?: string | number;
  /** Box shadow */
  shadow?: string;
  /** Padding */
  padding?: string | number;
}

const StyledCard = styled.div<{
  $background?: string;
  $borderRadius?: string;
  $shadow?: string;
  $padding?: string;
}>`
  width: 100%;
  background: ${(props) => props.$background || '#1a1a1a'};
  border-radius: ${(props) => props.$borderRadius || '16px'};
  box-shadow: ${(props) => props.$shadow || '0 10px 40px rgba(0, 0, 0, 0.4)'};
  padding: ${(props) => props.$padding || '2rem'};
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

export function StickyCard({
  children,
  className,
  style,
  background,
  borderRadius,
  shadow,
  padding,
}: StickyCardProps): JSX.Element {
  const borderRadiusValue =
    typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;
  const paddingValue = typeof padding === 'number' ? `${padding}px` : padding;

  return (
    <StyledCard
      className={className}
      style={style}
      $background={background}
      $borderRadius={borderRadiusValue}
      $shadow={shadow}
      $padding={paddingValue}
    >
      {children}
    </StyledCard>
  );
}

export default StickyStack;

