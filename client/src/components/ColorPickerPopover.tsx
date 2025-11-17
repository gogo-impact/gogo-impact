import React from "react";
import { Popover, Box, Button } from "@mui/material";
import { HexColorPicker } from "react-colorful";
import ColorizeIcon from "@mui/icons-material/Colorize";
import COLORS from "../../assets/colors";

export interface ColorPickerPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  value: string;
  onChange: (hex: string) => void;
  presets?: string[];
}

function ColorPickerPopover(props: ColorPickerPopoverProps) {
  const { open, anchorEl, onClose, value, onChange, presets } = props;

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

  const handleEyeDropperPick = async () => {
    try {
      if (!canUseDropper) return;
      const eye = new (window as any).EyeDropper();
      const { sRGBHex } = await eye.open();
      onChange(sRGBHex);
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
              onClick={() => onChange(c)}
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
          <HexColorPicker color={value} onChange={onChange} style={{ width: "100%" }} />
        </Box>
      </Box>
    </Popover>
  );
}

export default ColorPickerPopover;


