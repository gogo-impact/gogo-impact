import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import gogoLogoBK from '../../assets/logos/gogoLogoBK';

const Overlay = styled.div<{ $fadeOut: boolean }>`
  position: fixed;
  inset: 0;
  background: transparent;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
   /* Fade the entire overlay to transparent at the very end to avoid a white flash */
  opacity: ${({ $fadeOut }) => ($fadeOut ? 0 : 1)};
  transition: opacity 260ms ease-out;
`;

const Stage = styled.div<{ $cutoutPhase: boolean }>`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  /* White while loading text is shown; becomes transparent when the cutout runs,
     so the SVG-masked rect is the only white overlay and can reveal the page */
  background: ${({ $cutoutPhase }) => ($cutoutPhase ? 'transparent' : '#ffffff')};
`;

const revealCutoutIn = keyframes`
  0% {
    transform: scale(0);
  }
  100% {
    /* Mid zoom kept very small so the second phase feels more dramatic */
    transform: scale(0.5);
  }
`;

const revealCutoutOut = keyframes`
  0% {
    transform: scale(0.5);
  }
  100% {
    /* Final zoom ~20% larger than previous implementation */
    transform: scale(24);
  }
`;

const fadeInText = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const fadeOutText = keyframes`
  0% { opacity: 1; }
  100% { opacity: 0; }
`;

const dotWave = keyframes`
  0%, 100% {
    transform: translateY(0);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-4px);
    opacity: 1;
  }
`;

const LoadingText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  font-family: 'Century Gothic', Arial, sans-serif;
  font-weight: bold;
  color: #171717;
  text-align: center;
  letter-spacing: 0.08em;
  will-change: opacity, transform;

  opacity: 0;

  &.fade-in {
    animation: ${fadeInText} 600ms ease-out forwards;
  }

  &.fade-out {
    animation: ${fadeOutText} 500ms ease-in-out forwards;
  }
`;

const LoadingDots = styled.span`
  display: inline-flex;
  align-items: flex-end;
  gap: 4px;
  margin-left: 0.4em;

  span {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #171717;
    display: inline-block;
    animation: ${dotWave} 720ms ease-in-out infinite;
  }

  span:nth-child(2) {
    animation-delay: 120ms;
  }

  span:nth-child(3) {
    animation-delay: 240ms;
  }
`;

const MaskSvg = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  shape-rendering: geometricPrecision;
`;

const MaskLogoGroup = styled.g`
  transform-origin: center;
  transform-box: fill-box;
  will-change: transform;

  &.grow-in {
    animation: ${revealCutoutIn} 1400ms forwards;
    /* Phase 1: start quickly, then ease into the mid zoom (classic ease-out) */
    animation-timing-function: cubic-bezier(0, 0, 0.3, 1);
    animation-iteration-count: 1;
  }

  &.grow-out {
    animation: ${revealCutoutOut} 1400ms forwards;
    /* Phase 2: gentle at the start, then accelerates harder into the final size */
    animation-timing-function: cubic-bezier(0.7, 0, 0.9, 1);
    animation-iteration-count: 1;
  }
`;

type IntroPhase = 'loading' | 'cutout';

type IntroOverlayProps = {
  onFinish?: () => void;
  minimumDurationMs?: number;
};

function IntroOverlay({
  onFinish,
  minimumDurationMs = 2000,
}: IntroOverlayProps): JSX.Element | null {
  const [phase, setPhase] = useState<IntroPhase>('loading');
  const [done, setDone] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const loadingTextRef = useRef<HTMLDivElement>(null);
  const logoGroupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const timeouts: number[] = [];

    const prefersReduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const loadingText = loadingTextRef.current;

    if (!loadingText) return;

    // Phase 1: fade in loading text
    loadingText.classList.add('fade-in');

    if (prefersReduced) {
      // For reduced motion, keep a short static loading state then finish.
      const tReduced = window.setTimeout(() => {
        setDone(true);
        onFinish && onFinish();
      }, Math.max(800, minimumDurationMs));
      timeouts.push(tReduced);
      return () => {
        timeouts.forEach((id) => window.clearTimeout(id));
      };
    }

    // Phase 2: fade out the loading text after minimum duration
    const fadeOutDelay = minimumDurationMs;
    const t1 = window.setTimeout(() => {
      loadingText.classList.add('fade-out');
    }, fadeOutDelay);
    timeouts.push(t1);

    // Phase 3: start logo cutout zoom after text fade-out completes
    const logoStartDelay = fadeOutDelay + 600; // 600ms ~= fade-out duration
    const t2 = window.setTimeout(() => {
      // Switch to the logo cutout phase and, on the next frame,
      // start the zoom animation once the SVG group is mounted.
      setPhase('cutout');
      window.requestAnimationFrame(() => {
        const logoGroup = logoGroupRef.current;
        if (!logoGroup) return;

        const handleFirstEnd = () => {
          logoGroup.classList.remove('grow-in');

          const handleSecondEnd = () => {
            // After the logo zoom finishes, fade the whole overlay out
            // so there is no abrupt white flash when it unmounts.
            setIsFadingOut(true);
            const fadeTimeout = window.setTimeout(() => {
              setDone(true);
              onFinish && onFinish();
            }, 260);
            timeouts.push(fadeTimeout);
          };

          logoGroup.addEventListener('animationend', handleSecondEnd, {
            once: true,
          });
          logoGroup.classList.add('grow-out');
        };

        logoGroup.addEventListener('animationend', handleFirstEnd, {
          once: true,
        });
        logoGroup.classList.add('grow-in');
      });
    }, logoStartDelay);
    timeouts.push(t2);

    return () => {
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [minimumDurationMs, onFinish]);

  if (done) {
    return null;
  }

  return (
    <Overlay aria-hidden="true" $fadeOut={isFadingOut}>
      <Stage $cutoutPhase={phase === 'cutout'}>
        <LoadingText ref={loadingTextRef}>
          impact report loading
          <LoadingDots aria-hidden="true">
            <span />
            <span />
            <span />
          </LoadingDots>
        </LoadingText>
        {phase === 'cutout' && (
          <MaskSvg
            viewBox={gogoLogoBK.viewBox}
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <mask
                id="logo-cutout-mask"
                maskUnits="userSpaceOnUse"
                maskContentUnits="userSpaceOnUse"
              >
                {/* Start fully opaque, carve a transparent hole where the logo is */}
                <rect
                  x="0"
                  y="0"
                  width="595"
                  height="595"
                  fill="white"
                />
                <MaskLogoGroup ref={logoGroupRef} fill="black">
                  {gogoLogoBK.paths.map((p, i) => (
                    <path key={i} d={p.d} transform={p.transform} />
                  ))}
                </MaskLogoGroup>
              </mask>
            </defs>
            {/* White overlay rectangle that will be punched out by the mask */}
            <rect
              x="0"
              y="0"
              width="595"
              height="595"
              fill="white"
              mask="url(#logo-cutout-mask)"
            />
          </MaskSvg>
        )}
      </Stage>
    </Overlay>
  );
}

export default IntroOverlay;
