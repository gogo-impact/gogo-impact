import React, { useRef, useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  Button,
  Divider,
  LinearProgress,
  FormControlLabel,
  Switch,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ClearIcon from '@mui/icons-material/Clear';
import ColorPickerPopover from '../../components/ColorPickerPopover';
import { CustomTextField } from '../styles';
import { GradientEditor, parseGradientString, composeGradient } from './GradientEditor';
import { HeroSectionForm } from '../types';
import COLORS from '../../../assets/colors';

type HeroColorPickerField =
  | 'titleColor'
  | 'subtitleColor'
  | 'yearColor'
  | 'taglineColor'
  | 'primaryCtaColor'
  | 'secondaryCtaColor'
  | 'primaryCtaBgColor'
  | 'primaryCtaHoverBgColor'
  | 'secondaryCtaBgColor'
  | 'secondaryCtaHoverBgColor'
  | 'titleUnderlineColor'
  | 'bubbleTextColor'
  | 'bubbleBgColor'
  | 'bubbleBorderColor';

export interface HeroTabEditorProps {
  hero: HeroSectionForm;
  defaultSwatch: string[] | null;
  heroUploadPct: number | null;
  onHeroChange: (field: keyof HeroSectionForm, value: any) => void;
  onBackgroundUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearBackground: () => void;
}

export function HeroTabEditor({
  hero,
  defaultSwatch,
  heroUploadPct,
  onHeroChange,
  onBackgroundUpload,
  onClearBackground,
}: HeroTabEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);
  const [colorPickerField, setColorPickerField] = useState<HeroColorPickerField | null>(null);
  const openColorPicker = Boolean(colorPickerAnchor);

  // State for gradient color picker
  const [gradientPickerAnchor, setGradientPickerAnchor] = useState<HTMLElement | null>(null);
  const [gradientPickerColorIndex, setGradientPickerColorIndex] = useState<number>(0);
  const gradientPickerOpen = Boolean(gradientPickerAnchor);

  // Get the current background gradient - use full string if available, otherwise compose from legacy fields
  const getBackgroundGradient = (): string => {
    return hero.backgroundGradient || `linear-gradient(${hero.degree}deg, ${hero.color1}, ${hero.color2})`;
  };

  // Get current gradient color for the picker
  const getGradientPickerColor = (): string => {
    const gradient = getBackgroundGradient();
    const parsed = parseGradientString(gradient);
    return parsed.colors[gradientPickerColorIndex] || '#000000';
  };

  const openGradientPicker = (el: HTMLElement, colorIndex: number) => {
    setGradientPickerColorIndex(colorIndex);
    setGradientPickerAnchor(el);
  };

  const handleGradientColorChange = (val: string) => {
    const currentGradient = getBackgroundGradient();
    const parsed = parseGradientString(currentGradient);
    const newColors = [...parsed.colors];
    newColors[gradientPickerColorIndex] = val;
    const newGradient = composeGradient(
      parsed.type,
      parsed.degree,
      newColors,
      parsed.opacity,
    );
    onHeroChange("backgroundGradient", newGradient);
  };

  const getPickerColor = (): string => {
    if (!colorPickerField) return "#000000";
    switch (colorPickerField) {
      case "titleColor":
        return hero.titleColor || "#ffffff";
      case "subtitleColor":
        return hero.subtitleColor || "#77ddab";
      case "yearColor":
        return hero.yearColor || "#e9bb4d";
      case "taglineColor":
        return hero.taglineColor || COLORS.gogo_green;
      case "primaryCtaColor":
        return hero.primaryCtaColor || "#ffffff";
      case "secondaryCtaColor":
        return hero.secondaryCtaColor || "#ffffff";
      case "primaryCtaBgColor":
        return hero.primaryCtaBgColor || "#1946f5";
      case "primaryCtaHoverBgColor":
        return hero.primaryCtaHoverBgColor || "#68369a";
      case "secondaryCtaBgColor":
        return hero.secondaryCtaBgColor || "rgba(255, 255, 255, 0.1)";
      case "secondaryCtaHoverBgColor":
        return hero.secondaryCtaHoverBgColor || "rgba(255, 255, 255, 0.2)";
      case "titleUnderlineColor":
        return hero.titleUnderlineColor || "rgba(119, 221, 171, 0.8)";
      case "bubbleTextColor":
        return hero.bubbleTextColor || "#ffffff";
      case "bubbleBgColor":
        return hero.bubbleBgColor || "rgba(255, 255, 255, 0.08)";
      case "bubbleBorderColor":
        return hero.bubbleBorderColor || "rgba(255, 255, 255, 0.2)";
      default:
        return "#000000";
    }
  };

  const openPicker = (field: HeroColorPickerField, el: HTMLElement) => {
    setColorPickerField(field);
    setColorPickerAnchor(el);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontFamily: "'Airwaves', 'Century Gothic', 'Arial', sans-serif",
          }}
        >
          Hero Section
        </Typography>
      </Box>
      <Divider sx={{ mb: 3, bgcolor: "rgba(255,255,255,0.1)" }} />

      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Basics */}
        <Grid item xs={12}>
          <CustomTextField
            label="Hero Title"
            value={hero.title}
            onChange={(e) => onHeroChange("title", e.target.value)}
            fullWidth
          />
          <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => openPicker("titleColor", e.currentTarget)}
              sx={{
                borderColor: "rgba(255,255,255,0.3)",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  background: hero.titleColor || "#ffffff",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
              &nbsp;Text color
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) =>
                openPicker("titleUnderlineColor", e.currentTarget)
              }
              sx={{
                borderColor: "rgba(255,255,255,0.3)",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  background:
                    hero.titleUnderlineColor || "rgba(119, 221, 171, 0.8)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
              &nbsp;Underline color
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            label="Hero Subtitle"
            value={hero.subtitle}
            onChange={(e) => onHeroChange("subtitle", e.target.value)}
            fullWidth
          />
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openPicker("subtitleColor", e.currentTarget)}
            sx={{
              mt: 1,
              borderColor: "rgba(255,255,255,0.3)",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 16,
                height: 16,
                borderRadius: 3,
                background: hero.subtitleColor || "#77ddab",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />
            &nbsp;Text color
          </Button>
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomTextField
            label="Year"
            value={hero.year}
            onChange={(e) => onHeroChange("year", e.target.value)}
            fullWidth
          />
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openPicker("yearColor", e.currentTarget)}
            sx={{
              mt: 1,
              borderColor: "rgba(255,255,255,0.3)",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 16,
                height: 16,
                borderRadius: 3,
                background: hero.yearColor || "#e9bb4d",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />
            &nbsp;Text color
          </Button>
        </Grid>
        <Grid item xs={12} md={8}>
          <CustomTextField
            label="Tagline"
            value={hero.tagline}
            onChange={(e) => onHeroChange("tagline", e.target.value)}
            fullWidth
          />
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => openPicker("taglineColor", e.currentTarget)}
            sx={{
              mt: 1,
              borderColor: "rgba(255,255,255,0.3)",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 16,
                height: 16,
                borderRadius: 3,
                background: hero.taglineColor || COLORS.gogo_green,
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />
            &nbsp;Text color
          </Button>
        </Grid>
        <Grid item xs={12} md={12}>
          <CustomTextField
            label="Bubbles (comma separated)"
            value={hero.bubblesCsv}
            onChange={(e) => onHeroChange("bubblesCsv", e.target.value)}
            fullWidth
          />
          <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => openPicker("bubbleTextColor", e.currentTarget)}
              sx={{
                borderColor: "rgba(255,255,255,0.3)",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  background: hero.bubbleTextColor || "#ffffff",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
              &nbsp;Bubble text
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => openPicker("bubbleBgColor", e.currentTarget)}
              sx={{
                borderColor: "rgba(255,255,255,0.3)",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  background: hero.bubbleBgColor || "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
              &nbsp;Bubble background
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => openPicker("bubbleBorderColor", e.currentTarget)}
              sx={{
                borderColor: "rgba(255,255,255,0.3)",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  background:
                    hero.bubbleBorderColor || "rgba(255, 255, 255, 0.2)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
              &nbsp;Bubble border
            </Button>
          </Box>
        </Grid>

        {/* CTAs */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Call To Action Buttons
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            label="Primary CTA Label"
            value={hero.primaryCtaLabel}
            onChange={(e) => onHeroChange("primaryCtaLabel", e.target.value)}
            fullWidth
          />
          <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => openPicker("primaryCtaColor", e.currentTarget)}
              sx={{
                borderColor: "rgba(255,255,255,0.3)",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  background: hero.primaryCtaColor || "#ffffff",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
              &nbsp;Text color
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => openPicker("primaryCtaBgColor", e.currentTarget)}
              sx={{
                borderColor: "rgba(255,255,255,0.3)",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  background: hero.primaryCtaBgColor || "#1946f5",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
              &nbsp;Background
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) =>
                openPicker("primaryCtaHoverBgColor", e.currentTarget)
              }
              sx={{
                borderColor: "rgba(255,255,255,0.3)",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  background: hero.primaryCtaHoverBgColor || "#68369a",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
              &nbsp;Hover background
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            label="Primary CTA Link (URL)"
            value={hero.primaryCtaHref}
            onChange={(e) => onHeroChange("primaryCtaHref", e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            label="Secondary CTA Label"
            value={hero.secondaryCtaLabel}
            onChange={(e) => onHeroChange("secondaryCtaLabel", e.target.value)}
            fullWidth
          />
          <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => openPicker("secondaryCtaColor", e.currentTarget)}
              sx={{
                borderColor: "rgba(255,255,255,0.3)",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  background: hero.secondaryCtaColor || "#ffffff",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
              &nbsp;Text color
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) =>
                openPicker("secondaryCtaBgColor", e.currentTarget)
              }
              sx={{
                borderColor: "rgba(255,255,255,0.3)",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  background:
                    hero.secondaryCtaBgColor || "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
              &nbsp;Background
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) =>
                openPicker("secondaryCtaHoverBgColor", e.currentTarget)
              }
              sx={{
                borderColor: "rgba(255,255,255,0.3)",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  background:
                    hero.secondaryCtaHoverBgColor || "rgba(255, 255, 255, 0.2)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
              &nbsp;Hover background
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            label="Secondary CTA Link (URL)"
            value={hero.secondaryCtaHref}
            onChange={(e) => onHeroChange("secondaryCtaHref", e.target.value)}
            fullWidth
          />
        </Grid>

        {/* Gradient */}
        <Grid item xs={12}>
          <GradientEditor
            label="Background Gradient"
            value={getBackgroundGradient()}
            onChange={(gradient) =>
              onHeroChange("backgroundGradient", gradient)
            }
            onPickColor={(el, colorIndex) => openGradientPicker(el, colorIndex)}
          />
        </Grid>

        {/* Gradient color picker */}
        <ColorPickerPopover
          open={gradientPickerOpen}
          anchorEl={gradientPickerAnchor}
          onClose={() => {
            setGradientPickerAnchor(null);
          }}
          value={getGradientPickerColor()}
          onChange={handleGradientColorChange}
          presets={defaultSwatch ?? undefined}
        />

        <ColorPickerPopover
          open={openColorPicker}
          anchorEl={colorPickerAnchor}
          onClose={() => {
            setColorPickerAnchor(null);
            setColorPickerField(null);
          }}
          value={getPickerColor()}
          onChange={(val) => {
            if (!colorPickerField) return;
            onHeroChange(colorPickerField, val);
          }}
          presets={defaultSwatch ?? undefined}
        />
        {/* Background Image */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Background Image
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={onBackgroundUpload}
              style={{ display: "none" }}
              ref={fileInputRef}
            />
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ minWidth: { xs: "100%", sm: "auto" } }}
            >
              Upload Background
            </Button>
            <Button
              variant="text"
              color="error"
              startIcon={<ClearIcon />}
              onClick={onClearBackground}
              disabled={
                !hero.backgroundImageUrl && !hero.backgroundImagePreview
              }
            >
              Clear Background
            </Button>
            {heroUploadPct !== null && (
              <Box sx={{ flex: 1, minWidth: 180 }}>
                <LinearProgress variant="determinate" value={heroUploadPct} />
                <Typography variant="caption" color="rgba(255,255,255,0.7)">
                  {heroUploadPct}%
                </Typography>
              </Box>
            )}
            {heroUploadPct === null && hero.backgroundImagePreview && (
              <Box
                sx={{
                  width: { xs: "100%", sm: 120 },
                  height: { xs: 140, sm: 70 },
                  overflow: "hidden",
                  borderRadius: 1,
                  minWidth: { xs: "auto", sm: 120 },
                }}
              >
                <img
                  src={hero.backgroundImagePreview}
                  alt="Background preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: hero.backgroundGrayscale
                      ? "grayscale(1)"
                      : undefined,
                  }}
                />
              </Box>
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={hero.backgroundGrayscale}
                  onChange={(e) =>
                    onHeroChange("backgroundGrayscale", e.target.checked)
                  }
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: COLORS.gogo_blue,
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: COLORS.gogo_blue,
                    },
                  }}
                />
              }
              label="Render background image in grayscale (gradient and text stay color)"
              sx={{ color: "white" }}
            />
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.7)",
                display: "block",
              }}
            >
              Note: The preview frame is approximate. The background image may
              not align exactly with other elements on the final page.
            </Typography>
          </Box>
        </Grid>

        {/* Accessibility */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Accessibility
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            label="ARIA Label"
            value={hero.ariaLabel}
            onChange={(e) => onHeroChange("ariaLabel", e.target.value)}
            fullWidth
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default HeroTabEditor;

