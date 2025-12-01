import React, { useEffect, useState } from "react";
import { Popover, Box, Button, InputBase, Slider, Typography } from "@mui/material";
import { HexColorPicker } from "react-colorful";
import ColorizeIcon from "@mui/icons-material/Colorize";
import COLORS from "../../assets/colors";

// Helper: Parse any color (hex, rgb, rgba) to { hex, opacity }
function parseColorToHexAndOpacity(color: string): { hex: string; opacity: number } {
  if (!color) return { hex: "#000000", opacity: 1 };
  
  const c = color.trim();
  
  // Parse rgba
  const rgbaMatch = c.match(/rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/i);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1], 10);
    const g = parseInt(rgbaMatch[2], 10);
    const b = parseInt(rgbaMatch[3], 10);
    const a = parseFloat(rgbaMatch[4]);
    const toHex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
    return { hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`, opacity: a };
  }
  
  // Parse rgb
  const rgbMatch = c.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    const toHex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
    return { hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`, opacity: 1 };
  }
  
  // Hex (3 or 6 digits)
  if (c.startsWith('#')) {
    const raw = c.slice(1);
    if (raw.length === 3) {
      const expanded = raw.split('').map(ch => ch + ch).join('');
      return { hex: `#${expanded}`, opacity: 1 };
    }
    return { hex: c.toLowerCase(), opacity: 1 };
  }
  
  return { hex: "#000000", opacity: 1 };
}

// Helper: Compose hex + opacity into rgba (or hex if opacity is 1)
function composeColorWithOpacity(hex: string, opacity: number): string {
  if (opacity >= 1) return hex;
  
  const clean = hex.startsWith('#') ? hex.slice(1) : hex;
  const expanded = clean.length === 3 
    ? clean.split('').map(ch => ch + ch).join('') 
    : clean;
  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export interface ColorPickerPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  value: string;
  onChange: (color: string) => void;
  presets?: string[];
  /** If true, show opacity slider (default: true) */
  showOpacity?: boolean;
}

function ColorPickerPopover(props: ColorPickerPopoverProps) {
  const { open, anchorEl, onClose, value, onChange, presets, showOpacity = true } = props;

  const brandPresets = presets ?? [
    COLORS.gogo_blue,
    COLORS.gogo_purple,
    COLORS.gogo_teal,
    COLORS.gogo_yellow,
    COLORS.gogo_pink,
    COLORS.gogo_green,
  ];

  const canUseDropper =
    typeof window !== "undefined" && typeof (window as any).EyeDropper === "function";

  const [hexInput, setHexInput] = useState<string>("#000000");
  const [hexValue, setHexValue] = useState<string>("#000000");
  const [opacity, setOpacity] = useState<number>(1);

  // Parse incoming value to extract hex and opacity
  useEffect(() => {
    const parsed = parseColorToHexAndOpacity(value);
    setHexValue(parsed.hex);
    setHexInput(parsed.hex.toUpperCase());
    setOpacity(parsed.opacity);
  }, [value]);

  // Emit combined color whenever hex or opacity changes
  const emitColor = (newHex: string, newOpacity: number) => {
    const color = composeColorWithOpacity(newHex, newOpacity);
    onChange(color);
  };

  const handleColorPickerChange = (newHex: string) => {
    setHexValue(newHex);
    setHexInput(newHex.toUpperCase());
    emitColor(newHex, opacity);
  };

  const handleOpacityChange = (_: Event, newValue: number | number[]) => {
    const newOpacity = newValue as number;
    setOpacity(newOpacity);
    emitColor(hexValue, newOpacity);
  };

  const expandShortHex = (raw: string) => {
    if (raw.length === 3) {
      return raw
        .split("")
        .map((c) => c + c)
        .join("");
    }
    return raw;
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    const withoutHash = next.startsWith("#") ? next.slice(1) : next;
    const cleaned = withoutHash.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
    const display = `#${cleaned}`.toUpperCase();
    setHexInput(display);

    if (cleaned.length === 3 || cleaned.length === 6) {
      const expanded = expandShortHex(cleaned).toLowerCase();
      const newHex = `#${expanded}`;
      setHexValue(newHex);
      emitColor(newHex, opacity);
    }
  };

  const handleHexInputBlur = () => {
    const raw = hexInput.replace("#", "");
    if (!raw) {
      setHexInput("#000000");
      setHexValue("#000000");
      emitColor("#000000", opacity);
      return;
    }
    const cleaned = raw.replace(/[^0-9a-fA-F]/g, "");
    const expanded = expandShortHex(cleaned.padEnd(6, cleaned.slice(-1) || "0")).slice(0, 6);
    const normalized = `#${expanded}`.toLowerCase();
    setHexInput(normalized.toUpperCase());
    setHexValue(normalized);
    emitColor(normalized, opacity);
  };

  const handlePresetClick = (presetColor: string) => {
    const parsed = parseColorToHexAndOpacity(presetColor);
    setHexValue(parsed.hex);
    setHexInput(parsed.hex.toUpperCase());
    // Keep current opacity when clicking preset, unless preset has its own opacity
    const newOpacity = parsed.opacity < 1 ? parsed.opacity : opacity;
    setOpacity(newOpacity);
    emitColor(parsed.hex, newOpacity);
  };

  const handleEyeDropperPick = async () => {
    try {
      if (!canUseDropper) return;
      const eye = new (window as any).EyeDropper();
      const { sRGBHex } = await eye.open();
      setHexValue(sRGBHex);
      setHexInput(sRGBHex.toUpperCase());
      emitColor(sRGBHex, opacity);
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        // eslint-disable-next-line no-console
        console.warn("EyeDropper failed", err);
      }
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      PaperProps={{
        sx: {
          bgcolor: "rgba(21,24,33,0.6)",
          border: "1px solid rgba(255,255,255,0.12)",
          WebkitBackdropFilter: "blur(10px) saturate(140%)",
          backdropFilter: "blur(10px) saturate(140%)",
          p: 2,
          width: { xs: 260, sm: 320 },
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          {brandPresets.map((c) => (
            <button
              key={`preset-${c}`}
              onClick={() => handlePresetClick(c)}
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                border: "1px solid rgba(255,255,255,0.25)",
                background: c,
                cursor: "pointer",
              }}
              aria-label={`Use ${c}`}
              title={c}
            />
          ))}
          <span style={{ flex: 1 }} />
          <Button
            size="small"
            variant="outlined"
            onClick={handleEyeDropperPick}
            disabled={!canUseDropper}
            sx={{
              borderColor: "rgba(255,255,255,0.3)",
              color: "rgba(255,255,255,0.9)",
              minWidth: 36,
              px: 0.5,
              height: 30,
            }}
            aria-label="Pick color from screen"
          >
            <ColorizeIcon fontSize="small" />
          </Button>
        </Box>
        <Box sx={{ width: "100%" }}>
          <HexColorPicker color={hexValue} onChange={handleColorPickerChange} style={{ width: "100%" }} />
        </Box>
        <Box sx={{ mt: 0.5 }}>
          <InputBase
            value={hexInput}
            onChange={handleHexInputChange}
            onBlur={handleHexInputBlur}
            inputProps={{ "aria-label": "Hex color", spellCheck: false }}
            sx={{
              width: "100%",
              fontSize: 12,
              px: 1,
              py: 0.5,
              height: 28,
              color: "rgba(255,255,255,0.92)",
              bgcolor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 1,
            }}
            placeholder="#RRGGBB"
          />
        </Box>
        {showOpacity && (
          <Box sx={{ mt: 0.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                Opacity
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.9)" }}>
                {Math.round(opacity * 100)}%
              </Typography>
            </Box>
            <Slider
              value={opacity}
              onChange={handleOpacityChange}
              min={0}
              max={1}
              step={0.01}
              size="small"
              sx={{
                color: COLORS.gogo_blue,
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                  backgroundColor: 'white',
                  border: `2px solid ${COLORS.gogo_blue}`,
                },
                '& .MuiSlider-track': {
                  backgroundColor: COLORS.gogo_blue,
                },
                '& .MuiSlider-rail': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                },
              }}
            />
          </Box>
        )}
        {/* Preview swatch showing final color with opacity */}
        <Box
          sx={{
            width: "100%",
            height: 24,
            borderRadius: 1,
            border: "1px solid rgba(255,255,255,0.18)",
            background: `linear-gradient(45deg, #808080 25%, transparent 25%), 
                         linear-gradient(-45deg, #808080 25%, transparent 25%), 
                         linear-gradient(45deg, transparent 75%, #808080 75%), 
                         linear-gradient(-45deg, transparent 75%, #808080 75%)`,
            backgroundSize: "8px 8px",
            backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: composeColorWithOpacity(hexValue, opacity),
            }}
          />
        </Box>
      </Box>
    </Popover>
  );
}

export default ColorPickerPopover;


