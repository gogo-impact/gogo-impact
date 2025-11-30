// Shared styled components for the Admin customization pages

import { Paper, TextField } from '@mui/material';
import styled from 'styled-components';
import COLORS from '../../assets/colors';

// Styled components for dark theme
export const CustomPaper = styled(Paper)`
  && {
    /* Frosted glass effect */
    background-color: rgba(21, 24, 33, 0.55); /* liquid glass */
    -webkit-backdrop-filter: blur(12px) saturate(140%);
    backdrop-filter: blur(12px) saturate(140%);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
      0 10px 30px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
    font-family: 'Century Gothic', 'Arial', sans-serif;
  }
`;

export const CustomTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    background: rgba(255, 255, 255, 0.06);
    -webkit-backdrop-filter: blur(8px) saturate(140%);
    backdrop-filter: blur(8px) saturate(140%);
    color: white;
    & fieldset {
      border-color: rgba(255, 255, 255, 0.3);
    }
    &:hover fieldset {
      border-color: rgba(255, 255, 255, 0.5);
    }
    &.Mui-focused fieldset {
      border-color: ${COLORS.gogo_blue};
    }
  }
  & .MuiInputLabel-root {
    color: rgba(255, 255, 255, 0.7);
    &.Mui-focused {
      color: ${COLORS.gogo_blue};
    }
  }
`;

/* Scope styles for clearer button states and glass look */
export const FrostedScope = styled.div`
  /* Base glass look for outlined buttons */
  .MuiButton-root.MuiButton-outlined {
    background: rgba(255, 255, 255, 0.06);
    -webkit-backdrop-filter: blur(6px) saturate(140%);
    backdrop-filter: blur(6px) saturate(140%);
    border-color: rgba(255, 255, 255, 0.18);
    color: rgba(255, 255, 255, 0.9);
    transition:
      transform 0.15s ease,
      background 0.2s ease,
      border-color 0.2s ease;
  }
  .MuiButton-root.MuiButton-outlined:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.28);
    transform: translateY(-1px);
  }
  /* Clear disabled state for all buttons */
  .MuiButton-root.Mui-disabled,
  button.Mui-disabled {
    opacity: 0.45 !important;
    color: rgba(255, 255, 255, 0.35) !important;
    border-color: rgba(255, 255, 255, 0.12) !important;
    background: rgba(255, 255, 255, 0.03) !important;
    cursor: not-allowed !important;
  }
`;

// Preview frame wrapper (no overrides to internal section heights)
export const PreviewFrame = styled.div``;




